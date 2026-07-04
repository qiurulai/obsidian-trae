// NoteWriter：把整理后的 Markdown 写入 vault，含 frontmatter。

import { App, TFile } from "obsidian";
import { Article, ObsidianTraeSettings } from "./types";

export class NoteWriter {
  constructor(private app: App, private settings: ObsidianTraeSettings) {}

  async write(
    article: Article,
    traeMarkdown: string,
    extraTags: string[]
  ): Promise<TFile> {
    const folder = (this.settings.targetFolder || "").trim() || "/";
    const title = this.resolveTitle(article, traeMarkdown);
    const slug = this.slugify(title);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const name =
      (this.settings.noteNameTemplate || "{{date}}-{{title}}")
        .replace(/\{\{date\}\}/g, date)
        .replace(/\{\{title\}\}/g, slug) || `${date}-${slug}`;

    const base = folder.endsWith("/") ? `${folder}${name}` : `${folder}/${name}`;
    const path = this.ensureUnique(`${base}.md`);

    const tags = this.settings.autoTags
      ? this.mergeTags(traeMarkdown, extraTags)
      : extraTags.map((t) => t.replace(/^#/, ""));

    const content = `---\n${this.frontmatter(article, tags)}\n---\n\n${traeMarkdown.trim()}\n`;

    const file = await this.app.vault.create(path, content);
    await this.app.workspace.openLinkText(file.basename, "", true);
    return file;
  }

  private resolveTitle(article: Article, md: string): string {
    if (article.title && article.title !== "未命名") return article.title;
    const h1 = md.match(/^#\s+(.+)\s*$/m);
    if (h1) return h1[1].trim();
    return "未命名";
  }

  private frontmatter(article: Article, tags: string[]): string {
    const lines = [
      `source: ${article.url}`,
      `fetched_at: ${new Date().toISOString()}`,
      `via: trae-work`,
      `title: ${this.escapeYaml(this.resolveTitleRaw(article))}`,
    ];
    if (tags.length) {
      lines.push(`tags: [${tags.join(", ")}]`);
    }
    return lines.join("\n");
  }

  private resolveTitleRaw(article: Article): string {
    return article.title || "未命名";
  }

  private mergeTags(md: string, extra: string[]): string[] {
    const fromMd =
      md.match(/#[\u4e00-\u9fa5\w]+/g)?.map((t) => t.replace(/^#/, "")) || [];
    const all = [...fromMd, ...extra.map((t) => t.replace(/^#/, ""))];
    return Array.from(new Set(all)).filter(Boolean).slice(0, 8);
  }

  private ensureUnique(path: string): string {
    if (!this.app.vault.getAbstractFileByPath(path)) return path;
    const dot = path.lastIndexOf(".");
    const base = dot > 0 ? path.slice(0, dot) : path;
    const ext = dot > 0 ? path.slice(dot) : "";
    let i = 1;
    while (this.app.vault.getAbstractFileByPath(`${base}-${i}${ext}`)) i++;
    return `${base}-${i}${ext}`;
  }

  private slugify(s: string): string {
    const out = (s || "未命名")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "-")
      .trim()
      .slice(0, 50);
    return out || "未命名";
  }

  private escapeYaml(s: string): string {
    if (/[:#\[\]{}&*!|>'"%@`,]/.test(s) || /^\s|\s$/.test(s)) {
      return `"${s.replace(/"/g, '\\"')}"`;
    }
    return s;
  }
}
