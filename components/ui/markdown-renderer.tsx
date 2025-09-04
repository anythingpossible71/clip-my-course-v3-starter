import { marked } from 'marked'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Configure marked options for security
  marked.setOptions({
    breaks: true,
    gfm: true,
    sanitize: false, // We trust our own markdown content
  })

  const html = marked(content)
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  )
}

