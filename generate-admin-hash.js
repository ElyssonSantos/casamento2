/**
 * =====================================================================
 * GERADOR DE HASH ADMIN — Casamento2
 * =====================================================================
 * Use este script para gerar o hash bcrypt da sua senha admin.
 * 
 * Uso: node generate-admin-hash.js "suasenha"
 * 
 * Depois, copie o hash para o .env como ADMIN_PASSWORD_HASH
 * =====================================================================
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
    console.error('Uso: node generate-admin-hash.js "suasenha"');
    console.error('Exemplo: node generate-admin-hash.js "171026"');
    process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log('\n✅ Hash gerado com sucesso!\n');
console.log('Adicione esta linha ao seu arquivo .env:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('\n');
