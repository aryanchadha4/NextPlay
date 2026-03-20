import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export function createServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return null;
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logActivity(
  supabase: { from: (table: string) => any },
  taskId: string,
  action: string,
  userId: string,
  oldValue: string | null = null,
  newValue: string | null = null
) {
  await supabase.from("activity_log").insert({
    task_id: taskId,
    action,
    old_value: oldValue,
    new_value: newValue,
    user_id: userId,
  });
}
