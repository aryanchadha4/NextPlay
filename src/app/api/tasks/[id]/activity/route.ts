import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
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
    .from("activity_log")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}
