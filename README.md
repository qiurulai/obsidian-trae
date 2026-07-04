# Obsidian Trae

在 Obsidian 内通过 Trae Work 的 AI 整理公众号等链接文章，并保存为 Markdown 笔记。**以手机端为主要使用对象**：在公众号 App 复制链接 → 切到 Obsidian → 点图标 → 一键保存。

## 特性

- 移动端优先，桌面/移动通吃（`isDesktopOnly: false`）。
- 粘贴链接 → 内置 Readability 抓正文 → Trae 整理为结构化 Markdown → 写入 vault。
- 抓取失败时回退到让 Trae 智能体读取链接。
- 打开添加窗口时自动用剪贴板里的链接预填（可在设置关闭）。
- 自动收集 `# 标签`写入 frontmatter，记录来源 URL、抓取时间。
- 所有网络请求走 Obsidian 内置 `requestUrl`，绕过 CORS。

## 工作流

1. 在公众号（或其他网页）点"复制链接"。
2. 切到 Obsidian，点左侧 ribbon 的链接图标（或命令面板执行 `Trae: 从链接添加文章`）。
3. 弹窗里链接已自动填入（若剪贴板里是链接），可加附加标签。
4. 点"保存"：插件抓取正文 → 调 Trae 整理 → 生成笔记并打开。

## 安装

### 从源码构建

```bash
git clone https://github.com/<your-username>/obsidian-trae.git
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

## 配置 Trae 账号

在设置 → Obsidian Trae 中填写：

- **PAT（个人访问令牌）**：登录 Trae Work 后在 Trae 控制台 / CLI（`trae auth`）获取的个人访问令牌。仅保存在本地 `data.json`，不会上传。
- **Trae Base URL**：Trae 推理端点地址（OpenAI 兼容）。插件会自动拼接 `/v1/chat/completions`。
- **模型**：如 `GLM-5.1`、`Doubao-Seed-2.0-Code`、`DeepSeek-V3.2` 等。
- 点"测试连接"验证。

## 风险与限制

- **端点稳定性**：Trae 的 raw-chat / OpenAI 兼容端点并非官方对外公开 API，可能随版本变化。若连接失败，请先在设置中确认并更新 Base URL 与 PAT。
- **公众号反爬**：部分公众号文章需要登录或有反爬措施，内置 Readability 可能抓不到正文，此时会回退到让 Trae 智能体读取链接（成功率取决于 Trae 当时是否可访问该 URL）。
- **PAT 安全**：PAT 存于本地 `data.json`，本仓库 `.gitignore` 已忽略该文件，请勿提交。不要把含 PAT 的 `data.json` 分享给他人。

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
