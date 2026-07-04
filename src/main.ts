// Obsidian Trae 插件入口
// 在 Obsidian 内通过 AI 整理链接文章并保存为笔记（移动端优先）。

import { Notice, Plugin } from "obsidian";
import { Article, DEFAULT_SETTINGS, ObsidianTraeSettings } from "./types";
import { AIClient } from "./trae-client";
import { ArticleFetcher } from "./article-fetcher";
import { NoteWriter } from "./note-writer";
import { AddLinkModal } from "./modal-add-link";
import { TraeSettingTab } from "./settings";

export default class ObsidianTraePlugin extends Plugin {
  settings: ObsidianTraeSettings = DEFAULT_SETTINGS;
  private fetcher = new ArticleFetcher();

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("link", "Trae：从链接添加文章", () => {
      this.openAddLink();
    });

    this.addCommand({
      id: "trae-add-from-link",
      name: "从链接添加文章",
      callback: () => this.openAddLink(),
    });

    this.addCommand({
      id: "trae-test-connection",
      name: "测试 AI 连接",
      callback: async () => {
        const r = await new AIClient(this.settings).testConnection();
        new Notice(r.message);
      },
    });

    this.addSettingTab(new TraeSettingTab(this.app, this));
  }

  private openAddLink() {
    const modal = new AddLinkModal(this.app);

    // 在用户点击 ribbon/命令的手势链内尝试读剪贴板，再打开窗口
    const prefill = this.settings.autoReadClipboard
      ? modal.tryPrefillFromClipboard()
      : Promise.resolve(false);

    prefill.finally(() => modal.open());

    modal.onSubmit(async (url, tags) => {
      if (!url) {
        new Notice("请输入文章链接");
        return;
      }
      const tagList = tags ? tags.split(/\s+/).filter(Boolean) : [];
      await this.run(url, tagList);
    });
  }

  private async run(url: string, extraTags: string[]) {
    if (!this.settings.apiKey) {
      new Notice("未配置 API Key，请在设置中填写。");
      return;
    }

    const client = new AIClient(this.settings);

    // 1. 抓取正文
    let article: Article | null = null;
    try {
      new Notice("正在抓取文章…", 3000);
      article = await this.fetcher.fetch(url);
    } catch (e) {
      new Notice("内置抓取失败，改用 AI 读取链接…", 3000);
    }

    // 2. 构造提示词
    let prompt: string;
    if (article) {
      prompt = this.settings.promptTemplate
        .replace(/\{\{url\}\}/g, article.url)
        .replace(/\{\{content\}\}/g, article.textContent);
    } else {
      prompt = `请阅读以下链接的文章并整理为适合 Obsidian 的 Markdown 笔记（保留要点、生成 2-3 句摘要、给出 3-5 个标签、用标题组织结构，只输出可直接保存为 .md 的内容）：\n${url}`;
    }

    // 3. 调用 AI 整理
    new Notice("AI 正在整理文章…", 6000);
    const result = await client.chat(prompt);
    if (!result.ok) {
      new Notice(`AI 整理失败：${result.message}`);
      return;
    }
    const aiMarkdown = result.text;
    if (!aiMarkdown.trim()) {
      new Notice("AI 返回为空，已取消。");
      return;
    }

    // 4. 写入笔记
    try {
      const writer = new NoteWriter(this.app, this.settings);
      const fallback: Article = {
        title: "未命名",
        content: "",
        textContent: "",
        url,
      };
      const file = await writer.write(article || fallback, aiMarkdown, extraTags);
      new Notice(`已保存：${file.basename}`);
    } catch (e) {
      new Notice(`保存失败：${(e as Error).message}`);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
