import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark-dimmed.css';
import {
  BoldIcon, ItalicIcon, StrikethroughIcon,
  Heading1Icon, Heading2Icon, Heading3Icon,
  ListIcon, ListOrderedIcon, CheckSquareIcon,
  CodeIcon, BracesIcon, QuoteIcon, LinkIcon, ImageIcon,
  MinusIcon, TableIcon,
  EditIcon, SplitIcon, EyeIcon,
  TypeIcon, ALargeSmallIcon,
} from './Icons';
import './MarkdownEditor.css';

// Configure marked with highlight.js
marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(text, { language }).value;
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

type EditorMode = 'edit' | 'preview' | 'split';

//Default system font for different devices
function getSystemFontStack() {
  if (typeof navigator === 'undefined') {
    return `"IBM Plex Sans", system-ui, sans-serif`;
  }

  const platform = navigator.platform || '';
  const userAgent = navigator.userAgent || '';
  const isApple = /Mac|iPhone|iPad|iPod/.test(platform + ' ' + userAgent);

  return isApple
    ? `-apple-system, BlinkMacSystemFont, sans-serif`
    : `"IBM Plex Sans", system-ui, sans-serif`;
}

// Available fonts for the editor
const FONT_OPTIONS = [
  {
    label: 'System',
    value: getSystemFontStack(),
  },
  {
    label: 'Serif',
    value: "'Playfair Display', Georgia, 'Times New Roman', serif",
  },
  {
    label: 'Mono',
    value: "'SF Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
  },
  {
    label: 'Inter',
    value: "'Inter', system-ui, sans-serif",
  },
  {
    label: 'Georgia',
    value: "Georgia, 'Times New Roman', serif",
  },
];

const FONT_SIZE_OPTIONS = [
  { label: '12px', value: '12px' },
  { label: '13px', value: '13px' },
  { label: '14px', value: '14px' },
  { label: '15px', value: '15px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
];

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  fileName?: string;
}

// Simple syntax "tinting" for the overlay
function highlightMarkdown(text: string): string {
  return text
    .replace(/(```[\s\S]*?```)/g, '<span class="md-codeblock">$1</span>')
    .replace(/^(#{1,6}\s.*)$/gm, '<span class="md-h">$1</span>')
    .replace(/(\*\*[^*]+\*\*)/g, '<span class="md-bold">$1</span>')
    .replace(/(__[^_]+__)/g, '<span class="md-bold">$1</span>')
    .replace(/(\*[^*]+\*)/g, '<span class="md-italic">$1</span>')
    .replace(/(\_[^_]+\_)/g, '<span class="md-italic">$1</span>')
    .replace(/(`[^`]+`)/g, '<span class="md-code">$1</span>')
    .replace(/(\[[^\]]*\]\([^)]*\))/g, '<span class="md-link">$1</span>')
    .replace(/(!\[[^\]]*\]\([^)]*\))/g, '<span class="md-img">$1</span>')
    .replace(/^(>\s.*)$/gm, '<span class="md-blockquote">$1</span>')
    .replace(/^(\s*[-*+]\s)/gm, '<span class="md-list">$1</span>')
    .replace(/^(\s*\d+\.\s)/gm, '<span class="md-list">$1</span>')
    .replace(/^(---+|___+|\*\*\*+)$/gm, '<span class="md-hr">$1</span>')
    .replace(/^(\|[\s:|-]+\|)$/gm, '<span class="md-table-sep">$1</span>');
}

const SAMPLE_CONTENT = `# Welcome to vCHITR Notes

A beautiful, minimal notepad for all your thoughts.

## Getting Started

This editor supports **full Markdown** with *live preview*. Try toggling between **Edit**, **Preview**, and **Split** modes using the buttons above.

### Features

- **Bold** text with \`Ctrl+B\`
- *Italic* text with \`Ctrl+I\`
- [Links](https://example.com) with \`Ctrl+K\`
- Inline \`code\` snippets
- And much more...

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}! Welcome to vCHITR.\`;
}

console.log(greet("World"));
\`\`\`

### A Quick Table

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Syntax Highlighting | ✅ |
| Live Preview | ✅ |
| Dark Mode | ✅ |

> "The best way to predict the future is to create it."
> — Peter Drucker

---

*Start writing your notes below...*
`;

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ content, onChange, fileName }) => {
  const [mode, setMode] = useState<EditorMode>('split');
  const [editorFont, setEditorFont] = useState(getSystemFontStack());
  const [editorFontSize, setEditorFontSize] = useState('14px');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const effectiveContent = content || SAMPLE_CONTENT;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setShowFontMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) setShowSizeMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Sync scroll
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = textarea.scrollTop;
      overlayRef.current.scrollLeft = textarea.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textarea.scrollTop;
    }
  }, []);

  const stats = useMemo(() => {
    const lines = effectiveContent.split('\n').length;
    const words = effectiveContent.trim() ? effectiveContent.trim().split(/\s+/).length : 0;
    const chars = effectiveContent.length;
    return { lines, words, chars };
  }, [effectiveContent]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: stats.lines }, (_, i) => i + 1);
  }, [stats.lines]);

  const renderedHtml = useMemo(() => {
    try {
      return marked(effectiveContent) as string;
    } catch {
      return '<p>Error rendering markdown</p>';
    }
  }, [effectiveContent]);

  const highlightedContent = useMemo(() => {
    return highlightMarkdown(
      effectiveContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    );
  }, [effectiveContent]);

  // ===== Text manipulation helpers =====
  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = effectiveContent;
      const selectedText = text.substring(start, end);
      const beforeText = text.substring(Math.max(0, start - before.length), start);
      const afterText = text.substring(end, end + after.length);
      if (beforeText === before && afterText === after) {
        const newContent = text.substring(0, start - before.length) + selectedText + text.substring(end + after.length);
        onChange(newContent);
        setTimeout(() => { textarea.selectionStart = start - before.length; textarea.selectionEnd = end - before.length; textarea.focus(); }, 0);
        return;
      }
      const newContent = text.substring(0, start) + before + selectedText + after + text.substring(end);
      onChange(newContent);
      setTimeout(() => { textarea.selectionStart = start + before.length; textarea.selectionEnd = end + before.length; textarea.focus(); }, 0);
    },
    [effectiveContent, onChange]
  );

  const insertAtCursor = useCallback(
    (insertion: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = effectiveContent.substring(0, start) + insertion + effectiveContent.substring(end);
      onChange(newContent);
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + insertion.length; textarea.focus(); }, 0);
    },
    [effectiveContent, onChange]
  );

  const prependLine = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const lineStart = effectiveContent.lastIndexOf('\n', start - 1) + 1;
      const newContent = effectiveContent.substring(0, lineStart) + prefix + effectiveContent.substring(lineStart);
      onChange(newContent);
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + prefix.length; textarea.focus(); }, 0);
    },
    [effectiveContent, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key === 'b') { e.preventDefault(); wrapSelection('**', '**'); }
      else if (isCtrl && e.key === 'i') { e.preventDefault(); wrapSelection('*', '*'); }
      else if (isCtrl && e.key === 'k') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const selected = effectiveContent.substring(textarea.selectionStart, textarea.selectionEnd);
          if (selected) wrapSelection('[', '](url)');
          else insertAtCursor('[link text](url)');
        }
      }
      else if (isCtrl && e.key === '`') { e.preventDefault(); wrapSelection('`', '`'); }
      else if (isCtrl && e.shiftKey && e.key === 'K') { e.preventDefault(); insertAtCursor('\n```\n\n```\n'); }
      else if (e.key === 'Tab') { e.preventDefault(); insertAtCursor('  '); }
    },
    [wrapSelection, insertAtCursor, effectiveContent]
  );

  useEffect(() => {
    if (!content && onChange) onChange(SAMPLE_CONTENT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showEditor = mode === 'edit' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';

  // Editor custom styles
  const editorStyle: React.CSSProperties = { fontFamily: editorFont, fontSize: editorFontSize };

  return (
    <div className="md-editor">
      {/* Toolbar */}
      <div className="md-toolbar">
        <div className="md-toolbar-group">
          <button onClick={() => wrapSelection('**', '**')} title="Bold (Ctrl+B)">{BoldIcon({ size: 16 })}</button>
          <button onClick={() => wrapSelection('*', '*')} title="Italic (Ctrl+I)">{ItalicIcon({ size: 16 })}</button>
          <button onClick={() => wrapSelection('~~', '~~')} title="Strikethrough">{StrikethroughIcon({ size: 16 })}</button>
        </div>

        <div className="md-toolbar-divider" />

        <div className="md-toolbar-group">
          <button onClick={() => prependLine('# ')} title="Heading 1">{Heading1Icon({ size: 16 })}</button>
          <button onClick={() => prependLine('## ')} title="Heading 2">{Heading2Icon({ size: 16 })}</button>
          <button onClick={() => prependLine('### ')} title="Heading 3">{Heading3Icon({ size: 16 })}</button>
        </div>

        <div className="md-toolbar-divider" />

        <div className="md-toolbar-group">
          <button onClick={() => prependLine('- ')} title="Unordered List">{ListIcon({ size: 16 })}</button>
          <button onClick={() => prependLine('1. ')} title="Ordered List">{ListOrderedIcon({ size: 16 })}</button>
          <button onClick={() => prependLine('- [ ] ')} title="Task List">{CheckSquareIcon({ size: 16 })}</button>
        </div>

        <div className="md-toolbar-divider" />

        <div className="md-toolbar-group">
          <button onClick={() => wrapSelection('`', '`')} title="Inline Code">{CodeIcon({ size: 16 })}</button>
          <button onClick={() => insertAtCursor('\n```\n\n```\n')} title="Code Block">{BracesIcon({ size: 16 })}</button>
          <button onClick={() => prependLine('> ')} title="Blockquote">{QuoteIcon({ size: 16 })}</button>
          <button
            onClick={() => {
              const textarea = textareaRef.current;
              if (textarea) {
                const selected = effectiveContent.substring(textarea.selectionStart, textarea.selectionEnd);
                if (selected) wrapSelection('[', '](url)');
                else insertAtCursor('[link text](url)');
              }
            }}
            title="Link (Ctrl+K)"
          >{LinkIcon({ size: 16 })}</button>
          <button onClick={() => insertAtCursor('![alt text](image-url)')} title="Image">{ImageIcon({ size: 16 })}</button>
        </div>

        <div className="md-toolbar-divider" />

        <div className="md-toolbar-group">
          <button onClick={() => insertAtCursor('\n---\n')} title="Horizontal Rule">{MinusIcon({ size: 16 })}</button>
          <button
            onClick={() => insertAtCursor('\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n')}
            title="Table"
          >{TableIcon({ size: 16 })}</button>
        </div>

        <div className="md-toolbar-divider" />

        {/* Font selector */}
        <div className="md-toolbar-group">
          <div className="md-dropdown" ref={fontMenuRef}>
            <button
              onClick={() => { setShowFontMenu(!showFontMenu); setShowSizeMenu(false); }}
              title="Change Font"
              className={showFontMenu ? 'active' : ''}
            >
              {TypeIcon({ size: 16 })}
            </button>
            {showFontMenu && (
              <div className="md-dropdown-menu">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.label}
                    className={`md-dropdown-item ${editorFont === f.value ? 'selected' : ''}`}
                    style={{ fontFamily: f.value }}
                    onClick={() => { setEditorFont(f.value); setShowFontMenu(false); }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font size selector */}
          <div className="md-dropdown" ref={sizeMenuRef}>
            <button
              onClick={() => { setShowSizeMenu(!showSizeMenu); setShowFontMenu(false); }}
              title="Change Font Size"
              className={showSizeMenu ? 'active' : ''}
            >
              {ALargeSmallIcon({ size: 16 })}
            </button>
            {showSizeMenu && (
              <div className="md-dropdown-menu">
                {FONT_SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    className={`md-dropdown-item ${editorFontSize === s.value ? 'selected' : ''}`}
                    onClick={() => { setEditorFontSize(s.value); setShowSizeMenu(false); }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="md-mode-toggle">
          <button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')} title="Edit mode">
            {EditIcon({ size: 14 })} <span>Edit</span>
          </button>
          <button className={mode === 'split' ? 'active' : ''} onClick={() => setMode('split')} title="Split mode">
            {SplitIcon({ size: 14 })} <span>Split</span>
          </button>
          <button className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')} title="Preview mode">
            {EyeIcon({ size: 14 })} <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="md-body">
        {showEditor && (
          <div className="md-edit-pane">
            <div className="md-line-numbers" ref={lineNumbersRef} style={editorStyle}>
              {lineNumbers.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>
            <div className="md-editor-wrapper">
              <div
                ref={overlayRef}
                className="md-highlight-overlay"
                style={editorStyle}
                dangerouslySetInnerHTML={{ __html: highlightedContent + '\n' }}
              />
              <textarea
                ref={textareaRef}
                className="md-textarea"
                style={editorStyle}
                value={effectiveContent}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                placeholder="Start writing your notes in Markdown..."
                spellCheck={false}
                id="md-editor-textarea"
              />
            </div>
          </div>
        )}
        {showEditor && showPreview && <div className="md-split-divider" />}
        {showPreview && (
          <div className="md-preview-pane" ref={previewRef}>
            <div
              className="md-preview-content"
              style={{ fontFamily: editorFont, fontSize: editorFontSize }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="md-status-bar">
        <div className="md-status-left">
          <span>Ln {stats.lines}</span>
          <span>{stats.words} word{stats.words !== 1 ? 's' : ''}</span>
          <span>{stats.chars} char{stats.chars !== 1 ? 's' : ''}</span>
          {fileName && <span>· {fileName}</span>}
        </div>
        <div className="md-status-right">
          <div className="md-shortcut-hint">
            <kbd>⌘B</kbd> Bold
            <kbd>⌘I</kbd> Italic
            <kbd>⌘K</kbd> Link
          </div>
          <span>Markdown</span>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
