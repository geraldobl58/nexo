"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Logo } from "./logo";
import { NavBar } from "./navbar";
import { MobileSidebar } from "./mobile-sidebar";
import { useAuth } from "@/features/auth";
import Button from "@mui/material/Button";

export const Header = () => {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/panel");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Erro ao iniciar login:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 shadow-sm border-b bg-violet-50">
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
        <Button
          variant="text"
          onClick={handleLogin}
          className="!normal-case !font-medium"
        >
          Entrar
        </Button>
        <Button
          variant="contained"
          component={Link}
          href="/panel"
          className="!normal-case !font-bold !rounded-xl !shadow-[0_4px_12px_rgb(124_58_237_/_0.3)] hover:!shadow-[0_4px_16px_rgb(124_58_237_/_0.4)]"
        >
          Anuncie Grátis
        </Button>
      </div>
    </header>
  );
};
