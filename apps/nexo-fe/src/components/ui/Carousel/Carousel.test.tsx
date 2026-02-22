/* eslint-disable react/display-name */
import { render, screen } from "@testing-library/react";
import { createRef, forwardRef, useImperativeHandle } from "react";
import { describe, expect, it, vi } from "vitest";

import { Carousel, type CarouselHandle } from "./Carousel";

// Mock react-slick para ambiente jsdom
vi.mock("react-slick", () => ({
  default: forwardRef<
    { slickPrev: () => void; slickNext: () => void },
    {
      children: React.ReactNode;
      dots?: boolean;
      beforeChange?: (current: number, next: number) => void;
    }
  >(({ children, dots, beforeChange }, ref) => {
    useImperativeHandle(ref, () => ({
      slickPrev: vi.fn(),
      slickNext: vi.fn(),
    }));
    return (
      <div
        data-testid="slider"
        data-dots={dots ? "true" : "false"}
        onClick={() => beforeChange?.(0, 1)}
      >
        {children}
      </div>
    );
  }),
}));

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} data-testid={`slide-${i}`}>
      Item {i + 1}
    </div>
  ));

describe("Carousel", () => {
  describe("renderização básica", () => {
    it("renderiza o container do carousel", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(screen.getByTestId("carousel")).toBeInTheDocument();
    });

    it("renderiza o slider interno", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(screen.getByTestId("slider")).toBeInTheDocument();
    });

    it("renderiza todos os itens fornecidos", () => {
      render(<Carousel items={makeItems(4)} />);
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
      expect(screen.getByText("Item 4")).toBeInTheDocument();
    });

    it("renderiza a quantidade correta de slides", () => {
      render(<Carousel items={makeItems(5)} />);
      const slides = screen.getAllByTestId(/^slide-/);
      expect(slides).toHaveLength(5);
    });

    it("renderiza lista vazia sem erros", () => {
      render(<Carousel items={[]} />);
      expect(screen.getByTestId("carousel")).toBeInTheDocument();
    });
  });

  describe("classe nexo-slider", () => {
    it("aplica a classe nexo-slider ao container por padrão", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(screen.getByTestId("carousel")).toHaveClass("nexo-slider");
    });

    it("mescla nexo-slider com className customizada", () => {
      render(<Carousel items={makeItems(3)} className="minha-classe" />);
      const container = screen.getByTestId("carousel");
      expect(container).toHaveClass("nexo-slider");
      expect(container).toHaveClass("minha-classe");
    });

    it("aplica apenas nexo-slider quando className é omitida", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(screen.getByTestId("carousel").className).toBe("nexo-slider");
    });
  });

  describe("props de configuração", () => {
    it("passa dots=true ao slider por padrão", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(screen.getByTestId("slider")).toHaveAttribute("data-dots", "true");
    });

    it("passa dots=false ao slider quando desabilitado", () => {
      render(<Carousel items={makeItems(3)} dots={false} />);
      expect(screen.getByTestId("slider")).toHaveAttribute(
        "data-dots",
        "false",
      );
    });
  });

  describe("navegação externa (arrows)", () => {
    it("exibe os botões de navegação por padrão (arrows=true)", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(screen.getByTestId("carousel-nav")).toBeInTheDocument();
    });

    it("exibe o botão 'Anterior'", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(
        screen.getByRole("button", { name: /anterior/i }),
      ).toBeInTheDocument();
    });

    it("exibe o botão 'Próximo'", () => {
      render(<Carousel items={makeItems(3)} />);
      expect(
        screen.getByRole("button", { name: /próximo/i }),
      ).toBeInTheDocument();
    });

    it("oculta os botões de navegação quando arrows=false", () => {
      render(<Carousel items={makeItems(3)} arrows={false} />);
      expect(screen.queryByTestId("carousel-nav")).not.toBeInTheDocument();
    });

    it("oculta o botão 'Anterior' quando arrows=false", () => {
      render(<Carousel items={makeItems(3)} arrows={false} />);
      expect(
        screen.queryByRole("button", { name: /anterior/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("disabled state dos botões (infinite=false)", () => {
    it("botão 'Anterior' inicia desabilitado no primeiro slide", () => {
      render(
        <Carousel items={makeItems(5)} slidesToShow={3} infinite={false} />,
      );
      expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
    });

    it("botão 'Próximo' inicia habilitado no primeiro slide", () => {
      render(
        <Carousel items={makeItems(5)} slidesToShow={3} infinite={false} />,
      );
      expect(
        screen.getByRole("button", { name: /próximo/i }),
      ).not.toBeDisabled();
    });

    it("botão 'Anterior' tem opacity-30 quando desabilitado", () => {
      render(
        <Carousel items={makeItems(5)} slidesToShow={3} infinite={false} />,
      );
      expect(screen.getByRole("button", { name: /anterior/i })).toHaveClass(
        "opacity-30",
      );
    });

    it("botão 'Anterior' tem cursor-not-allowed quando desabilitado", () => {
      render(
        <Carousel items={makeItems(5)} slidesToShow={3} infinite={false} />,
      );
      expect(screen.getByRole("button", { name: /anterior/i })).toHaveClass(
        "cursor-not-allowed",
      );
    });

    it("botões não são desabilitados quando infinite=true", () => {
      render(
        <Carousel items={makeItems(5)} slidesToShow={3} infinite={true} />,
      );
      expect(
        screen.getByRole("button", { name: /anterior/i }),
      ).not.toBeDisabled();
      expect(
        screen.getByRole("button", { name: /próximo/i }),
      ).not.toBeDisabled();
    });
  });

  describe("gap entre slides", () => {
    it("aplica gap 'md' por padrão (px-2)", () => {
      render(<Carousel items={makeItems(1)} />);
      expect(screen.getByTestId("slide-0").parentElement).toHaveClass("px-2");
    });

    it("aplica gap 'none' (sem padding)", () => {
      render(<Carousel items={makeItems(1)} gap="none" />);
      expect(
        screen.getByTestId("slide-0").parentElement?.className,
      ).toBeFalsy();
    });

    it("aplica gap 'sm' (px-1)", () => {
      render(<Carousel items={makeItems(1)} gap="sm" />);
      expect(screen.getByTestId("slide-0").parentElement).toHaveClass("px-1");
    });

    it("aplica gap 'lg' (px-4)", () => {
      render(<Carousel items={makeItems(1)} gap="lg" />);
      expect(screen.getByTestId("slide-0").parentElement).toHaveClass("px-4");
    });
  });

  describe("forwardRef (CarouselHandle)", () => {
    it("expõe o método prev via ref", () => {
      const ref = createRef<CarouselHandle>();
      render(<Carousel ref={ref} items={makeItems(3)} />);
      expect(typeof ref.current?.prev).toBe("function");
    });

    it("expõe o método next via ref", () => {
      const ref = createRef<CarouselHandle>();
      render(<Carousel ref={ref} items={makeItems(3)} />);
      expect(typeof ref.current?.next).toBe("function");
    });

    it("ref não é nulo após renderização", () => {
      const ref = createRef<CarouselHandle>();
      render(<Carousel ref={ref} items={makeItems(3)} />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("conteúdo dos slides", () => {
    it("renderiza conteúdo ReactNode arbitrário nos slides", () => {
      const items = [
        <span key="a" data-testid="custom-a">
          Slide A
        </span>,
        <button key="b" data-testid="custom-b">
          Slide B
        </button>,
      ];
      render(<Carousel items={items} />);
      expect(screen.getByTestId("custom-a")).toBeInTheDocument();
      expect(screen.getByTestId("custom-b")).toBeInTheDocument();
    });
  });
});
