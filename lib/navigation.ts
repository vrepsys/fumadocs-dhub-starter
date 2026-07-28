import fs from 'node:fs';
import path from 'node:path';
import type * as PageTree from 'fumadocs-core/page-tree';
import { source } from './source';

/**
 * Builds the sidebar page tree from navigation.json in the project root.
 *
 * navigation.json is the single source of truth for the sidebar. Dhub
 * (https://dhub.dev) reads and writes this file, so you can rearrange
 * navigation visually without editing code. You can also edit it by hand.
 *
 * Node types:
 * - tab:     top-level container; with several tabs, each becomes a
 *            root folder rendered as Layout Tabs by Fumadocs UI
 * - page:    links to an MDX file; "path" is relative to the repo root
 * - folder:  collapsible group of nodes
 * - group:   non-collapsible group of nodes
 * - divider: separator line
 * - link:    external URL
 */

type NavNode =
  | { type: 'page'; label: string; path: string }
  | { type: 'link'; label: string; url: string }
  | { type: 'folder'; label: string; children?: NavNode[] }
  | { type: 'group'; label: string; children?: NavNode[] }
  | { type: 'divider' };

type NavTab = {
  type: 'tab';
  label: string;
  path?: string;
  children?: NavNode[];
};

const NAV_FILE = path.join(process.cwd(), 'navigation.json');

// content hash so client components re-memoize when navigation changes
const hash = (text: string): string => {
  let value = 5381;
  for (let i = 0; i < text.length; i++) {
    value = (value * 33) ^ text.charCodeAt(i);
  }
  return (value >>> 0).toString(36);
};

const stripExtension = (filePath: string): string =>
  filePath.replace(/\.(mdx?)$/, '');

const stripPrefix = (filePath: string, prefix?: string): string => {
  if (prefix && filePath.startsWith(prefix + '/')) {
    return filePath.slice(prefix.length + 1);
  }
  return filePath;
};

// Map from content-relative file path (without extension) to page URL,
// so URLs always match what the loader generates
const buildUrlMap = (): Map<string, string> => {
  const urls = new Map<string, string>();
  for (const page of source.getPages()) {
    const filePath: string | undefined =
      (page as { path?: string }).path ??
      (page as { file?: { path?: string } }).file?.path;
    if (filePath) {
      urls.set(stripExtension(filePath), page.url);
    }
  }
  return urls;
};

const convertNode = (
  node: NavNode,
  tabPath: string | undefined,
  urls: Map<string, string>
): PageTree.Node | null => {
  switch (node.type) {
    case 'page': {
      const contentPath = stripExtension(stripPrefix(node.path, tabPath));
      const url = urls.get(contentPath);
      if (!url) {
        console.warn(`[navigation] page not found for path: ${node.path}`);
        return null;
      }
      return { type: 'page', name: node.label, url };
    }

    case 'link':
      return { type: 'page', name: node.label, url: node.url, external: true };

    case 'folder':
      return {
        type: 'folder',
        name: node.label,
        children: convertChildren(node.children, tabPath, urls),
      };

    case 'group':
      return {
        type: 'folder',
        name: node.label,
        collapsible: false,
        children: convertChildren(node.children, tabPath, urls),
      };

    case 'divider':
      return { type: 'separator' };

    default:
      return null;
  }
};

const convertChildren = (
  children: NavNode[] | undefined,
  tabPath: string | undefined,
  urls: Map<string, string>
): PageTree.Node[] =>
  (children ?? [])
    .map((child) => convertNode(child, tabPath, urls))
    .filter((node): node is PageTree.Node => node !== null);

const firstPage = (nodes: PageTree.Node[]): PageTree.Item | undefined => {
  for (const node of nodes) {
    if (node.type === 'page' && !node.external) return node;
    if (node.type === 'folder') {
      const found = firstPage(node.children);
      if (found) return found;
    }
  }
  return undefined;
};

export function getNavigationTree(): PageTree.Root {
  const content = fs.readFileSync(NAV_FILE, 'utf-8');
  const tabs = JSON.parse(content) as NavTab[];
  const urls = buildUrlMap();
  const $id = `navigation-${hash(content)}`;

  // A single tab renders as a plain sidebar; multiple tabs become
  // root folders, which Fumadocs UI renders as Layout Tabs
  if (tabs.length === 1) {
    return {
      $id,
      name: tabs[0].label,
      children: convertChildren(tabs[0].children, tabs[0].path, urls),
    };
  }

  return {
    $id,
    name: 'docs',
    children: tabs.map((tab): PageTree.Folder => {
      const children = convertChildren(tab.children, tab.path, urls);
      return {
        type: 'folder',
        name: tab.label,
        root: true,
        index: firstPage(children),
        children,
      };
    }),
  };
}
