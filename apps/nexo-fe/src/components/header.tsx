"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { NavBar } from "./navbar";
import { Button } from "./ui/button";
import { useAuth } from "@/features/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se já estiver autenticado, redireciona para o painel
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
    <div className="flex items-center justify-between p-4 shadow-sm bg-white">
      <Logo />
      <NavBar />
      <div className="flex items-center space-x-4">
        <Button
          className="rounded-full"
          variant="secondary"
          onClick={handleLogin}
        >
          Entrar
        </Button>
        <Button className="rounded-full">
          <Link href="/panel" className="flex items-center space-x-1">
            <span>Publicar</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
