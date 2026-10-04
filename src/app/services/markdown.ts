import { marked } from 'marked';

/**
 * 將 Markdown 轉成 HTML 字串。
 * 輸出一律經由 Angular 的 [innerHTML] 綁定，由內建 sanitizer 移除 script、事件屬性與 javascript: 連結。
 */
export function renderMarkdown(source: string): string {
  return marked.parse(source ?? '', { async: false, gfm: true, breaks: true });
}
