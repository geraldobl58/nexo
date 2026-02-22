import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  args: {
    onFavoriteClick: fn(),
    onContactClick: fn(),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const price = canvas.getByText("R$1.500.000");
    await expect(price).toBeInTheDocument();

    const badge = canvas.getByText("Destaque");
    await expect(badge).toBeInTheDocument();
  },
};

export const NoBadge: Story = {
  args: {
    badge: false,
  },
};

export const NoFavorite: Story = {
  args: {
    favorite: false,
  },
};

export const ApartmentLuxo: Story = {
  name: "Apartamento de Luxo",
  args: {
    badge: true,
    badgeText: "Novo",
    price: "R$3.200.000",
    condoFee: "R$ 2.100",
    propertyName: "Apartamento Duplex no Itaim Bibi",
    address: "Itaim Bibi, São Paulo - SP",
    bedrooms: 3,
    bathrooms: 3,
    garages: 2,
    area: 180,
  },
};

export const KitnetCompacta: Story = {
  name: "Kitnet Compacta",
  args: {
    badge: true,
    badgeText: "Aluguel",
    price: "R$2.500/mês",
    condoFee: "R$ 300",
    propertyName: "Kitnet Mobiliada no Centro",
    address: "Centro, São Paulo - SP",
    bedrooms: 1,
    bathrooms: 1,
    garages: 0,
    area: 28,
  },
};

export const CasaGrande: Story = {
  name: "Casa Grande",
  args: {
    badge: true,
    badgeText: "Exclusivo",
    price: "R$12.000.000",
    condoFee: "R$ 4.500",
    propertyName: "Mansão com Piscina no Morumbi",
    address: "Morumbi, São Paulo - SP",
    bedrooms: 6,
    bathrooms: 8,
    garages: 4,
    area: 800,
  },
};

export const SemCondominio: Story = {
  name: "Sem Taxa de Condomínio",
  args: {
    badge: true,
    badgeText: "Destaque",
    condoFee: "",
    propertyName: "Casa Independente no Brooklin",
    address: "Brooklin, São Paulo - SP",
    price: "R$980.000",
    bedrooms: 3,
    bathrooms: 2,
    garages: 2,
    area: 150,
  },
};

export const WithInteractions: Story = {
  name: "Com Interações",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const favoriteBtn = canvas.getByRole("button", {
      name: /adicionar aos favoritos/i,
    });
    await user.click(favoriteBtn);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);

    const contactBtn = canvas.getByRole("button", {
      name: /contatar anunciante/i,
    });
    await user.click(contactBtn);
    await expect(args.onContactClick).toHaveBeenCalledTimes(1);
  },
};
