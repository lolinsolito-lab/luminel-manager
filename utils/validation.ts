

export const validateEmail = (email: string): boolean => {
    // Enhanced regex supporting Italian providers and international domains
    // Supports: gmail.com, outlook.com, libero.it, virgilio.it, tiscali.it, tin.it, alice.it, etc.
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return false;
    }

    // Additional validation: ensure domain has at least 2 characters after the dot
    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const domain = parts[1];
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;

    // Check that TLD (top-level domain) is at least 2 characters
    const tld = domainParts[domainParts.length - 1];
    return tld.length >= 2;
};

export const validatePhone = (phone: string): boolean => {
    // Accetta formati: +39 333 1234567, 333-123-4567, (333) 1234567
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateDate = (date: string): boolean => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
};

export const validateWebhookUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' &&
            (parsed.hostname.includes('make.com') || parsed.hostname.includes('integromat.com'));
    } catch {
        return false;
    }
};
