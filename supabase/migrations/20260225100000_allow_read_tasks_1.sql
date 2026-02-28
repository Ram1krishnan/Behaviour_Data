-- Allow anonymous read access to tasks_1 (same as tasks)
-- Required when using tasks_1 as the source for task prompts
ALTER TABLE tasks_1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to read tasks_1" ON tasks_1;
CREATE POLICY "Allow anyone to read tasks_1"
  ON tasks_1 FOR SELECT
  TO anon
  USING (true);
