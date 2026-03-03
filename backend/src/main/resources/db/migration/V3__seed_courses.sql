INSERT INTO courses (slug, title) VALUES
  ('software-design-patterns', '軟體設計模式精通之旅')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO courses (slug, title) VALUES
  ('ai-bdd', 'AI x BDD：規格驅動全自動開發術')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO courses (slug, title) VALUES
  ('clean-architecture', '潔淨架構實戰')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO courses (slug, title) VALUES
  ('java-mastery', 'Java 進階實戰')
ON CONFLICT (slug) DO NOTHING;
