"use client";

import Link from "next/link";

import { useAuth } from "@/features/auth";
import Button from "@mui/material/Button";

import { MobileSidebar } from "../MobileSidebar/MobileSidebar";
import { Logo } from "@/components/ui/Logo/Logo";
import { NavBar } from "../Navbar/Navbar";

export const Header = () => {
  const { login, user } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Erro ao iniciar login:", error);
    }
  };

  return (
    <header className="px-4 py-3 shadow-sm border-b bg-violet-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Hamburguer (mobile) + Logo */}
        <div className="flex items-center gap-2">
          <MobileSidebar onLogin={handleLogin} />
          <Logo />
        </div>

        {/* Navegação central — oculta em mobile */}
        <div className="hidden md:flex">
          <NavBar />
        </div>

        {/* Botões de ação — ocultos em mobile (ficam no sidebar) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button variant="text" LinkComponent={Link} href="/panel">
              Dashboard
            </Button>
          ) : (
            <Button variant="text" onClick={handleLogin}>
              Entrar
            </Button>
          )}
          <Button variant="contained" component={Link} href="/publish">
            Anuncie Grátis
          </Button>
        </div>
      </div>
    </header>
  );
};
