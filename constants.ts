
// === LUMINA ROYAL DESIGN SYSTEM ===
// Semantically meaningful colors and tokens for the 6-figure Empire

export const LUMINA_COLORS = {
    // Income/Revenue: Oro Champagne Luminoso
    income: '#D4A853',  // Gold Royal
    incomeLight: 'hsla(43, 65%, 58%, 0.3)',

    // Expenses: Rosa Champagne elegante
    expense: '#C9A18C',  // Rose Champagne
    expenseLight: 'hsla(20, 35%, 67%, 0.3)',

    // Payroll: Blu Navy Royal
    payroll: '#2C3E50',
    payrollLight: 'hsla(210, 29%, 24%, 0.3)',

    // Status: Sage Green (Success/Safe)
    success: '#8FA691',
    successLight: 'hsla(125, 12%, 61%, 0.3)',

    // Accents: White/Stone base
    stone: '#F5F5F4',
    gold: '#D4A853',
    emerald: '#8FA691',
    amber: '#D4A853'
};

export const PROGRAM_COLORS = {
    Coaching: LUMINA_COLORS.income,
    Holistic: LUMINA_COLORS.success
};

export default {
    LUMINA_COLORS,
    PROGRAM_COLORS
};
