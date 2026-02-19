"use client";

import { ProtectedRoute, useAuth } from "@/features/auth";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function PanelPage() {
  const { user, logout } = useAuth();

  console.log(user);

  // useEffect(() => {
  //   // Se já estiver autenticado, redireciona para o painel
  //   if (!isLoading && isAuthenticated) {
  //     router.replace("/panel");
  //   }
  // }, [isAuthenticated, isLoading, router]);

  // // Mostra loading enquanto verifica autenticação
  // if (isLoading) {
  //   return <LoadingScreen label="Verificando autenticação..." />;
  // }

  // // Se já estiver autenticado, mostra loading enquanto redireciona
  // if (isAuthenticated) {
  //   return <LoadingScreen label="Redirecionando para o painel..." />;
  // }

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center h-screen">
        <Button variant="contained">Test</Button>
        <TextField label="Teste" variant="outlined" />
        <div>
          <p>Bem-vindo, {user?.name}!</p>
          <Button variant="contained" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
