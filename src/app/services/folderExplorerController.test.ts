import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkPathsExist } from '../../lib/desktop/tauriStorage';
import type { FileTreeNode } from '../types';
import { loadFolderChildren, loadFolderTree } from './documentFiles';
import { createFolderExplorerController } from './folderExplorerController';

vi.mock('../../lib/desktop/tauriStorage', () => ({
  checkPathsExist: vi.fn(),
}));

vi.mock('./documentFiles', () => ({
  loadFolderChildren: vi.fn(),
  loadFolderTree: vi.fn(),
  pickFolderPath: vi.fn(),
}));

describe('folderExplorerController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('载入工作区时只读取根目录，不启动递归索引', async () => {
    const state = createControllerState('D:\\Demo\\Workspace');
    vi.mocked(loadFolderTree).mockResolvedValue([
      file('readme.md', `${state.rootPath}\\readme.md`),
    ]);

    await state.controller.loadFolder(state.rootPath);

    expect(loadFolderTree).toHaveBeenCalledOnce();
    expect(loadFolderTree).toHaveBeenCalledWith(state.rootPath);
    expect(loadFolderChildren).not.toHaveBeenCalled();
    expect(state.folderTree).toHaveLength(1);
    expect(state.statusMessage).not.toMatch(/索引|index/i);
  });

  it.each(['/notes/readme.md', '/readme.md', 'C:\\readme.md', 'C:/readme.md'])(
    '自动显示文件所在目录并保留原生根路径：%s',
    async (path) => {
      const state = createControllerState('');
      vi.mocked(loadFolderTree).mockResolvedValue([file('readme.md', path)]);
      await state.controller.revealFile(path, true);
      const root =
        path === '/readme.md' ? '/' : path.startsWith('C:') ? path.slice(0, 3) : '/notes';
      expect(state.currentFolderPath).toBe(root);
      expect(loadFolderTree).toHaveBeenCalledWith(root);
      expect(state.folderTree[0].name).toBe('readme.md');
    },
  );

  it('关闭自动显示时不载入新目录，也不替换现有文件树', async () => {
    const state = createControllerState('/notes', [file('readme.md', '/notes/readme.md')]);
    await state.controller.revealFile('/other/readme.md', false);
    expect(state.currentFolderPath).toBe('/notes');
    expect(state.folderTree[0].path).toBe('/notes/readme.md');
    expect(loadFolderTree).not.toHaveBeenCalled();
    expect(loadFolderChildren).not.toHaveBeenCalled();
  });

  it('现有根目录包含文件时只展开其祖先，关闭自动显示仍可定位', async () => {
    const state = createControllerState('/notes', [
      folder({ name: 'project', path: '/notes/project', has_children: true }),
    ]);
    vi.mocked(loadFolderChildren).mockResolvedValue([
      file('readme.md', '/notes/project/readme.md'),
    ]);
    await state.controller.revealFile('/notes/project/readme.md', false);
    expect(state.currentFolderPath).toBe('/notes');
    expect(loadFolderTree).not.toHaveBeenCalled();
    expect(loadFolderChildren).toHaveBeenCalledWith('/notes/project', '/notes');
    expect(state.expandedFolders.has('/notes/project')).toBe(true);
    expect(state.folderTree[0].children[0].name).toBe('readme.md');
  });

  it('路径仅共享名称前缀时改用文件父目录', async () => {
    const state = createControllerState('/notes');
    vi.mocked(loadFolderTree).mockResolvedValue([]);
    await state.controller.revealFile('/notes-archive/project/readme.md', true);
    expect(state.currentFolderPath).toBe('/notes-archive/project');
    expect(loadFolderChildren).not.toHaveBeenCalled();
  });

  it('快速切换目录时忽略迟到的旧目录结果和错误', async () => {
    const state = createControllerState('');
    let resolveOld!: (value: Awaited<ReturnType<typeof loadFolderTree>>) => void;
    vi.mocked(loadFolderTree).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    const first = state.controller.revealFile('/old/readme.md', true);
    vi.mocked(loadFolderTree).mockResolvedValueOnce([file('new.md', '/new/new.md')]);
    await state.controller.revealFile('/new/new.md', true);
    const message = state.statusMessage;
    resolveOld({ tree: [], error: 'old request failed' });
    await first;
    expect(state.currentFolderPath).toBe('/new');
    expect(state.folderTree[0].name).toBe('new.md');
    expect(state.statusMessage).toBe(message);
  });

  it('旧目录后台刷新完成时不能覆盖新根目录', async () => {
    const state = createControllerState('/old');
    let resolveExists!: (value: boolean[]) => void;
    vi.mocked(checkPathsExist).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveExists = resolve;
        }),
    );
    const refreshing = state.controller.syncLoadedFolders();
    vi.mocked(loadFolderTree).mockResolvedValueOnce([file('new.md', '/new/new.md')]);
    await state.controller.revealFile('/new/new.md', true);
    resolveExists([false]);
    await refreshing;
    expect(state.currentFolderPath).toBe('/new');
    expect(state.folderTree[0].name).toBe('new.md');
  });

  it('销毁后失效仍在读取的目录结果', async () => {
    const state = createControllerState('');
    let resolveRoot!: (value: FileTreeNode[]) => void;
    vi.mocked(loadFolderTree).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRoot = resolve;
        }),
    );
    const opening = state.controller.revealFile('/notes/readme.md', true);
    state.controller.dispose();
    resolveRoot([file('readme.md', '/notes/readme.md')]);
    await opening;
    expect(state.folderTree).toEqual([]);
    expect(state.statusMessage).toBe('');
    await state.controller.revealFile('/other/readme.md', true);
    expect(loadFolderTree).toHaveBeenCalledOnce();
  });

  it('合并仍在执行的目录刷新，完成后允许下一次刷新', async () => {
    const state = createControllerState('D:\\Demo\\Workspace');
    let resolveExists!: (value: boolean[]) => void;
    vi.mocked(checkPathsExist).mockImplementationOnce(
      () => new Promise((resolve) => (resolveExists = resolve)),
    );
    vi.mocked(loadFolderChildren).mockResolvedValue([]);

    const first = state.controller.syncLoadedFolders();
    const overlapping = state.controller.syncLoadedFolders();

    expect(overlapping).toBe(first);
    expect(checkPathsExist).toHaveBeenCalledOnce();
    resolveExists([true]);
    await first;

    vi.mocked(checkPathsExist).mockResolvedValue([true]);
    await state.controller.syncLoadedFolders();
    expect(checkPathsExist).toHaveBeenCalledTimes(2);
  });

  it('刷新发现工作区根目录消失时清空工作区', async () => {
    const state = createControllerState('D:\\Demo\\Workspace', [
      file('readme.md', 'D:\\Demo\\Workspace\\readme.md'),
    ]);
    vi.mocked(checkPathsExist).mockResolvedValue([false, true]);

    await state.controller.syncLoadedFolders();

    expect(state.currentFolderPath).toBe('');
    expect(state.folderTree).toEqual([]);
    expect(state.expandedFolders.size).toBe(0);
    expect(loadFolderChildren).not.toHaveBeenCalled();
  });

  it('刷新已展开文件夹时只提交最终文件树，避免 UI 暴露中间空树', async () => {
    const rootPath = 'D:\\Demo\\Workspace';
    const docsPath = `${rootPath}\\docs`;
    const notesPath = `${docsPath}\\notes`;

    let folderTree: FileTreeNode[] = [
      folder({
        name: 'docs',
        path: docsPath,
        has_children: true,
        children_loaded: true,
        children: [
          folder({
            name: 'notes',
            path: notesPath,
            has_children: true,
            children_loaded: true,
            children: [file('old.md', `${notesPath}\\old.md`)],
          }),
        ],
      }),
    ];
    let expandedFolders = new Set([docsPath, notesPath]);

    const setFolderTree = vi.fn((value: FileTreeNode[]) => {
      folderTree = value;
    });
    const setExpandedFolders = vi.fn((value: Set<string>) => {
      expandedFolders = value;
    });
    const controller = createFolderExplorerController({
      getDesktopEnabled: () => true,
      getFolderTree: () => folderTree,
      setFolderTree,
      getExpandedFolders: () => expandedFolders,
      setExpandedFolders,
      getRootFolderExpanded: () => true,
      setRootFolderExpanded: vi.fn(),
      getCurrentFolderPath: () => rootPath,
      setCurrentFolderPath: vi.fn(),
      setStatusMessage: vi.fn(),
    });

    vi.mocked(checkPathsExist).mockImplementation(async (paths) => paths.map(() => true));
    vi.mocked(loadFolderChildren).mockImplementation(async (path) => {
      if (path === rootPath) {
        return [
          folder({
            name: 'docs',
            path: docsPath,
            has_children: true,
            children_loaded: false,
            children: [],
          }),
          file('readme.md', `${rootPath}\\readme.md`),
        ];
      }
      if (path === docsPath) {
        return [
          folder({
            name: 'notes',
            path: notesPath,
            has_children: true,
            children_loaded: false,
            children: [],
          }),
          file('fresh.md', `${docsPath}\\fresh.md`),
        ];
      }
      if (path === notesPath) {
        return [file('nested.md', `${notesPath}\\nested.md`)];
      }
      return [];
    });

    await controller.syncLoadedFolders();

    expect(setFolderTree).toHaveBeenCalledTimes(1);
    expect(setExpandedFolders).not.toHaveBeenCalled();
    expect(loadFolderChildren).toHaveBeenCalledWith(rootPath, rootPath);
    expect(loadFolderChildren).toHaveBeenCalledWith(docsPath, rootPath);
    expect(loadFolderChildren).toHaveBeenCalledWith(notesPath, rootPath);
    const normalizedRootPath = rootPath.replace(/\\/g, '/');
    const normalizedDocsPath = docsPath.replace(/\\/g, '/');
    const normalizedNotesPath = notesPath.replace(/\\/g, '/');
    expect(folderTree).toEqual([
      folder({
        name: 'docs',
        path: normalizedDocsPath,
        has_children: true,
        children_loaded: true,
        children: [
          folder({
            name: 'notes',
            path: normalizedNotesPath,
            has_children: true,
            children_loaded: true,
            children: [file('nested.md', `${normalizedNotesPath}/nested.md`)],
          }),
          file('fresh.md', `${normalizedDocsPath}/fresh.md`),
        ],
      }),
      file('readme.md', `${normalizedRootPath}/readme.md`),
    ]);
  });
});

function createControllerState(rootPath: string, initialTree: FileTreeNode[] = []) {
  let folderTree = initialTree;
  let expandedFolders = new Set<string>();
  let currentFolderPath = rootPath;
  let rootFolderExpanded = true;
  let statusMessage = '';

  const controller = createFolderExplorerController({
    getDesktopEnabled: () => true,
    getFolderTree: () => folderTree,
    setFolderTree: (value) => (folderTree = value),
    getExpandedFolders: () => expandedFolders,
    setExpandedFolders: (value) => (expandedFolders = value),
    getRootFolderExpanded: () => rootFolderExpanded,
    setRootFolderExpanded: (value) => (rootFolderExpanded = value),
    getCurrentFolderPath: () => currentFolderPath,
    setCurrentFolderPath: (value) => (currentFolderPath = value),
    setStatusMessage: (value) => (statusMessage = value),
  });

  return {
    controller,
    rootPath,
    get folderTree() {
      return folderTree;
    },
    get expandedFolders() {
      return expandedFolders;
    },
    get currentFolderPath() {
      return currentFolderPath;
    },
    get statusMessage() {
      return statusMessage;
    },
  };
}

function folder(overrides: Partial<FileTreeNode>): FileTreeNode {
  return {
    name: 'folder',
    path: 'D:\\Demo\\Workspace\\folder',
    is_dir: true,
    has_children: false,
    children_loaded: false,
    loading: false,
    children: [],
    ...overrides,
  };
}

function file(name: string, path: string): FileTreeNode {
  return {
    name,
    path,
    is_dir: false,
    has_children: false,
    children_loaded: true,
    loading: false,
    children: [],
  };
}
