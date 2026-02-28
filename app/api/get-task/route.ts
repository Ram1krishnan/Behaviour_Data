import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    const { data, error } = await supabaseServer
      .from('tasks_1')
      .select('*')
      .eq('id', taskId)
      .single();

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
