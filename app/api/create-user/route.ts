import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        const { error } = await supabaseServer
            .from("users")
            .insert({ id });

        if (error) {
            return Response.json({
                success: false,
                error: error.message
            });
        }

        return Response.json({
            success: true
        });

    } catch (err) {
        return Response.json({
            success: false,
            error: "Internal server error"
        });
    }
}
