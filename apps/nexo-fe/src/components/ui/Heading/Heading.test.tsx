import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "./Heading";

describe("Heading", () => {
  describe("renderização básica", () => {
    it("renderiza o título corretamente", () => {
      render(<Heading title="Imóveis em Destaque" />);
      expect(screen.getByText("Imóveis em Destaque")).toBeInTheDocument();
    });

    it("renderiza a descrição quando fornecida", () => {
      render(
        <Heading
          title="Imóveis em Destaque"
          description="Os melhores imóveis selecionados para você"
        />,
      );
      expect(
        screen.getByText("Os melhores imóveis selecionados para você"),
      ).toBeInTheDocument();
    });

    it("não renderiza a descrição quando omitida", () => {
      render(<Heading title="Título" />);
      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });

    it("renderiza o badge quando fornecido", () => {
      render(<Heading title="Título" badge="Novo" />);
      expect(screen.getByText("Novo")).toBeInTheDocument();
    });

    it("não renderiza o badge quando omitido", () => {
      render(<Heading title="Título" />);
      expect(screen.queryByText("Novo")).not.toBeInTheDocument();
    });
  });

  describe("tag HTML (prop 'as')", () => {
    it("renderiza como h1 por padrão", () => {
      render(<Heading title="Título" />);
      expect(
        screen.getByRole("heading", { level: 1, name: "Título" }),
      ).toBeInTheDocument();
    });

    it("renderiza como h2 quando as='h2'", () => {
      render(<Heading title="Título" as="h2" />);
      expect(
        screen.getByRole("heading", { level: 2, name: "Título" }),
      ).toBeInTheDocument();
    });

    it("renderiza como h3 quando as='h3'", () => {
      render(<Heading title="Título" as="h3" />);
      expect(
        screen.getByRole("heading", { level: 3, name: "Título" }),
      ).toBeInTheDocument();
    });

    it("renderiza como h4 quando as='h4'", () => {
      render(<Heading title="Título" as="h4" />);
      expect(
        screen.getByRole("heading", { level: 4, name: "Título" }),
      ).toBeInTheDocument();
    });
  });

  describe("tamanhos (prop 'size')", () => {
    it("aplica tamanho 'sm'", () => {
      render(<Heading title="Título" size="sm" />);
      expect(screen.getByRole("heading")).toHaveClass("text-base");
    });

    it("aplica tamanho 'md' por padrão", () => {
      render(<Heading title="Título" />);
      expect(screen.getByRole("heading")).toHaveClass("text-lg");
    });

    it("aplica tamanho 'lg'", () => {
      render(<Heading title="Título" size="lg" />);
      expect(screen.getByRole("heading")).toHaveClass("text-xl");
    });

    it("aplica tamanho 'xl'", () => {
      render(<Heading title="Título" size="xl" />);
      expect(screen.getByRole("heading")).toHaveClass("text-2xl");
    });
  });

  describe("alinhamento (prop 'align')", () => {
    it("alinha à esquerda por padrão", () => {
      const { container } = render(<Heading title="Título" />);
      expect(container.firstChild).toHaveClass("text-left");
    });

    it("alinha ao centro quando align='center'", () => {
      const { container } = render(<Heading title="Título" align="center" />);
      expect(container.firstChild).toHaveClass("text-center");
    });

    it("alinha à direita quando align='right'", () => {
      const { container } = render(<Heading title="Título" align="right" />);
      expect(container.firstChild).toHaveClass("text-right");
    });
  });

  describe("tamanho da descrição acompanha o size", () => {
    it("descrição com tamanho 'sm' usa text-xs", () => {
      render(<Heading title="Título" description="Descrição" size="sm" />);
      expect(screen.getByText("Descrição")).toHaveClass("text-xs");
    });

    it("descrição com tamanho 'lg' usa text-base", () => {
      render(<Heading title="Título" description="Descrição" size="lg" />);
      expect(screen.getByText("Descrição")).toHaveClass("text-base");
    });
  });
});
