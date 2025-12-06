## 📄 README: Controle Financeiro Pessoal

Este é um projeto de Controle Financeiro Pessoal desenvolvido em **JavaScript Puro**, HTML e CSS. O objetivo é fornecer uma aplicação web simples, rápida e responsiva para gerenciar receitas e despesas, com recursos essenciais como persistência de dados e filtros dinâmicos.

-----

## 🚀 Funcionalidades Principais

  * **Registro de Transações:** Adiciona novas transações (Receita/Despesa) com descrição, valor e data.
  * **Saldo Total Dinâmico:** Calcula e exibe o saldo atualizado em tempo real, com cores indicando se o saldo é positivo (verde) ou negativo (vermelho).
  * **Exclusão de Transações:** Permite a remoção de itens da lista.
  * **Persistência de Dados:** Salva todas as transações e a preferência de tema no **`localStorage`** do navegador.
  * **Filtros Dinâmicos:** Filtra a lista de transações por descrição em tempo real, ignorando acentos (não sensível a diacríticos).
  * **Ordenação:** Ordena a lista por data (mais recente/mais antiga) e valor (maior/menor).
  * **Modo Noturno (Dark Mode):** Alterna entre tema claro e escuro utilizando variáveis CSS e um botão *switch*.
  * **Responsividade:** Layout adaptável para dispositivos móveis (coluna única) e desktop (duas colunas: formulário e histórico lado a lado).

-----

## 🛠️ Tecnologias Utilizadas

  * **HTML5**
  * **CSS3** (Incluindo **Variáveis CSS** para temas e **Media Queries** para responsividade).
  * **JavaScript ES6+** (Vanilla JS)
      * **Modularização:** Uso do sistema `import`/`export` em arquivos separados.
      * **Manipulação de DOM** e **Delegação de Eventos**.

-----

## 📁 Estrutura do Projeto

O projeto segue uma estrutura modular para separar responsabilidades:

```
controle-financeiro/
├── index.html                  # Estrutura principal da aplicação (view)
├── style.css                   # Estilos, variáveis de tema e media queries
├── script.js                   # Módulo principal (lógica, listeners e inicialização)
├── mock/
│   └── transactions.js         # Dados de exemplo (mockData)
└── package.json (opcional)     # Metadados do projeto
```

-----

## ⚙️ Detalhes da Implementação (Lógica JS)

### 1\. Inicialização e Estado Global

A função **`init()`** carrega a aplicação, priorizando os dados e temas salvos no `localStorage` sobre os dados de exemplo.

  * O estado de todas as transações é mantido na variável global (de módulo) **`let transactions`**.

### 2\. Funções de Renderização e Câmbio

  * **`createTransactionElement(transaction)`:** Cria o `<li>` dinamicamente, injetando o HTML (descrição, valor, data) e o botão de exclusão com o atributo `data-id`.
  * **`renderTransactions()`:** Função principal que limpa o `TRANSACTIONS_LIST` e re-renderiza toda a lista (usada para ordenação e exclusão).
  * **`renderNewTransaction()`:** Função otimizada que apenas anexa o novo `<li>` ao DOM (usada para adicionar novas transações).
  * **`updateBalance()`:** Calcula o saldo usando `reduce()` no array de transações e aplica as classes **`.positive-balance`** ou **`.negative-balance`** ao elemento `#balance`.

### 3\. Persistência de Dados

As transações e o tema são salvos usando `localStorage`:

  * **`saveTransactions()` e `loadTransactions()`:** Salva/carrega o array `transactions` como uma *string* JSON. Chamadas após `addTransaction` e `deleteTransaction`.
  * **`saveTheme()` e `loadTheme()`:** Salva/carrega o atributo **`data-theme`** do `<body>`. Chamadas no `init` e na troca de tema.

### 4\. Controles Dinâmicos

  * **Filtro:** A função **`filterTransactions()`** utiliza **`normalizeString()`** para remover acentos e converter para minúsculas, garantindo uma busca fluida e insensível à capitalização/acentuação. O evento **`input`** do campo de filtro dispara a re-renderização em tempo real.
  * **Deleção:** A lista usa **delegação de eventos** (o *listener* é anexado ao `TRANSACTIONS_LIST` e verifica se o alvo é o `.delete-btn`). Isso garante que *listeners* funcionem em itens criados dinamicamente.
  * **Ordenação:** A função **`sortTransactions()`** usa o método nativo `Array.prototype.sort()` do JavaScript para reordenar o array `transactions` globalmente antes de chamar `renderTransactions()`.

-----

## ▶️ Como Executar o Projeto

1.  **Clone o Repositório** (ou baixe os arquivos).
2.  Abra o arquivo **`index.html`** no seu navegador web.
3.  Como alternativa, use uma extensão de servidor local (como "Live Server" no VS Code) para evitar problemas de CORS no carregamento de módulos.