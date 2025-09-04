import { readFileSync } from 'fs'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DMCAPage() {
  // Read markdown file at build time
  const markdown = readFileSync('./legal/dmca-policy.md', 'utf-8')
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
        
        <MarkdownRenderer 
          content={markdown}
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
        />
      </div>
    </div>
  )
}

