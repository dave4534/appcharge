import type { ComponentType } from 'react'
import { Building2, Folder, LayoutGrid, Users, type LucideIcon } from 'lucide-react'
import jonathan from '@/assets/profile/jonathan.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

// Icons for the crumbs that have one. The trail's label is what the crumb reads.
export type Crumb = { icon?: LucideIcon; label: string }

const ICONS: Record<string, LucideIcon> = { Company: Building2, Store: Folder, Offers: Users, 'Reward Calendars': LayoutGrid }

export function TopBar({ trail }: { trail: Crumb[] }) {
  return (
    <header className="topbar">
      <Breadcrumb>
        <BreadcrumbList>
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1
            const Icon: ComponentType<{ className?: string }> | undefined = crumb.icon ?? ICONS[crumb.label]
            return (
              <BreadcrumbItem key={`${crumb.label}-${index}`}>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {Icon && <Icon className="size-4" />}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1.5">
                    {Icon && <Icon className="size-4" />}
                    {crumb.label}
                  </BreadcrumbLink>
                )}
                {!isLast && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="user-card">
        <Avatar size="lg">
          <AvatarImage src={jonathan} alt="Jonathan" />
          <AvatarFallback>J</AvatarFallback>
        </Avatar>
        <div>
          <div className="user-name">Hi, Jonathan</div>
          <div className="user-role">Project Owner</div>
        </div>
      </div>
    </header>
  )
}
