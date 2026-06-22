# FinPesquisa — Como configurar e rodar

## Pré-requisitos (instalar antes)

| Ferramenta | Download |
|---|---|
| PostgreSQL 16 | https://www.postgresql.org/download/windows/ |
| Node.js 20 LTS | já instalado |
| .NET 9 SDK | já instalado |

---

## 1. Configurar o banco de dados

Após instalar o PostgreSQL, abra o **pgAdmin** ou o **psql** e rode:

```sql
CREATE DATABASE finpesquisa;
```

O Entity Framework vai criar todas as tabelas automaticamente quando você rodar as migrations.

---

## 2. Configurar a connection string

Edite o arquivo `backend/appsettings.json` e ajuste a senha:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=finpesquisa;Username=postgres;Password=SUA_SENHA_AQUI"
```

---

## 3. Criar as tabelas com EF Core Migrations

Abra um terminal na pasta `backend/` e rode:

```bash
dotnet tool install --global dotnet-ef   # só na primeira vez
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 4. Rodar o backend

```bash
cd backend
dotnet run
```

A API estará disponível em: http://localhost:5083

---

## 5. Rodar o frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

O site estará em: http://localhost:5173

---

## Estrutura do projeto

```
PIIIIB/
├── backend/           ASP.NET Core Web API (C#)
├── frontend/          React + Vite + Tailwind CSS
└── database/
    └── schema.sql     Script SQL de referência
```

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
