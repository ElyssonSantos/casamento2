import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = 'c:/Users/elyss/Desktop/casamento2-main/data/rsvps.json';

async function test() {
    try {
        console.log('Tentando ler o arquivo...');
        const data = await fs.readFile(DATA_FILE, 'utf8');
        console.log('Leitura bem-sucedida. Conteúdo:', data.substring(0, 50));
        
        console.log('Tentando escrever no arquivo...');
        const rsvps = JSON.parse(data);
        await fs.writeFile(DATA_FILE, JSON.stringify(rsvps, null, 2), 'utf8');
        console.log('Escrita bem-sucedida.');
    } catch (error) {
        console.error('ERRO:', error);
    }
}

test();
