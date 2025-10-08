// app/api/create-repo/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Octokit } from "octokit";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG; // optional: create in org if set

if (!GITHUB_TOKEN) {
  throw new Error("Missing GITHUB_TOKEN env var");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

type CreateBody = {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  initializeWithREADME?: boolean;
};

async function createRepoAndFiles({
  owner,
  name,
  description,
  visibility,
  files,
}: {
  owner: string;
  name: string;
  description?: string;
  visibility?: "public" | "private";
  files: Array<{ path: string; content: string; message?: string }>;
}) {
  // 1) create repo
  const createResponse =
    owner && owner !== (await octokit.rest.users.getAuthenticated()).data.login
      ? await octokit.rest.repos.createInOrg({
          org: owner,
          name,
          description,
          private: visibility !== "public",
        })
      : await octokit.rest.repos.createForAuthenticatedUser({
          name,
          description,
          private: visibility !== "public",
        });

  const defaultBranch =
    createResponse.data.default_branch || createResponse.data.default_branch || "main";

  // 2) add files using createOrUpdateFileContents
  for (const file of files) {
    const path = file.path;
    const message = file.message ?? `chore: add ${path}`;
    // create file on default branch
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: createResponse.data.owner.login,
      repo: name,
      path,
      message,
      content: Buffer.from(file.content).toString("base64"),
      branch: defaultBranch,
    });
  }

  return createResponse.data;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBody;
    if (!body?.name) return NextResponse.json({ error: "Missing repo name" }, { status: 400 });

    const owner = GITHUB_ORG ?? (await octokit.rest.users.getAuthenticated()).data.login;

    // standard repo files
    const files = [
      {
        path: "README.md",
        content: `# ${body.name}\n\n${body.description ?? "Repo generated from Backstage-like UI."}`,
        message: "chore: add README",
      },
      {
        path: ".gitignore",
        content: `node_modules\n.env\n.DS_Store\n`,
        message: "chore: add gitignore",
      },
      {
        path: ".github/workflows/ci.yml",
        content: defaultWorkflowYml(), // function defined below
        message: "ci: add standard CI workflow",
      },
      // Add other standard files e.g. CODEOWNERS, LICENSE...
    ];

    const repo = await createRepoAndFiles({
      owner,
      name: body.name,
      description: body.description,
      visibility: body.visibility ?? "private",
      files,
    });

    return NextResponse.json({ repo });
  } catch (err: any) {
    console.error("create-repo error", err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}

function defaultWorkflowYml() {
  return `name: CI

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install deps
        run: npm ci

      - name: Lint
        run: npm run lint --if-present

      - name: Test
        run: npm test --if-present

      - name: Build
        run: npm run build --if-present

  # Optional deploy job placeholder
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy placeholder
        run: echo "Run your deploy here"
`;
}
