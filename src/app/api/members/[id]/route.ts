import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  serverError,
} from "@/lib/supabase-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id } = await params;

  await supabase.from("task_assignees").delete().eq("member_id", id);
  const { error } = await supabase.from("team_members").delete().eq("id", id);

  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}
