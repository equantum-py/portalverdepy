import {
  Boxes,
  BriefcaseBusiness,
  FolderTree,
  Home,
  Images,
  PanelsTopLeft,
  LayoutDashboard,
  Settings,
  Users,
  Image,
  Sprout
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
    title: 'Vivero Digital',
    href: '/admin/vivero-digital',
    icon: Sprout
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
    title: 'Banners de servicios',
    href: '/admin/banners-servicios',
    icon: PanelsTopLeft
  },
  {
    title: 'Logo',
    href: '/admin/logo',
    icon: Image
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
