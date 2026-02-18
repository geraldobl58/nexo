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
    <div className="flex items-center justify-between p-4 shadow-sm border-b bg-violet-50">
      <Logo />
      <NavBar />
      <div className="flex items-center space-x-4">
        <Button variant="link" onClick={handleLogin}>
          Entrar
        </Button>
        <Button className="h-12 rounded-2xl shadow-md font-bold">
          <Link href="/panel" className="flex items-center space-x-1">
            <span>Anuncie Grátis</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
