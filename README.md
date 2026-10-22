<p align="center">
  <img src="./src-tauri/icons/128x128.png" alt="Nomo 图标" width="60">
</p>

<h1 align="center">Nomo</h1>

<p align="center">
  <a href="https://github.com/Xunzi229/nomo/releases/latest">
    <img src="https://img.shields.io/github/v/release/Xunzi229/nomo?label=release" alt="GitHub Release">
  </a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="支持 macOS、Windows 与 Linux">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-AGPL--3.0--or--later-blue" alt="AGPL-3.0-or-later">
  </a>
</p>

<p align="center">
  <a href="./README.md"><strong>简体中文</strong></a>
  ·
  <a href="./README.en.md">English</a>
</p>

<p align="center">
  <strong>一款本地优先的 Markdown 编辑器，让写作保持简单。</strong>
</p>

<p align="center">
  <img src="./assets/nomo-editor-zh.gif" alt="Nomo 中文写作演示" width="800">
</p>

## 下载与安装

从 [GitHub Releases](https://github.com/Xunzi229/nomo/releases/latest) 下载最新版本。

本仓库基于 [nomo-md/nomo](https://github.com/nomo-md/nomo) 维护，以上下载链接指向本仓库的构建。应用内更新仍检查上游发布，本仓库新版请手动下载安装包。

| 系统 | 要求 | 安装方式 |
| :--- | :--- | :--- |
| Windows | Windows 10 / 11，x64 | `.exe` 安装版 / `.zip` 免安装版 |
| macOS | macOS 12.0+，Apple Silicon | `.dmg` / Homebrew（上游版） |
| Linux | x64，GTK 3 / WebKitGTK 4.1 | `.deb` / `.rpm` |

如需安装上游版本，macOS 可使用 Homebrew：

```bash
brew tap nomo-md/nomo https://github.com/nomo-md/nomo
brew install --cask nomo
```

升级：`brew upgrade --cask nomo`。

首次打开可能出现 SmartScreen / Gatekeeper 提示，请从本项目 Releases 下载。

## 核心功能

- **Markdown 编辑**：即时预览、源码与双栏模式，输入 `/` 快速插入内容。
- **丰富内容**：支持表格、代码高亮、数学公式与 Mermaid 图表。
- **文件管理**：打开 Markdown 时自动展示所在目录，按需展开子目录、键入定位并高亮当前文档；支持多标签及 TXT / JSON 大文件分段编辑。
- **保存与恢复**：可启用自动保存和 Markdown 本地快照，恢复工作区与阅读位置。
- **舒适写作**：浅深色主题、[自定义配色主题与字体](docs/custom-themes.md)、可手动开启的精细排版，以及可置顶的 Markdown 小窗。
- **导出与预览**：导出 HTML / PDF / Word（.docx），Word 正文和表格可编辑，公式与图表转为图片；macOS 支持 Quick Look 快速预览。

### 浏览 Markdown 所在目录

打开 `.md` 或 `.markdown` 文件后，侧边栏默认以文件所在目录为根目录。单击文件预览，双击固定为标签；点击目录可展开或折叠。

- 文件树只展示 Markdown 文件和目录，过滤图片、TXT、JSON 等其他文件；TXT / JSON 仍可通过“打开文件”或拖放打开。
- 如果当前文件已包含在打开的目录内，会沿用现有文件树并展开其祖先目录；打开目录外的 Markdown 时会切换根目录，保留已有标签和未保存内容。
- 在 **偏好设置 → 文件与窗口 → 打开文件时自动显示所在目录** 中关闭自动载入；已打开目录内的文档仍可定位。
- 目录按需读取，保留 `.gitignore` 与内置忽略规则。

版本变化请查看[更新记录](https://github.com/Xunzi229/nomo/releases)。

## 开发

使用 Tauri 2 + Svelte 5 构建，需要 Node.js 22、pnpm 11.5.1 和 Rust / Cargo。

- Windows：Visual Studio 2022 Build Tools 或完整 Visual Studio。
- macOS：Xcode Command Line Tools；构建 Quick Look 扩展需要完整 Xcode。
- Linux：GTK 3、WebKitGTK 4.1、AppIndicator、librsvg 和 patchelf 等系统依赖；远程构建使用 Ubuntu 24.04。

```bash
pnpm install --frozen-lockfile
pnpm tauri dev
```

验证与打包：

```bash
pnpm check
pnpm build
pnpm exec vitest run <测试文件>

# macOS：应用、DMG 与 Quick Look 扩展
pnpm run build:macos

# Windows x64：NSIS 安装包
pnpm run build:win64:nsis

# Linux x64：DEB 与 RPM
bash scripts/build-linux.sh
```

安装包生成在 `src-tauri/target/release/bundle/`。推送与应用版本一致的 `vX.Y.Z` 标签会触发 [Release 工作流](.github/workflows/release.yml)，远程构建 Windows x64、macOS arm64 和 Linux x64 安装包，并发布 `checksums.md5` 校验清单。

若标签未自动触发，可手动运行 `gh workflow run release.yml --ref vX.Y.Z`；手动发布同样必须选择版本标签。

## 参与项目

欢迎提交 [Issue](https://github.com/nomo-md/nomo/issues) 或 [Pull Request](https://github.com/nomo-md/nomo/pulls)；反馈问题时请附系统版本、复现步骤与样例。

喜欢 Nomo，欢迎 [Star 项目](https://github.com/nomo-md/nomo) 或关注作者 [LIXianSenQwQ](https://github.com/LIXianSenQwQ)。社区：[linux.do](https://linux.do/)。

采用 [AGPL-3.0-or-later](./LICENSE) 许可证；商业授权请联系维护者，第三方组件遵循各自许可证。

感谢 Tauri、Svelte、ProseMirror、CodeMirror、markdown-it、Shiki、KaTeX、Mermaid 等开源项目。
