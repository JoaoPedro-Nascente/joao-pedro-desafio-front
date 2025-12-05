import { mockData } from './mock/transactions.js';

// ---
// ESTADO GLOBAL
// ---
let transactions = [...mockData];
let currentTheme = 'light';

// ---
// SELETORES DO DOM (Constantes - Padrão UPPER_SNAKE_CASE)
// ---
const THEME_SWITCHER = document.getElementById('theme-switcher');

// ---
// FUNÇÕES AUXILIARES 
// ---

/**
 * Formata uma string de data (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY).
 * @param {string} dateString - A data no formato ISO.
 * @returns {string} A data formatada.
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00')

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
}

/**
 * Formata um número para o formato de moeda Real (R$ X.XXX,XX).
 * * @param {number} amount - O valor numérico a ser formatado.
 * @returns {string} O valor formatado como string de moeda.
 */
function formatCurrency(amount) {
    return Math.abs(amount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
}


// ---
// MANIPULADORES DE EVENTOS
// ---

/**
 * Lida com o clique no botão de trocar o tema (Light/Dark).
 */
THEME_SWITCHER.addEventListener('click', () => {
});

/**
 * Renderiza a lista completa de transações na interface do usuário (DOM).
 * * A função itera sobre o array 'mockData' e cria um novo elemento <li> 
 * para cada transação.
 * @param {HTMLElement} transactionsList - O elemento de lista de transações
 * * @returns {void}
 */
function renderTransactions(transactionsList) {
    mockData.forEach(transaction => {
        const listItem = document.createElement('li')

        const signClass = transaction.type === "income" ? "plus" : "minus";
        listItem.classList.add(signClass)

        const typeText = transaction.type === 'income' ? 'Entrada' : 'Saída'
        const sign = transaction.type === "expense" ? "-" : "";
        const formattedDate = formatDate(transaction.date)
        const formattedAmount = formatCurrency(transaction.amount)

        listItem.textContent = `
            ID: ${transaction.id},
            Valor: ${sign}${formattedAmount},
            Tipo: ${typeText},
            Data: ${formattedDate}
        `;

        transactionsList.appendChild(listItem)
    })
}

/**
 * Função de inicialização da aplicação. A "main"
 */
function init() {
    let transactions = [...mockData]

    const transactionsList = document.getElementById('transactions-list')

    renderTransactions(transactionsList)
}

// Inicia a aplicação
init();
