import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  serverError,
} from "@/lib/supabase-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { commentId } = await params;

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}
