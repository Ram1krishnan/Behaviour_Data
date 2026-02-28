export interface Task {
  id: number;
  name: string;
  description: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  task_id: number;
  turn_number: number;
  prompt_text: string;
  response_text: string;
  created_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}
