import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

// A screen that fails to draw should never leave a blank page. This shows what happened and
// two ways out: reload, or clear what this browser saved (a bad saved calendar is the usual cause).
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('The prototype hit an error:', error)
  }

  private reset = () => {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('appcharge-prototype:'))
        .forEach((k) => window.localStorage.removeItem(k))
    } catch {
      // Nothing to clear if storage is unavailable.
    }
    window.location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" style={{ display: 'grid', placeItems: 'center', minHeight: '100%', padding: 32, textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 20 }}>Something went wrong on this screen</h1>
          <p style={{ margin: '0 0 20px', color: 'var(--color-text-muted)' }}>
            Reloading usually fixes it. If it keeps happening, clear the saved calendars in this browser and start fresh.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button size="lg" onClick={this.reset}>
              Clear saved data
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
