"use client";

import { ProtectedRoute, useAuth } from "@/features/auth";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function PanelPage() {
  const { user, logout } = useAuth();

  console.log(user);

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
