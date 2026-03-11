"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth";
import { useMyListings } from "@/features/owner/hooks/use-my-listings.hook";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import { MobileSidebar } from "./mobile-sidebar";
import { NavBar } from "./navbar";
import { Logo } from "@/components/ui/logo/logo";

export const Header = () => {
  const { login, user } = useAuth();
  const { isAtFreeLimit } = useMyListings();
  // Só renderiza botões de auth depois da hidratação para evitar mismatch
  // (server não conhece o estado Keycloak; cliente pode já ter user definido)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
        {/* suppressHydrationWarning não funciona para elementos filhos;
            usamos mounted para garantir render idêntico em server e client */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && user ? (
            <Button variant="text" LinkComponent={Link} href="/panel">
              Dashboard
            </Button>
          ) : (
            <Button variant="text" onClick={handleLogin}>
              Entrar
            </Button>
          )}
          {mounted && user ? (
            <Tooltip
              title={
                isAtFreeLimit
                  ? "Plano FREE: limite de 1 imóvel atingido. Faça upgrade para anunciar mais."
                  : ""
              }
              arrow
            >
              {/* span necessário para o Tooltip funcionar em botão desabilitado */}
              <span>
                <Button
                  variant="contained"
                  component={Link}
                  href="/publish/owner"
                  disabled={isAtFreeLimit}
                >
                  Anuncie Grátis
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button variant="contained" component={Link} href="/publish">
              Anuncie Grátis
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
