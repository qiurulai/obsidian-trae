// TraeSettingTab：配置 API Key、端点、模型、目标文件夹、提示词等。

import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import ObsidianTraePlugin from "./main";
import { AIClient } from "./trae-client";

/** 常用 OpenAI 兼容服务商预设 */
const PROVIDER_PRESETS: Record<string, { baseUrl: string; model: string }> = {
  "DeepSeek": { baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
  "MiniMax": { baseUrl: "https://api.minimax.io/v1", model: "MiniMax-M3" },
  "通义千问": { baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
  "智谱 GLM": { baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-plus" },
  "月之暗面 Kimi": { baseUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  "OpenAI": { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
};

export class TraeSettingTab extends PluginSettingTab {
  plugin: ObsidianTraePlugin;

  constructor(app: App, plugin: ObsidianTraePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("AI 模型配置").setHeading();

    new Setting(containerEl)
      .setName("API Key")
      .setDesc("OpenAI 兼容服务商的 API Key。仅保存在本地 data.json，不会上传。")
      .addText((t) => {
        t.inputEl.type = "password";
        t.setValue(this.plugin.settings.apiKey).onChange(async (v) => {
          this.plugin.settings.apiKey = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("API Base URL")
      .setDesc("OpenAI 兼容端点地址，插件自动拼接 /chat/completions。可从下方预设快速填充。")
      .addText((t) =>
        t.setValue(this.plugin.settings.apiBaseUrl).onChange(async (v) => {
          this.plugin.settings.apiBaseUrl = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("快速选择服务商")
      .setDesc("选择常用服务商，自动填充 Base URL 和模型名（仍可手动修改）。")
      .addDropdown((d) => {
        d.addOption("", "— 手动配置 —");
        for (const name of Object.keys(PROVIDER_PRESETS)) {
          d.addOption(name, name);
        }
        d.onChange(async (v) => {
          if (!v) return;
          const preset = PROVIDER_PRESETS[v];
          this.plugin.settings.apiBaseUrl = preset.baseUrl;
          this.plugin.settings.model = preset.model;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName("模型")
      .setDesc("如 deepseek-chat、MiniMax-M3、qwen-plus、glm-4-plus、moonshot-v1-8k、gpt-4o-mini 等。")
      .addText((t) =>
        t.setValue(this.plugin.settings.model).onChange(async (v) => {
          this.plugin.settings.model = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl).addButton((b) => {
      b.setButtonText("测试连接").setClass("mod-cta");
      b.onClick(async () => {
        const client = new AIClient(this.plugin.settings);
        new Notice("正在测试连接…");
        const r = await client.testConnection();
        new Notice(r.message);
      });
    });

    new Setting(containerEl).setName("笔记存储").setHeading();

    new Setting(containerEl)
      .setName("目标文件夹")
      .setDesc("整理后的笔记保存在此文件夹下（不存在会自动创建）。")
      .addText((t) =>
        t.setValue(this.plugin.settings.targetFolder).onChange(async (v) => {
          this.plugin.settings.targetFolder = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("笔记命名模板")
      .setDesc("可用 {{date}}（YYYYMMDD）、{{title}}。")
      .addText((t) =>
        t.setValue(this.plugin.settings.noteNameTemplate).onChange(async (v) => {
          this.plugin.settings.noteNameTemplate = v;
          await this.plugin.saveSettings();
        })
      );

    const promptSetting = new Setting(containerEl)
      .setName("提示词模板")
      .setDesc("控制 AI 如何整理文章。可用 {{url}}、{{content}}。");
    promptSetting.addTextArea((t) => {
      t.inputEl.rows = 8;
      t.inputEl.style.width = "100%";
      t.inputEl.addClass("obsidian-trae-prompt-textarea");
      t.setValue(this.plugin.settings.promptTemplate).onChange(async (v) => {
        this.plugin.settings.promptTemplate = v;
        await this.plugin.saveSettings();
      });
    });

    new Setting(containerEl)
      .setName("自动读剪贴板")
      .setDesc("打开添加窗口时自动用剪贴板里的链接预填。")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.autoReadClipboard).onChange(async (v) => {
          this.plugin.settings.autoReadClipboard = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("自动收集标签")
      .setDesc("从 AI 输出中提取 # 标签写入 frontmatter。")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.autoTags).onChange(async (v) => {
          this.plugin.settings.autoTags = v;
          await this.plugin.saveSettings();
        })
      );
  }
}
