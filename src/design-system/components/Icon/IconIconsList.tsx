import { useMemo, useState } from 'react';
import {
  Archive,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Folder,
  Heart,
  Home,
  Info,
  Link,
  Loader2,
  Mail,
  Menu,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search as SearchIcon,
  Settings,
  Star,
  Trash2,
  Upload,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Search } from '../Search';
import { Icon } from './Icon';

const galleryIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'Archive', icon: Archive },
  { name: 'ArrowRight', icon: ArrowRight },
  { name: 'Bell', icon: Bell },
  { name: 'Calendar', icon: Calendar },
  { name: 'Check', icon: Check },
  { name: 'ChevronDown', icon: ChevronDown },
  { name: 'ChevronRight', icon: ChevronRight },
  { name: 'Circle', icon: Circle },
  { name: 'Copy', icon: Copy },
  { name: 'Download', icon: Download },
  { name: 'Edit', icon: Edit },
  { name: 'ExternalLink', icon: ExternalLink },
  { name: 'Eye', icon: Eye },
  { name: 'Filter', icon: Filter },
  { name: 'Folder', icon: Folder },
  { name: 'Heart', icon: Heart },
  { name: 'Home', icon: Home },
  { name: 'Info', icon: Info },
  { name: 'Link', icon: Link },
  { name: 'Loader2', icon: Loader2 },
  { name: 'Mail', icon: Mail },
  { name: 'Menu', icon: Menu },
  { name: 'Minus', icon: Minus },
  { name: 'MoreHorizontal', icon: MoreHorizontal },
  { name: 'Pencil', icon: Pencil },
  { name: 'Plus', icon: Plus },
  { name: 'Search', icon: SearchIcon },
  { name: 'Settings', icon: Settings },
  { name: 'Star', icon: Star },
  { name: 'Trash2', icon: Trash2 },
  { name: 'Upload', icon: Upload },
  { name: 'User', icon: User },
  { name: 'X', icon: X },
];

export function IconIconsList() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return galleryIcons;
    return galleryIcons.filter(({ name }) => name.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <section style={{ width: '100%' }}>
      <Search
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search for icons"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 'var(--space-24)',
          marginTop: 'var(--space-24)',
        }}
      >
        {filtered.map(({ name, icon }) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              color: 'var(--icon-color)',
            }}
          >
            <Icon icon={icon} size={26} label={name} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
