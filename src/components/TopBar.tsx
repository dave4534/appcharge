import { Icon } from './Icon'

export function TopBar({ trail }: { trail: string[] }) {
  return (
    <header className="topbar">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1
          return (
            <span className="breadcrumb-item" key={crumb} style={{ display: 'contents' }}>
              <span aria-current={isLast ? 'page' : undefined}>{crumb}</span>
              {!isLast && <Icon name="chevronRight" size={12} />}
            </span>
          )
        })}
      </nav>

      <div className="user-card">
        <span className="avatar">D</span>
        <div>
          <div className="user-name">Hi, Dave</div>
          <div className="user-role">Project Owner</div>
        </div>
      </div>
    </header>
  )
}
