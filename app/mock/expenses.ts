export interface Expense {
    id: number;
    description: string;
    amount: number;
    category: string;
    date: string;
    color: string;
    isPaid?: boolean;
}

export interface Income {
    id: number;
    description: string;
    amount: number;
    source: string;
    date: string;
    isPaid?: boolean;
}

export const mockExpenses: Expense[] = [
    // Setembro 2025
    { id: 1, description: "Aluguel", amount: 1500, category: "Moradia", date: "2025-09-05", color: "#1976D2" },
    { id: 2, description: "Conta de Luz", amount: 160, category: "Moradia", date: "2025-09-10", color: "#1976D2" },
    { id: 3, description: "Conta de Água", amount: 85, category: "Moradia", date: "2025-09-10", color: "#1976D2" },
    { id: 4, description: "Internet", amount: 120, category: "Moradia", date: "2025-09-08", color: "#1976D2" },
    { id: 5, description: "Supermercado", amount: 780, category: "Alimentação", date: "2025-09-03", color: "#F57C00" },
    { id: 6, description: "Restaurante", amount: 95, category: "Alimentação", date: "2025-09-14", color: "#F57C00" },
    { id: 7, description: "Gasolina", amount: 280, category: "Transporte", date: "2025-09-04", color: "#0097A7" },
    { id: 8, description: "Plano de Saúde", amount: 450, category: "Saúde", date: "2025-09-01", color: "#D32F2F" },
    { id: 9, description: "Academia", amount: 110, category: "Lazer", date: "2025-09-01", color: "#7B1FA2" },
    { id: 10, description: "Netflix", amount: 45, category: "Lazer", date: "2025-09-05", color: "#7B1FA2" },
    { id: 11, description: "Spotify", amount: 22, category: "Lazer", date: "2025-09-05", color: "#7B1FA2" },

    // Outubro 2025
    { id: 12, description: "Aluguel", amount: 1500, category: "Moradia", date: "2025-10-05", color: "#1976D2" },
    { id: 13, description: "Conta de Luz", amount: 175, category: "Moradia", date: "2025-10-10", color: "#1976D2" },
    { id: 14, description: "Conta de Água", amount: 90, category: "Moradia", date: "2025-10-10", color: "#1976D2" },
    { id: 15, description: "Internet", amount: 120, category: "Moradia", date: "2025-10-08", color: "#1976D2" },
    { id: 16, description: "Supermercado", amount: 920, category: "Alimentação", date: "2025-10-02", color: "#F57C00" },
    { id: 17, description: "iFood", amount: 180, category: "Alimentação", date: "2025-10-18", color: "#F57C00" },
    { id: 18, description: "Restaurante", amount: 150, category: "Alimentação", date: "2025-10-22", color: "#F57C00" },
    { id: 19, description: "Gasolina", amount: 310, category: "Transporte", date: "2025-10-06", color: "#0097A7" },
    { id: 20, description: "Uber", amount: 65, category: "Transporte", date: "2025-10-15", color: "#0097A7" },
    { id: 21, description: "Plano de Saúde", amount: 450, category: "Saúde", date: "2025-10-01", color: "#D32F2F" },
    { id: 22, description: "Farmácia", amount: 120, category: "Saúde", date: "2025-10-12", color: "#D32F2F" },
    { id: 23, description: "Academia", amount: 110, category: "Lazer", date: "2025-10-01", color: "#7B1FA2" },
    { id: 24, description: "Netflix", amount: 45, category: "Lazer", date: "2025-10-05", color: "#7B1FA2" },
    { id: 25, description: "Spotify", amount: 22, category: "Lazer", date: "2025-10-05", color: "#7B1FA2" },
    { id: 26, description: "Curso Online", amount: 200, category: "Educação", date: "2025-10-09", color: "#388E3C" },

    // Novembro 2025
    { id: 27, description: "Aluguel", amount: 1500, category: "Moradia", date: "2025-11-05", color: "#1976D2" },
    { id: 28, description: "Conta de Luz", amount: 190, category: "Moradia", date: "2025-11-10", color: "#1976D2" },
    { id: 29, description: "Conta de Água", amount: 88, category: "Moradia", date: "2025-11-10", color: "#1976D2" },
    { id: 30, description: "Internet", amount: 120, category: "Moradia", date: "2025-11-08", color: "#1976D2" },
    { id: 31, description: "Supermercado", amount: 870, category: "Alimentação", date: "2025-11-04", color: "#F57C00" },
    { id: 32, description: "Restaurante", amount: 200, category: "Alimentação", date: "2025-11-15", color: "#F57C00" },
    { id: 33, description: "iFood", amount: 160, category: "Alimentação", date: "2025-11-20", color: "#F57C00" },
    { id: 34, description: "Gasolina", amount: 290, category: "Transporte", date: "2025-11-03", color: "#0097A7" },
    { id: 35, description: "Estacionamento", amount: 50, category: "Transporte", date: "2025-11-11", color: "#0097A7" },
    { id: 36, description: "Plano de Saúde", amount: 450, category: "Saúde", date: "2025-11-01", color: "#D32F2F" },
    { id: 37, description: "Academia", amount: 110, category: "Lazer", date: "2025-11-01", color: "#7B1FA2" },
    { id: 38, description: "Netflix", amount: 45, category: "Lazer", date: "2025-11-05", color: "#7B1FA2" },
    { id: 39, description: "Spotify", amount: 22, category: "Lazer", date: "2025-11-05", color: "#7B1FA2" },
    { id: 40, description: "Presente Aniversário", amount: 250, category: "Lazer", date: "2025-11-18", color: "#7B1FA2" },

    // Dezembro 2025
    { id: 41, description: "Aluguel", amount: 1500, category: "Moradia", date: "2025-12-05", color: "#1976D2" },
    { id: 42, description: "Conta de Luz", amount: 210, category: "Moradia", date: "2025-12-10", color: "#1976D2" },
    { id: 43, description: "Conta de Água", amount: 100, category: "Moradia", date: "2025-12-10", color: "#1976D2" },
    { id: 44, description: "Internet", amount: 120, category: "Moradia", date: "2025-12-08", color: "#1976D2" },
    { id: 45, description: "Supermercado", amount: 1100, category: "Alimentação", date: "2025-12-03", color: "#F57C00" },
    { id: 46, description: "Restaurante", amount: 300, category: "Alimentação", date: "2025-12-20", color: "#F57C00" },
    { id: 47, description: "iFood", amount: 220, category: "Alimentação", date: "2025-12-15", color: "#F57C00" },
    { id: 48, description: "Gasolina", amount: 350, category: "Transporte", date: "2025-12-04", color: "#0097A7" },
    { id: 49, description: "Uber", amount: 120, category: "Transporte", date: "2025-12-24", color: "#0097A7" },
    { id: 50, description: "Plano de Saúde", amount: 450, category: "Saúde", date: "2025-12-01", color: "#D32F2F" },
    { id: 51, description: "Farmácia", amount: 60, category: "Saúde", date: "2025-12-12", color: "#D32F2F" },
    { id: 52, description: "Academia", amount: 110, category: "Lazer", date: "2025-12-01", color: "#7B1FA2" },
    { id: 53, description: "Netflix", amount: 45, category: "Lazer", date: "2025-12-05", color: "#7B1FA2" },
    { id: 54, description: "Spotify", amount: 22, category: "Lazer", date: "2025-12-05", color: "#7B1FA2" },
    { id: 55, description: "Presentes de Natal", amount: 600, category: "Lazer", date: "2025-12-22", color: "#7B1FA2" },
    { id: 56, description: "Ceia de Natal", amount: 350, category: "Alimentação", date: "2025-12-24", color: "#F57C00" },

    // Janeiro 2026
    { id: 57, description: "Aluguel", amount: 1550, category: "Moradia", date: "2026-01-05", color: "#1976D2" },
    { id: 58, description: "Conta de Luz", amount: 200, category: "Moradia", date: "2026-01-10", color: "#1976D2" },
    { id: 59, description: "Conta de Água", amount: 92, category: "Moradia", date: "2026-01-10", color: "#1976D2" },
    { id: 60, description: "Internet", amount: 120, category: "Moradia", date: "2026-01-08", color: "#1976D2" },
    { id: 61, description: "Supermercado", amount: 830, category: "Alimentação", date: "2026-01-02", color: "#F57C00" },
    { id: 62, description: "Restaurante", amount: 110, category: "Alimentação", date: "2026-01-17", color: "#F57C00" },
    { id: 63, description: "iFood", amount: 190, category: "Alimentação", date: "2026-01-25", color: "#F57C00" },
    { id: 64, description: "Gasolina", amount: 300, category: "Transporte", date: "2026-01-05", color: "#0097A7" },
    { id: 65, description: "Estacionamento", amount: 45, category: "Transporte", date: "2026-01-14", color: "#0097A7" },
    { id: 66, description: "Uber", amount: 70, category: "Transporte", date: "2026-01-20", color: "#0097A7" },
    { id: 67, description: "Plano de Saúde", amount: 450, category: "Saúde", date: "2026-01-01", color: "#D32F2F" },
    { id: 68, description: "Farmácia", amount: 90, category: "Saúde", date: "2026-01-09", color: "#D32F2F" },
    { id: 69, description: "Academia", amount: 110, category: "Lazer", date: "2026-01-01", color: "#7B1FA2" },
    { id: 70, description: "Netflix", amount: 45, category: "Lazer", date: "2026-01-05", color: "#7B1FA2" },
    { id: 71, description: "Spotify", amount: 22, category: "Lazer", date: "2026-01-05", color: "#7B1FA2" },
    { id: 72, description: "IPVA", amount: 1200, category: "Transporte", date: "2026-01-15", color: "#0097A7" },
    { id: 73, description: "Material Escolar", amount: 350, category: "Educação", date: "2026-01-28", color: "#388E3C" },

    // Fevereiro 2026
    { id: 74, description: "Aluguel", amount: 1550, category: "Moradia", date: "2026-02-05", color: "#1976D2" },
    { id: 75, description: "Conta de Luz", amount: 180, category: "Moradia", date: "2026-02-10", color: "#1976D2" },
    { id: 76, description: "Conta de Água", amount: 95, category: "Moradia", date: "2026-02-10", color: "#1976D2" },
    { id: 77, description: "Internet", amount: 120, category: "Moradia", date: "2026-02-08", color: "#1976D2" },
    { id: 78, description: "Supermercado", amount: 850, category: "Alimentação", date: "2026-02-03", color: "#F57C00" },
    { id: 79, description: "Restaurante", amount: 120, category: "Alimentação", date: "2026-02-07", color: "#F57C00" },
    { id: 80, description: "iFood", amount: 200, category: "Alimentação", date: "2026-02-12", color: "#F57C00" },
    { id: 81, description: "Gasolina", amount: 300, category: "Transporte", date: "2026-02-04", color: "#0097A7" },
    { id: 82, description: "Estacionamento", amount: 60, category: "Transporte", date: "2026-02-09", color: "#0097A7" },
    { id: 83, description: "Uber", amount: 85, category: "Transporte", date: "2026-02-13", color: "#0097A7" },
    { id: 84, description: "Plano de Saúde", amount: 450, category: "Saúde", date: "2026-02-01", color: "#D32F2F" },
    { id: 85, description: "Farmácia", amount: 75, category: "Saúde", date: "2026-02-06", color: "#D32F2F" },
    { id: 86, description: "Academia", amount: 110, category: "Lazer", date: "2026-02-01", color: "#7B1FA2" },
    { id: 87, description: "Netflix", amount: 45, category: "Lazer", date: "2026-02-05", color: "#7B1FA2" },
    { id: 88, description: "Spotify", amount: 22, category: "Lazer", date: "2026-02-05", color: "#7B1FA2" },
    { id: 89, description: "Curso Online", amount: 200, category: "Educação", date: "2026-02-02", color: "#388E3C" },
];

export const mockIncome: Income[] = [
    // Setembro 2025
    { id: 1, description: "Salário", amount: 5500, source: "Emprego", date: "2025-09-05" },
    { id: 2, description: "Freelance", amount: 800, source: "Freelance", date: "2025-09-20" },

    // Outubro 2025
    { id: 3, description: "Salário", amount: 5500, source: "Emprego", date: "2025-10-05" },
    { id: 4, description: "Freelance", amount: 600, source: "Freelance", date: "2025-10-18" },

    // Novembro 2025
    { id: 5, description: "Salário", amount: 5500, source: "Emprego", date: "2025-11-05" },
    { id: 6, description: "Freelance", amount: 1200, source: "Freelance", date: "2025-11-22" },

    // Dezembro 2025
    { id: 7, description: "Salário", amount: 5500, source: "Emprego", date: "2025-12-05" },
    { id: 8, description: "13º Salário", amount: 5500, source: "Emprego", date: "2025-12-20" },
    { id: 9, description: "Freelance", amount: 400, source: "Freelance", date: "2025-12-15" },

    // Janeiro 2026
    { id: 10, description: "Salário", amount: 5800, source: "Emprego", date: "2026-01-05" },
    { id: 11, description: "Freelance", amount: 900, source: "Freelance", date: "2026-01-25" },

    // Fevereiro 2026
    { id: 12, description: "Salário", amount: 5800, source: "Emprego", date: "2026-02-05" },
    { id: 13, description: "Freelance", amount: 700, source: "Freelance", date: "2026-02-14" },
];

const COLORS = ["#1976d2", "#f57c00", "#388e3c", "#d32f2f", "#7b1fa2", "#0097a7"];

const MONTH_LABELS: Record<string, string> = {
    "2025-09": "Set/25",
    "2025-10": "Out/25",
    "2025-11": "Nov/25",
    "2025-12": "Dez/25",
    "2026-01": "Jan/26",
    "2026-02": "Fev/26",
};

export const expensesByCategory = Object.entries(
    mockExpenses.reduce<Record<string, number>>((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {})
).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length],
}));

export const monthlyBalance = Object.keys(MONTH_LABELS).map((monthKey) => {
    const totalExpenses = mockExpenses
        .filter((e) => e.date.startsWith(monthKey))
        .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = mockIncome
        .filter((i) => i.date.startsWith(monthKey))
        .reduce((sum, i) => sum + i.amount, 0);

    return {
        month: MONTH_LABELS[monthKey],
        despesas: totalExpenses,
        receitas: totalIncome,
        saldo: totalIncome - totalExpenses,
    };
});
