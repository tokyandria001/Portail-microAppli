// lib/templates.ts
import fs from "fs/promises";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

export async function listTemplates() {
  try {
    const names = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
    return names.filter(n => n.isDirectory()).map(n => n.name);
  } catch {
    return [];
  }
}

async function readDirRecursive(dir: string, base = ""): Promise<Array<{ path: string; content: string }>> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: Array<{ path: string; content: string }> = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = base ? path.posix.join(base, entry.name) : entry.name;
    if (entry.isDirectory()) {
      const sub = await readDirRecursive(full, rel);
      files.push(...sub);
    } else if (entry.isFile()) {
      const raw = await fs.readFile(full, "utf8");
      files.push({ path: rel, content: raw });
    }
  }

  return files;
}

export async function loadTemplateFiles(templateName: string) {
  const dir = path.join(TEMPLATES_DIR, templateName);
  return readDirRecursive(dir);
}

/** Replace placeholders like {{NAME}} in file contents / paths */
export function applyTemplateVars(files: Array<{ path: string; content: string }>, vars: Record<string, string>) {
  const replaced = files.map(f => {
    let p = f.path;
    let c = f.content;
    for (const [k, v] of Object.entries(vars)) {
      const token = new RegExp(`{{\\s*${escapeRegExp(k)}\\s*}}`, "g");
      p = p.replace(token, v);
      c = c.replace(token, v);
    }
    return { path: p, content: c };
  });
  return replaced;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
