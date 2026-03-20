import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id: taskId } = await params;
  const body = await request.json();
  if (!body.label_id) return badRequest("label_id is required");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return unauthorized();

  const { error } = await supabase.from("task_labels").insert({
    task_id: taskId,
    label_id: body.label_id,
    user_id: userData.user.id,
  });

  if (error) return serverError(error.message);
  return NextResponse.json({ success: true }, { status: 201 });
}
