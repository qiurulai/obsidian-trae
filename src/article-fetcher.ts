// ArticleFetcher：requestUrl 取 HTML → DOMParser → @mozilla/readability
// 移动端 webview 内置 DOMParser，无需 jsdom。

import { requestUrl } from "obsidian";
import { Readability } from "@mozilla/readability";
import { Article } from "./types";

// 模拟手机端微信浏览器，提高公众号正文命中率
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0";

const MIN_LENGTH = 120; // 正文最小字符数，过短视为抓取失败

export class ArticleFetcher {
  async fetch(url: string): Promise<Article> {
    const res = await requestUrl({
      url,
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      throw: false,
    });

    if (res.status >= 400) {
      throw new Error(`抓取失败：HTTP ${res.status}`);
    }

    const html = res.text || "";
    if (!html) throw new Error("抓取失败：返回内容为空。");

    const doc = new DOMParser().parseFromString(html, "text/html");
    const parsed = new Readability(doc).parse();

    if (
      !parsed ||
      !parsed.textContent ||
      parsed.textContent.trim().length < MIN_LENGTH
    ) {
      throw new Error("Readability 未能提取有效正文（可能被反爬），将回退到 Trae 读取。");
    }

    return {
      title: (parsed.title || "").trim() || this.titleFromUrl(url),
      content: parsed.content || "",
      textContent: parsed.textContent.trim(),
      url,
      excerpt: parsed.excerpt,
    };
  }

  private titleFromUrl(url: string): string {
    try {
      const u = new URL(url);
      const seg = u.pathname.split("/").filter(Boolean).pop();
      return seg ? decodeURIComponent(seg).slice(0, 60) : u.hostname;
    } catch {
      return "未命名";
    }
  }
}
