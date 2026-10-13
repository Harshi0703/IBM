import { NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/db";
import { ProjectCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const result = await listProjects();
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to load saved projects." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parsed = ProjectCreateSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid project data.";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const created = await createProject(parsed.data);
    return NextResponse.json({ project: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to save project session." },
      { status: 500 }
    );
  }
}
