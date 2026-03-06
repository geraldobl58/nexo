import {
  Calendar,
  CreditCard,
  HouseHeart,
  LayoutDashboard,
  Settings,
  Users2,
  ZapIcon,
} from "lucide-react";

type SidebarRoute = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

type SidebarSection = {
  label: string;
  routes: SidebarRoute[];
};

export const sections: SidebarSection[] = [
  {
    label: "Principal",
    routes: [
      {
        name: "Dashboard",
        path: "/panel",
        icon: <LayoutDashboard size={18} />,
      },
      {
        name: "Meus Imóveis",
        path: "/panel/my-properties",
        icon: <HouseHeart size={18} />,
      },
      {
        name: "Agendamentos",
        path: "/panel/agendamentos",
        icon: <Calendar size={18} />,
      },
      { name: "Clientes", path: "/panel/clientes", icon: <Users2 size={18} /> },
      {
        name: "Mensagens",
        path: "/panel/mensagens",
        icon: <ZapIcon size={18} />,
      },
    ],
  },
  {
    label: "Configurações",
    routes: [
      { name: "Ajustes", path: "/panel/ajustes", icon: <Settings size={18} /> },
      {
        name: "Faturamento",
        path: "/panel/faturamento",
        icon: <CreditCard size={18} />,
      },
    ],
  },
];
