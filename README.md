# Obsidian Trae

在 Obsidian 内通过 AI（OpenAI 兼容端点）整理公众号等链接文章，并保存为 Markdown 笔记。**以手机端为主要使用对象**：在公众号 App 复制链接 → 切到 Obsidian → 点图标 → 一键保存。

## 特性

- 移动端优先，桌面/移动通吃（`isDesktopOnly: false`）。
- 粘贴链接 → 内置 Readability 抓正文 → AI 整理为结构化 Markdown → 写入 vault。
- 抓取失败时回退到让 AI 读取链接。
- 打开添加窗口时自动用剪贴板里的链接预填（可在设置关闭）。
- 自动收集 `# 标签`写入 frontmatter，记录来源 URL、抓取时间。
- 所有网络请求走 Obsidian 内置 `requestUrl`，绕过 CORS。
- 支持任意 OpenAI 兼容端点（DeepSeek、MiniMax、通义千问、智谱 GLM、Kimi、OpenAI 等），内置常用服务商快速选择。

## 工作流

1. 在公众号（或其他网页）点"复制链接"。
2. 切到 Obsidian，点左侧 ribbon 的链接图标（或命令面板执行 `Trae: 从链接添加文章`）。
3. 弹窗里链接已自动填入（若剪贴板里是链接），可加附加标签。
4. 点"保存"：插件抓取正文 → 调 AI 整理 → 生成笔记并打开。

## 安装

### 从源码构建

```bash
git clone https://github.com/qiurulai/obsidian-trae.git
cd obsidian-trae
npm install
npm run build
```

把 `main.js`、`manifest.json`、`styles.css` 三个文件拷贝到你的 vault：

```
<vault>/.obsidian/plugins/obsidian-trae/
```

然后在 Obsidian：设置 → 第三方插件 → 关闭安全模式 → 启用 "Obsidian Trae"。

### 移动端安装

移动端同样把上述三个文件放到 vault 的 `.obsidian/plugins/obsidian-trae/` 下（可用 iCloud / Syncthing / 直接在移动端文件管理器操作），或在桌面端配好后用同步把插件目录带到移动端。启用插件后即用。也可借助 BRAT 等插件从 GitHub 安装。

## 配置 AI 模型

插件支持任意 OpenAI 兼容的模型端点。在设置 → Obsidian Trae 中填写：

- **API Key**：你所使用服务商的 API Key。仅保存在本地 `data.json`，不会上传。
- **API Base URL**：OpenAI 兼容端点地址。插件会自动拼接 `/chat/completions`。
- **模型**：对应服务商的模型名。
- 点"测试连接"验证。

### 常用服务商配置参考

| 服务商 | API Base URL | 模型名 | 获取 API Key |
|---|---|---|---|
| DeepSeek | `https://api.deepseek.com` | `deepseek-chat` | https://platform.deepseek.com/api_keys |
| MiniMax | `https://api.minimax.io/v1` | `MiniMax-M3` | https://platform.minimax.io |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` | https://dashscope.console.aliyun.com/apiKey |
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-plus` | https://open.bigmodel.cn/usercenter/apikeys |
| 月之暗面 Kimi | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` | https://platform.moonshot.cn/console/api-keys |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` | https://platform.openai.com/api-keys |

设置界面内置"快速选择服务商"下拉，选中后自动填充 Base URL 和模型名，仍可手动修改。

### 从旧版本升级（v0.1.0 → v0.2.0）

v0.1.0 使用的是不存在的 "Trae PAT + Trae 推理端点"，v0.2.0 已改为标准 OpenAI 兼容端点。升级后需重新在设置中填写 API Key 和 Base URL。

## 风险与限制

- **公众号反爬**：部分公众号文章需要登录或有反爬措施，内置 Readability 可能抓不到正文，此时会回退到让 AI 读取链接（成功率取决于 AI 服务商当时是否可访问该 URL）。
- **API Key 安全**：API Key 存于本地 `data.json`，本仓库 `.gitignore` 已忽略该文件，请勿提交。不要把含 API Key 的 `data.json` 分享给他人。
- **费用**：调用第三方模型 API 会产生费用，具体计费规则请查阅对应服务商。

## 开发

```bash
npm install
npm run dev      # 监听模式，改完自动 rebuild
npm run build    # 类型检查 + 生产构建，产出 main.js
```

在测试 vault 里软链插件目录便于热重载：

```bash
ln -s "$(pwd)" <vault>/.obsidian/plugins/obsidian-trae
```

## License

MIT
