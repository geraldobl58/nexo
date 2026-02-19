"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";

/**
 * Tema MUI mínimo alinhado às variáveis CSS do Tailwind do projeto.
 * O CssBaseline é desabilitado para não conflitar com os estilos Tailwind.
 */
const theme = createTheme({
  palette: {
    primary: {
      // Cor primária: hsl(262.1 83.3% 57.8%) ≈ violet-600
      main: "#7c3aed",
      contrastText: "#f8fafc",
    },
    secondary: {
      main: "#f1f5f9",
      contrastText: "#0f172a",
    },
  },
  typography: {
    fontFamily: "var(--font-montserrat), sans-serif",
  },
  components: {
    // Desabilita os estilos globais do MUI para não conflitar com Tailwind
    MuiCssBaseline: {
      styleOverrides: "",
    },
  },
});

export function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}
