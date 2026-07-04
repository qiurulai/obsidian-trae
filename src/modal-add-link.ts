// AddLinkModal：粘贴链接、可选标签，提交后触发主流程。
// 移动端友好：大触控、剪贴板预填、显式"粘贴"兜底按钮。

import { App, Modal, Setting, TextComponent } from "obsidian";

export class AddLinkModal extends Modal {
  url = "";
  tags = "";
  private urlInput?: TextComponent;
  private resolveCb?: (url: string, tags: string) => void;

  constructor(app: App, prefillUrl?: string) {
    super(app);
    if (prefillUrl) this.url = prefillUrl;
  }

  /**
   * 在用户点击 ribbon/命令的手势链内调用，尝试读剪贴板预填 URL。
   * 返回是否预填成功。失败（权限/环境）静默忽略。
   */
  async tryPrefillFromClipboard(): Promise<boolean> {
    if (this.url) return true;
    try {
      const text = (await navigator.clipboard.readText()) || "";
      const trimmed = text.trim();
      if (/^https?:\/\//i.test(trimmed)) {
        this.url = trimmed;
        return true;
      }
    } catch {
      // 移动端可能在非手势或无权限时抛错，忽略
    }
    return false;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("obsidian-trae-modal");

    contentEl.createEl("h2", { text: "从链接添加文章" });

    const urlSetting = new Setting(contentEl)
      .setName("文章链接")
      .setDesc("公众号或其他网页链接");

    urlSetting.addText((t) => {
      this.urlInput = t;
      t.inputEl.addClass("obsidian-trae-url-input");
      t.setValue(this.url).setPlaceholder("https://...");
      t.onChange((v) => (this.url = v));
    });

    urlSetting.addButton((b) => {
      b.setIcon("clipboard").setTooltip("从剪贴板粘贴");
      b.onClick(async () => {
        try {
          const text = ((await navigator.clipboard.readText()) || "").trim();
          if (text) {
            this.url = text;
            this.urlInput?.setValue(text);
          }
        } catch {
          // 忽略
        }
      });
    });

    new Setting(contentEl)
      .setName("附加标签（可选）")
      .setDesc("用空格分隔，如 公众号 AI")
      .addText((t) => {
        t.inputEl.addClass("obsidian-trae-tags-input");
        t.setPlaceholder("公众号 AI");
        t.onChange((v) => (this.tags = v));
      });

    const btns = contentEl.createDiv({ cls: "obsidian-trae-buttons" });
    const cancel = btns.createEl("button", { text: "取消" });
    cancel.onclick = () => this.close();

    const save = btns.createEl("button", {
      text: "保存",
      cls: "obsidian-trae-btn-primary mod-cta",
    });
    save.onclick = () => {
      if (this.resolveCb) this.resolveCb(this.url.trim(), this.tags.trim());
      this.close();
    };
  }

  onClose() {
    this.contentEl.empty();
  }

  /** 外部注册提交回调 */
  onSubmit(cb: (url: string, tags: string) => void): void {
    this.resolveCb = cb;
  }
}
