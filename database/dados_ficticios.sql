DO $$
DECLARE
  proj1_id INT;
  proj2_id INT;
  user_id  INT;
BEGIN
  SELECT "Id" INTO user_id FROM "Users" ORDER BY "Id" LIMIT 1;

  INSERT INTO "Projects" ("Name", "Description", "StartDate", "EndDate", "TotalBudget", "UserId", "CreatedAt")
  VALUES ('Pesquisa em Inteligencia Artificial Aplicada', 'Desenvolvimento de algoritmos de IA para processamento de linguagem natural em documentos academicos.', '2026-01-15', '2026-12-15', 30000, user_id, NOW())
  RETURNING "Id" INTO proj1_id;

  INSERT INTO "Projects" ("Name", "Description", "StartDate", "EndDate", "TotalBudget", "UserId", "CreatedAt")
  VALUES ('Desenvolvimento de Plataforma EdTech', 'Criacao de plataforma web para gestao de cursos e monitoramento de desempenho academico.', '2026-03-01', '2026-11-30', 28500, user_id, NOW())
  RETURNING "Id" INTO proj2_id;

  INSERT INTO "BudgetItems" ("ProjectId", "CategoryId", "Description", "Quantity", "UnitValue", "Notes", "CreatedAt") VALUES
  (proj1_id, 1, 'Diarias Nacionais - Conferencia CBIC Brasilia', 5, 320, NULL, NOW()),
  (proj1_id, 2, 'Santa Cruz do Sul - Porto Alegre (rodovario ida/volta)', 1, 200, NULL, NOW()),
  (proj1_id, 2, 'Porto Alegre - Brasilia (aereo ida/volta)', 1, 1800, NULL, NOW()),
  (proj1_id, 3, 'Mouse Magic Apple', 1, 1000, NULL, NOW()),
  (proj1_id, 3, 'Teclado sem fio Logitech compativel Apple', 1, 250, NULL, NOW()),
  (proj1_id, 3, 'Kit teclado e mouse sem fio DELL ou Logitech', 1, 250, NULL, NOW()),
  (proj1_id, 3, 'Adaptador USB-C/USB', 2, 100, NULL, NOW()),
  (proj1_id, 3, 'Cabo Adaptador USB-C/VGA', 1, 100, NULL, NOW()),
  (proj1_id, 3, 'Cabo Adaptador USB-C/HDMI', 1, 100, NULL, NOW()),
  (proj1_id, 4, 'Material de divulgacao do seminario', 1, 500, NULL, NOW()),
  (proj1_id, 4, 'Revisao e traducao de artigos para publicacao', 1, 500, NULL, NOW()),
  (proj1_id, 5, 'Notebook Apple MacBook Pro 13 M2', 1, 14000, NULL, NOW()),
  (proj1_id, 5, 'Notebook Dell Intel Core i7 16GB RAM 14 polegadas', 1, 8500, NULL, NOW()),
  (proj1_id, 5, 'Monitor para microcomputador 23.8 polegadas', 1, 1000, NULL, NOW());

  INSERT INTO "BudgetItems" ("ProjectId", "CategoryId", "Description", "Quantity", "UnitValue", "Notes", "CreatedAt") VALUES
  (proj2_id, 1, 'Diarias Nacionais - Workshop de Inovacao SP', 4, 380, NULL, NOW()),
  (proj2_id, 2, 'Florianopolis - Sao Paulo (aereo ida/volta)', 1, 800, NULL, NOW()),
  (proj2_id, 2, 'Sao Paulo - Recife (aereo ida/volta)', 1, 2200, NULL, NOW()),
  (proj2_id, 3, 'Headset USB para videoconferencia', 2, 300, NULL, NOW()),
  (proj2_id, 3, 'Webcam Full HD 1080p', 2, 450, NULL, NOW()),
  (proj2_id, 3, 'Hub USB-C 7 portas', 2, 200, NULL, NOW()),
  (proj2_id, 4, 'Traducao de artigos cientificos para ingles', 1, 900, NULL, NOW()),
  (proj2_id, 4, 'Design de identidade visual do projeto', 1, 1180, NULL, NOW()),
  (proj2_id, 5, 'Servidor de Desenvolvimento Dell PowerEdge T150', 1, 12000, NULL, NOW()),
  (proj2_id, 5, 'Notebook Lenovo ThinkPad X1 Carbon', 1, 8000, NULL, NOW());

  INSERT INTO "ActualItems" ("ProjectId", "CategoryId", "BudgetItemId", "Description", "Quantity", "UnitValue", "Date", "InvoiceNumber", "Notes", "CreatedAt") VALUES
  (proj1_id, 1, NULL, 'Diarias Nacionais - Conferencia CBIC', 3, 320, '2026-03-10', 'NF-2026-001', NULL, NOW()),
  (proj1_id, 2, NULL, 'Passagem SC - Porto Alegre', 1, 200, '2026-03-08', 'NF-2026-002', NULL, NOW()),
  (proj1_id, 2, NULL, 'Passagem POA - Brasilia aereo', 1, 1850, '2026-03-08', 'NF-2026-003', 'Pequena variacao no preco', NOW()),
  (proj1_id, 3, NULL, 'Mouse Magic Apple', 1, 1000, '2026-02-15', 'NF-2026-004', NULL, NOW()),
  (proj1_id, 3, NULL, 'Teclado sem fio Logitech', 1, 250, '2026-02-15', 'NF-2026-005', NULL, NOW()),
  (proj1_id, 3, NULL, 'Adaptador USB-C/USB', 2, 100, '2026-02-20', 'NF-2026-006', NULL, NOW()),
  (proj1_id, 4, NULL, 'Material de divulgacao do seminario', 1, 480, '2026-04-05', 'NF-2026-007', NULL, NOW()),
  (proj1_id, 5, NULL, 'Notebook Apple MacBook Pro 13 M2', 1, 14000, '2026-02-01', 'NF-2026-008', NULL, NOW());

  INSERT INTO "ActualItems" ("ProjectId", "CategoryId", "BudgetItemId", "Description", "Quantity", "UnitValue", "Date", "InvoiceNumber", "Notes", "CreatedAt") VALUES
  (proj2_id, 1, NULL, 'Diarias Workshop Sao Paulo', 2, 380, '2026-04-12', 'NF-2026-009', NULL, NOW()),
  (proj2_id, 2, NULL, 'Passagem Floripa - Sao Paulo', 1, 820, '2026-04-10', 'NF-2026-010', NULL, NOW()),
  (proj2_id, 3, NULL, 'Headset USB videoconferencia', 2, 300, '2026-03-20', 'NF-2026-011', NULL, NOW()),
  (proj2_id, 3, NULL, 'Webcam Full HD 1080p', 1, 450, '2026-03-20', 'NF-2026-012', NULL, NOW()),
  (proj2_id, 4, NULL, 'Traducao de artigos cientificos', 1, 900, '2026-05-02', 'NF-2026-013', NULL, NOW()),
  (proj2_id, 5, NULL, 'Servidor Dell PowerEdge T150', 1, 11800, '2026-03-01', 'NF-2026-014', 'Desconto de R$ 200', NOW());

END $$;
