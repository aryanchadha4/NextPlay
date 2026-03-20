import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  serverError,
} from "@/lib/supabase-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; labelId: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id: taskId, labelId } = await params;

  const { error } = await supabase
    .from("task_labels")
    .delete()
    .eq("task_id", taskId)
    .eq("label_id", labelId);

  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}
