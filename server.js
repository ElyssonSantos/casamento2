import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'receipts');

// ===================================================================
// SEGURANÇA: Headers HTTP seguros
// ===================================================================
app.use(helmet());

// ===================================================================
// SEGURANÇA: CORS restrito à origin permitida
// ===================================================================
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*').split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        // Permite requests sem origin (curl, Postman em dev) apenas se * está configurado
        if (!origin && allowedOrigins.includes('*')) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Bloqueado pelo CORS'));
    },
    credentials: true,
}));

// ===================================================================
// SEGURANÇA: Body size reduzido (era 50mb — vetor de DoS)
// ===================================================================
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

// ===================================================================
// SEGURANÇA: Rate Limiting Global
// ===================================================================
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

// Rate Limiter agressivo para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate Limiter para RSVP POST
const rsvpPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas confirmações em sequência. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter para doações
const donationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Muitas tentativas de doação. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ===================================================================
// SEGURANÇA: Upload com validação de tipo real (Magic Bytes)
// ===================================================================
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(UPLOADS_DIR, { recursive: true });
            cb(null, UPLOADS_DIR);
        } catch (error) {
            cb(error, UPLOADS_DIR);
        }
    },
    filename: (req, file, cb) => {
        // SEGURANÇA: Remover caracteres perigosos do nome
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(new Error('Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF, WebP).'), false);
        }
        cb(null, true);
    }
});

// ===================================================================
// SEGURANÇA: JWT Secret e Admin Password Hash
// ===================================================================
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_' + Math.random();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;

if (!process.env.ADMIN_JWT_SECRET) {
    console.warn('⚠️  ADMIN_JWT_SECRET não definido! Usando valor temporário inseguro. Defina no .env!');
}
if (!ADMIN_PASSWORD_HASH) {
    console.warn('⚠️  ADMIN_PASSWORD_HASH não definido! Gere com: node -e "import(\'bcryptjs\').then(b=>b.default.hash(\'suasenha\',12).then(console.log))"');
}

// ===================================================================
// SEGURANÇA: Middleware de autenticação Admin (server-side)
// ===================================================================
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação ausente' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado: role insuficiente' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

// ===================================================================
// SEGURANÇA: Validações de input rígidas
// ===================================================================
const VALIDATORS = {
    name: (v) => typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 120,
    cpf: (v) => typeof v === 'string' && /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v.trim()),
    phone: (v) => typeof v === 'string' && /^[\d()\s.\-+]{8,20}$/.test(v.trim()),
    amount: (v) => {
        const num = Number(v);
        return !isNaN(num) && num > 0 && num <= 100000;
    },
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
// SEGURANÇA: Mutex para operações atômicas (Race Condition)
// ===================================================================
let writeLock = Promise.resolve();
const withWriteLock = (fn) => {
    writeLock = writeLock.then(fn).catch(fn);
    return writeLock;
};

// ===================================================================
// SEGURANÇA: Validação de Magic Bytes para base64
// ===================================================================
const MAGIC_BYTES = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': null, // WebP has RIFF header, check separately
};

const validateBase64Image = (base64String) => {
    if (!base64String || typeof base64String !== 'string') return false;

    // Expect data:image/xxx;base64,XXXX format
    const match = base64String.match(/^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/);
    if (!match) return false;

    const mimeType = match[1];
    const data = match[3];

    try {
        const buffer = Buffer.from(data, 'base64');

        // Size limit: 5MB decoded
        if (buffer.length > MAX_FILE_SIZE) return false;

        if (mimeType === 'image/webp') {
            // RIFF....WEBP
            return buffer.length > 12 &&
                buffer[0] === 0x52 && buffer[1] === 0x49 &&
                buffer[2] === 0x46 && buffer[3] === 0x46;
        }

        const expected = MAGIC_BYTES[mimeType];
        if (!expected) return false;

        for (let i = 0; i < expected.length; i++) {
            if (buffer[i] !== expected[i]) return false;
        }
        return true;
    } catch {
        return false;
    }
};

// ===================================================================
// Data Store
// ===================================================================
const initDataStore = async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify([]), 'utf8');
        }
    } catch (error) {
        console.error('Error initializing data store:', error);
    }
};

initDataStore();

const getRSVPs = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        if (!data || data.trim() === '') return [];
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Erro ao ler rsvps.json:', error);
        return [];
    }
};

const saveRSVPsStore = async (rsvps) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(rsvps, null, 2), 'utf8');
};

// ===================================================================
// ROTA: Login Admin (server-side com bcrypt + JWT)
// ===================================================================
app.post('/api/admin/login', loginLimiter, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || typeof password !== 'string' || password.length > 128) {
            return res.status(400).json({ error: 'Senha inválida' });
        }

        if (!ADMIN_PASSWORD_HASH) {
            return res.status(500).json({ error: 'Autenticação admin não configurada no servidor' });
        }

        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!isValid) {
            // SEGURANÇA: Delay para dificultar timing attacks
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { role: 'admin', iat: Math.floor(Date.now() / 1000) },
            JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.json({ token, expiresIn: 4 * 60 * 60 });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no login' });
    }
});

// ROTA: Verificar token admin
app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
    res.json({ valid: true, role: req.admin.role });
});

// ===================================================================
// ROTA: GET RSVPs — PROTEGIDA (só admin vê a lista completa)
// ===================================================================
app.get('/api/rsvps', authenticateAdmin, async (req, res) => {
    try {
        const rsvps = await getRSVPs();
        res.json({ total: rsvps.length, list: rsvps });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar RSVPs' });
    }
});

// ===================================================================
// ROTA: POST RSVP — PÚBLICA (mas com validação rígida + rate limit)
// ===================================================================
app.post('/api/rsvps', rsvpPostLimiter, async (req, res) => {
    try {
        const { name, cpf, phone, familyMembers, totalPeople } = req.body;

        // SEGURANÇA: Validação rígida de todos os campos
        if (!VALIDATORS.name(name)) {
            return res.status(400).json({ error: 'Nome inválido (2-120 caracteres)' });
        }
        if (!VALIDATORS.cpf(cpf)) {
            return res.status(400).json({ error: 'CPF inválido (formato: 000.000.000-00)' });
        }
        if (!VALIDATORS.phone(phone)) {
            return res.status(400).json({ error: 'Telefone inválido (8-20 caracteres)' });
        }

        // Validar membros da família
        const cleanFamilyMembers = [];
        if (Array.isArray(familyMembers)) {
            if (familyMembers.length > 20) {
                return res.status(400).json({ error: 'Máximo de 20 acompanhantes' });
            }
            for (const member of familyMembers) {
                if (!VALIDATORS.familyMemberName(member.name)) {
                    return res.status(400).json({ error: 'Nome de acompanhante inválido' });
                }
                if (!VALIDATORS.relationship(member.relationship)) {
                    return res.status(400).json({ error: 'Parentesco inválido' });
                }
                cleanFamilyMembers.push({
                    name: sanitize(member.name),
                    relationship: sanitize(member.relationship),
                });
            }
        }

        // SEGURANÇA: Operação atômica com lock de escrita
        const result = await new Promise((resolve, reject) => {
            withWriteLock(async () => {
                try {
                    const currentRSVPs = await getRSVPs();

                    // Checagem de duplicatas
                    const duplicate = currentRSVPs.find(rsvp =>
                        (rsvp.cpf && rsvp.cpf === sanitize(cpf)) ||
                        (rsvp.phone && rsvp.phone === sanitize(phone))
                    );

                    if (duplicate) {
                        resolve({ status: 400, data: { error: 'CPF ou Telefone já registrado.' } });
                        return;
                    }

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
                    resolve({ status: 201, data: newRSVP });
                } catch (error) {
                    reject(error);
                }
            });
        });

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error('ERRO CRÍTICO AO SALVAR RSVP:', error);
        res.status(500).json({ error: 'Erro interno ao salvar confirmação' });
    }
});

// ===================================================================
// ROTA: DELETE RSVP por CPF — PROTEGIDA (só admin)
// ===================================================================
app.delete('/api/rsvps/:cpf', authenticateAdmin, async (req, res) => {
    try {
        const { cpf } = req.params;

        if (!VALIDATORS.cpf(cpf)) {
            return res.status(400).json({ error: 'CPF inválido' });
        }

        const result = await new Promise((resolve, reject) => {
            withWriteLock(async () => {
                try {
                    const currentRSVPs = await getRSVPs();
                    const updatedRSVPs = currentRSVPs.filter(rsvp => rsvp.cpf !== cpf);

                    if (currentRSVPs.length === updatedRSVPs.length) {
                        resolve({ status: 404, data: { error: 'RSVP não encontrado' } });
                        return;
                    }

                    await saveRSVPsStore(updatedRSVPs);
                    resolve({ status: 200, data: { message: 'RSVP removido com sucesso' } });
                } catch (error) {
                    reject(error);
                }
            });
        });

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error('Erro ao deletar RSVP:', error);
        res.status(500).json({ error: 'Erro ao deletar RSVP' });
    }
});

// ===================================================================
// ROTA: DELETE ALL RSVPs — PROTEGIDA (só admin)
// ===================================================================
app.delete('/api/rsvps', authenticateAdmin, async (req, res) => {
    try {
        await withWriteLock(async () => {
            await saveRSVPsStore([]);
        });
        res.json({ message: 'Todos os RSVPs foram apagados' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao apagar RSVPs' });
    }
});

// ===================================================================
// ROTA: POST Donations — PÚBLICA (com validação + rate limit)
// ===================================================================
app.post('/api/donations', donationLimiter, async (req, res) => {
    try {
        const { cpf, amount, receipt } = req.body;

        // SEGURANÇA: Validação de inputs
        if (!VALIDATORS.cpf(cpf)) {
            return res.status(400).json({ error: 'CPF inválido' });
        }
        if (!VALIDATORS.amount(amount)) {
            return res.status(400).json({ error: 'Valor inválido (deve ser positivo e menor que R$100.000)' });
        }
        if (!receipt || typeof receipt !== 'string') {
            return res.status(400).json({ error: 'Comprovante é obrigatório' });
        }

        // SEGURANÇA: Validar magic bytes do comprovante base64
        if (!validateBase64Image(receipt)) {
            return res.status(400).json({ error: 'Comprovante inválido. Envie uma imagem real (JPEG, PNG, GIF ou WebP).' });
        }

        // SEGURANÇA: Operação atômica
        const result = await new Promise((resolve, reject) => {
            withWriteLock(async () => {
                try {
                    const currentRSVPs = await getRSVPs();
                    const rsvpIndex = currentRSVPs.findIndex(r => r.cpf === sanitize(cpf));

                    if (rsvpIndex === -1) {
                        resolve({ status: 404, data: { error: 'Nenhuma confirmação de presença encontrada para este CPF' } });
                        return;
                    }

                    currentRSVPs[rsvpIndex].donation = {
                        amount: Number(amount),
                        receiptUrl: receipt,
                        date: new Date().toISOString()
                    };

                    await saveRSVPsStore(currentRSVPs);
                    resolve({ status: 200, data: { message: 'Doação registrada com sucesso', donation: currentRSVPs[rsvpIndex].donation } });
                } catch (error) {
                    reject(error);
                }
            });
        });

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error('Erro ao registrar doação:', error);
        res.status(500).json({ error: 'Erro ao registrar doação' });
    }
});

// ===================================================================
// Error handler global (não vazar stack traces)
// ===================================================================
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
    console.log(`Backend server rodando na porta ${PORT}`);
});
