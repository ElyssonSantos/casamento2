
import Redis from 'ioredis';

const redisUrl = "redis://default:YYvDWVLDaVscfl7zcDcLMeN3zfQtOsHF@redis-17948.c245.us-east-1-3.ec2.cloud.redislabs.com:17948";

async function testRedis() {
    console.log("Tentando conectar ao Redis...");
    const redis = new Redis(redisUrl);

    try {
        await redis.set('test_key', 'Hello from Antigravity ' + new Date().toISOString());
        const val = await redis.get('test_key');
        console.log("SUCESSO! Valor recuperado:", val);
        process.exit(0);
    } catch (err) {
        console.error("FALHA na conexão Redis:", err);
        process.exit(1);
    }
}

testRedis();
