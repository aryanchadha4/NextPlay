import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id: taskId } = await params;

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id: taskId } = await params;
  const body = await request.json();
  if (!body.content?.trim()) return badRequest("Content is required");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return unauthorized();

  const { data, error } = await supabase
    .from("comments")
    .insert({
      task_id: taskId,
      content: body.content.trim(),
      user_id: userData.user.id,
    })
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data, { status: 201 });
}
