import { mockData } from "./mock/transactions.js";

// ---
// ESTADO GLOBAL
// ---
let transactions = [...mockData];
let currentTheme = "light";

// ---
// ESTADO
// ---
let API_TOKEN = null;
const BASE_URL = "http://127.0.0.1:8000/";
const TOKEN_OBTAIN_URL = "http://127.0.0.1:8000/auth/token/";

// SELETORES DO DOM (Constantes - Padrão UPPER_SNAKE_CASE)
const THEME_SWITCHER = document.getElementById("theme-switcher");
const BODY = document.body;
const TRANSACTIONS_LIST = document.getElementById("transactions-list");
const FILTER_INPUT = document.getElementById("filter-description");
const TRANSACTIONS_FORM = document.getElementById("transaction-form");
const SORT_SELECT = document.getElementById("sort-by");
const BALANCE_ELEMENT = document.getElementById("balance");

const LOGIN_SCREEN = document.getElementById("login-screen");
const MAIN_APP = document.getElementById("main-app");
const LOGIN_FORM = document.getElementById("login-form");
const LOGIN_ERROR_ELEMENT = document.getElementById("login-error");
const LOGOUT_BUTTON = document.getElementById("logout-button");

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
 * Gera os cabeçalhos de autenticação para as requisições protegidas.
 * Inclui o Content-Type (para enviar JSON) e o Token JWT.
 * @returns {object} Cabeçalhos HTTP
 */
function getAuthHeaders() {
    if (!API_TOKEN) {
        console.error("Token de API ausente. Requer autenticação.");
        return {
            'Content-Type': 'application/json'
        };
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`, 
    };
}

/**
 * Busca a lista de transações na API, armazena no estado global e renderiza.
 * @returns {void}
 */
async function fetchTransactions() {
    if (!API_TOKEN) return;

    try {
        const response = await fetch(`${BASE_URL}transactions/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Falha ao carregar transações: ${response.status}`);
        }

        const data = await response.json();
        
        transactions = data.results || data;

        renderTransactions(); 
    } catch (error) {
        console.error("Error loading transactions:", error);
        TRANSACTIONS_LIST.innerHTML = "<li>Falha ao carregar dados da API.</li>";
    }
}

/**
 * Busca o resumo do saldo na API e atualiza o DOM.
 * @returns {void}
 */
async function fetchSummary() {
  if (!API_TOKEN) return;

  try {
    const response = await fetch(`${BASE_URL}/transactions/summary/`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter resumo: ${response.status}`);
    }

    const data = await response.json();
        
    const netBalance = parseFloat(data.net_balance) || 0;

    console.log("Saldo recebido da API (float):", netBalance);

    const formattedTotal = formatCurrency(netBalance);
    const signPrefix = Math.sign(netBalance) === -1 ? "-" : "";

    BALANCE_ELEMENT.textContent = `${signPrefix} ${formattedTotal}`;
    BALANCE_ELEMENT.className = netBalance >= 0 ? "positive-balance" : "negative-balance";

  } catch (error) {
      console.error("Erro ao carregar resumo:", error);
  }
}

/**
 * Atualiza a exibição do saldo total no DOM.
 * @returns {void}
 */
const updateBalance = () => {
  return fetchSummary();
};

/**
 * Troca a visualização entre a tela de login e o main-app
 * @param {boolean} showApp - Um booleano que indica o que deve estar ativo na tela
 * @returns {void}
 */
function toggleScreens(showApp){
  if (showApp) {
    LOGIN_SCREEN.classList.remove("active");
    LOGIN_SCREEN.classList.add("hidden");
    MAIN_APP.classList.remove("hidden");
    MAIN_APP.classList.add("active");
  } else {
    LOGIN_SCREEN.classList.add("active");
    LOGIN_SCREEN.classList.remove("hidden");
    MAIN_APP.classList.add("hidden");
    MAIN_APP.classList.remove("active");
  }
};

// ---
// FUNÇÕES DE GERENCIAMENTO DE LOGIN
// ---
/** * Envia credenciais para o backend, obtém o token e inicializa o app.
 * @param {string} username
 * @param {string} password
 */
async function handleLogin(username, password) {
    LOGIN_ERROR_ELEMENT.textContent = "";

    try {
      console.log("Origin:", window.location.origin);
      const response = await fetch(TOKEN_OBTAIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
          const errorMessage = data.detail || "Credenciais inválidas.";
          LOGIN_ERROR_ELEMENT.textContent = errorMessage;
          API_TOKEN = null;
          return;
      }

      API_TOKEN = data.access;
      localStorage.setItem('jwt_token', API_TOKEN);
      
      toggleScreens(true);
      await initAppData();

    } catch (error) {
        console.error("NETWORK ERROR/SERVER:", error);
        LOGIN_ERROR_ELEMENT.textContent = "Failed to connect to server.";
    }
}

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
 * Remove uma transação da API e do estado global.
 * @param {string} id - O ID (PK) da transação a ser excluída (UUID ou int).
 * @returns {Promise<void>}
 */
const deleteTransaction = async (id) => {
  if (!API_TOKEN) {
      alert("Sessão expirada. Faça login novamente.");
      return;
  }

  try {
    const response = await fetch(`${BASE_URL}transactions/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (response.status === 200) {
      console.log(`Transação ${id} deletada com sucesso.`);
      transactions = transactions.filter((transaction) => String(transaction.id) !== id);
          
      renderTransactions(); 
          
      updateBalance(); 

    } else if (response.status === 404) {
      alert("A transação não existe ou você não tem permissão para excluí-la.");
    } else {
      throw new Error(`Falha ao deletar: ${response.status}`);
    }

  } catch (error) {
      console.error("Erro ao deletar transação:", error);
      alert("Falha crítica ao deletar transação.");
  }
}

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
                <br>Tipo: ${typeText} <br> Data: ${formattedDate}
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

/**
 * Salva uma nova transação na API via POST.
 * * Se bem-sucedido (201), atualiza a lista e o saldo.
 * Se houver erro de validação (400), exibe as mensagens de erro retornadas pelo backend.
 * * @param {object} transactionData - Dados da transação (description, amount, type, date).
 * @returns {Promise<void>}
 */
async function saveNewTransaction(transactionData) {
  if (!API_TOKEN) {
    alert("Sessão expirada. Faça login novamente.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/transactions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 400) {
        for (const [field, errors] of Object.entries(responseData)) {
          displayError(`error-${field}`, errors.join(' ')); 
        }
        return false; 
      }
      throw new Error(`Falha ao salvar: ${response.status} - ${JSON.stringify(responseData)}`);
    }
      
    transactions.unshift(responseData);
      
    renderTransactions(); 
    updateBalance();
      
    console.log("Nova transação salva com sucesso.", responseData);
    return true;

  } catch (error) {
    console.error("Erro ao salvar transação:", error);
    alert("Erro crítico ao salvar transação. Verifique o console.");
    return false;
  }
}

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
TRANSACTIONS_FORM.addEventListener("submit", async (e) => {
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

  const amount = parseFloat(amountString);
  if (description === "") {
    displayError("error-description", "A descrição não pode estar vazia.");
    hasErrors = true;
  }

  if (!type) {
    displayError("error-type", "Selecione o tipo (Receita ou Despesa).");
    hasErrors = true;
  }

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

  const transactionData = {
    description: description,
    amount: amount,
    type: type,
    date: date,
  };

  const success = await saveNewTransaction(transactionData);

  if(success){
    descriptionInput.value = "";
    amountInput.value = "";
    dateInput.value = "";

    if (typeInput) {
      typeInput.checked = false;
    }
  }

  console.log("Tentativa de adicionar transação a API");
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
      const idToDelete = deleteButton.getAttribute("data-id");
      deleteTransaction(idToDelete);
    }
  }
});

LOGIN_FORM.addEventListener("submit", (e) =>{
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  handleLogin(username, password)
});

LOGOUT_BUTTON.addEventListener("click", () => {
  API_TOKEN = null;
  localStorage.removeItem("jwt_token");
  toggleScreens(false);
  transactions = [];
  TRANSACTIONS_LIST.innerHTML = "";
  BALANCE_ELEMENT.textContent = "R$ 0,00";
});

// ---
// INICIALIZAÇÃO
// ---

/**
 * Função para atualizar dados após o login
 */
async function initAppData() {
  await fetchTransactions();
  await updateBalance();
}

/**
 * Função de inicialização da aplicação. A "main"
 */
function init() {
  const savedTheme = loadTheme();
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
  }

  const storedToken = localStorage.getItem('jwt_token');

  if(storedToken){
    API_TOKEN = storedToken;
    toggleScreens(true);
    initAppData();
  } else {
    toggleScreens(false);
  }

  updateBalance();
}

// Inicia a aplicação
init();