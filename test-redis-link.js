
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// SEGURANÇA: Credencial vem exclusivamente de variável de ambiente
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error("ERRO: REDIS_URL não definido. Configure no arquivo .env");
    process.exit(1);
}

async function testRedis() {
    console.log("Tentando conectar ao Redis...");
    const redis = new Redis(redisUrl);

    try {
        await redis.set('test_key', 'Hello from test ' + new Date().toISOString());
        const val = await redis.get('test_key');
        console.log("SUCESSO! Valor recuperado:", val);
        process.exit(0);
    } catch (err) {
        console.error("FALHA na conexão Redis:", err);
        process.exit(1);
    }
}

testRedis();
