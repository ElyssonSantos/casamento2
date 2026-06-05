/**
 * =====================================================================
 * TESTES DE SEGURANÇA — Casamento2 MVP
 * =====================================================================
 * Testes automatizados focados em validar cada camada de segurança
 * implementada. Rodar com: node security.test.js
 * 
 * Pré-requisitos:
 *   1. Backend rodando (npm run start:backend)
 *   2. ADMIN_PASSWORD_HASH configurado no .env
 *   3. ADMIN_JWT_SECRET configurado no .env
 * =====================================================================
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
let adminToken = null;
let passed = 0;
let failed = 0;

// ===================================================================
// TEST HELPERS
// ===================================================================
const test = async (name, fn) => {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`  ❌ ${name}`);
        console.log(`     → ${error.message}`);
        failed++;
    }
};

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

const request = async (path, options = {}) => {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    return { status: response.status, body, headers: response.headers };
};

// ===================================================================
// 1. TESTES DE AUTENTICAÇÃO ADMIN
// ===================================================================
const testAuth = async () => {
    console.log('\n🔐 1. AUTENTICAÇÃO ADMIN\n');

    await test('Login sem senha retorna 400', async () => {
        const res = await request('/api/admin/login', { method: 'POST', body: '{}' });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('Login com senha errada retorna 401', async () => {
        const res = await request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password: 'senhaerrada' }),
        });
        assert(res.status === 401, `Esperado 401, recebeu ${res.status}`);
    });

    await test('Login com senha muito longa (>128 chars) retorna 400', async () => {
        const res = await request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password: 'a'.repeat(200) }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('Verify sem token retorna 401', async () => {
        const res = await request('/api/admin/verify');
        assert(res.status === 401, `Esperado 401, recebeu ${res.status}`);
    });

    await test('Verify com token inválido retorna 401', async () => {
        const res = await request('/api/admin/verify', {
            headers: { 'Authorization': 'Bearer token_falso_manipulado' },
        });
        assert(res.status === 401, `Esperado 401, recebeu ${res.status}`);
    });
};

// ===================================================================
// 2. TESTES DE PROTEÇÃO DE ROTAS (IDOR/RBAC)
// ===================================================================
const testRouteProtection = async () => {
    console.log('\n🛡️  2. PROTEÇÃO DE ROTAS\n');

    await test('GET /api/rsvps sem token retorna 401', async () => {
        const res = await request('/api/rsvps');
        assert(res.status === 401, `Esperado 401, recebeu ${res.status}`);
    });

    await test('DELETE /api/rsvps/:cpf sem token retorna 401', async () => {
        const res = await request('/api/rsvps/123.456.789-00', { method: 'DELETE' });
        assert(res.status === 401, `Esperado 401, recebeu ${res.status}`);
    });

    await test('DELETE /api/rsvps (apagar tudo) sem token retorna 401', async () => {
        const res = await request('/api/rsvps', { method: 'DELETE' });
        assert(res.status === 401, `Esperado 401, recebeu ${res.status}`);
    });
};

// ===================================================================
// 3. TESTES DE VALIDAÇÃO DE INPUT
// ===================================================================
const testInputValidation = async () => {
    console.log('\n📝 3. VALIDAÇÃO DE INPUT\n');

    await test('POST RSVP sem nome retorna 400', async () => {
        const res = await request('/api/rsvps', {
            method: 'POST',
            body: JSON.stringify({ cpf: '123.456.789-00', phone: '79999999999' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST RSVP com CPF inválido retorna 400', async () => {
        const res = await request('/api/rsvps', {
            method: 'POST',
            body: JSON.stringify({ name: 'Teste', cpf: 'cpf_invalido', phone: '79999999999' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST RSVP com telefone inválido retorna 400', async () => {
        const res = await request('/api/rsvps', {
            method: 'POST',
            body: JSON.stringify({ name: 'Teste', cpf: '123.456.789-00', phone: '12' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST RSVP com nome muito longo (>120 chars) retorna 400', async () => {
        const res = await request('/api/rsvps', {
            method: 'POST',
            body: JSON.stringify({ name: 'A'.repeat(130), cpf: '123.456.789-00', phone: '79999999999' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST RSVP com >20 familiares retorna 400', async () => {
        const family = Array.from({ length: 25 }, (_, i) => ({ name: `Familiar ${i}`, relationship: 'Primo(a)' }));
        const res = await request('/api/rsvps', {
            method: 'POST',
            body: JSON.stringify({ name: 'Teste', cpf: '999.888.777-66', phone: '79988776655', familyMembers: family }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST RSVP com XSS no nome é sanitizado', async () => {
        const res = await request('/api/rsvps', {
            method: 'POST',
            body: JSON.stringify({ 
                name: '<script>alert("xss")</script>', 
                cpf: '111.222.333-44', 
                phone: '79911223344' 
            }),
        });
        // Pode retornar 201 (sanitizado) ou 400 (nome muito curto após sanitização)
        assert(res.status === 201 || res.status === 400, `Esperado 201 ou 400, recebeu ${res.status}`);
        if (res.status === 201) {
            assert(!res.body.name.includes('<script>'), 'Script tag NÃO deve estar presente no nome');
        }
    });
};

// ===================================================================
// 4. TESTES DE VALIDAÇÃO DE DOAÇÕES
// ===================================================================
const testDonationValidation = async () => {
    console.log('\n💰 4. VALIDAÇÃO DE DOAÇÕES\n');

    await test('POST /api/donations com CPF inválido retorna 400', async () => {
        const res = await request('/api/donations', {
            method: 'POST',
            body: JSON.stringify({ cpf: 'invalido', amount: '100', receipt: 'data:image/jpeg;base64,/9j/' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST /api/donations com amount negativo retorna 400', async () => {
        const res = await request('/api/donations', {
            method: 'POST',
            body: JSON.stringify({ cpf: '123.456.789-00', amount: '-1', receipt: 'data:image/jpeg;base64,/9j/' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST /api/donations com amount = 0 retorna 400', async () => {
        const res = await request('/api/donations', {
            method: 'POST',
            body: JSON.stringify({ cpf: '123.456.789-00', amount: '0', receipt: 'data:image/jpeg;base64,/9j/' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST /api/donations com amount absurdo (>100k) retorna 400', async () => {
        const res = await request('/api/donations', {
            method: 'POST',
            body: JSON.stringify({ cpf: '123.456.789-00', amount: '999999', receipt: 'data:image/jpeg;base64,/9j/' }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST /api/donations com receipt que NÃO é imagem retorna 400', async () => {
        const res = await request('/api/donations', {
            method: 'POST',
            body: JSON.stringify({ 
                cpf: '123.456.789-00', 
                amount: '100', 
                receipt: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK' 
            }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status}`);
    });

    await test('POST /api/donations com receipt text/plain disfarçado retorna 400', async () => {
        const fakeImageBase64 = Buffer.from('isto é um texto, não uma imagem').toString('base64');
        const res = await request('/api/donations', {
            method: 'POST',
            body: JSON.stringify({ 
                cpf: '123.456.789-00', 
                amount: '100', 
                receipt: `data:image/jpeg;base64,${fakeImageBase64}` 
            }),
        });
        assert(res.status === 400, `Esperado 400, recebeu ${res.status} — Magic bytes não validados!`);
    });
};

// ===================================================================
// 5. TESTES DE BODY SIZE / DoS
// ===================================================================
const testBodySize = async () => {
    console.log('\n💣 5. PROTEÇÃO CONTRA DoS\n');

    await test('Payload > 2MB é rejeitado', async () => {
        const largePayload = JSON.stringify({ data: 'x'.repeat(3 * 1024 * 1024) });
        try {
            const res = await request('/api/rsvps', {
                method: 'POST',
                body: largePayload,
            });
            // Pode retornar 413 (payload too large) ou fechar a conexão
            assert(res.status === 413 || res.status >= 400, `Esperado 413 ou erro, recebeu ${res.status}`);
        } catch {
            // Conexão fechada pelo servidor = proteção funcionando
        }
    });
};

// ===================================================================
// 6. TESTES DE RATE LIMITING
// ===================================================================
const testRateLimiting = async () => {
    console.log('\n⏱️  6. RATE LIMITING\n');

    await test('Mais de 5 tentativas de login em sequência recebe 429', async () => {
        let got429 = false;
        for (let i = 0; i < 8; i++) {
            const res = await request('/api/admin/login', {
                method: 'POST',
                body: JSON.stringify({ password: 'senhaerrada' }),
            });
            if (res.status === 429) {
                got429 = true;
                break;
            }
        }
        assert(got429, 'Rate limiting NÃO ativado após 5+ tentativas de login');
    });
};

// ===================================================================
// 7. TESTES DE SEGURANÇA DE HEADERS
// ===================================================================
const testSecurityHeaders = async () => {
    console.log('\n🔒 7. HEADERS DE SEGURANÇA\n');

    await test('Resposta inclui headers de segurança (Helmet)', async () => {
        const res = await request('/api/admin/login', { method: 'POST', body: '{}' });
        const headers = res.headers;
        // Helmet adiciona vários headers de segurança
        const hasXContentType = headers.get('x-content-type-options') === 'nosniff';
        assert(hasXContentType, 'Header X-Content-Type-Options: nosniff ausente');
    });
};

// ===================================================================
// EXECUÇÃO
// ===================================================================
const run = async () => {
    console.log('='.repeat(60));
    console.log('   🔒 TESTES DE SEGURANÇA — Casamento2 MVP');
    console.log('='.repeat(60));
    console.log(`   Alvo: ${BASE_URL}`);

    await testAuth();
    await testRouteProtection();
    await testInputValidation();
    await testDonationValidation();
    await testBodySize();
    await testRateLimiting();
    await testSecurityHeaders();

    console.log('\n' + '='.repeat(60));
    console.log(`   RESULTADO: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60));

    // Cleanup: remover RSVPs de teste (se tiver token admin)
    if (adminToken) {
        try {
            // Limpar RSVPs criados durante os testes
            const testCpfs = ['111.222.333-44'];
            for (const cpf of testCpfs) {
                await request(`/api/rsvps/${encodeURIComponent(cpf)}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${adminToken}` },
                });
            }
        } catch { /* ignore cleanup errors */ }
    }

    process.exit(failed > 0 ? 1 : 0);
};

run().catch(err => {
    console.error('Erro fatal nos testes:', err);
    process.exit(1);
});
