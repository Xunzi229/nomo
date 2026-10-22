<p align="center">
  <img src="./src-tauri/icons/128x128.png" alt="Nomo icon" width="60">
</p>

<h1 align="center">Nomo</h1>

<p align="center">
  <a href="https://github.com/Xunzi229/nomo/releases/latest">
    <img src="https://img.shields.io/github/v/release/Xunzi229/nomo?label=release" alt="GitHub Release">
  </a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Available for macOS, Windows and Linux">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-AGPL--3.0--or--later-blue" alt="AGPL-3.0-or-later">
  </a>
</p>

<p align="center">
  <a href="./README.md">简体中文</a>
  ·
  <a href="./README.en.md"><strong>English</strong></a>
</p>

<p align="center">
  <strong>A local-first Markdown editor that keeps writing simple.</strong>
</p>

<p align="center">
  <img src="./assets/nomo-editor-en.gif" alt="Nomo writing demo in English" width="800">
</p>

## Download and Install

Get the latest version from [GitHub Releases](https://github.com/Xunzi229/nomo/releases/latest).

This repository is a fork of [nomo-md/nomo](https://github.com/nomo-md/nomo). The download link above provides builds from this fork. In-app updates still check upstream releases; download updates for this fork manually.

| Platform | Requirements | Installation |
| :--- | :--- | :--- |
| Windows | Windows 10 / 11, x64 | `.exe` installer / `.zip` portable |
| macOS | macOS 12.0+, Apple Silicon | `.dmg` / Homebrew (upstream) |
| Linux | x64, GTK 3 / WebKitGTK 4.1 | `.deb` / `.rpm` |

To install the upstream version on macOS, use Homebrew:

```bash
brew tap nomo-md/nomo https://github.com/nomo-md/nomo
brew install --cask nomo
```

Upgrade with `brew upgrade --cask nomo`.

SmartScreen or Gatekeeper may prompt on first launch; download from this project's Releases.

## Features

- **Markdown editing**: Live preview, source and split modes, with `/` for quick insertion.
- **Rich content**: Tables, syntax highlighting, math formulas and Mermaid diagrams.
- **File management**: Automatically browse the directory of an opened Markdown file, expand subdirectories on demand, type to locate files and highlight the current document; work in multiple tabs and edit large TXT / JSON files in segments.
- **Save and restore**: Optional autosave and local Markdown snapshots, plus workspace and reading position restoration.
- **Comfortable writing**: Light and dark themes, [custom color themes and fonts](docs/custom-themes.md) (guide in Chinese), optional fine typography and an always-on-top Markdown mini window.
- **Export and preview**: Export HTML / PDF / Word (.docx), with editable Word text and tables, formulas and diagrams as images, and Quick Look previews on macOS.

### Browse the Markdown file’s directory

Opening an `.md` or `.markdown` file shows its parent directory in the sidebar by default. Click a file to preview it, double-click to pin its tab, and click a directory to expand or collapse it.

- The tree shows only Markdown files and directories, filtering out images, TXT, JSON and other files. TXT / JSON files can still be opened through Open File or drag and drop.
- If the current directory already contains the file, Nomo keeps that tree and expands the file’s ancestors. Opening Markdown outside the tree changes its root while preserving existing tabs and unsaved changes.
- Disable automatic loading in **Preferences → Files and windows → Automatically show the file’s directory**. Documents within an existing tree can still be located.
- Directories load on demand and respect `.gitignore` and built-in ignore rules.

See [release notes](https://github.com/Xunzi229/nomo/releases) for version changes.

## Development

Built with Tauri 2 + Svelte 5. Requires Node.js 22, pnpm 11.5.1 and Rust / Cargo.

- Windows: Visual Studio 2022 Build Tools or the full Visual Studio.
- macOS: Xcode Command Line Tools; building the Quick Look extension requires the full Xcode.
- Linux: GTK 3, WebKitGTK 4.1, AppIndicator, librsvg, patchelf and related system dependencies. Remote builds use Ubuntu 24.04.

```bash
pnpm install --frozen-lockfile
pnpm tauri dev
```

Validate and package:

```bash
pnpm check
pnpm build
pnpm exec vitest run <test-file>

# macOS app, DMG and Quick Look extension
pnpm run build:macos

# Windows x64 NSIS installer
pnpm run build:win64:nsis

# Linux x64 DEB and RPM packages
bash scripts/build-linux.sh
```

Packages are written to `src-tauri/target/release/bundle/`. Pushing a `vX.Y.Z` tag that matches the app version triggers the [Release workflow](.github/workflows/release.yml), which builds Windows x64, macOS arm64 and Linux x64 packages remotely and publishes a `checksums.md5` manifest.

If the tag does not trigger a run automatically, use `gh workflow run release.yml --ref vX.Y.Z`. Manual releases must also select a version tag.

## Get Involved

[Issues](https://github.com/nomo-md/nomo/issues) and [pull requests](https://github.com/nomo-md/nomo/pulls) are welcome; include your OS version, steps to reproduce and a sample when reporting a bug.

Enjoy Nomo? [Star the project](https://github.com/nomo-md/nomo) or follow [LIXianSenQwQ](https://github.com/LIXianSenQwQ). Community: [linux.do](https://linux.do/).

Licensed under [AGPL-3.0-or-later](./LICENSE); contact the maintainers for separate commercial licensing. Third-party components retain their own licenses.

Thanks to Tauri, Svelte, ProseMirror, CodeMirror, markdown-it, Shiki, KaTeX, Mermaid and other open-source projects.
