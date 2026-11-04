import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import claude from '@/assets/mcp/claude.svg'
import chatgpt from '@/assets/mcp/chatgpt.svg'
import gemini from '@/assets/mcp/gemini.svg'
import perplexity from '@/assets/mcp/perplexity.svg'
import cursor from '@/assets/mcp/cursor.svg'
import './mcp.css'

const COMMAND = 'npx @appcharge/wizard mcp add'

const CLIENTS = [
  { name: 'Claude', icon: claude },
  { name: 'ChatGPT', icon: chatgpt },
  { name: 'Gemini', icon: gemini },
  { name: 'Perplexity', icon: perplexity },
  { name: 'Cursor', icon: cursor },
]

type McpDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function McpDialog({ open, onOpenChange }: McpDialogProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND)
    } catch {
      // Clipboard can be blocked (for example in an iframe); the command is still on screen.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mcp-dialog sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="mcp-title">Appcharge MCP</DialogTitle>
          <DialogDescription className="sr-only">Connect your AI assistant to Appcharge.</DialogDescription>
        </DialogHeader>

        <div className="mcp-body">
          <p>
            The Appcharge <strong>Model Context Protocol (MCP)</strong> server is a free, hosted endpoint that lets your
            AI assistant work with your store. With plain text questions it can draft a reward calendar, review a
            week&rsquo;s rewards, or compare chip amounts across weeks.
          </p>
          <p>It works with any MCP-compatible client, including Claude, ChatGPT, Gemini, Perplexity and Cursor.</p>

          <h3>Get started in 30 seconds</h3>
          <p>
            The fastest way to set up the MCP is the <strong>Appcharge Wizard</strong>, which installs the MCP server
            directly into Claude, ChatGPT, Gemini, Perplexity and Cursor:
          </p>

          <div className="mcp-card">
            <div className="mcp-card-main">
              <div className="mcp-card-head">
                <strong>Install the Appcharge MCP</strong>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Learn more
                </a>
              </div>
              <div className="mcp-command">
                <code>
                  <span className="tok-cmd">npx</span> <span className="tok-pkg">@appcharge/wizard</span>{' '}
                  <span className="tok-arg">mcp add</span>
                </code>
                <button type="button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy the install command'}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="mcp-supports">
                Supports Claude, ChatGPT, Gemini, Perplexity, and Cursor.
              </p>
            </div>
            <div className="mcp-clients">
              {CLIENTS.map((c) => (
                <img key={c.name} src={c.icon} alt={c.name} title={c.name} width={20} height={20} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
