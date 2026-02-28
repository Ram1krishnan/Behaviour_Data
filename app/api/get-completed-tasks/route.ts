import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { userID } = await req.json();

    const { data, error } = await supabaseServer
      .from('prompts')
      .select('task_id')
      .eq('user_id', userID);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const taskIds = data
      ? Array.from(new Set(data.map((p: any) => p.task_id)))
      : [];
    return Response.json({ data: taskIds });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
