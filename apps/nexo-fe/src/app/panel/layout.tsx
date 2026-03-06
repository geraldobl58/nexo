import { ProtectedRoute } from "@/features/auth";
import { PanelSidebar } from "@/components/layout/sidebar";
import { PanelAppBar } from "@/components/layout/app-bar-container";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <PanelSidebar />
        <PanelAppBar />

        <main className="min-h-screen pt-16 ml-60 p-6">
          <div className="max-w-screen-2xl mx-auto bg-white rounded-xl p-6 shadow-sm mt-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
