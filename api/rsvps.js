import express from 'express';
import cors from 'cors';
import { createClient } from '@vercel/kv';
import Redis from 'ioredis';
import multer from 'multer';

const app = express();
console.log('--- API VERSÃO FINAL (HIBRIDA) CARREGADA ---');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const UPLOADS_DIR = '/tmp'; 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

const RSVP_KV_KEY = 'rsvps_list';

// 🔍 CONFIGURAÇÃO DE ALTA DISPONIBILIDADE (BLOCO DE NOTAS NA NUVEM)
const kvRestUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvRestToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Se não achar na Vercel, usa o link direto que você me mandou
const redisTcpUrl = process.env.REDIS_URL || process.env.KV_URL || "redis://default:YYvDWVLDaVscfl7zcDcLMeN3zfQtOsHF@redis-17948.c245.us-east-1-3.ec2.cloud.redislabs.com:17948";

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
        // Esta mensagem tem a data para sabermos se o deploy atualizou
        throw new Error('Banco de dados não configurado (Versão: 13/03 01:10). Verifique o REDIS_URL.');
    }
    try {
        const data = await dbClient.get(RSVP_KV_KEY);
        if (!data) return [];
        // Redis retorna string, KV já retorna objeto
        return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
        console.error('Erro na leitura do banco:', error);
        throw error;
    }
};

const saveRSVPsStore = async (rsvps) => {
    if (!dbClient) throw new Error('Cliente DB não inicializado');
    // Redis exige string, KV aceita objeto
    const value = dbType === 'redis' ? JSON.stringify(rsvps) : rsvps;
    await dbClient.set(RSVP_KV_KEY, value);
};

app.get('/api/rsvps', async (req, res) => {
    try {
        const rsvps = await getRSVPs();
        res.json({ total: rsvps.length, list: rsvps });
    } catch (error) {
        console.error('Erro na API GET /rsvps:', error);
        res.status(500).json({ error: 'Erro ao buscar: ' + (error.message || 'Erro interno') });
    }
});

app.post('/api/rsvps', async (req, res) => {
    try {
        const { name, cpf, phone } = req.body;
        
        if (!name || !cpf || !phone) {
            return res.status(400).json({ error: 'Nome, CPF e telefone são obrigatórios' });
        }

        const currentRSVPs = await getRSVPs();

        const duplicate = currentRSVPs.find(rsvp =>
            (rsvp.cpf && rsvp.cpf === cpf) ||
            (rsvp.phone && rsvp.phone === phone)
        );

        if (duplicate) {
            return res.status(400).json({ error: 'CPF ou Telefone já registrado.' });
        }

        const newRSVP = {
            name,
            cpf,
            phone,
            id: Date.now(),
            date: new Date().toISOString()
        };

        const updatedRSVPs = [...currentRSVPs, newRSVP];
        await saveRSVPsStore(updatedRSVPs);

        res.status(201).json(newRSVP);
    } catch (error) {
        console.error('ERRO CRÍTICO AO SALVAR RSVP (API):', error);
        res.status(500).json({ error: 'Erro ao salvar: ' + (error.message || 'Erro interno') });
    }
});

app.delete('/api/rsvps', async (req, res) => {
    try {
        await saveRSVPsStore([]);
        res.json({ message: 'Todos os RSVPs foram apagados' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao apagar RSVPs' });
    }
});

app.post('/api/donations', async (req, res) => {
    try {
        const { cpf, amount, receipt } = req.body;

        if (!cpf || !amount || !receipt) {
            return res.status(400).json({ error: 'CPF, valor e comprovante são obrigatórios' });
        }

        const currentRSVPs = await getRSVPs();
        const rsvpIndex = currentRSVPs.findIndex(r => r.cpf === cpf);

        if (rsvpIndex === -1) {
            return res.status(404).json({ error: 'Nenhuma confirmação de presença encontrada para este CPF' });
        }

        currentRSVPs[rsvpIndex].donation = {
            amount: amount,
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
