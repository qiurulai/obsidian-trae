// Obsidian Trae 类型定义

/** 插件设置 */
export interface ObsidianTraeSettings {
  /** API Key，用于调用 OpenAI 兼容的第三方模型端点 */
  apiKey: string;
  /** API Base URL（OpenAI 兼容端点，自动拼接 /v1/chat/completions） */
  apiBaseUrl: string;
  /** 模型名，如 deepseek-chat、glm-4-plus、moonshot-v1-8k 等 */
  model: string;
  /** 笔记保存目标文件夹 */
  targetFolder: string;
  /** 笔记命名模板，可用 {{date}}、{{title}} */
  noteNameTemplate: string;
  /** 提示词模板，可用 {{url}}、{{content}} */
  promptTemplate: string;
  /** 是否从 AI 输出中自动收集 # 标签写入 frontmatter */
  autoTags: boolean;
  /** 打开添加窗口时是否自动用剪贴板里的链接预填 */
  autoReadClipboard: boolean;
}

export const DEFAULT_SETTINGS: ObsidianTraeSettings = {
  apiKey: "",
  apiBaseUrl: "https://api.deepseek.com",
  model: "deepseek-chat",
  targetFolder: "Trae 收藏",
  noteNameTemplate: "{{date}}-{{title}}",
  promptTemplate: `请把以下文章整理为适合 Obsidian 的 Markdown 笔记：
1. 用一级标题写出文章标题；
2. 在标题下方用引用块（>）写一段 2-3 句的摘要；
3. 保留文章的关键要点与小标题，用二级/三级标题组织；
4. 在文末给出 3-5 个标签（形如 #标签）；
5. 不要输出与笔记无关的解释性文字，只输出可直接保存为 .md 的内容。

文章 URL：{{url}}

文章正文：
{{content}}`,
  autoTags: true,
  autoReadClipboard: true,
};

/** 抓取到的文章 */
export interface Article {
  title: string;
  /** HTML 正文 */
  content: string;
  /** 纯文本正文 */
  textContent: string;
  url: string;
  excerpt?: string;
}
