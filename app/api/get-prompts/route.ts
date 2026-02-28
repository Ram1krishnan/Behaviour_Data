import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { userID, taskId } = await req.json();

    const { data, error } = await supabaseServer
      .from('prompts')
      .select('*')
      .eq('user_id', userID)
      .eq('task_id', taskId)
      .order('turn_number', { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
