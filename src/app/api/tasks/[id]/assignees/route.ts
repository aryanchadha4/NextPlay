import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  badRequest,
  serverError,
  logActivity,
} from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id: taskId } = await params;
  const body = await request.json();
  if (!body.member_id) return badRequest("member_id is required");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return unauthorized();

  const { error } = await supabase.from("task_assignees").insert({
    task_id: taskId,
    member_id: body.member_id,
    user_id: userData.user.id,
  });

  if (error) return serverError(error.message);

  const { data: member } = await supabase
    .from("team_members")
    .select("name")
    .eq("id", body.member_id)
    .single();

  await logActivity(
    supabase,
    taskId,
    "assignee_added",
    userData.user.id,
    null,
    member?.name || body.member_id
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
