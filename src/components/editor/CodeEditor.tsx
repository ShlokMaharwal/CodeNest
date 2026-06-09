'use client'
import { useEffect, useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { Lock } from 'lucide-react'
import { codeNestDarkTheme } from '@/styles/monaco-codenest-dark'
import { codeNestLightTheme } from '@/styles/monaco-codenest-light'



interface CodeEditorProps {
  code: string
  language: string
  onChange?: (code: string) => void
  readOnly?: boolean
  locked?: boolean
  lockedMessage?: string
}

export function CodeEditor({
  code, language, onChange,
  readOnly = false, locked = false,
  lockedMessage = '🔒 Editor locked by interviewer',
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    
    monaco.editor.defineTheme('codenest-dark', codeNestDarkTheme as any)
    monaco.editor.defineTheme('codenest-light', codeNestLightTheme as any)
    monaco.editor.setTheme(resolvedTheme === 'dark' ? 'codenest-dark' : 'codenest-light')
  }

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel()
      if (model && model.getValue() !== code) {
        const pos = editorRef.current.getPosition()
        model.setValue(code)
        if (pos) editorRef.current.setPosition(pos)
      }
    }
  }, [code])

  
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(resolvedTheme === 'dark' ? 'codenest-dark' : 'codenest-light')
    }
  }, [resolvedTheme])

  const isReadOnly = readOnly || locked

  return (
    <div className="relative h-full w-full">
      {}
      <a href="#editor-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 bg-accent text-[#1a2a0e] px-3 py-1 rounded text-xs">
        Skip to code editor
      </a>
      <div id="editor-content" className="h-full">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          theme={resolvedTheme === 'dark' ? 'codenest-dark' : 'codenest-light'}
          onMount={handleMount}
          onChange={value => {
            if (!isReadOnly && onChange) onChange(value || '')
          }}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 14,
            fontLigatures: true,
            lineHeight: 1.6,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'gutter',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: { enabled: true },
            guides: { indentation: true, bracketPairs: true },
            automaticLayout: true,
            readOnly: isReadOnly,
            domReadOnly: isReadOnly,
            contextmenu: !isReadOnly,
          }}
        />
      </div>

      {}
      {locked && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-6">
          <div className="flex items-center gap-2 bg-bg/95 backdrop-blur border border-warning/30 text-warning rounded-full px-4 py-2 text-xs shadow-lg animate-fade-in">
            <Lock size={12} />
            <span>{lockedMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
