"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { LogOut } from "lucide-react";

import { Divider, IconButton } from "@mui/material";

import { sections } from "@/routes";
import { Logo } from "@/components/ui/Logo/Logo";
import { useAuth } from "@/features/auth";
import Image from "next/image";

export const PanelSidebar = () => {
  const pathname = usePathname();

  const { user, logout } = useAuth();

  console.log(user);

  return (
    <aside className="fixed w-60 inset-y-0 left-0 flex flex-col bg-white border-r border-gray-100 z-40">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 shrink-0">
        <Logo />
      </div>

      <hr className="border-gray-100" />

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {sections.map((section, idx) => (
          <div key={section.label}>
            {idx > 0 && <hr className="border-gray-100 my-3" />}
            <p className="px-2 mb-1 text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.routes.map((route) => {
                const active =
                  route.path === "/panel"
                    ? pathname === "/panel"
                    : pathname.startsWith(route.path);

                return (
                  <li key={route.name}>
                    <Link
                      href={route.path}
                      className={[
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 mb-2 text-sm transition-colors duration-150",
                        active
                          ? "bg-violet-600 text-white font-semibold"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <span className={active ? "text-white" : "text-gray-500"}>
                        {route.icon}
                      </span>
                      {route.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Divider />

      <footer className="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
        <div className="flex items-center gap-3">
          <Image
            src={user?.avatar || "/images/avatar.jpg"}
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full mb-1"
          />
          <div>
            <h3 className="text-xs font-semibold">{user?.name}</h3>
            <p className="text-xs text-gray-500 text-muted-foreground">
              {user?.role === "ADMIN" ? "Administrador" : "Usuário"}
            </p>
          </div>
        </div>
        <div>
          <IconButton onClick={logout} size="small">
            <LogOut size={16} />
          </IconButton>
        </div>
      </footer>
    </aside>
  );
};
