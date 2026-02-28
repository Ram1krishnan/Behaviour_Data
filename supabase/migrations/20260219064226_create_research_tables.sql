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
  (1, 'Prompted Summarization', 'You will work with the following paragraph about Artificial Intelligence:\n\n"Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The field of AI research includes machine learning, natural language processing, robotics, and computer vision. AI systems can perform tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation. Modern AI applications range from virtual assistants like Siri and Alexa to autonomous vehicles and advanced medical diagnosis systems. As AI continues to evolve, it raises important questions about ethics, privacy, and the future of work."\n\nYour job is **not** to write the summary yourself. Instead, your job is to design a **single, very good prompt** that will make the AI produce an excellent summary.\n\nIn your prompt to the AI, clearly specify:\n- The desired length (for example: 3–4 sentences).\n- The target reader (for example: a non-technical adult).\n- What to focus on (for example: main ideas, key applications, and ethical questions).\n\nThink carefully about what you want, then write one precise prompt for the AI.'),
  (2, 'Audience-aware Explanation', 'Choose a complex topic (for example: Blockchain, Quantum Computing, Climate Change, or any other advanced concept).\n\nYour goal is to create a prompt that asks the AI to explain this topic to a **12-year-old child** in a way that is engaging and easy to understand.\n\nIn your prompt to the AI, make sure you:\n- State the topic you picked.\n- Describe the audience (a curious 12-year-old with basic school knowledge).\n- Ask for simple language, everyday examples, and short paragraphs.\n- Ask the AI to check for and remove difficult jargon.\n\nWrite one clear, detailed prompt that instructs the AI exactly how to teach this child.'),
  (3, 'Code Generation Requirements', 'You want the AI to generate a Python function that implements **binary search** on a sorted list.\n\nYour task is to design a prompt that tells the AI exactly what you expect from the code.\n\nIn your prompt to the AI, clearly specify that the function should:\n- Take a sorted list and a target value as input.\n- Return the index of the target if it is found, or -1 if it is not found.\n- Handle edge cases (empty list, target not present, invalid input types).\n- Include a short docstring and at least two simple usage examples.\n\nWrite a single prompt that lists these requirements in a clear, structured way so the AI can follow them.'),
  (4, 'Debugging with Guidance', 'Here is a Python loop that contains syntax errors:\n\nfor i in range(10)\n    print(i * 2)\n    if i > 5\n        break\n\nYour task is to write a prompt that instructs the AI to **be a debugging assistant**.\n\nIn your prompt to the AI, ask it to:\n- Point out each syntax error in the code and explain why it is an error.\n- Provide a corrected version of the code.\n- Briefly describe what the fixed code does.\n\nWrite one detailed prompt that clearly tells the AI how to analyze and fix this code.'),
  (5, 'Structured Output Control', 'You will ask the AI to explain **Machine Learning**, but the main goal is to practice controlling the **structure** of the output.\n\nIn your prompt to the AI, require it to answer using a **fixed outline** with these exact section headings:\n1. Introduction\n2. Key Ideas\n3. Types of Machine Learning\n4. Real-world Applications\n5. Limitations and Risks\n6. Summary\n\nAlso ask the AI to:\n- Use bullet points where appropriate.\n- Keep each section concise but informative.\n\nWrite one precise prompt that clearly enforces this structure.'),
  (6, 'Step-by-step Reasoning', 'Consider this word problem:\n\n"Two trains leave stations 450 miles apart, traveling toward each other. One train travels at 60 mph and the other at 90 mph. How long will it take for them to meet?"\n\nYour task is to write a prompt that makes the AI **show its reasoning step by step**.\n\nIn your prompt to the AI, ask it to:\n- Restate the important numbers and assumptions.\n- Show the calculation in clear steps.\n- Give the final answer with units and a short explanation.\n\nWrite one careful prompt that strongly encourages a clear, step-by-step solution.'),
  (7, 'Free-style Meta Prompting', 'This is a free-style task focused on **your own interests** and on designing a strong prompt.\n\nThink of a topic that really matters to you (for example: learning a new skill, planning a project, improving your health, or understanding a difficult subject).\n\nYour goal is to create a prompt that asks the AI to:\n- Understand your goal or problem.\n- Ask you any clarifying questions if needed.\n- Then give you a structured, practical plan tailored to you (with steps, timelines, and concrete suggestions).\n\nWrite one rich, detailed prompt that tells the AI who you are, what you want, and how you would like the answer to be organized.')
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_task ON prompts(user_id, task_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);