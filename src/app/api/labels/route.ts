import { NextRequest, NextResponse } from "next/server";
import {
  createServerClient,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const [labelsRes, taskLabelsRes] = await Promise.all([
    supabase.from("labels").select("*").order("name"),
    supabase.from("task_labels").select("*"),
  ]);

  if (labelsRes.error) return serverError(labelsRes.error.message);
  if (taskLabelsRes.error) return serverError(taskLabelsRes.error.message);

  return NextResponse.json({
    labels: labelsRes.data,
    taskLabels: taskLabelsRes.data,
  });
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(request);
  if (!supabase) return unauthorized();

  const body = await request.json();
  if (!body.name?.trim()) return badRequest("Name is required");
  if (!body.color) return badRequest("Color is required");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return unauthorized();

  const { data, error } = await supabase
    .from("labels")
    .insert({ name: body.name.trim(), color: body.color, user_id: userData.user.id })
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data, { status: 201 });
}
