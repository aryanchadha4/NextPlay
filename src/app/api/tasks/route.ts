import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  badRequest,
  serverError,
  logActivity,
} from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const body = await request.json();
  if (!body.title?.trim()) return badRequest("Title is required");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return unauthorized();

  const task = {
    title: body.title.trim(),
    description: body.description || null,
    priority: body.priority || "normal",
    due_date: body.due_date || null,
    status: body.status || "todo",
    user_id: userData.user.id,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) return serverError(error.message);

  await logActivity(supabase, data.id, "task_created", userData.user.id);

  return NextResponse.json(data, { status: 201 });
}
