# Prompt Behavior Research System

A full-stack web application designed for academic research to study prompt engineering behavior and human-AI interaction patterns.

## System Architecture

- **Frontend**: Next.js 14 (App Router) with TypeScript and TailwindCSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **LLM API**: Google Gemini API (called only from Supabase Edge Functions)
- **Authentication**: Anonymous user tracking via localStorage
- **UI**: Professional, minimal, research-grade interface

## Features

### Anonymous User Tracking
- Automatic generation of unique userID on first visit
- Persistent storage in browser localStorage
- Consistent tracking across all tasks

### Sequential Task System
- 7 research tasks in fixed order:
  1. Summarization
  2. Explanation
  3. Coding
  4. Debugging
  5. Structured Formatting
  6. Step-by-step Logic
  7. Free Style

- Tasks unlock sequentially (must complete previous task)
- Unlimited prompt refinements per task
- Full conversation history maintained

### Context Memory
- Complete conversation history sent to Gemini API
- Enables proper prompt refinement
- All previous prompts and responses preserved

### Data Collection
- Automatic logging of all interactions
- Captures: userID, taskID, turn number, prompts, responses, timestamps
- All data stored anonymously in Supabase

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Google Gemini API key

### Environment Variables

The `.env` file already contains Supabase credentials. You need to add the Gemini API key to the Supabase Edge Function environment:

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions settings
3. Add environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your Google Gemini API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. The database schema is already deployed to Supabase with:
   - `users` table
   - `tasks` table (pre-populated with 7 tasks)
   - `prompts` table
   - Proper Row Level Security policies

3. The edge function `generate-response` is already deployed to Supabase

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Database Schema

### users table
- `id` (uuid) - Anonymous user identifier
- `created_at` (timestamp) - Account creation time

### tasks table
- `id` (integer) - Task number (1-7)
- `name` (text) - Task name
- `description` (text) - Task instructions

### prompts table
- `id` (uuid) - Unique prompt identifier
- `user_id` (uuid) - Foreign key to users
- `task_id` (integer) - Foreign key to tasks
- `turn_number` (integer) - Refinement number within task
- `prompt_text` (text) - User's prompt
- `response_text` (text) - Gemini's response
- `created_at` (timestamp) - Submission time

## User Flow

1. **Consent Screen**: User reads ethics information and agrees to participate
2. **Anonymous ID Generation**: System generates unique userID, stores in localStorage
3. **Task 1**: User completes first task with unlimited refinements
4. **Sequential Tasks**: Each task unlocks after completing previous task
5. **Completion**: After Task 7, user sees completion screen

## Key Features

### Unlimited Refinements
Users can refine their prompts as many times as needed. Each refinement:
- Maintains full conversation context
- Increments turn number
- Stores both prompt and response

### Context Preservation
When submitting a new prompt for the same task:
- All previous prompts and responses are sent to Gemini
- Enables natural conversation flow
- Allows iterative refinement

### Sequential Locking
Users must complete tasks in order:
- Cannot skip to later tasks
- Must submit at least one prompt per task
- "Next Task" button disabled until submission

### Research-Grade UI
- Clean, professional design
- Neutral academic color palette (slate/blue)
- ChatGPT-style chat bubbles
- Clear progress indicators
- Responsive layout

## Security

- Gemini API key stored securely in Supabase Edge Function environment
- API key never exposed to frontend
- Row Level Security enabled on all tables
- Anonymous-only access (no authentication required)

## API Endpoints

### Edge Function: generate-response

**Endpoint**: `/functions/v1/generate-response`

**Method**: POST

**Request Body**:
```json
{
  "userID": "uuid",
  "taskID": 1,
  "prompt": "User's prompt text",
  "conversationHistory": [
    { "role": "user", "text": "Previous prompt" },
    { "role": "assistant", "text": "Previous response" }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "response": "Gemini's response text",
  "turnNumber": 2
}
```

## Data Analysis

All research data is stored in the `prompts` table and can be queried for analysis:

```sql
-- Get all prompts for a specific user
SELECT * FROM prompts WHERE user_id = 'user-uuid';

-- Get average turn numbers per task
SELECT task_id, AVG(turn_number) as avg_refinements
FROM prompts
GROUP BY task_id;

-- Get completion rates
SELECT
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN task_id = 7 THEN user_id END) as completed_users
FROM prompts;
```

## Technical Notes

- Uses Next.js App Router for modern React Server Components
- Client-side components marked with 'use client' directive
- Automatic user initialization on first visit
- localStorage used for persistent anonymous tracking
- All timestamps in UTC
- Edge function handles Gemini API communication securely

## License

This is a research project. Please ensure proper ethics approval before deploying for actual research use.
