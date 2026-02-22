import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardInformation } from "./CardInformation";

describe("CardInformation", () => {
  describe("renderização básica", () => {
    it("renderiza o título corretamente", () => {
      render(
        <CardInformation
          title="Informações do Imóvel"
          description="Detalhes do imóvel"
        />,
      );
      expect(screen.getByText("Informações do Imóvel")).toBeInTheDocument();
    });

    it("renderiza a descrição corretamente", () => {
      render(
        <CardInformation
          title="Informações do Imóvel"
          description="Detalhes e características do imóvel"
        />,
      );
      expect(
        screen.getByText("Detalhes e características do imóvel"),
      ).toBeInTheDocument();
    });

    it("renderiza o ícone quando fornecido", () => {
      render(
        <CardInformation
          icon="📊"
          title="Informações"
          description="Descrição"
        />,
      );
      expect(screen.getByText("📊")).toBeInTheDocument();
    });
  });

  describe("visibilidade do ícone", () => {
    it("não renderiza o ícone quando icon=false", () => {
      render(
        <CardInformation
          icon={false}
          title="Informações"
          description="Descrição"
        />,
      );
      expect(screen.queryByText("📊")).not.toBeInTheDocument();
    });

    it("não renderiza o ícone quando não fornecido", () => {
      render(<CardInformation title="Informações" description="Descrição" />);
      // Verifica que não há span de ícone renderizado
      const container = screen.getByText("Informações").closest("div");
      const iconSpan = container?.querySelector("span");
      expect(iconSpan).not.toBeInTheDocument();
    });

    it("renderiza o ícone como ReactNode", () => {
      render(
        <CardInformation
          icon={<span data-testid="custom-icon">🏠</span>}
          title="Casa"
          description="Imóvel residencial"
        />,
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  describe("variantes", () => {
    it("aplica a variante 'default' por padrão", () => {
      const { container } = render(
        <CardInformation title="Título" description="Descrição" />,
      );
      expect(container.firstChild).toHaveClass("bg-primary/5");
    });

    it("aplica a variante 'highlight'", () => {
      const { container } = render(
        <CardInformation
          title="Título"
          description="Descrição"
          variant="highlight"
        />,
      );
      expect(container.firstChild).toHaveClass("bg-primary/15");
    });

    it("aplica a variante 'subtle'", () => {
      const { container } = render(
        <CardInformation
          title="Título"
          description="Descrição"
          variant="subtle"
        />,
      );
      expect(container.firstChild).toHaveClass("bg-muted/30");
    });
  });

  describe("tamanhos", () => {
    it("aplica o tamanho 'md' por padrão", () => {
      const { container } = render(
        <CardInformation title="Título" description="Descrição" />,
      );
      expect(container.firstChild).toHaveClass("p-6");
    });

    it("aplica o tamanho 'sm'", () => {
      const { container } = render(
        <CardInformation title="Título" description="Descrição" size="sm" />,
      );
      expect(container.firstChild).toHaveClass("p-4");
    });

    it("aplica o tamanho 'lg'", () => {
      const { container } = render(
        <CardInformation title="Título" description="Descrição" size="lg" />,
      );
      expect(container.firstChild).toHaveClass("p-8");
    });

    it("aplica classe de título menor no tamanho 'sm'", () => {
      render(
        <CardInformation title="Título" description="Descrição" size="sm" />,
      );
      const heading = screen.getByRole("heading", { name: "Título" });
      expect(heading).toHaveClass("text-base");
    });

    it("aplica classe de título maior no tamanho 'lg'", () => {
      render(
        <CardInformation title="Título" description="Descrição" size="lg" />,
      );
      const heading = screen.getByRole("heading", { name: "Título" });
      expect(heading).toHaveClass("text-xl");
    });
  });
});
