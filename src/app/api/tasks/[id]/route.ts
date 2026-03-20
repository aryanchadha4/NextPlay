import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  serverError,
  logActivity,
} from "@/lib/supabase-server";

const TRACKED_FIELDS = ["status", "priority", "title", "description", "due_date"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const { data: existing, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return serverError(fetchError?.message || "Task not found");

  const { data, error } = await supabase
    .from("tasks")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return serverError(error.message);

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const userId = userData.user.id;
    for (const field of TRACKED_FIELDS) {
      if (field in body && String(existing[field] ?? "") !== String(body[field] ?? "")) {
        await logActivity(
          supabase,
          id,
          `${field}_change`,
          userId,
          existing[field] != null ? String(existing[field]) : null,
          body[field] != null ? String(body[field]) : null
        );
      }
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const { id } = await params;

  await supabase.from("task_labels").delete().eq("task_id", id);
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}
