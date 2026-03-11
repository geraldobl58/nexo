"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth.hook";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  fallback = <div className="p-10">Verificando autenticação...</div>,
}: ProtectedRouteProps) {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    try {
      await login("/panel");
    } catch (error) {
      console.error("Erro ao iniciar login:", error);
      router.replace("/");
    }
  }, [login, router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleLogin();
    }
  }, [isAuthenticated, isLoading, handleLogin]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
