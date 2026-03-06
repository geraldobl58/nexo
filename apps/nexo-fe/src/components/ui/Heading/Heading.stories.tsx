import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heading } from "./Heading";

const meta = {
  title: "Components/Heading",
  component: Heading,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Imóveis em Destaque",
    description: "Os melhores imóveis selecionados para você",
  },
};

export const WithBadge: Story = {
  name: "Com Badge",
  args: {
    badge: "Novidades",
    title: "Lançamentos da Semana",
    description: "Confira os imóveis mais recentes disponíveis na plataforma",
  },
};

export const WithoutDescription: Story = {
  name: "Sem Descrição",
  args: {
    title: "Imóveis em Destaque",
  },
};

export const SizeSm: Story = {
  name: "Tamanho: Pequeno",
  args: {
    title: "Características do Imóvel",
    description: "Veja os detalhes e diferenciais",
    size: "sm",
  },
};

export const SizeLg: Story = {
  name: "Tamanho: Grande",
  args: {
    title: "Encontre o Imóvel dos Seus Sonhos",
    description: "Mais de 10.000 imóveis disponíveis em todo o Brasil",
    size: "lg",
  },
};

export const SizeXl: Story = {
  name: "Tamanho: Extra Grande",
  args: {
    badge: "Plataforma #1",
    title: "O Melhor da Consultoria Imobiliária",
    description:
      "Conectamos você aos melhores imóveis com a expertise de corretores especializados",
    size: "xl",
  },
};

export const AlignCenter: Story = {
  name: "Alinhamento: Centro",
  args: {
    badge: "Destaques",
    title: "Imóveis de Luxo",
    description: "Seleção exclusiva de alto padrão",
    align: "center",
  },
};

export const AlignRight: Story = {
  name: "Alinhamento: Direita",
  args: {
    title: "Sua Busca, Nossa Missão",
    description: "Encontramos o imóvel ideal para você",
    align: "right",
  },
};

export const AsH2: Story = {
  name: "Tag: h2 (seção)",
  args: {
    as: "h2",
    title: "Imóveis por Região",
    description: "Explore as melhores opções por bairro",
  },
};

export const AsH3: Story = {
  name: "Tag: h3 (subseção)",
  args: {
    as: "h3",
    size: "sm",
    title: "Apartamentos no Jardins",
    description: "15 imóveis disponíveis",
  },
};

export const FullFeatured: Story = {
  name: "Completo",
  args: {
    badge: "Em Alta",
    as: "h2",
    title: "Imóveis Premium em São Paulo",
    description:
      "Descubra apartamentos e casas de alto padrão nas melhores localizações da cidade",
    size: "lg",
    align: "center",
  },
};
