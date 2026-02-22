import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Card } from "../Card/Card";
import { Carousel } from "./Carousel";

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCards = [
  <Card
    key="1"
    badgeText="Destaque"
    price="R$1.500.000"
    propertyName="Casa Contemporânea no Jardins"
    address="Jardins, São Paulo - SP"
    bedrooms={4}
    bathrooms={4}
    garages={2}
    area={320}
  />,
  <Card
    key="2"
    badgeText="Novo"
    price="R$3.200.000"
    propertyName="Apartamento Duplex no Itaim"
    address="Itaim Bibi, São Paulo - SP"
    bedrooms={3}
    bathrooms={3}
    garages={2}
    area={180}
  />,
  <Card
    key="3"
    badgeText="Exclusivo"
    price="R$12.000.000"
    propertyName="Mansão com Piscina no Morumbi"
    address="Morumbi, São Paulo - SP"
    bedrooms={6}
    bathrooms={8}
    garages={4}
    area={800}
  />,
  <Card
    key="4"
    badgeText="Aluguel"
    price="R$2.500/mês"
    propertyName="Kitnet Mobiliada no Centro"
    address="Centro, São Paulo - SP"
    bedrooms={1}
    bathrooms={1}
    garages={0}
    area={28}
  />,
  <Card
    key="5"
    badgeText="Oportunidade"
    price="R$980.000"
    propertyName="Casa Independente no Brooklin"
    address="Brooklin, São Paulo - SP"
    bedrooms={3}
    bathrooms={2}
    garages={2}
    area={150}
  />,
];

export const Default: Story = {
  args: {
    items: sampleCards,
    slidesToShow: 3,
    dots: true,
    arrows: true,
    infinite: false,
    slidesToScroll: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // No primeiro slide, "Anterior" deve estar desabilitado
    const prevBtn = canvas.getByRole("button", { name: /anterior/i });
    await expect(prevBtn).toBeDisabled();
    // "Próximo" deve estar habilitado
    const nextBtn = canvas.getByRole("button", { name: /próximo/i });
    await expect(nextBtn).not.toBeDisabled();
  },
};

export const PrimeiroSlide: Story = {
  name: "Arrows: Primeiro slide (prev disabled)",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    dots: true,
    arrows: true,
    infinite: false,
    slidesToScroll: 2,
  },
};

export const UltimoSlide: Story = {
  name: "Arrows: Último slide (next disabled)",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    dots: true,
    arrows: true,
    infinite: false,
    slidesToScroll: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const nextBtn = canvas.getByRole("button", { name: /próximo/i });
    // Avança até o último slide (5 itens - 3 visíveis = 2 cliques)
    await user.click(nextBtn);
    await user.click(nextBtn);
    // No último slide, "Próximo" deve estar desabilitado
    await expect(nextBtn).toBeDisabled();
    // "Anterior" deve estar habilitado
    const prevBtn = canvas.getByRole("button", { name: /anterior/i });
    await expect(prevBtn).not.toBeDisabled();
  },
};

export const InfiniteLoop: Story = {
  name: "Arrows: Loop infinito (sem disabled)",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    dots: true,
    arrows: true,
    infinite: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Com infinite=true, nenhum botão deve ser desabilitado
    await expect(
      canvas.getByRole("button", { name: /anterior/i }),
    ).not.toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: /próximo/i }),
    ).not.toBeDisabled();
  },
};

export const SingleSlide: Story = {
  name: "1 Por Vez",
  args: {
    items: sampleCards,
    slidesToShow: 1,
    dots: true,
    arrows: true,
    infinite: false,
  },
};

export const TwoSlides: Story = {
  name: "2 Por Vez",
  args: {
    items: sampleCards,
    slidesToShow: 2,
    dots: true,
    arrows: true,
    infinite: false,
    gap: "md",
  },
};

export const AutoPlay: Story = {
  name: "Com AutoPlay",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    autoPlay: true,
    autoPlaySpeed: 2000,
    dots: true,
    arrows: false,
    infinite: true,
  },
};

export const NoDots: Story = {
  name: "Sem Pontos",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    dots: false,
    arrows: true,
    infinite: false,
  },
};

export const NoArrows: Story = {
  name: "Sem Setas",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    dots: true,
    arrows: false,
  },
};

export const GapLarge: Story = {
  name: "Gap: Grande",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    gap: "lg",
    dots: true,
    arrows: true,
    infinite: false,
  },
};

export const GapNone: Story = {
  name: "Gap: Nenhum",
  args: {
    items: sampleCards,
    slidesToShow: 3,
    gap: "none",
    dots: true,
    arrows: true,
    infinite: false,
  },
};
