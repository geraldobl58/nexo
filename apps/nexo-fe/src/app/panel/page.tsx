"use client";

import { ProtectedRoute, useAuth } from "@/features/auth";

export default function PanelPage() {
  const { user, logout } = useAuth();

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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Painel Administrativo
            </h1>
            <button
              onClick={logout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Bem-vindo, {user?.name}! 👋
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Função</p>
                  <p className="mt-1 text-lg text-gray-900">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {user?.role}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {user?.id}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {user?.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                        Inativo
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Em breve:</strong> Aqui você poderá gerenciar
                  anúncios, visualizar estatísticas e muito mais!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
