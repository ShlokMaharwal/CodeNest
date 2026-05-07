'use client'
import { useRef, useCallback, useEffect } from 'react'
import Editor, { OnMount, OnChange } from '@monaco-editor/react'
import { useTheme } from 'next-themes'

interface CodeEditorProps {
  code: string
  language: string
  onChange: (code: string) => void
}

const MONACO_LANG: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rust',
}

export function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(resolvedTheme === 'dark' ? 'codepulse-dark' : 'codepulse-light')
    }
  }, [resolvedTheme])

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco


    monaco.editor.defineTheme('codepulse-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fb923c' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'function', foreground: 'fbbf24' },
      ],
      colors: {
        'editor.background': '#12121a',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#374151',
        'editorLineNumber.activeForeground': '#6366f1',
        'editor.selectionBackground': '#6366f130',
        'editor.lineHighlightBackground': '#1e1e2e',
        'editorCursor.foreground': '#6366f1',
        'editor.inactiveSelectionBackground': '#6366f115',
        'scrollbarSlider.background': '#2d2d3d',
        'scrollbarSlider.hoverBackground': '#6366f140',
        'editorWidget.background': '#12121a',
        'editorWidget.border': '#1e1e2e',
        'input.background': '#0a0a0f',
        'input.border': '#1e1e2e',
        'focusBorder': '#6366f1',
      },
    })

    monaco.editor.defineTheme('codepulse-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '4f46e5' },
        { token: 'string', foreground: '16a34a' },
        { token: 'number', foreground: 'ca8a04' },
        { token: 'type', foreground: '0284c7' },
        { token: 'function', foreground: 'd97706' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#4f46e5',
        'editor.selectionBackground': '#4f46e530',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorCursor.foreground': '#4f46e5',
        'editor.inactiveSelectionBackground': '#4f46e515',
        'scrollbarSlider.background': '#e2e8f0',
        'scrollbarSlider.hoverBackground': '#cbd5e1',
        'editorWidget.background': '#ffffff',
        'editorWidget.border': '#e2e8f0',
        'input.background': '#f8fafc',
        'input.border': '#e2e8f0',
        'focusBorder': '#4f46e5',
      },
    })
    
    monaco.editor.setTheme('codepulse-light')


    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      window.dispatchEvent(new CustomEvent('run-code'))
    })


    editor.focus()
  }, [])

  const handleChange: OnChange = useCallback((value) => {
    onChange(value || '')
  }, [onChange])

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={MONACO_LANG[language] || 'javascript'}
        value={code}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          suggest: { showIcons: true },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
        loading={
          <div className="h-full bg-surface flex items-center justify-center">
            <span className="text-muted text-sm font-mono animate-pulse">Loading editor...</span>
          </div>
        }
      />
    </div>
  )
}
