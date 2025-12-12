---

# 💸 Controle Financeiro Pessoal (Frontend)

Este é um projeto de Controle Financeiro Pessoal desenvolvido em **JavaScript Puro (Vanilla JS)**, HTML e CSS. O objetivo é fornecer uma aplicação web simples, rápida e responsiva para gerenciar receitas e despesas.

---

## ⚠️ Dependência do Backend (API)

**IMPORTANTE:** Esta aplicação é apenas o *frontend* (a interface). Para que as transações sejam salvas, o saldo seja calculado e o login funcione, é necessário que a API (o backend Django/DRF) esteja ativa e configurada.

O repositório do backend está em: [https://github.com/JoaoPedro-Nascente/joao-pedro-desafio](https://github.com/JoaoPedro-Nascente/joao-pedro-desafio)

### Como Iniciar e Autenticar:

1.  **Clone o Backend:** Siga as instruções no `README.md` do repositório acima para clonar e inicializar a API.
2.  **Rode as Migrações:** Certifique-se de ter rodado `python manage.py migrate` para criar as tabelas.
3.  **Crie um Usuário:** Crie um usuário de login usando `python manage.py createsuperuser` no terminal do backend.
4.  **Inicie a API:** Certifique-se de que o servidor Django está rodando localmente (normalmente em `http://127.0.0.1:8000/`).
5.  **Faça Login:** Use as credenciais do usuário que você criou no backend na tela de login desta aplicação para obter o token JWT e acessar o sistema.

---

## 🚀 Funcionalidades Principais

* **Registro de Transações:** Adiciona novas transações (Receita/Despesa) com descrição, valor e data.
* **Saldo Total Dinâmico:** Calcula e exibe o saldo atualizado em tempo real, com cores indicando se o saldo é **positivo (verde)** ou **negativo (vermelho)**.
* **Exclusão de Transações:** Permite a remoção de itens da lista.
* **Filtros Dinâmicos:** Filtra a lista de transações por descrição em tempo real, ignorando acentos (busca não sensível a diacríticos).
* **Ordenação:** Permite ordenar a lista por data (mais recente/mais antiga) e valor (maior/menor).
* **Modo Noturno (Dark Mode):** Alterna entre tema claro e escuro utilizando variáveis CSS.
* **Responsividade:** Layout adaptável para dispositivos móveis e desktop.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5**
* **CSS3** (Com ênfase em **Variáveis CSS** para temas e **Media Queries** para responsividade).
* **JavaScript ES6+** (Vanilla JS):
    * Modularização (`import`/`export`).
    * Manipulação eficiente do DOM e Delegação de Eventos.

---

## ▶️ Como Executar o Projeto

1.  **Baixe os Arquivos:** Clone o repositório ou baixe os arquivos diretamente.
2.  **Abra:** Abra o arquivo **`index.html`** no seu navegador web.
3.  **Lembre-se:** Siga as instruções acima para **iniciar o backend** antes de tentar fazer login.