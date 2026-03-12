const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/rsvps';
const RSVP_KEY = 'casamento_rsvps';

const migrateLocalData = async () => {
    try {
        const localData = localStorage.getItem(RSVP_KEY);
        if (localData) {
            const parsedData = JSON.parse(localData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                for (const item of parsedData) {
                    try {
                        const duplicateCheck = await fetch(API_URL);
                        const duplicateData = await duplicateCheck.json();
                        const exists = duplicateData.list.some(rsvp => rsvp.cpf === item.cpf || rsvp.phone === item.phone);
                        if (!exists) {
                            await fetch(API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(item),
                            });
                        }
                    } catch (e) {
                        console.error('Erro ao migrar item:', e);
                    }
                }
            }
            localStorage.removeItem(RSVP_KEY);
        }
    } catch (error) {
        console.error('Falha na migração:', error);
    }
};

export const saveRSVP = async (data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar RSVP");
    }

    return response.json();
};

export const getRSVPs = async () => {
    await migrateLocalData();
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Erro ao buscar RSVPs");
    }
    const data = await response.json();
    return data.list;
};

export const clearRSVPs = async () => {
    const response = await fetch(API_URL, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error("Erro ao apagar RSVPs");
    }
};

export const getStats = async () => {
    await migrateLocalData();
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Erro ao buscar estatísticas");
    }
    return response.json();
};

export const registerDonation = async (formData) => {
    const DONATION_URL = API_URL.replace('/rsvps', '/donations');
    const response = await fetch(DONATION_URL, {
        method: 'POST',
        // Note: Do not stringify FormData, fetch does it automatically and sets the boundary header
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao registrar doação");
    }

    return response.json();
};
