import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'receipts');

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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Ensure data directory and file exist
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
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};

const saveRSVPsStore = async (rsvps) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(rsvps, null, 2), 'utf8');
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

        // Check for duplicates
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
        res.status(500).json({ error: 'Erro ao salvar RSVP' });
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

app.listen(PORT, () => {
    console.log(`Backend server rodando na porta ${PORT}`);
});
