const RSVP_KEY = 'casamento_rsvps';

export const saveRSVP = (data) => {
    const currentRSVPs = getRSVPs();

    // Check for duplicates
    const duplicate = currentRSVPs.find(rsvp =>
        (rsvp.cpf && rsvp.cpf === data.cpf) ||
        (rsvp.phone && rsvp.phone === data.phone)
    );

    if (duplicate) {
        throw new Error("CPF ou Telefone já registrado.");
    }

    const newRSVP = {
        ...data,
        id: Date.now(),
        date: new Date().toISOString()
    };

    const updatedRSVPs = [...currentRSVPs, newRSVP];
    localStorage.setItem(RSVP_KEY, JSON.stringify(updatedRSVPs));
    return newRSVP;
};

export const getRSVPs = () => {
    const data = localStorage.getItem(RSVP_KEY);
    return data ? JSON.parse(data) : [];
};

export const clearRSVPs = () => {
    localStorage.removeItem(RSVP_KEY);
};

export const getStats = () => {
    const rsvps = getRSVPs();
    return {
        total: rsvps.length,
        list: rsvps
    };
};
