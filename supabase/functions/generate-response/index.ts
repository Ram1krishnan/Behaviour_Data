import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  userID: string;
  taskID: number;
  prompt: string;
  conversationHistory: Array<{ role: string; text: string }>;
  taskDescription?: string;
  taskName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      userID,
      taskID,
      prompt,
      conversationHistory,
      taskDescription,
      taskName,
    }: RequestBody = await req.json();

    if (!userID || !taskID || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userID)
      .eq('task_id', taskID);

    const turnNumber = (count || 0) + 1;

    const contents = [];

    const systemInstruction = `
You are an AI assistant helping a user solve and reflect on tasks in a research project.
All prompts and responses will be used to analyze user behaviour.
Answer in a clear, structured and helpful way that makes it easy to understand the user's reasoning and problem‑solving process. I want to see and analyse how they refine the query and prompt to get the best possible response.
`;

    contents.push({
      role: 'user',
      parts: [{ text: systemInstruction.trim() }],
    });

    if (taskDescription || taskName) {
      const taskContext = `Task context:
- Task ID: ${taskID}
- Task Name: ${taskName || 'N/A'}
- Task Description / Question: ${taskDescription || 'N/A'}`;

      contents.push({
        role: 'user',
        parts: [{ text: taskContext }],
      });
    }

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from Gemini API' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    const { error: insertError } = await supabase.from('prompts').insert({
      user_id: userID,
      task_id: taskID,
      turn_number: turnNumber,
      prompt_text: prompt,
      response_text: responseText,
    });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store prompt' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: responseText,
        turnNumber: turnNumber,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
