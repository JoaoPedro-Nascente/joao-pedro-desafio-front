import { mockData } from "./mock/transactions.js";

// ---
// ESTADO GLOBAL
// ---
let transactions = [...mockData];
let currentTheme = "light";

// ---
// VARIÁVEIS DE CHAVE E SELETORES DO DOM
// ---

// SELETORES DO DOM (Constantes - Padrão UPPER_SNAKE_CASE)
const THEME_SWITCHER = document.getElementById("theme-switcher");
const BODY = document.body;
const TRANSACTIONS_LIST = document.getElementById("transactions-list");
const FILTER_INPUT = document.getElementById("filter-description");
const TRANSACTIONS_FORM = document.getElementById("transaction-form");
const SORT_SELECT = document.getElementById("sort-by");
const BALANCE_ELEMENT = document.getElementById("balance");

// Variáveis de Chave
const TRANSACTIONS_STORAGE_KEY = "control_transactions";
const THEME_STORAGE_KEY = "app_theme";

// ---
// MÓDULO DE PERSISTÊNCIA (localStorage)
// ---

/**
 * Salva o array de transações no LocalStorage.
 * @returns {void}
 */
const saveTransactions = () => {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

/**
 * Carrega o array de transações do LocalStorage.
 * @returns {Array<object> | null} O array de transações ou null se não houver dados.
 */
const loadTransactions = () => {
  const storedData = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

  return storedData ? JSON.parse(storedData) : null;
};

/**
 * Salva a preferência de tema do usuário no LocalStorage.
 * @param {string} theme - 'light' ou 'dark'.
 * @returns {void}
 */
const saveTheme = (theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

/**
 * Carrega a preferência de tema do LocalStorage.
 * @returns {string | null} O tema ('light' ou 'dark') ou null.
 */
const loadTheme = () => {
  return localStorage.getItem(THEME_STORAGE_KEY);
};

// ---
// FUNÇÕES DE UTILIDADE E CÁLCULO
// ---

/**
 * Formata uma string de data (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY).
 * @param {string} dateString - A data no formato ISO.
 * @returns {string} A data formatada.
 */
function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formata um número para o formato de moeda Real (R$ X.XXX,XX).
 * * @param {number} amount - O valor numérico a ser formatado.
 * @returns {string} O valor formatado como string de moeda.
 */
function formatCurrency(amount) {
  // 💡 Aspas duplas mantidas por consistência com as template literals: 'pt-BR'
  return Math.abs(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Normaliza uma string removendo acentos
 * e converte para minúsculas para facilitar comparações não sensíveis.
 * @param {string} str - A string de entrada.
 * @returns {string} A string normalizada.
 */
const normalizeString = (str) => {
  if (!str) return "";

  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Calcula o saldo total da aplicação (Entradas - Saídas).
 * @returns {number} O valor numérico do saldo.
 */
function calculateBalance() {
  const total = transactions.reduce((accumulator, transaction) => {
    console.log(
      transaction.type === "income"
        ? transaction.amount
        : -1 * transaction.amount
    );
    const amount =
      transaction.type === "income"
        ? transaction.amount
        : -1 * transaction.amount;
    return accumulator + amount;
  }, 0);

  return total;
}

/**
 * Atualiza a exibição do saldo total no DOM.
 * @returns {void}
 */
const updateBalance = () => {
  const total = calculateBalance();

  const formattedTotal = formatCurrency(total);

  const signPrefix = Math.sign(total) === -1 ? "-" : "";

  BALANCE_ELEMENT.textContent = `${signPrefix} ${formattedTotal}`;

  BALANCE_ELEMENT.className =
    total >= 0 ? "positive-balance" : "negative-balance";
};

// ---
// FUNÇÕES DE MANIPULAÇÃO DE TRANSAÇÕES
// ---

/**
 * Gera um ID único simples para a nova transação.
 * @returns {number} O próximo ID disponível.
 */
function generateID() {
  //Encontra o maior id e adiciona 1
  const maxId = transactions.reduce((max, t) => (t.id > max ? t.id : max), 0);
  return maxId + 1;
}

/**
 * Adiciona uma nova transação ao array de dados e força a re-renderização da lista.
 * @param {string} description - Descrição da transação.
 * @param {number} amount - Valor da transação (positivo).
 * @param {string} type - Tipo da transação ('income' ou 'expense').
 * @param {string} date - Data da transação (AAAA-MM-DD).
 * @returns {void}
 */
function addTransaction(description, amount, type, date) {
  const newTransaction = {
    id: generateID(),
    description: description,
    amount: amount,
    type: type,
    date: date,
  };

  transactions.push(newTransaction);

  saveTransactions();

  renderNewTransaction(newTransaction, TRANSACTIONS_LIST);

  updateBalance();
}

/**
 * Remove uma transação do array global e re-renderiza a lista e o saldo.
 * @param {number} id - O ID da transação a ser excluída.
 * @returns {void}
 */
const deleteTransaction = (id) => {
  transactions = transactions.filter((transaction) => transaction.id !== id);

  saveTransactions();

  renderTransactions();

  updateBalance();
};

/**
 * Função para ordenar transações com base na opção selecionada.
 * * Usa Array.prototype.sort() para reordenar a lista global 'transactions'.
 * @param {string} criteria - O critério de ordenação (ex: 'date-newest', 'amount-highest').
 * @returns {void}
 */
const sortTransactions = (criteria) => {
  if (criteria === "default") {
    transactions.sort((a, b) => a.id - b.id);
    return;
  }

  switch (criteria) {
    case "date-newest":
      transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      break;
    case "date-oldest":
      transactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      break;
    case "amount-highest":
      transactions.sort((a, b) => b.amount - a.amount);
      break;
    case "amount-lowest":
      transactions.sort((a, b) => a.amount - b.amount);
      break;
  }
};

/**
 * Função para filtrar as transações.
 * @param {string} searchTerm - O texto a ser procurado na descrição.
 * @returns {Array<object>} Um novo array de transações que correspondem ao critério.
 */
const filterTransactions = (searchTerm) => {
  const normalizedSearchTerm = normalizeString(searchTerm);

  if (!searchTerm) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const normalizedDescription = normalizeString(transaction.description);

    return normalizedDescription.includes(normalizedSearchTerm);
  });
};

// ---
// FUNÇÕES DE RENDERIZAÇÃO E MANIPULAÇÃO DE DOM
// ---

/**
 * Cria e retorna um elemento <li> HTML para uma transação.
 * @param {object} transaction - O objeto da transação a ser renderizado.
 * @returns {HTMLLIElement} O elemento <li> pronto para ser anexado ao DOM.
 */
function createTransactionElement(transaction) {
  const signClass = transaction.type === "income" ? "plus" : "minus";

  const typeText = transaction.type === "income" ? "Receita" : "Despesa";

  const formattedDate = formatDate(transaction.date);
  const formattedAmount = formatCurrency(transaction.amount);
  const sign = transaction.type === "expense" ? "-" : "";

  const listItem = document.createElement("li");

  listItem.classList.add(signClass);

  // 💡 Aspas duplas utilizadas no innerHTML para consistência
  listItem.innerHTML = `
        <div class="transaction-content">
            <span class="description">${transaction.description}</span>
            <span class="details">
                <br> ID: ${transaction.id} <br >Tipo: ${typeText} <br> Data: ${formattedDate}
            </span>
        </div>
        
        <div class="control-group">
            <span class="amount-display">${sign}${formattedAmount}</span>
            <button class="delete-btn" data-id="${transaction.id}">X</button>
        </div>
    `;

  return listItem;
}

/**
 * Renderiza a lista completa de transações na interface do usuário (DOM).
 * * A função itera sobre o array 'transactions' e cria um novo elemento <li>
 * para cada transação.
 * * @returns {void}
 */
function renderTransactions(dataToRender = transactions) {
  TRANSACTIONS_LIST.innerHTML = "";

  dataToRender.forEach((transaction) => {
    const listItem = createTransactionElement(transaction);
    TRANSACTIONS_LIST.appendChild(listItem);
  });
}

/**
 * Renderiza apenas uma nova transação no final da lista, otimizando o DOM.
 * @param {object} transaction - O objeto da transação recém-criada.
 * @param {HTMLElement} transactionsList - O elemento <ul> ou <ol> onde o item será anexado.
 * @returns {void}
 */
const renderNewTransaction = (transaction, transactionsList) => {
  const listItem = createTransactionElement(transaction);

  TRANSACTIONS_LIST.appendChild(listItem);
};

/**
 * Exibe uma mensagem de erro abaixo do campo.
 * @param {string} id - O ID do elemento span de erro (ex: 'error-description').
 * @param {string} message - A mensagem de erro a ser exibida.
 * @returns {void}
 */
function displayError(id, message) {
  const errorElement = document.getElementById(id);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

/**
 * Limpa a mensagem de erro abaixo do campo.
 * @param {string} id - O ID do elemento span de erro (ex: 'error-description').
 * @returns {void}
 */
const clearError = (id) => {
  displayError(id, "");
};

/**
 * Limpa todas as mensagens de erro do formulário.
 * @returns {void}
 */
const clearAllErrors = () => {
  clearError("error-description");
  clearError("error-amount");
  clearError("error-type");
  clearError("error-date");
};

// ---
// MANIPULADORES DE EVENTOS (LISTENERS)
// ---

/**
 * Lida com o clique no botão de trocar o tema (Light/Dark).
 */
THEME_SWITCHER.addEventListener("click", () => {
  const currentTheme = BODY.getAttribute("data-theme");

  const newTheme = currentTheme === "dark" ? "light" : "dark";

  BODY.setAttribute("data-theme", newTheme);

  saveTheme(newTheme);
});

/**
 * Manipulador de evento para a digitação no campo de filtro.
 * @param {Event} e - O objeto do evento de input.
 * @returns {void}
 */
FILTER_INPUT.addEventListener("input", (e) => {
  const searchTerm = e.target.value.trim();

  const filteredData = filterTransactions(searchTerm);

  renderTransactions(filteredData);
});

/**
 * Manipulador de evento para a mudança na seleção de ordenação.
 * @param {Event} e - O objeto do evento de change.
 * @returns {void}
 */
SORT_SELECT.addEventListener("change", (e) => {
  const selectedCriteria = e.target.value;

  sortTransactions(selectedCriteria);

  if (FILTER_INPUT.value.trim() !== "") {
    const filteredData = filterTransactions(FILTER_INPUT.value.trim());
    renderTransactions(filteredData);
  } else {
    renderTransactions();
  }
});

/* Manipulador de evento para a submissão do formulário
 * @param {Event} e - O objeto do evento de submissão do formulário.
 * @returns {void}
 */
TRANSACTIONS_FORM.addEventListener("submit", (e) => {
  e.preventDefault();

  clearAllErrors();

  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const typeInput = document.querySelector('input[name="type"]:checked');

  const description = descriptionInput.value.trim();
  const amountString = amountInput.value.trim();
  const date = dateInput.value;
  const type = typeInput ? typeInput.value : null;

  let hasErrors = false;

  if (description === "") {
    displayError("error-description", "A descrição não pode estar vazia.");
    hasErrors = true;
  }

  if (!type) {
    displayError("error-type", "Selecione o tipo (Receita ou Despesa).");
    hasErrors = true;
  }

  const amount = parseFloat(amountString);
  if (isNaN(amount) || amount <= 0) {
    displayError(
      "error-amount",
      "O valor deve ser um número positivo maior que zero."
    );
    hasErrors = true;
  }

  if (date === "") {
    displayError("error-date", "A data da transação precisa ser preenchida.");
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  console.log("Dados Coletados:");
  console.log(`Descrição: ${description}`);
  console.log(`Valor: ${amount} (string)`);
  console.log(`Tipo: ${type}`);
  console.log(`Data: ${date}`);

  const finalAmount = parseFloat(amountString);

  addTransaction(description, finalAmount, type, date);

  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.value = "";

  if (typeInput) {
    typeInput.checked = false;
  }

  console.log("Nova transação adicionada");
});

/**
 * Manipulador de clique para deletar transação
 * @param {Event} e - O objeto do evento de clique.
 * @returns {void}
 */
TRANSACTIONS_LIST.addEventListener("click", (e) => {
  const deleteButton = e.target.closest(".delete-btn");

  if (deleteButton) {
    const confirmed = confirm("Tem certeza que deseja excluir esta transação?");

    if (confirmed) {
      const idToDelete = parseInt(deleteButton.getAttribute("data-id"));
      deleteTransaction(idToDelete);
    }
  }
});

// ---
// INICIALIZAÇÃO
// ---

/**
 * Função de inicialização da aplicação. A "main"
 */
function init() {
  const savedTransactions = loadTransactions();
  if (savedTransactions) {
    transactions = savedTransactions;
  }

  const savedTheme = loadTheme();
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
  }

  renderTransactions();

  updateBalance();
}

// Inicia a aplicação
init();