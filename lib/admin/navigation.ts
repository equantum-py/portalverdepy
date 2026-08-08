import {
  Boxes,
  BriefcaseBusiness,
  FolderTree,
  Home,
  Images,
  LayoutDashboard,
  Settings,
  Users
} from 'lucide-react';

export const adminNavigation = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Productos',
    href: '/admin/productos',
    icon: Boxes
  },
  {
    title: 'Categorías',
    href: '/admin/categorias',
    icon: FolderTree
  },
  {
    title: 'Trabajos',
    href: '/admin/trabajos',
    icon: BriefcaseBusiness
  },
  {
    title: 'Banners',
    href: '/admin/banners',
    icon: Images
  },
  {
    title: 'Página de inicio',
    href: '/admin/pagina-inicio',
    icon: Home
  },
  {
    title: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings
  },
  {
    title: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users
  }
] as const;
