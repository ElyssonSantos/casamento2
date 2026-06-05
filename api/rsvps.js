import express from 'express';
import cors from 'cors';
import { createClient } from '@vercel/kv';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
console.log('--- API VERSÃO SEGURA (HARDENED) CARREGADA ---');

// ===================================================================
// SEGURANÇA: CORS restrito
// ===================================================================
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*').split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin && allowedOrigins.includes('*')) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Bloqueado pelo CORS'));
    },
    credentials: true,
}));

// SEGURANÇA: Body size reduzido (era 50mb — vetor de DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// ===================================================================
// SEGURANÇA: Validações de input rígidas
// ===================================================================
const VALIDATORS = {
    name: (v) => typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 120,
    cpf: (v) => typeof v === 'string' && /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v.trim()),
    phone: (v) => typeof v === 'string' && /^[\d()\s.\-+]{8,20}$/.test(v.trim()),
    amount: (v) => { const num = Number(v); return !isNaN(num) && num > 0 && num <= 100000; },
    familyMemberName: (v) => typeof v === 'string' && v.trim().length >= 1 && v.trim().length <= 120,
    relationship: (v) => typeof v === 'string' && v.trim().length >= 1 && v.trim().length <= 50,
};

const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>"'&]/g, (char) => {
        const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
        return entities[char] || char;
    }).trim();
};

// ===================================================================
// SEGURANÇA: Validação Magic Bytes para base64 images
// ===================================================================
const validateBase64Image = (base64String) => {
    if (!base64String || typeof base64String !== 'string') return false;
    const match = base64String.match(/^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/);
    if (!match) return false;
    const mimeType = match[1];
    const data = match[3];
    try {
        const buffer = Buffer.from(data, 'base64');
        if (buffer.length > 5 * 1024 * 1024) return false;
        const magicBytes = {
            'image/jpeg': [0xFF, 0xD8, 0xFF],
            'image/png': [0x89, 0x50, 0x4E, 0x47],
            'image/gif': [0x47, 0x49, 0x46],
        };
        if (mimeType === 'image/webp') {
            return buffer.length > 12 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
        }
        const expected = magicBytes[mimeType];
        if (!expected) return false;
        for (let i = 0; i < expected.length; i++) {
            if (buffer[i] !== expected[i]) return false;
        }
        return true;
    } catch { return false; }
};

// ===================================================================
// SEGURANÇA: JWT + bcrypt para admin auth
// ===================================================================
// 🔒 ADMIN AUTHENTICATION
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$0uCc9QgBfGthejNzFBiivePfodx/CAY0xg0v90nJoflGgZnda7m96';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'casamento2-jwt-fallback-do-not-use-in-prod';

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação ausente' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

// Simple in-memory rate limiting for serverless
const rateLimitMap = new Map();
const rateLimit = (key, maxAttempts, windowMs) => {
    const now = Date.now();
    const record = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > record.resetAt) {
        record.count = 0;
        record.resetAt = now + windowMs;
    }
    record.count++;
    rateLimitMap.set(key, record);
    return record.count > maxAttempts;
};

// ===================================================================
// SEGURANÇA: Banco de dados — SEM credenciais hardcoded
// ===================================================================
const RSVP_KV_KEY = 'rsvps_list';

const kvRestUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvRestToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// SEGURANÇA: Fallback de credenciais hardcoded REMOVIDO
const redisTcpUrl = process.env.REDIS_URL || process.env.KV_URL;

let dbClient = null;
let dbType = '';

if (kvRestUrl && kvRestToken) {
    dbClient = createClient({ url: kvRestUrl, token: kvRestToken });
    dbType = 'kv';
} else if (redisTcpUrl) {
    dbClient = new Redis(redisTcpUrl);
    dbType = 'redis';
}

const getRSVPs = async () => {
    if (!dbClient) {
        throw new Error('Banco de dados não configurado. Verifique o REDIS_URL nas variáveis de ambiente.');
    }
    try {
        const data = await dbClient.get(RSVP_KV_KEY);
        if (!data) return [];
        return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
        console.error('Erro na leitura do banco:', error);
        throw error;
    }
};

const saveRSVPsStore = async (rsvps) => {
    if (!dbClient) throw new Error('Cliente DB não inicializado');
    const value = dbType === 'redis' ? JSON.stringify(rsvps) : rsvps;
    await dbClient.set(RSVP_KV_KEY, value);
};

// ===================================================================
// ROTA: Login Admin
// ===================================================================
app.post('/api/admin/login', async (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (rateLimit(`login:${clientIp}`, 5, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Muitas tentativas de login. Tente em 15 minutos.' });
    }

    try {
        const { password } = req.body;
        if (!password || typeof password !== 'string' || password.length > 128) {
            return res.status(400).json({ error: 'Senha inválida' });
        }
        if (!ADMIN_PASSWORD_HASH) {
            return res.status(500).json({ error: 'Autenticação admin não configurada' });
        }
        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!isValid) {
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            return res.status(401).json({ error: 'Senha incorreta' });
        }
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });
        res.json({ token, expiresIn: 4 * 60 * 60 });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
    res.json({ valid: true, role: req.admin.role });
});

// ===================================================================
// ROTA: GET RSVPs — PROTEGIDA (só admin)
// ===================================================================
app.get(['/api/rsvps', '/'], authenticateAdmin, async (req, res) => {
    try {
        const rsvps = await getRSVPs();
        res.json({ total: rsvps.length, list: rsvps });
    } catch (error) {
        console.error('Erro na API GET /rsvps:', error);
        res.status(500).json({ error: 'Erro ao buscar RSVPs' });
    }
});

// ===================================================================
// ROTA: POST RSVP — PÚBLICA (com validação rígida)
// ===================================================================
app.post(['/api/rsvps', '/'], async (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (rateLimit(`rsvp:${clientIp}`, 10, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Muitas confirmações. Tente em 15 minutos.' });
    }

    try {
        const { name, cpf, phone, familyMembers, totalPeople } = req.body;

        if (!VALIDATORS.name(name)) return res.status(400).json({ error: 'Nome inválido (2-120 caracteres)' });
        if (!VALIDATORS.cpf(cpf)) return res.status(400).json({ error: 'CPF inválido' });
        if (!VALIDATORS.phone(phone)) return res.status(400).json({ error: 'Telefone inválido' });

        const cleanFamilyMembers = [];
        if (Array.isArray(familyMembers)) {
            if (familyMembers.length > 20) return res.status(400).json({ error: 'Máximo de 20 acompanhantes' });
            for (const member of familyMembers) {
                if (!VALIDATORS.familyMemberName(member.name)) return res.status(400).json({ error: 'Nome de acompanhante inválido' });
                if (!VALIDATORS.relationship(member.relationship)) return res.status(400).json({ error: 'Parentesco inválido' });
                cleanFamilyMembers.push({ name: sanitize(member.name), relationship: sanitize(member.relationship) });
            }
        }

        const currentRSVPs = await getRSVPs();
        const duplicate = currentRSVPs.find(rsvp =>
            (rsvp.cpf && rsvp.cpf === sanitize(cpf)) ||
            (rsvp.phone && rsvp.phone === sanitize(phone))
        );
        if (duplicate) return res.status(400).json({ error: 'CPF ou Telefone já registrado.' });

        const newRSVP = {
            name: sanitize(name),
            cpf: sanitize(cpf),
            phone: sanitize(phone),
            familyMembers: cleanFamilyMembers,
            totalPeople: Math.min(Math.max(1, Number(totalPeople) || 1), 21),
            id: Date.now(),
            date: new Date().toISOString()
        };

        const updatedRSVPs = [...currentRSVPs, newRSVP];
        await saveRSVPsStore(updatedRSVPs);
        res.status(201).json(newRSVP);
    } catch (error) {
        console.error('ERRO CRÍTICO AO SALVAR RSVP (API):', error);
        res.status(500).json({ error: 'Erro ao salvar confirmação' });
    }
});

// ===================================================================
// ROTA: DELETE RSVPs — PROTEGIDA (só admin)
// ===================================================================
app.delete(['/api/rsvps/:cpf', '/:cpf'], authenticateAdmin, async (req, res) => {
    try {
        const { cpf } = req.params;
        if (!VALIDATORS.cpf(cpf)) return res.status(400).json({ error: 'CPF inválido' });

        const currentRSVPs = await getRSVPs();
        const updatedRSVPs = currentRSVPs.filter(rsvp => rsvp.cpf !== cpf);
        if (currentRSVPs.length === updatedRSVPs.length) {
            return res.status(404).json({ error: 'RSVP não encontrado' });
        }
        await saveRSVPsStore(updatedRSVPs);
        res.json({ message: 'RSVP removido com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar RSVP:', error);
        res.status(500).json({ error: 'Erro ao deletar RSVP' });
    }
});

app.delete(['/api/rsvps', '/'], authenticateAdmin, async (req, res) => {
    try {
        await saveRSVPsStore([]);
        res.json({ message: 'Todos os RSVPs foram apagados' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao apagar RSVPs' });
    }
});

// ===================================================================
// ROTA: POST Donations — PÚBLICA (com validação)
// ===================================================================
app.post('/api/donations', async (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (rateLimit(`donation:${clientIp}`, 5, 15 * 60 * 1000)) {
        return res.status(429).json({ error: 'Muitas tentativas. Tente em 15 minutos.' });
    }

    try {
        const { cpf, amount, receipt } = req.body;

        if (!VALIDATORS.cpf(cpf)) return res.status(400).json({ error: 'CPF inválido' });
        if (!VALIDATORS.amount(amount)) return res.status(400).json({ error: 'Valor inválido' });
        if (!receipt || typeof receipt !== 'string') return res.status(400).json({ error: 'Comprovante obrigatório' });
        if (!validateBase64Image(receipt)) {
            return res.status(400).json({ error: 'Comprovante inválido. Envie uma imagem real.' });
        }

        const currentRSVPs = await getRSVPs();
        const rsvpIndex = currentRSVPs.findIndex(r => r.cpf === sanitize(cpf));
        if (rsvpIndex === -1) {
            return res.status(404).json({ error: 'Nenhuma confirmação encontrada para este CPF' });
        }

        currentRSVPs[rsvpIndex].donation = {
            amount: Number(amount),
            receiptUrl: receipt,
            date: new Date().toISOString()
        };

        await saveRSVPsStore(currentRSVPs);
        res.status(200).json({ message: 'Doação registrada com sucesso', donation: currentRSVPs[rsvpIndex].donation });
    } catch (error) {
        console.error('Erro ao registrar doação:', error);
        res.status(500).json({ error: 'Erro ao registrar doação' });
    }
});

export default app;
