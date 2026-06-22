# CyberFinanças — Guia de Instalação e Execução

## Pré-requisitos

Instale as ferramentas abaixo antes de começar:

| Ferramenta | Versão | Download |
|---|---|---|
| **Node.js** | 20 LTS | https://nodejs.org |
| **.NET SDK** | 9.0 | https://dotnet.microsoft.com/download/dotnet/9.0 |
| **PostgreSQL** | 16 ou 17 | https://www.postgresql.org/download/windows/ |
| **Git** | qualquer | https://git-scm.com |

---

## 1. Clonar o repositório

```bash
git clone https://github.com/cyberpontelmtd-droid/cyberfinancas.git
cd cyberfinancas
```

---

## 2. Configurar o banco de dados

Após instalar o PostgreSQL, abra o **pgAdmin** ou **psql** e execute:

```sql
CREATE DATABASE finpesquisa;
```

Edite o arquivo `backend/appsettings.json` e coloque a sua senha do PostgreSQL:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=finpesquisa;Username=postgres;Password=SUA_SENHA"
```

---

## 3. Rodar as migrations (criar tabelas)

```bash
cd backend
dotnet tool install --global dotnet-ef
dotnet ef database update
```

> As tabelas e categorias padrão serão criadas automaticamente.

---

## 4. Rodar o backend

```bash
cd backend
dotnet run
```

A API ficará disponível em: **http://localhost:5083**

---

## 5. Rodar o frontend

Abra **outro terminal** e execute:

```bash
cd frontend
npm install
npm run dev
```

O sistema ficará disponível em: **http://localhost:5173**

---

## Acesso online

O sistema também está hospedado em:

**http://187.77.228.49**

---

## Estrutura do projeto

```
cyberfinancas/
├── backend/           ASP.NET Core Web API (.NET 9 + C#)
│   ├── Controllers/   Endpoints da API
│   ├── Models/        Entidades do banco
│   ├── Data/          DbContext e migrations
│   └── Services/      JWT
├── frontend/          React 19 + Vite + Tailwind CSS
│   └── src/
│       ├── pages/     Telas da aplicação
│       ├── components/Componentes reutilizáveis
│       ├── context/   Autenticação (JWT)
│       └── services/  Comunicação com a API
└── database/
    └── schema.sql     Script SQL de referência
```

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/register | Cadastro de usuário |
| POST | /api/auth/login | Login (retorna JWT) |
| GET/POST | /api/projects | Listar/criar projetos |
| GET/PUT/DELETE | /api/projects/{id} | Detalhar/editar/excluir projeto |
| GET/POST | /api/projects/{id}/budget-items | Itens orçados |
| PUT/DELETE | /api/budget-items/{id} | Editar/excluir item orçado |
| GET/POST | /api/projects/{id}/actual-items | Gastos realizados |
| PUT/DELETE | /api/actual-items/{id} | Editar/excluir gasto |
| GET | /api/projects/{id}/dashboard | Dados do dashboard |
| GET | /api/categories | Listar categorias |

---

## Tecnologias utilizadas

- **Frontend:** React 19, React Router v7, Recharts, Tailwind CSS, Axios
- **Backend:** ASP.NET Core 9, Entity Framework Core, JWT, BCrypt
- **Banco de dados:** PostgreSQL 17
- **Servidor:** Debian 13 (KVM) com Nginx
