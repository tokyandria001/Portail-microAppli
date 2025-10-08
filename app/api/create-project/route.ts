// app/api/generate-project/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Octokit } from "octokit";
import { loadTemplateFiles, applyTemplateVars, listTemplates } from "@/lib/templates";
import { getServerSession } from "next-auth"; // si tu utilises NextAuth
import { authOptions } from "@/lib/auth"; // ton auth NextAuth config

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG ?? undefined;

if (!GITHUB_TOKEN) {
  throw new Error("Missing GITHUB_TOKEN env var");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function GET(req: NextRequest) {
  // retourne la liste des templates disponibles
  const templates = await listTemplates();
  return NextResponse.json({ templates });
}

type Body = {
  template: string;
  repoName: string;
  description?: string;
  visibility?: "private" | "public";
  vars?: Record<string, string>; // user-supplied variables for template replacement
  useTemplateRepo?: boolean; // optional: use GitHub template repo path
};

async function createRepo(owner: string, name: string, description?: string, visibility: "private" | "public" = "private") {
  // create repo in org or user
  const userLogin = (await octokit.rest.users.getAuthenticated()).data.login;
  const inOrg = owner && owner !== userLogin;

  if (inOrg) {
    const res = await octokit.rest.repos.createInOrg({
      org: owner,
      name,
      description,
      private: visibility !== "public",
    });
    return res.data;
  } else {
    const res = await octokit.rest.repos.createForAuthenticatedUser({
      name,
      description,
      private: visibility !== "public",
    });
    return res.data;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Optionnel : check session (NextAuth)
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as Body;
    if (!body?.template || !body?.repoName) {
      return NextResponse.json({ error: "Missing template or repoName" }, { status: 400 });
    }

    const owner = GITHUB_ORG ?? (await octokit.rest.users.getAuthenticated()).data.login;

    // Mode recommandé: if body.useTemplateRepo true => call GitHub generate repo from template (faster)
    if (body.useTemplateRepo && body.template.includes("/")) {
      // template should be "owner/repo" string pointing to an existing GitHub Template repository
      const [tmplOwner, tmplRepo] = body.template.split("/");
      const result = await octokit.request("POST /repos/{template_owner}/{template_repo}/generate", {
        template_owner: tmplOwner,
        template_repo: tmplRepo,
        owner,
        name: body.repoName,
        description: body.description,
        private: body.visibility !== "public",
      });
      return NextResponse.json({ repo: result.data });
    }

    // Otherwise: load template files from disk
    const files = await loadTemplateFiles(body.template);
    const applied = applyTemplateVars(files, { NAME: body.repoName, DESCRIPTION: body.description ?? "", ...(body.vars ?? {}) });

    // 1) create repository
    const repo = await createRepo(owner, body.repoName, body.description, body.visibility ?? "private");
    const repoOwner = repo.owner.login;
    const repoName = repo.name;
    const defaultBranch = repo.default_branch ?? "main";

    // 2) push files one-by-one
    for (const file of applied) {
      // skip .git if exists
      if (file.path.startsWith(".git")) continue;

      // create or update content
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: repoOwner,
        repo: repoName,
        path: file.path,
        message: `chore: add ${file.path}`,
        content: Buffer.from(file.content).toString("base64"),
        branch: defaultBranch,
      });
    }

    return NextResponse.json({ repo });
  } catch (err: any) {
    console.error("generate-project error:", err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
