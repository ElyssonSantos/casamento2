import express from 'express';
import cors from 'cors';
import { kv } from '@vercel/kv';
import multer from 'multer';

const app = express();

app.use(cors());
app.use(express.json());

const UPLOADS_DIR = '/tmp'; // Vercel only allows writing to /tmp

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

const getRSVPs = async () => {
    try {
        const data = await kv.get(RSVP_KV_KEY);
        // KV returns null if empty
        return data || [];
    } catch (error) {
        console.error('Error reading from KV:', error);
        return [];
    }
};

const saveRSVPsStore = async (rsvps) => {
    await kv.set(RSVP_KV_KEY, rsvps);
};

app.get('/api/rsvps', async (req, res) => {
    try {
        const rsvps = await getRSVPs();
        res.json({ total: rsvps.length, list: rsvps });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar RSVPs' });
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
