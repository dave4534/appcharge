import { Avatar, BreadcrumbsBar, type BreadcrumbBarItem } from '../design-system/components'

export function TopBar({ trail }: { trail: BreadcrumbBarItem[] }) {
  return (
    <header className="topbar">
      <BreadcrumbsBar items={trail} />

      <div className="user-card">
        <Avatar size="Medium" type="Initials" text="D" />
        <div>
          <div className="user-name">Hi, Dave</div>
          <div className="user-role">Project Owner</div>
        </div>
      </div>
    </header>
  )
}
