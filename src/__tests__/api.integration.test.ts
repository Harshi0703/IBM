import { describe, it, expect } from "vitest";
import { POST as explainPost } from "@/app/api/explain/route";
import { POST as debugPost } from "@/app/api/debug/route";
import { POST as hintPost } from "@/app/api/hint/route";
import { POST as tutorPost } from "@/app/api/tutor/route";
import { POST as executePost } from "@/app/api/execute/route";
import { GET as projectsGet, POST as projectsPost } from "@/app/api/projects/route";
import {
  GET as projectByIdGet,
  PATCH as projectByIdPatch,
  DELETE as projectByIdDelete,
} from "@/app/api/projects/[id]/route";

function makeJsonRequest(url: string, method: string, body?: unknown): Request {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("Integration Tests: Explain, Debug, Hint, Tutor, Execute & Projects APIs", () => {
  it("POST /api/explain returns structured explanation with honest mode label", async () => {
    const req = makeJsonRequest("http://localhost:3000/api/explain", "POST", {
      language: "python",
      code: "x = 10\ny = 20\nprint(x + y)",
      learningMode: true,
    });
    const res = await explainPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(["demo", "live_ai"]).toContain(data.mode);
    expect(data.summary).toBeTruthy();
    expect(Array.isArray(data.lineByLine)).toBe(true);
    expect(Array.isArray(data.concepts)).toBe(true);
    expect(data.learningCheck.options.length).toBeGreaterThanOrEqual(2);
  });

  it("POST /api/explain rejects empty input with HTTP 400", async () => {
    const req = makeJsonRequest("http://localhost:3000/api/explain", "POST", {
      language: "python",
      code: "",
    });
    const res = await explainPost(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/debug diagnoses buggy Python code and provides Socratic guidance", async () => {
    const req = makeJsonRequest("http://localhost:3000/api/debug", "POST", {
      language: "python",
      code: 'age = 20\nprint("Age: " + age)',
      learningMode: true,
    });
    const res = await debugPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hasErrors).toBe(true);
    expect(data.errorCategory).toBe("Type Error");
    expect(data.primaryLine).toBe(2);
    expect(data.socraticGuidance.diagnosis).toBeTruthy();
    expect(data.socraticGuidance.nextStep).toBeTruthy();
    expect(data.correctedCode).toContain("str(age)");
  });

  it("POST /api/hint provides Golden-Rule hint at level 1 and Frustration Protocol example at level 4", async () => {
    const req1 = makeJsonRequest("http://localhost:3000/api/hint", "POST", {
      language: "python",
      code: 'age = 20\nprint("Age: " + age)',
      hintLevel: 1,
    });
    const res1 = await hintPost(req1);
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.hintLevel).toBe(1);
    expect(data1.genericSyntaxExample).toBeNull();

    const req4 = makeJsonRequest("http://localhost:3000/api/hint", "POST", {
      language: "python",
      code: 'age = 20\nprint("Age: " + age)',
      hintLevel: 4,
    });
    const res4 = await hintPost(req4);
    expect(res4.status).toBe(200);
    const data4 = await res4.json();
    expect(data4.hintLevel).toBe(4);
    expect(data4.genericSyntaxExample).toBeTruthy();
  });

  it("POST /api/tutor returns Socratic formatted reply with Diagnosis, Location, Concept, Next Step", async () => {
    const req = makeJsonRequest("http://localhost:3000/api/tutor", "POST", {
      sessionId: "test-session",
      language: "python",
      currentCode: 'age = 20\nprint(age + " years old")',
      errorTrace: "TypeError: unsupported operand type(s) for +: 'int' and 'str'",
      userMessage: "Why is my code throwing a TypeError?",
    });
    const res = await tutorPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toContain("Diagnosis:");
    expect(data.reply).toContain("Location:");
    expect(data.reply).toContain("Concept:");
    expect(data.reply).toContain("Next Step:");
  });

  it("POST /api/execute handles unconfigured sandbox gracefully without fabricating output", async () => {
    const req = makeJsonRequest("http://localhost:3000/api/execute", "POST", {
      language: "python",
      code: 'print("hello")',
    });
    const res = await executePost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    if (!process.env.JUDGE0_API_URL) {
      expect(data.configured).toBe(false);
      expect(data.executed).toBe(false);
      expect(data.stdout).toBe("");
      expect(data.setupNotice).toBeTruthy();
    }
  });

  it("Saves, retrieves, renames, and deletes a project session via /api/projects", async () => {
    const createReq = makeJsonRequest("http://localhost:3000/api/projects", "POST", {
      title: "Integration Test Session",
      language: "javascript",
      code: "const a = 1; console.log(a);",
      learningMode: true,
    });
    const createRes = await projectsPost(createReq);
    expect(createRes.status).toBe(201);
    const { project } = await createRes.json();
    expect(project.id).toBeTruthy();

    // List
    const listRes = await projectsGet();
    const listData = await listRes.json();
    expect(listData.projects.some((p: { id: string }) => p.id === project.id)).toBe(true);

    // Get by ID
    const getRes = await projectByIdGet(new Request("http://localhost:3000"), {
      params: { id: project.id },
    });
    expect(getRes.status).toBe(200);

    // Patch
    const patchReq = makeJsonRequest(
      `http://localhost:3000/api/projects/${project.id}`,
      "PATCH",
      { title: "Renamed Test Session" }
    );
    const patchRes = await projectByIdPatch(patchReq, { params: { id: project.id } });
    expect(patchRes.status).toBe(200);
    const patched = await patchRes.json();
    expect(patched.project.title).toBe("Renamed Test Session");

    // Delete
    const delRes = await projectByIdDelete(new Request("http://localhost:3000"), {
      params: { id: project.id },
    });
    expect(delRes.status).toBe(200);
  });
});
