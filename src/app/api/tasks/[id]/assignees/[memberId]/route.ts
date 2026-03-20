import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  serverError,
  logActivity,
} from "@/lib/supabase-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id: taskId, memberId } = await params;

  const { data: member } = await supabase
    .from("team_members")
    .select("name")
    .eq("id", memberId)
    .single();

  const { error } = await supabase
    .from("task_assignees")
    .delete()
    .eq("task_id", taskId)
    .eq("member_id", memberId);

  if (error) return serverError(error.message);

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    await logActivity(
      supabase,
      taskId,
      "assignee_removed",
      userData.user.id,
      member?.name || memberId,
      null
    );
  }

  return NextResponse.json({ success: true });
}
