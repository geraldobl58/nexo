import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardInformation } from "./card-information";

const meta = {
  title: "Components/CardInformation",
  component: CardInformation,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CardInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "📊",
    title: "Informações do Imóvel",
    description: "Detalhes e características do imóvel",
  },
};

export const WithoutIcon: Story = {
  args: {
    icon: false,
    title: "Informações do Imóvel",
    description: "Detalhes e características do imóvel",
  },
};

export const VariantHighlight: Story = {
  name: "Variante: Destaque",
  args: {
    icon: "🏠",
    title: "Imóvel em Destaque",
    description: "Este imóvel está em destaque na plataforma",
    variant: "highlight",
  },
};

export const VariantSubtle: Story = {
  name: "Variante: Sutil",
  args: {
    icon: "📍",
    title: "Localização",
    description: "Jardins, São Paulo - SP",
    variant: "subtle",
  },
};

export const SizeSm: Story = {
  name: "Tamanho: Pequeno",
  args: {
    icon: "🛁",
    title: "Banheiros",
    description: "4 banheiros completos com porcelanato importado",
    size: "sm",
  },
};

export const SizeLg: Story = {
  name: "Tamanho: Grande",
  args: {
    icon: "🏡",
    title: "Área Total",
    description:
      "450m² de área total construída com acabamento de alto padrão, incluindo jardim, piscina e área gourmet.",
    size: "lg",
  },
};

export const SafetyInfo: Story = {
  name: "Informação de Segurança",
  args: {
    icon: "🔒",
    title: "Segurança 24h",
    description:
      "Condomínio com portaria 24 horas, câmeras de segurança e controle de acesso",
    variant: "highlight",
    size: "md",
  },
};

export const AreaInfo: Story = {
  name: "Informação de Área",
  args: {
    icon: false,
    title: "Área Útil",
    description: "280m² distribuídos em 3 andares com terraço privativo",
    variant: "subtle",
    size: "md",
  },
};
