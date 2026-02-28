'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/use-user';
import { Task, Message } from '@/lib/types';
import { ArrowRight, Loader2, User, Bot } from 'lucide-react';

/** Formats task description: literal \n -> line breaks, **bold** -> <strong>, escape HTML for safety */
function formatTaskDescription(desc: string): string {
  if (!desc) return '';
  let text = desc.replace(/\\n/g, '\n');
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\n/g, '<br />');
  return text;
}

export default function TaskPage() {
  const router = useRouter();
  const params = useParams();
  const { userID, isLoading: userLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const taskId = parseInt(params.id as string);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!mounted || userLoading || !userID) return;

    const loadTask = async () => {
      const res = await fetch('/api/get-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const result = await res.json();
      if (result.data) {
        setTask(result.data);
      }
    };

    const loadPrompts = async () => {
      const res = await fetch('/api/get-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, taskId }),
      });
      const result = await res.json();
      if (result.data) {
        const loadedMessages: Message[] = [];
        result.data.forEach((prompt: { prompt_text: string; response_text: string; created_at: string }) => {
          loadedMessages.push({
            role: 'user',
            text: prompt.prompt_text,
            timestamp: prompt.created_at,
          });
          loadedMessages.push({
            role: 'assistant',
            text: prompt.response_text,
            timestamp: prompt.created_at,
          });
        });
        setMessages(loadedMessages);
        setHasSubmitted(true);
      }
    };

    const loadCompletedTasks = async () => {
      const res = await fetch('/api/get-completed-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID }),
      });
      const result = await res.json();
      if (result.data) {
        setCompletedTasks(new Set(result.data));
      }
    };

    loadTask();
    loadPrompts();
    loadCompletedTasks();
  }, [mounted, userLoading, userID, taskId, router]);

  const handleSubmit = async () => {
    if (!currentPrompt.trim() || !userID || !task) return;

    setIsSubmitting(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID,
          taskID: taskId,
          prompt: currentPrompt,
          taskDescription: task.description,
          taskName: task.name,
          conversationHistory,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages([
          ...messages,
          { role: 'user', text: currentPrompt },
          { role: 'assistant', text: result.response },
        ]);
        setCurrentPrompt('');
        setHasSubmitted(true);
        setCompletedTasks((prev) => new Set(prev).add(taskId));
      } else {
        alert('Error: ' + (result.error || 'Failed to get response'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit prompt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTask = () => {
    if (taskId < 7) {
      router.push(`/task/${taskId + 1}`);
    } else {
      router.push('/complete');
    }
  };

  const canAccessTask = () => {
    if (taskId === 1) return true;
    return completedTasks.has(taskId - 1);
  };

  if (!mounted || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!userID) {
    router.push('/');
    return null;
  }

  if (!canAccessTask()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center text-slate-700">
              Please complete Task {taskId - 1} before accessing this task.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push(`/task/${taskId - 1}`)}>
                Go to Task {taskId - 1}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading task...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Task {taskId}: {task.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Task {taskId} of 7
                </p>
              </div>
              <div className="text-sm text-slate-500">
                User ID: <span className="font-mono">{userID.slice(0, 8)}...</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Task Instructions</h3>
              <div
                className="text-slate-700 [&_strong]:font-semibold [&_br]:block"
                dangerouslySetInnerHTML={{
                  __html: formatTaskDescription(task.description),
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4 mb-4" style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  No messages yet. Start by entering your prompt below.
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-700" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Textarea
                placeholder="Enter your prompt here..."
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                rows={4}
                disabled={isSubmitting}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey && !isSubmitting) {
                    handleSubmit();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">
                  Press Ctrl+Enter to submit
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!currentPrompt.trim() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Submit Prompt'
                    )}
                  </Button>
                  <Button
                    onClick={handleNextTask}
                    disabled={!hasSubmitted}
                    variant="outline"
                  >
                    {taskId === 7 ? 'Complete Study' : 'Next Task'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
