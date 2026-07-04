// TraeSettingTab：配置 PAT、端点、模型、目标文件夹、提示词等。

import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import ObsidianTraePlugin from "./main";
import { TraeClient } from "./trae-client";

export class TraeSettingTab extends PluginSettingTab {
  plugin: ObsidianTraePlugin;

  constructor(app: App, plugin: ObsidianTraePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("Trae 账号").setHeading();

    new Setting(containerEl)
      .setName("PAT（个人访问令牌）")
      .setDesc("登录 Trae Work 后获取的 PAT，用于调用 Trae 模型。仅保存在本地 data.json。")
      .addText((t) => {
        t.inputEl.type = "password";
        t.setValue(this.plugin.settings.traePat).onChange(async (v) => {
          this.plugin.settings.traePat = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Trae Base URL")
      .setDesc("Trae 推理端点地址（OpenAI 兼容，自动拼接 /v1/chat/completions）。默认值需按实际部署调整。")
      .addText((t) =>
        t.setValue(this.plugin.settings.traeBaseUrl).onChange(async (v) => {
          this.plugin.settings.traeBaseUrl = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("模型")
      .setDesc("如 GLM-5.1、Doubao-Seed-2.0-Code、DeepSeek-V3.2 等。")
      .addText((t) =>
        t.setValue(this.plugin.settings.model).onChange(async (v) => {
          this.plugin.settings.model = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl).addButton((b) => {
      b.setButtonText("测试连接").setClass("mod-cta");
      b.onClick(async () => {
        const client = new TraeClient(this.plugin.settings);
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
      .setDesc("控制 Trae 如何整理文章。可用 {{url}}、{{content}}。");
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
      .setDesc("从 Trae 输出中提取 # 标签写入 frontmatter。")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.autoTags).onChange(async (v) => {
          this.plugin.settings.autoTags = v;
          await this.plugin.saveSettings();
        })
      );
  }
}
