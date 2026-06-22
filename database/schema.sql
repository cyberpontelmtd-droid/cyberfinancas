-- FinPesquisa - Sistema de Monitoramento de Finanças de Projetos de Pesquisa
-- Banco de dados: PostgreSQL 16

CREATE DATABASE finpesquisa;
\c finpesquisa;

-- Usuários
CREATE TABLE "Users" (
    "Id"           SERIAL PRIMARY KEY,
    "Name"         VARCHAR(100)  NOT NULL,
    "Email"        VARCHAR(150)  NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(255)  NOT NULL,
    "Role"         VARCHAR(20)   NOT NULL DEFAULT 'user',
    "CreatedAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Projetos de pesquisa
CREATE TABLE "Projects" (
    "Id"          SERIAL PRIMARY KEY,
    "Name"        VARCHAR(200)     NOT NULL,
    "Description" TEXT,
    "StartDate"   DATE,
    "EndDate"     DATE,
    "TotalBudget" DECIMAL(15,2)    NOT NULL DEFAULT 0,
    "UserId"      INT              NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "CreatedAt"   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- Categorias de custo (Custeio / Capital)
CREATE TABLE "Categories" (
    "Id"   SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Type" VARCHAR(20)  NOT NULL  -- 'custeio' ou 'capital'
);

-- Itens orçados (previsto)
CREATE TABLE "BudgetItems" (
    "Id"          SERIAL PRIMARY KEY,
    "ProjectId"   INT            NOT NULL REFERENCES "Projects"("Id") ON DELETE CASCADE,
    "CategoryId"  INT            NOT NULL REFERENCES "Categories"("Id"),
    "Description" VARCHAR(200)   NOT NULL,
    "Quantity"    DECIMAL(10,2)  NOT NULL DEFAULT 1,
    "UnitValue"   DECIMAL(15,2)  NOT NULL,
    "Notes"       TEXT,
    "CreatedAt"   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Itens realizados (despesas lançadas)
CREATE TABLE "ActualItems" (
    "Id"            SERIAL PRIMARY KEY,
    "ProjectId"     INT            NOT NULL REFERENCES "Projects"("Id") ON DELETE CASCADE,
    "CategoryId"    INT            NOT NULL REFERENCES "Categories"("Id"),
    "BudgetItemId"  INT            REFERENCES "BudgetItems"("Id") ON DELETE SET NULL,
    "Description"   VARCHAR(200)   NOT NULL,
    "Quantity"      DECIMAL(10,2)  NOT NULL DEFAULT 1,
    "UnitValue"     DECIMAL(15,2)  NOT NULL,
    "Date"          DATE           NOT NULL,
    "InvoiceNumber" VARCHAR(100),
    "Notes"         TEXT,
    "CreatedAt"     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Categorias padrão
INSERT INTO "Categories" ("Name", "Type") VALUES
    ('Diárias',               'custeio'),
    ('Passagens',             'custeio'),
    ('Material de Consumo',   'custeio'),
    ('Serviços de Terceiros', 'custeio'),
    ('Material Permanente',   'capital');
