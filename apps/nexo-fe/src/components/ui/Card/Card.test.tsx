import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Card } from "./Card";

// Mock do next/image para ambiente jsdom
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

describe("Card", () => {
  describe("valores padrão", () => {
    it("renderiza o preço padrão do imóvel", () => {
      render(<Card />);
      expect(screen.getByText("R$1.500.000")).toBeInTheDocument();
    });

    it("renderiza o endereço padrão do imóvel", () => {
      render(<Card />);
      expect(screen.getByText(/Jardins, São Paulo/i)).toBeInTheDocument();
    });

    it("renderiza o nome padrão do imóvel", () => {
      render(<Card />);
      expect(
        screen.getByText("Casa Contemporânea no Jardins"),
      ).toBeInTheDocument();
    });

    it("renderiza a taxa de condomínio padrão", () => {
      render(<Card />);
      expect(screen.getByText(/R\$ 850/)).toBeInTheDocument();
    });

    it("renderiza o badge padrão com texto 'Destaque'", () => {
      render(<Card />);
      expect(screen.getByText("Destaque")).toBeInTheDocument();
    });

    it("renderiza o botão de contato", () => {
      render(<Card />);
      expect(
        screen.getByRole("button", { name: /contatar anunciante/i }),
      ).toBeInTheDocument();
    });

    it("renderiza o botão de favorito", () => {
      render(<Card />);
      expect(
        screen.getByRole("button", { name: /adicionar aos favoritos/i }),
      ).toBeInTheDocument();
    });

    it("renderiza a área com 'm²'", () => {
      render(<Card />);
      expect(screen.getByText("4m²")).toBeInTheDocument();
    });
  });

  describe("props customizáveis", () => {
    it("renderiza o preço customizado", () => {
      render(<Card price="R$2.000.000" />);
      expect(screen.getByText("R$2.000.000")).toBeInTheDocument();
    });

    it("renderiza o nome customizado do imóvel", () => {
      render(<Card propertyName="Apartamento Luxo no Itaim" />);
      expect(screen.getByText("Apartamento Luxo no Itaim")).toBeInTheDocument();
    });

    it("renderiza o endereço customizado", () => {
      render(<Card address="Itaim Bibi, São Paulo - SP" />);
      expect(
        screen.getByText("Itaim Bibi, São Paulo - SP"),
      ).toBeInTheDocument();
    });

    it("renderiza o número correto de quartos", () => {
      render(<Card bedrooms={3} />);
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("renderiza o número correto de banheiros", () => {
      render(<Card bathrooms={2} />);
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("renderiza o número correto de garagens", () => {
      render(<Card garages={1} />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("renderiza a área correta com 'm²'", () => {
      render(<Card area={250} />);
      expect(screen.getByText("250m²")).toBeInTheDocument();
    });

    it("renderiza o texto customizado do badge", () => {
      render(<Card badgeText="Novo" />);
      expect(screen.getByText("Novo")).toBeInTheDocument();
    });

    it("não exibe a taxa de condomínio quando não fornecida", () => {
      render(<Card condoFee="" />);
      expect(screen.queryByText(/Cond\./)).not.toBeInTheDocument();
    });

    it("renderiza a imagem com o alt correto", () => {
      render(
        <Card imageUrl="/images/test.jpg" imageAlt="Foto do apartamento" />,
      );
      expect(screen.getByAltText("Foto do apartamento")).toBeInTheDocument();
    });
  });

  describe("visibilidade condicional", () => {
    it("não renderiza o badge quando badge=false", () => {
      render(<Card badge={false} badgeText="Destaque" />);
      expect(screen.queryByText("Destaque")).not.toBeInTheDocument();
    });

    it("não renderiza o botão de favorito quando favorite=false", () => {
      render(<Card favorite={false} />);
      expect(
        screen.queryByRole("button", { name: /adicionar aos favoritos/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("interações", () => {
    it("chama onFavoriteClick ao clicar no botão de favorito", async () => {
      const user = userEvent.setup();
      const onFavoriteClick = vi.fn();
      render(<Card onFavoriteClick={onFavoriteClick} />);
      await user.click(
        screen.getByRole("button", { name: /adicionar aos favoritos/i }),
      );
      expect(onFavoriteClick).toHaveBeenCalledTimes(1);
    });

    it("chama onContactClick ao clicar no botão de contato", async () => {
      const user = userEvent.setup();
      const onContactClick = vi.fn();
      render(<Card onContactClick={onContactClick} />);
      await user.click(
        screen.getByRole("button", { name: /contatar anunciante/i }),
      );
      expect(onContactClick).toHaveBeenCalledTimes(1);
    });
  });
});
