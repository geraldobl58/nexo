"use client";

import { ProtectedRoute, useAuth } from "@/features/auth";
import Button from "@mui/material/Button";

export default function PanelPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col gap-4 p-8 border rounded-xl shadow-sm max-w-lg w-full">
          <p className="text-lg font-semibold">
            Bem-vindo, {user?.name ?? "—"}!
          </p>

          {user && (
            <pre className="text-xs bg-gray-100 rounded p-3 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          )}

          <Button variant="contained" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
