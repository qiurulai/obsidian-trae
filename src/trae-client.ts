// TraeClient：通过 Obsidian requestUrl 调用 Trae 模型（OpenAI 兼容端点）
// 跨桌面/移动端，绕过 CORS。

import { requestUrl } from "obsidian";
import { ObsidianTraeSettings } from "./types";

export interface ChatResult {
  ok: boolean;
  message: string;
  text: string;
}

export class TraeClient {
  constructor(private settings: ObsidianTraeSettings) {}

  private get endpoint(): string {
    const base = (this.settings.traeBaseUrl || "").trim().replace(/\/+$/, "");
    return `${base}/v1/chat/completions`;
  }

  /** 测试连接：发一个最小请求验证 PAT 与端点 */
  async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.settings.traePat) {
      return { ok: false, message: "未配置 PAT，请在设置中填写。" };
    }
    try {
      const r = await this.chat("reply with: ok", 8);
      if (r.ok) {
        return { ok: true, message: `连接成功。模型回复：${r.text.slice(0, 40)}` };
      }
      return { ok: false, message: r.message };
    } catch (e) {
      return { ok: false, message: `连接失败：${(e as Error).message}` };
    }
  }

  /**
   * 调用 Trae 生成。
   * 兼容 SSE 流式响应、整体 JSON、纯文本三种返回。
   */
  async chat(prompt: string, maxTokens?: number): Promise<ChatResult> {
    if (!this.settings.traePat) {
      return { ok: false, message: "未配置 PAT。", text: "" };
    }

    const body: Record<string, unknown> = {
      model: this.settings.model || "GLM-5.1",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    };
    if (maxTokens && maxTokens > 0) body.max_tokens = maxTokens;

    let res;
    try {
      res = await requestUrl({
        url: this.endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.settings.traePat}`,
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        throw: false,
      });
    } catch (e) {
      return {
        ok: false,
        message: `网络错误：${(e as Error).message}（请检查 Base URL）`,
        text: "",
      };
    }

    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: "PAT 无效或已失效（401/403）。", text: "" };
    }
    if (res.status >= 400) {
      return {
        ok: false,
        message: `接口返回 ${res.status}：${this.safeSlice(res.text)}`,
        text: "",
      };
    }

    const text = this.parseResponse(res.text);
    if (!text) {
      return { ok: false, message: "Trae 返回为空。", text: "" };
    }
    return { ok: true, message: "完成", text };
  }

  /** 解析 SSE 流 / JSON / 纯文本 */
  private parseResponse(raw: string): string {
    if (!raw) return "";
    // SSE：按 data: 行解析
    if (raw.includes("data:")) {
      let out = "";
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^data:\s*(.*)$/);
        if (!m) continue;
        const payload = m[1].trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const obj = JSON.parse(payload);
          const delta =
            obj?.choices?.[0]?.delta?.content ??
            obj?.choices?.[0]?.message?.content ??
            obj?.content ??
            "";
          out += delta || "";
        } catch {
          // 非 JSON 的 data 行，忽略
        }
      }
      if (out) return out.trim();
    }
    // 整体 JSON
    try {
      const obj = JSON.parse(raw);
      const c =
        obj?.choices?.[0]?.message?.content ??
        obj?.choices?.[0]?.delta?.content ??
        obj?.content ??
        "";
      if (c) return String(c).trim();
    } catch {
      // 落到纯文本
    }
    return raw.trim();
  }

  private safeSlice(s: string, n = 200): string {
    const t = (s || "").trim();
    return t.length > n ? t.slice(0, n) + "…" : t;
  }
}
