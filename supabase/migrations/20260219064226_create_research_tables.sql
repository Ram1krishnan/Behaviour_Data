/*
  # Prompt Behavior Research System - Database Schema
  
  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Anonymous user identifier
      - `created_at` (timestamptz) - When user first accessed system
      
    - `tasks`
      - `id` (integer, primary key) - Task identifier (1-7)
      - `name` (text) - Task name
      - `description` (text) - Task instruction content
      
    - `prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `task_id` (integer, foreign key to tasks)
      - `turn_number` (integer) - Sequential refinement number within task
      - `prompt_text` (text) - User's prompt
      - `response_text` (text) - Gemini's response
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous user access
    
  3. Data
    - Pre-populate tasks table with 7 research tasks
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous users to insert own record"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow users to read own record"
  ON users FOR SELECT
  TO anon
  USING (true);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to read tasks"
  ON tasks FOR SELECT
  TO anon
  USING (true);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id integer NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  turn_number integer NOT NULL DEFAULT 1,
  prompt_text text NOT NULL,
  response_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to insert prompts"
  ON prompts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow users to read all prompts"
  ON prompts FOR SELECT
  TO anon
  USING (true);

-- Insert task data
INSERT INTO tasks (id, name, description) VALUES
  (1, 'Prompted Summarization', '**What to do:** In the box below, write **one clear prompt** that asks the AI to summarize the paragraph.\n\n**Paragraph to use:**\n"Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The field of AI research includes machine learning, natural language processing, robotics, and computer vision. AI systems can perform tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation. Modern AI applications range from virtual assistants like Siri and Alexa to autonomous vehicles and advanced medical diagnosis systems. As AI continues to evolve, it raises important questions about ethics, privacy, and the future of work."\n\n**In your prompt, specify:**\n- Desired length (e.g. 3–4 sentences)\n- Target reader (e.g. non-technical adult)\n- What to focus on (e.g. main ideas, applications, ethical questions)\n\nThen submit your prompt. The AI will respond with the summary.'),
  (2, 'Audience-aware Explanation', '**What to do:** In the box below, write **one prompt** that asks the AI to explain a complex topic to a 12-year-old.\n\n**Steps:**\n- Choose a topic (e.g. Blockchain, Quantum Computing, Climate Change, or another advanced concept)\n- In your prompt, state the topic and that the audience is a curious 12-year-old with basic school knowledge\n- Ask for simple language, everyday examples, and short paragraphs\n- Ask the AI to avoid difficult jargon\n\nThen submit. The AI will respond with the explanation.'),
  (3, 'Code Generation Requirements', '**What to do:** In the box below, write **one prompt** that asks the AI to generate a Python function for **binary search** on a sorted list.\n\n**In your prompt, specify that the function should:**\n- Take a sorted list and a target value as input\n- Return the index of the target if found, or -1 if not found\n- Handle edge cases (empty list, target absent, invalid input)\n- Include a short docstring and at least two usage examples\n\nThen submit. The AI will respond with the code.'),
  (4, 'Debugging with Guidance', '**What to do:** In the box below, write **one prompt** that asks the AI to act as a debugging assistant for this code:\n\nfor i in range(10)\n    print(i * 2)\n    if i > 5\n        break\n\n**In your prompt, ask the AI to:**\n- Point out each syntax error and explain why it is wrong\n- Provide a corrected version of the code\n- Briefly describe what the fixed code does\n\nThen submit. The AI will respond with the analysis and corrected code.'),
  (5, 'Structured Output Control', '**What to do:** In the box below, write **one prompt** that asks the AI to explain **Machine Learning** using a fixed structure.\n\n**In your prompt, require the answer to use these section headings:**\n1. Introduction\n2. Key Ideas\n3. Types of Machine Learning\n4. Real-world Applications\n5. Limitations and Risks\n6. Summary\n\nAlso ask for bullet points where useful and concise sections.\n\nThen submit. The AI will respond with the structured explanation.'),
  (6, 'Step-by-step Reasoning', '**What to do:** In the box below, write **one prompt** that asks the AI to solve this problem and show its reasoning step by step:\n\n"Two trains leave stations 450 miles apart, traveling toward each other. One train travels at 60 mph and the other at 90 mph. How long will it take for them to meet?"\n\n**In your prompt, ask the AI to:**\n- Restate the numbers and assumptions\n- Show the calculation in clear steps\n- Give the final answer with units and a short explanation\n\nThen submit. The AI will respond with the step-by-step solution.'),
  (7, 'Free-style Meta Prompting', '**What to do:** In the box below, write **one prompt** about a topic that matters to you.\n\n**Ideas:** learning a new skill, planning a project, improving your health, or understanding a difficult subject.\n\n**In your prompt, you can ask the AI to:**\n- Understand your goal or problem\n- Ask you clarifying questions if needed\n- Give you a structured, practical plan (steps, timelines, concrete suggestions)\n\nWrite a clear prompt that says who you are, what you want, and how you’d like the answer organized. Then submit. The AI will respond with a tailored plan.')
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_task ON prompts(user_id, task_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);