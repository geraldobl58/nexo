/**
 * SEED DO BANCO DE DADOS — NEXO PORTAL IMOBILIÁRIO
 *
 * Popula o banco com dados realistas para desenvolvimento e testes manuais.
 *
 * O QUE ESTE SEED CRIA:
 *  - 1 usuário admin (equipe interna)
 *  - 3 anunciantes (imobiliária, corretor, proprietário)
 *  - 3 clientes (customers)
 *  - 5 comodidades (amenities)
 *  - 5 planos de anúncio (listing plans)
 *  - 8 imóveis com fotos e comodidades
 *  - 4 leads
 *  - 2 conversas com mensagens
 *  - 2 avaliações
 *  - 1 denúncia
 *  - 1 visita agendada
 *  - 1 proposta
 *
 * COMO USAR:
 *  pnpm prisma:seed
 *    ou
 *  npx ts-node prisma/seed.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Gera slug simples para imóveis */
function slugify(text: string, suffix: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') +
    '-' +
    suffix
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed principal
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // -------------------------------------------------------------------------
  // Limpeza prévia (ordem importa por causa das FK)
  // -------------------------------------------------------------------------
  console.log('🧹 Limpando dados anteriores...');
  await prisma.$transaction([
    prisma.webhookDelivery.deleteMany(),
    prisma.webhook.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.report.deleteMany(),
    prisma.review.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.proposal.deleteMany(),
    prisma.visit.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.favoriteProperty.deleteMany(),
    prisma.savedSearch.deleteMany(),
    prisma.propertyBoost.deleteMany(),
    prisma.propertyAmenity.deleteMany(),
    prisma.propertyMedia.deleteMany(),
    prisma.property.deleteMany(),
    prisma.listingPlan.deleteMany(),
    prisma.amenity.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('✅ Dados anteriores removidos.\n');

  // -------------------------------------------------------------------------
  // 1. USUÁRIO ADMIN (equipe interna)
  // -------------------------------------------------------------------------
  console.log('👤 Criando usuário admin...');
  const admin = await prisma.user.create({
    data: {
      keycloakId: 'kc-admin-001',
      email: 'admin@nexo.com.br',
      name: 'Admin Nexo',
      phone: '11999990001',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`   ✅ Admin: ${admin.email}`);

  // -------------------------------------------------------------------------
  // 2. ANUNCIANTES
  // -------------------------------------------------------------------------
  console.log('\n🏢 Criando anunciantes (como usuários)...');

  const imobiliaria = await prisma.user.create({
    data: {
      keycloakId: 'kc-adv-agency-001',
      email: 'contato@horizonte.com.br',
      name: 'Imobiliária Horizonte',
      phone: '11930000001',
      isActive: true,
      advertiserType: 'AGENCY',
    },
  });

  const corretor = await prisma.user.create({
    data: {
      keycloakId: 'kc-adv-broker-001',
      email: 'carlos.mendes@corretor.com.br',
      name: 'Carlos Eduardo Mendes',
      phone: '21987654321',
      isActive: true,
      advertiserType: 'BROKER',
    },
  });

  const proprietario = await prisma.user.create({
    data: {
      keycloakId: 'kc-adv-owner-001',
      email: 'maria.silva@email.com',
      name: 'Maria Aparecida Silva',
      phone: '11912345678',
      isActive: true,
      advertiserType: 'OWNER',
    },
  });

  console.log(`   ✅ Imobiliária: ${imobiliaria.name}`);
  console.log(`   ✅ Corretor: ${corretor.name}`);
  console.log(`   ✅ Proprietário: ${proprietario.name}`);

  // -------------------------------------------------------------------------
  // 3. CUSTOMERS (usuários finais)
  // -------------------------------------------------------------------------
  console.log('\n👥 Criando clientes...');

  const clienteJoao = await prisma.customer.create({
    data: {
      keycloakId: 'kc-customer-001',
      name: 'João Pedro Oliveira',
      email: 'joao.oliveira@gmail.com',
      phone: '11911111111',
      city: 'São Paulo',
      state: 'SP',
      isVerified: true,
    },
  });

  const clienteAna = await prisma.customer.create({
    data: {
      keycloakId: 'kc-customer-002',
      name: 'Ana Carolina Ferreira',
      email: 'ana.ferreira@gmail.com',
      phone: '21922222222',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
  });

  const clienteRoberto = await prisma.customer.create({
    data: {
      name: 'Roberto Almeida',
      email: 'roberto.almeida@empresa.com',
      phone: '11933333333',
      city: 'São Paulo',
      state: 'SP',
    },
  });

  console.log(`   ✅ ${clienteJoao.name}`);
  console.log(`   ✅ ${clienteAna.name}`);
  console.log(`   ✅ ${clienteRoberto.name}`);

  // -------------------------------------------------------------------------
  // 4. COMODIDADES (AMENITIES)
  // -------------------------------------------------------------------------
  console.log('\n🏊 Criando comodidades...');

  const amenities = await Promise.all([
    prisma.amenity.create({
      data: { slug: 'piscina', name: 'Piscina', icon: '🏊' },
    }),
    prisma.amenity.create({
      data: { slug: 'academia', name: 'Academia', icon: '🏋️' },
    }),
    prisma.amenity.create({
      data: { slug: 'churrasqueira', name: 'Churrasqueira', icon: '🔥' },
    }),
    prisma.amenity.create({
      data: { slug: 'playground', name: 'Playground', icon: '🛝' },
    }),
    prisma.amenity.create({
      data: { slug: 'portaria-24h', name: 'Portaria 24h', icon: '🛡️' },
    }),
    prisma.amenity.create({
      data: { slug: 'elevador', name: 'Elevador', icon: '🛗' },
    }),
    prisma.amenity.create({
      data: { slug: 'salao-festas', name: 'Salão de Festas', icon: '🎉' },
    }),
    prisma.amenity.create({
      data: { slug: 'quadra-esportiva', name: 'Quadra Esportiva', icon: '🏀' },
    }),
  ]);

  console.log(`   ✅ ${amenities.length} comodidades criadas`);

  // -------------------------------------------------------------------------
  // 5. PLANOS DE ANÚNCIO
  // -------------------------------------------------------------------------
  console.log('\n📋 Criando planos de anúncio...');

  const planos = await Promise.all([
    prisma.listingPlan.create({
      data: {
        type: 'FREE',
        name: 'Gratuito',
        description: 'Anúncio básico com até 5 fotos.',
        price: 0,
        duration: 30,
        maxPhotos: 5,
        maxVideos: 0,
      },
    }),
    prisma.listingPlan.create({
      data: {
        type: 'STANDARD',
        name: 'Padrão',
        description: 'Anúncio padrão com até 20 fotos.',
        price: 4990,
        duration: 60,
        maxPhotos: 20,
        maxVideos: 1,
        featuredInSearch: true,
      },
    }),
    prisma.listingPlan.create({
      data: {
        type: 'FEATURED',
        name: 'Destaque',
        description: 'Aparece no topo das buscas.',
        price: 9990,
        duration: 30,
        maxPhotos: 30,
        maxVideos: 2,
        featuredInSearch: true,
        badge: 'DESTAQUE',
      },
    }),
    prisma.listingPlan.create({
      data: {
        type: 'PREMIUM',
        name: 'Premium',
        description: 'Anúncio premium com tour virtual.',
        price: 19990,
        duration: 30,
        maxPhotos: 50,
        maxVideos: 5,
        allowVirtualTour: true,
        featuredInSearch: true,
        badge: 'PREMIUM',
      },
    }),
    prisma.listingPlan.create({
      data: {
        type: 'SUPER',
        name: 'Super Destaque',
        description: 'Máxima visibilidade: homepage + topo + cor especial.',
        price: 39990,
        duration: 30,
        maxPhotos: 50,
        maxVideos: 10,
        allowVirtualTour: true,
        featuredInSearch: true,
        featuredInHomepage: true,
        highlightColor: '#FFD700',
        badge: 'SUPER',
      },
    }),
  ]);

  console.log(`   ✅ ${planos.length} planos criados`);

  // -------------------------------------------------------------------------
  // 6. IMÓVEIS
  // -------------------------------------------------------------------------
  console.log('\n🏠 Criando imóveis...');

  // --- Imóveis da Imobiliária ---
  const apto1 = await prisma.property.create({
    data: {
      createdById: imobiliaria.id,
      status: 'ACTIVE',
      purpose: 'SALE',
      type: 'APARTMENT',
      title: 'Apartamento 3 quartos no Jardins com varanda gourmet',
      slug: slugify(
        'Apartamento 3 quartos no Jardins com varanda gourmet',
        'x7k2m9',
      ),
      description:
        'Lindo apartamento em localização privilegiada nos Jardins. 3 dormitórios sendo 1 suíte, varanda gourmet com churrasqueira, 2 vagas. Condomínio com piscina, academia e portaria 24h. Pronto para morar.',
      price: 145000000, // R$ 1.450.000
      condominiumFee: 120000, // R$ 1.200
      iptuYearly: 840000, // R$ 8.400
      areaM2: 130,
      builtArea: 110,
      bedrooms: 3,
      suites: 1,
      bathrooms: 3,
      garageSpots: 2,
      floor: 8,
      totalFloors: 18,
      yearBuilt: 2018,
      furnished: false,
      petFriendly: true,
      city: 'São Paulo',
      state: 'SP',
      district: 'Jardins',
      street: 'Rua Oscar Freire',
      streetNumber: '1200',
      zipcode: '01426-001',
      latitude: -23.563,
      longitude: -46.6553,
      acceptsFinancing: true,
      isReadyToMove: true,
      isFeatured: true,
      listingPlan: 'FEATURED',
      publishedAt: new Date('2024-10-01'),
      metaTitle: 'Apartamento 3 quartos nos Jardins - R$ 1.450.000',
      metaDescription:
        'Apartamento 130m² com varanda gourmet, 3 quartos, 2 vagas nos Jardins - SP',
      viewsCount: 1243,
      uniqueViewsCount: 876,
      leadsCount: 18,
      contactPhone: imobiliaria.phone,
      contactWhatsApp: imobiliaria.phone,
    },
  });

  const apto2 = await prisma.property.create({
    data: {
      createdById: imobiliaria.id,
      status: 'ACTIVE',
      purpose: 'RENT',
      type: 'APARTMENT',
      title: 'Studio moderno no Itaim Bibi mobiliado',
      slug: slugify('Studio moderno no Itaim Bibi mobiliado', 'a3b7n1'),
      description:
        'Studio completamente mobiliado e equipado no coração do Itaim Bibi. Ideal para executivos. Inclui smart TV, ar-condicionado, linha branca completa. Condomínio com academia e coworking.',
      price: 450000, // R$ 4.500/mês
      condominiumFee: 90000, // R$ 900
      areaM2: 42,
      builtArea: 38,
      bedrooms: 1,
      suites: 1,
      bathrooms: 1,
      garageSpots: 1,
      floor: 12,
      totalFloors: 22,
      yearBuilt: 2021,
      furnished: true,
      petFriendly: false,
      city: 'São Paulo',
      state: 'SP',
      district: 'Itaim Bibi',
      street: 'Rua Funchal',
      zipcode: '04551-060',
      latitude: -23.5877,
      longitude: -46.6823,
      acceptsFinancing: false,
      isReadyToMove: true,
      listingPlan: 'STANDARD',
      publishedAt: new Date('2024-11-15'),
      viewsCount: 567,
      uniqueViewsCount: 412,
      leadsCount: 9,
      contactPhone: imobiliaria.phone,
    },
  });

  const casa1 = await prisma.property.create({
    data: {
      createdById: imobiliaria.id,
      status: 'ACTIVE',
      purpose: 'SALE',
      type: 'HOUSE',
      title: 'Casa 4 quartos em condomínio fechado Alphaville',
      slug: slugify(
        'Casa 4 quartos em condomínio fechado Alphaville',
        'p9q2r4',
      ),
      description:
        'Ampla casa em condomínio fechado de alto padrão em Alphaville. 4 suítes, piscina privativa, área gourmet, jardim, 4 vagas. Condomínio com clube, quadras e segurança 24h.',
      price: 380000000, // R$ 3.800.000
      condominiumFee: 300000, // R$ 3.000
      iptuYearly: 1200000, // R$ 12.000
      areaM2: 600,
      builtArea: 420,
      bedrooms: 4,
      suites: 4,
      bathrooms: 6,
      garageSpots: 4,
      yearBuilt: 2019,
      furnished: false,
      petFriendly: true,
      city: 'Barueri',
      state: 'SP',
      district: 'Alphaville',
      zipcode: '06474-140',
      latitude: -23.4969,
      longitude: -46.8499,
      acceptsFinancing: true,
      acceptsExchange: true,
      isReadyToMove: true,
      isFeatured: true,
      listingPlan: 'PREMIUM',
      publishedAt: new Date('2024-09-01'),
      viewsCount: 2100,
      uniqueViewsCount: 1540,
      leadsCount: 35,
      contactPhone: imobiliaria.phone,
      contactWhatsApp: imobiliaria.phone,
    },
  });

  // --- Imóveis do Corretor ---
  const apto3 = await prisma.property.create({
    data: {
      createdById: corretor.id,
      status: 'ACTIVE',
      purpose: 'SALE',
      type: 'APARTMENT',
      title: 'Cobertura 3 quartos com piscina privativa no Leblon',
      slug: slugify(
        'Cobertura 3 quartos com piscina privativa no Leblon',
        'm5n8k3',
      ),
      description:
        'Cobertura duplex única no Leblon com piscina privativa e vista para o mar. 3 suítes, home theater, 4 vagas. Acabamento de altíssimo padrão. Oportunidade única.',
      price: 850000000, // R$ 8.500.000
      condominiumFee: 480000, // R$ 4.800
      iptuYearly: 3600000,
      areaM2: 320,
      builtArea: 280,
      bedrooms: 3,
      suites: 3,
      bathrooms: 5,
      garageSpots: 4,
      floor: 22,
      totalFloors: 22,
      yearBuilt: 2016,
      furnished: true,
      petFriendly: true,
      city: 'Rio de Janeiro',
      state: 'RJ',
      district: 'Leblon',
      street: 'Rua Dias Ferreira',
      zipcode: '22431-050',
      latitude: -22.9841,
      longitude: -43.2298,
      acceptsFinancing: false,
      isReadyToMove: true,
      isFeatured: true,
      listingPlan: 'SUPER',
      publishedAt: new Date('2024-08-01'),
      viewsCount: 5400,
      uniqueViewsCount: 3200,
      leadsCount: 22,
      contactPhone: corretor.phone,
      contactWhatsApp: corretor.phone,
    },
  });

  const apto4 = await prisma.property.create({
    data: {
      createdById: corretor.id,
      status: 'ACTIVE',
      purpose: 'SALE',
      type: 'APARTMENT',
      title: 'Apartamento 2 quartos em Ipanema próximo à praia',
      slug: slugify(
        'Apartamento 2 quartos em Ipanema próximo à praia',
        'v6w1t7',
      ),
      description:
        'Apartamento bem localizado em Ipanema, a 3 quadras da praia. 2 quartos, 1 suíte, 1 vaga. Andar alto com vista parcial para o mar. Ótimo para investimento ou moradia.',
      price: 230000000, // R$ 2.300.000
      condominiumFee: 180000, // R$ 1.800
      iptuYearly: 960000,
      areaM2: 90,
      builtArea: 82,
      bedrooms: 2,
      suites: 1,
      bathrooms: 2,
      garageSpots: 1,
      floor: 10,
      totalFloors: 14,
      yearBuilt: 2008,
      furnished: false,
      petFriendly: false,
      city: 'Rio de Janeiro',
      state: 'RJ',
      district: 'Ipanema',
      zipcode: '22420-030',
      latitude: -22.9845,
      longitude: -43.1986,
      acceptsFinancing: true,
      isReadyToMove: true,
      listingPlan: 'STANDARD',
      publishedAt: new Date('2024-12-01'),
      viewsCount: 890,
      uniqueViewsCount: 650,
      leadsCount: 11,
      contactPhone: corretor.phone,
    },
  });

  // --- Imóvel da Proprietária ---
  const aptoProprietario = await prisma.property.create({
    data: {
      createdById: proprietario.id,
      status: 'ACTIVE',
      purpose: 'SALE',
      type: 'APARTMENT',
      title: 'Apartamento 2 quartos em Moema sem condomínio',
      slug: slugify('Apartamento 2 quartos em Moema sem condomínio', 'c4d9e2'),
      description:
        'Vendo apartamento que foi minha residência por 10 anos. Muito bem conservado, 2 dormitórios, 1 banheiro social, 1 vaga. Sem condomínio (prédio antigo). Aceito proposta.',
      price: 65000000, // R$ 650.000
      iptuYearly: 360000, // R$ 3.600
      areaM2: 78,
      builtArea: 72,
      bedrooms: 2,
      suites: 0,
      bathrooms: 1,
      garageSpots: 1,
      floor: 3,
      totalFloors: 8,
      yearBuilt: 1985,
      furnished: false,
      petFriendly: true,
      city: 'São Paulo',
      state: 'SP',
      district: 'Moema',
      zipcode: '04077-020',
      latitude: -23.6016,
      longitude: -46.6693,
      acceptsFinancing: true,
      acceptsExchange: true,
      isReadyToMove: true,
      listingPlan: 'FREE',
      publishedAt: new Date('2025-01-10'),
      viewsCount: 234,
      uniqueViewsCount: 198,
      leadsCount: 7,
      contactPhone: proprietario.phone,
      contactWhatsApp: proprietario.phone,
    },
  });

  // --- Imóvel DRAFT (não publicado) ---
  const aptoDraft = await prisma.property.create({
    data: {
      createdById: imobiliaria.id,
      status: 'DRAFT',
      purpose: 'RENT',
      type: 'COMMERCIAL',
      title: 'Laje corporativa 500m² na Av. Paulista',
      slug: slugify('Laje corporativa 500m2 na Av. Paulista', 'z1y8x5'),
      description: 'Laje corporativa em edifício triple A na Avenida Paulista.',
      price: 5500000, // R$ 55.000/mês
      condominiumFee: 900000,
      areaM2: 500,
      builtArea: 480,
      garageSpots: 10,
      floor: 15,
      totalFloors: 28,
      city: 'São Paulo',
      state: 'SP',
      district: 'Bela Vista',
      street: 'Av. Paulista',
      zipcode: '01310-100',
      listingPlan: 'FREE',
    },
  });

  console.log(`   ✅ ${apto1.title}`);
  console.log(`   ✅ ${apto2.title}`);
  console.log(`   ✅ ${casa1.title}`);
  console.log(`   ✅ ${apto3.title}`);
  console.log(`   ✅ ${apto4.title}`);
  console.log(`   ✅ ${aptoProprietario.title}`);
  console.log(`   ✅ ${aptoDraft.title} [DRAFT]`);

  // -------------------------------------------------------------------------
  // 6b. BULK TEST LISTINGS (50 imóveis para paginação e filtros)
  // -------------------------------------------------------------------------
  console.log('\n🏘️  Criando 50 imóveis de teste em lote...');
  console.log(
    '   ℹ️  Defina SEED_OWNER_KEYCLOAK_ID=<uuid> no .env do backend para que',
  );
  console.log(
    '       esses imóveis apareçam no painel do seu usuário Keycloak.\n',
  );

  const seedOwnerKeycloakId =
    process.env.SEED_OWNER_KEYCLOAK_ID ??
    '03916ee1-861e-45d5-85cd-11635d42b4d4';

  const seedOwner = await prisma.user.create({
    data: {
      keycloakId: seedOwnerKeycloakId,
      email: 'seed.bulk@nexo-dev.local',
      name: 'Dev Bulk Tester',
      isActive: true,
      advertiserType: 'OWNER',
    },
  });

  const bulkCities = [
    { city: 'São Paulo', state: 'SP', district: 'Jardins' },
    { city: 'São Paulo', state: 'SP', district: 'Moema' },
    { city: 'São Paulo', state: 'SP', district: 'Pinheiros' },
    { city: 'São Paulo', state: 'SP', district: 'Itaim Bibi' },
    { city: 'São Paulo', state: 'SP', district: 'Vila Madalena' },
    { city: 'Rio de Janeiro', state: 'RJ', district: 'Ipanema' },
    { city: 'Rio de Janeiro', state: 'RJ', district: 'Leblon' },
    { city: 'Rio de Janeiro', state: 'RJ', district: 'Copacabana' },
    { city: 'Rio de Janeiro', state: 'RJ', district: 'Botafogo' },
    { city: 'Belo Horizonte', state: 'MG', district: 'Savassi' },
    { city: 'Belo Horizonte', state: 'MG', district: 'Lourdes' },
    { city: 'Curitiba', state: 'PR', district: 'Batel' },
    { city: 'Curitiba', state: 'PR', district: 'Água Verde' },
    { city: 'Porto Alegre', state: 'RS', district: 'Moinhos de Vento' },
    { city: 'Florianópolis', state: 'SC', district: 'Centro' },
  ] as const;

  type BulkStatus = 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'SOLD' | 'RENTED';
  type BulkPurpose = 'SALE' | 'RENT';
  type BulkType =
    | 'APARTMENT'
    | 'HOUSE'
    | 'STUDIO'
    | 'CONDO_HOUSE'
    | 'LAND'
    | 'COMMERCIAL';

  interface BulkSpec {
    title: string;
    type: BulkType;
    purpose: BulkPurpose;
    status: BulkStatus;
    price: number;
    areaM2: number;
    bedrooms?: number;
    bathrooms?: number;
    garageSpots?: number;
  }

  const bulkSpecs: BulkSpec[] = [
    // ── SALE · APARTMENT (17) ───────────────────────────────────────────────
    {
      title: 'Apartamento 1 quarto compacto',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 28000000,
      areaM2: 45,
      bedrooms: 1,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Apartamento 2 quartos com vista',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 52000000,
      areaM2: 72,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 1,
    },
    {
      title: 'Apartamento 3 quartos alto padrão',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 89000000,
      areaM2: 100,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Cobertura duplex com terraço',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 175000000,
      areaM2: 200,
      bedrooms: 4,
      bathrooms: 4,
      garageSpots: 3,
    },
    {
      title: 'Studio moderno próximo ao metrô',
      type: 'STUDIO',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 24000000,
      areaM2: 38,
      bedrooms: 1,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Apartamento reformado 2 quartos',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 45000000,
      areaM2: 68,
      bedrooms: 2,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Apartamento 4 suítes luxuoso',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 230000000,
      areaM2: 180,
      bedrooms: 4,
      bathrooms: 4,
      garageSpots: 4,
    },
    {
      title: 'Kitnet bem localizada',
      type: 'STUDIO',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 18500000,
      areaM2: 28,
      bedrooms: 1,
      bathrooms: 1,
    },
    {
      title: 'Apartamento garden com quintal privativo',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 67000000,
      areaM2: 90,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 2,
    },
    {
      title: 'Apê 2 quartos em condomínio clube',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 58000000,
      areaM2: 76,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 2,
    },
    {
      title: 'Apartamento 3 quartos 2 suítes',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 112000000,
      areaM2: 120,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Loft industrial reformado',
      type: 'STUDIO',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 35000000,
      areaM2: 55,
      bedrooms: 1,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Apartamento 2 quartos perto do parque',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 48000000,
      areaM2: 65,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 1,
    },
    {
      title: 'Apê novo em prédio com lazer completo',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 74000000,
      areaM2: 85,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 2,
    },
    {
      title: 'Cobertura 3 quartos vista panorâmica',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 145000000,
      areaM2: 160,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 3,
    },
    {
      title: 'Apartamento padrão médio 2 quartos',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 36000000,
      areaM2: 60,
      bedrooms: 2,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Apartamento alto padrão 1 suíte',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 62000000,
      areaM2: 78,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 1,
    },
    // ── SALE · HOUSE / CONDO_HOUSE (10) ─────────────────────────────────────
    {
      title: 'Casa 3 quartos com quintal',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 65000000,
      areaM2: 150,
      bedrooms: 3,
      bathrooms: 2,
      garageSpots: 2,
    },
    {
      title: 'Casa em condomínio fechado',
      type: 'CONDO_HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 120000000,
      areaM2: 200,
      bedrooms: 4,
      bathrooms: 4,
      garageSpots: 3,
    },
    {
      title: 'Casa térrea ampla 4 quartos',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 85000000,
      areaM2: 180,
      bedrooms: 4,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Sobrado 3 quartos rua tranquila',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 72000000,
      areaM2: 160,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Casa luxuosa com piscina e churrasqueira',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 220000000,
      areaM2: 350,
      bedrooms: 5,
      bathrooms: 5,
      garageSpots: 4,
    },
    {
      title: 'Casa geminada 2 quartos',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 39000000,
      areaM2: 90,
      bedrooms: 2,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Casa nova em condomínio clube',
      type: 'CONDO_HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 95000000,
      areaM2: 160,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Casa 3 suítes próxima ao comércio',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 78000000,
      areaM2: 170,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Sobrado moderno 4 quartos',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 110000000,
      areaM2: 210,
      bedrooms: 4,
      bathrooms: 4,
      garageSpots: 2,
    },
    {
      title: 'Casa simples 2 quartos boa localização',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 32000000,
      areaM2: 80,
      bedrooms: 2,
      bathrooms: 1,
      garageSpots: 1,
    },
    // ── SALE · LAND / COMMERCIAL (3) ─────────────────────────────────────────
    {
      title: 'Terreno 450m² em condomínio',
      type: 'LAND',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 38000000,
      areaM2: 450,
    },
    {
      title: 'Sala comercial 50m² edifício corporativo',
      type: 'COMMERCIAL',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 42000000,
      areaM2: 50,
    },
    {
      title: 'Terreno plano 600m²',
      type: 'LAND',
      purpose: 'SALE',
      status: 'ACTIVE',
      price: 55000000,
      areaM2: 600,
    },
    // ── RENT · APARTMENT / STUDIO (8) ────────────────────────────────────────
    {
      title: 'Apartamento 1 quarto para locação',
      type: 'APARTMENT',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 180000,
      areaM2: 45,
      bedrooms: 1,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Apartamento mobiliado 2 quartos',
      type: 'APARTMENT',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 350000,
      areaM2: 70,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 1,
    },
    {
      title: 'Studio mobiliado perto do metrô',
      type: 'STUDIO',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 120000,
      areaM2: 35,
      bedrooms: 1,
      bathrooms: 1,
    },
    {
      title: 'Apartamento 3 quartos para família',
      type: 'APARTMENT',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 520000,
      areaM2: 90,
      bedrooms: 3,
      bathrooms: 2,
      garageSpots: 2,
    },
    {
      title: 'Flat executivo para temporada',
      type: 'STUDIO',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 280000,
      areaM2: 42,
      bedrooms: 1,
      bathrooms: 1,
      garageSpots: 1,
    },
    {
      title: 'Apartamento alto padrão para locação',
      type: 'APARTMENT',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 980000,
      areaM2: 130,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Kitnet central bem localizada',
      type: 'STUDIO',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 95000,
      areaM2: 25,
      bedrooms: 1,
      bathrooms: 1,
    },
    {
      title: 'Sala comercial pronta para uso',
      type: 'COMMERCIAL',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 220000,
      areaM2: 60,
    },
    // ── RENT · HOUSE (2) ─────────────────────────────────────────────────────
    {
      title: 'Casa 3 quartos com jardim para locação',
      type: 'HOUSE',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 450000,
      areaM2: 140,
      bedrooms: 3,
      bathrooms: 2,
      garageSpots: 2,
    },
    {
      title: 'Casa em condomínio para locação',
      type: 'CONDO_HOUSE',
      purpose: 'RENT',
      status: 'ACTIVE',
      price: 580000,
      areaM2: 160,
      bedrooms: 3,
      bathrooms: 3,
      garageSpots: 2,
    },
    // ── DRAFT (5) ────────────────────────────────────────────────────────────
    {
      title: 'Apartamento novo sem fotos rascunho',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'DRAFT',
      price: 55000000,
      areaM2: 75,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 1,
    },
    {
      title: 'Casa 4 quartos em construção rascunho',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'DRAFT',
      price: 92000000,
      areaM2: 180,
      bedrooms: 4,
      bathrooms: 3,
      garageSpots: 2,
    },
    {
      title: 'Terreno bairro nobre rascunho',
      type: 'LAND',
      purpose: 'SALE',
      status: 'DRAFT',
      price: 44000000,
      areaM2: 500,
    },
    {
      title: 'Studio aluguel aguardando fotos',
      type: 'STUDIO',
      purpose: 'RENT',
      status: 'DRAFT',
      price: 130000,
      areaM2: 32,
      bedrooms: 1,
      bathrooms: 1,
    },
    {
      title: 'Apartamento 2q revisão de informações',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'DRAFT',
      price: 42000000,
      areaM2: 62,
      bedrooms: 2,
      bathrooms: 1,
      garageSpots: 1,
    },
    // ── INACTIVE (3) ─────────────────────────────────────────────────────────
    {
      title: 'Apartamento pausado temporariamente',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'INACTIVE',
      price: 67000000,
      areaM2: 85,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 1,
    },
    {
      title: 'Casa anúncio suspenso para reforma',
      type: 'HOUSE',
      purpose: 'SALE',
      status: 'INACTIVE',
      price: 88000000,
      areaM2: 160,
      bedrooms: 3,
      bathrooms: 2,
      garageSpots: 2,
    },
    {
      title: 'Studio aluguel pausado',
      type: 'STUDIO',
      purpose: 'RENT',
      status: 'INACTIVE',
      price: 110000,
      areaM2: 30,
      bedrooms: 1,
      bathrooms: 1,
    },
    // ── SOLD / RENTED (2) ────────────────────────────────────────────────────
    {
      title: 'Apartamento vendido histórico',
      type: 'APARTMENT',
      purpose: 'SALE',
      status: 'SOLD',
      price: 72000000,
      areaM2: 80,
      bedrooms: 2,
      bathrooms: 2,
      garageSpots: 1,
    },
    {
      title: 'Casa alugada contrato vigente',
      type: 'HOUSE',
      purpose: 'RENT',
      status: 'RENTED',
      price: 420000,
      areaM2: 120,
      bedrooms: 3,
      bathrooms: 2,
      garageSpots: 1,
    },
  ];

  // Distribui planos de forma realista: ~30% FREE, ~40% STANDARD, ~20% FEATURED, ~7% PREMIUM, ~3% SUPER
  const BULK_PLANS = [
    'FREE',
    'STANDARD',
    'STANDARD',
    'FEATURED',
    'STANDARD',
    'FREE',
    'STANDARD',
    'FEATURED',
    'PREMIUM',
    'SUPER',
  ] as const;

  const bulkProperties = await prisma.property.createManyAndReturn({
    data: bulkSpecs.map((spec, i) => {
      const loc = bulkCities[i % bulkCities.length];
      const plan = BULK_PLANS[i % BULK_PLANS.length];
      return {
        createdById: seedOwner.id,
        status: spec.status,
        purpose: spec.purpose,
        type: spec.type,
        title: spec.title,
        slug: slugify(spec.title, `bulk-${i + 1}`),
        description: `Imóvel de teste gerado automaticamente pelo seed. Localizado em ${loc.district}, ${loc.city} - ${loc.state}.`,
        price: spec.price,
        areaM2: spec.areaM2,
        bedrooms: spec.bedrooms,
        bathrooms: spec.bathrooms,
        garageSpots: spec.garageSpots,
        city: loc.city,
        state: loc.state,
        district: loc.district,
        publishedAt: spec.status === 'ACTIVE' ? new Date() : undefined,
        viewsCount: Math.floor(Math.random() * 800),
        uniqueViewsCount: Math.floor(Math.random() * 500),
        listingPlan: plan,
        isFeatured:
          plan === 'FEATURED' || plan === 'PREMIUM' || plan === 'SUPER',
        acceptsFinancing: spec.purpose === 'SALE',
        isReadyToMove: spec.status === 'ACTIVE',
      };
    }),
  });

  console.log(
    `   ✅ ${bulkSpecs.length} imóveis criados (keycloakId: ${seedOwnerKeycloakId})`,
  );

  // Adiciona 3 fotos + 1 vídeo (a cada 5 imóveis) para cada imóvel em lote
  const BULK_PHOTO_SEEDS = [
    ['architecture', 'living-room-01', 'bedroom-01'],
    ['house-01', 'kitchen-01', 'bathroom-01'],
    ['apartment-01', 'balcony-01', 'hall-01'],
    ['condo-01', 'pool-01', 'facade-01'],
    ['studio-01', 'open-plan-01', 'window-01'],
  ];

  // Vídeos de amostra do Google CDN — sempre disponíveis, sem autenticação
  const BULK_VIDEO_URLS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  ];

  await prisma.propertyMedia.createMany({
    data: bulkProperties.flatMap((prop, i) => {
      const seeds = BULK_PHOTO_SEEDS[i % BULK_PHOTO_SEEDS.length];
      const photos = seeds.map((seed, order) => ({
        propertyId: prop.id,
        type: 'IMAGE' as const,
        url: `https://picsum.photos/seed/nexo-${seed}-${i}/1200/800`,
        publicId: `seed/bulk-${i + 1}-photo-${order}`,
        order,
      }));
      // Adiciona 1 vídeo a cada 5 imóveis (índices 0, 5, 10, 15, …)
      const videoEntry =
        i % 5 === 0
          ? [
              {
                propertyId: prop.id,
                type: 'VIDEO' as const,
                url: BULK_VIDEO_URLS[
                  Math.floor(i / 5) % BULK_VIDEO_URLS.length
                ],
                publicId: `seed/bulk-${i + 1}-video`,
                order: seeds.length, // depois das fotos
              },
            ]
          : [];
      return [...photos, ...videoEntry];
    }),
  });

  const bulkVideoCount = bulkProperties.filter((_, i) => i % 5 === 0).length;
  console.log(
    `   📷 ${bulkProperties.length * 3} fotos + 🎬 ${bulkVideoCount} vídeos adicionados aos imóveis em lote`,
  );

  // -------------------------------------------------------------------------
  // 7. MÍDIAS DOS IMÓVEIS (fotos + vídeos)
  // -------------------------------------------------------------------------
  console.log('\n📸 Adicionando mídias (fotos e vídeos)...');

  await prisma.propertyMedia.createMany({
    data: [
      // ── Apê Jardins ──────────────────────────────────────────────────────
      {
        propertyId: apto1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-sala-jardins/1200/800',
        publicId: 'seed/apto1-sala-jardins',
        order: 0, // capa
      },
      {
        propertyId: apto1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-quarto-principal/1200/800',
        publicId: 'seed/apto1-quarto-principal',
        order: 1,
      },
      {
        propertyId: apto1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-varanda-gourmet/1200/800',
        publicId: 'seed/apto1-varanda-gourmet',
        order: 2,
      },
      {
        propertyId: apto1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-cozinha-01/1200/800',
        publicId: 'seed/apto1-cozinha',
        order: 3,
      },
      // ── Studio Itaim ─────────────────────────────────────────────────────
      {
        propertyId: apto2.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-studio-itaim/1200/800',
        publicId: 'seed/apto2-studio-itaim',
        order: 0, // capa
      },
      {
        propertyId: apto2.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-banheiro-01/1200/800',
        publicId: 'seed/apto2-banheiro',
        order: 1,
      },
      // ── Casa Alphaville ──────────────────────────────────────────────────
      {
        propertyId: casa1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-fachada-casa/1200/800',
        publicId: 'seed/casa1-fachada',
        order: 0, // capa
      },
      {
        propertyId: casa1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-piscina-01/1200/800',
        publicId: 'seed/casa1-piscina',
        order: 1,
      },
      {
        propertyId: casa1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-sala-grande/1200/800',
        publicId: 'seed/casa1-sala-grande',
        order: 2,
      },
      {
        propertyId: casa1.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-suite-master/1200/800',
        publicId: 'seed/casa1-suite-master',
        order: 3,
      },
      // ── Cobertura Leblon ─────────────────────────────────────────────────
      {
        propertyId: apto3.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-vista-mar/1200/800',
        publicId: 'seed/apto3-vista-mar',
        order: 0, // capa
      },
      {
        propertyId: apto3.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-piscina-privativa/1200/800',
        publicId: 'seed/apto3-piscina-privativa',
        order: 1,
      },
      {
        propertyId: apto3.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-sala-leblon/1200/800',
        publicId: 'seed/apto3-sala-leblon',
        order: 2,
      },
      {
        // Vídeo de tour virtual — Big Buck Bunny (Google CDN, sempre disponível)
        propertyId: apto3.id,
        type: 'VIDEO',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        publicId: 'seed/apto3-tour-virtual',
        order: 3,
      },
      // ── Apê Ipanema ──────────────────────────────────────────────────────
      {
        propertyId: apto4.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-sala-ipanema/1200/800',
        publicId: 'seed/apto4-sala-ipanema',
        order: 0, // capa
      },
      {
        propertyId: apto4.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-vista-parcial/1200/800',
        publicId: 'seed/apto4-vista-parcial',
        order: 1,
      },
      // ── Apê Moema (proprietário) ──────────────────────────────────────────
      {
        propertyId: aptoProprietario.id,
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/nexo-sala-moema/1200/800',
        publicId: 'seed/aptoProprietario-sala-moema',
        order: 0, // capa
      },
      // aptoDraft — sem mídia (draft recém-criado, ainda sem fotos)
    ],
  });

  console.log(
    '   ✅ 17 mídias adicionadas aos imóveis nomeados (16 imagens + 1 vídeo)',
  );

  // -------------------------------------------------------------------------
  // 8. COMODIDADES DOS IMÓVEIS
  // -------------------------------------------------------------------------
  console.log('\n🏊 Vinculando comodidades...');

  const [piscina, academia, churrasqueira, playground, portaria, elevador] =
    amenities;

  await prisma.propertyAmenity.createMany({
    data: [
      // Apê Jardins: piscina, academia, churrasqueira, portaria, elevador
      { propertyId: apto1.id, amenityId: piscina.id },
      { propertyId: apto1.id, amenityId: academia.id },
      { propertyId: apto1.id, amenityId: churrasqueira.id },
      { propertyId: apto1.id, amenityId: portaria.id },
      { propertyId: apto1.id, amenityId: elevador.id },
      // Casa Alphaville: tudo
      { propertyId: casa1.id, amenityId: piscina.id },
      { propertyId: casa1.id, amenityId: academia.id },
      { propertyId: casa1.id, amenityId: churrasqueira.id },
      { propertyId: casa1.id, amenityId: playground.id },
      { propertyId: casa1.id, amenityId: portaria.id },
      // Cobertura Leblon: piscina, portaria
      { propertyId: apto3.id, amenityId: piscina.id },
      { propertyId: apto3.id, amenityId: portaria.id },
      // Studio: academia, portaria, elevador
      { propertyId: apto2.id, amenityId: academia.id },
      { propertyId: apto2.id, amenityId: portaria.id },
      { propertyId: apto2.id, amenityId: elevador.id },
    ],
  });

  console.log('   ✅ Comodidades vinculadas');

  // -------------------------------------------------------------------------
  // 9. LEADS
  // -------------------------------------------------------------------------
  console.log('\n📬 Criando leads...');

  await prisma.lead.createMany({
    data: [
      {
        propertyId: apto1.id,
        status: 'NEW',
        name: 'Fernanda Costa',
        email: 'fernanda.costa@email.com',
        phone: '11944444444',
        message:
          'Tenho interesse no apartamento. Poderia agendar uma visita para o próximo sábado?',
        source: 'portal',
      },
      {
        propertyId: casa1.id,
        status: 'CONTACTED',
        name: 'Ricardo Nunes',
        email: 'ricnunes@empresa.com',
        phone: '11955555555',
        message:
          'Quero mais informações sobre a casa. Aceita permutar por apartamento em São Paulo?',
        source: 'portal',
        assignedToId: admin.id,
      },
      {
        propertyId: apto3.id,
        status: 'QUALIFIED',
        name: 'Sultão Al-Rashid',
        email: 'sultan@email.ae',
        phone: '11966666666',
        message:
          'I am interested in this property. Can you send me more details, please?',
        source: 'featured',
      },
      {
        propertyId: aptoProprietario.id,
        status: 'NEW',
        name: 'Patricia Diniz',
        email: 'patricia@gmail.com',
        phone: '11977777777',
        message: 'Quero visitar o apartamento. Tenho FGTS disponível.',
        source: 'portal',
      },
    ],
  });

  console.log('   ✅ 4 leads criados');

  // -------------------------------------------------------------------------
  // 10. CONVERSAS E MENSAGENS
  // -------------------------------------------------------------------------
  console.log('\n💬 Criando conversas...');

  const conversa1 = await prisma.conversation.create({
    data: {
      propertyId: apto1.id,
      customerId: clienteJoao.id,
      userId: imobiliaria.id,
      lastMessage: 'Olá! O apartamento ainda está disponível?',
      lastMessageAt: new Date('2025-01-20T10:30:00'),
      lastMessageBy: 'customer',
      isRead: false,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversa1.id,
        senderType: 'customer',
        customerId: clienteJoao.id,
        content: 'Olá! O apartamento ainda está disponível?',
        status: 'READ',
        createdAt: new Date('2025-01-20T10:30:00'),
      },
      {
        conversationId: conversa1.id,
        senderType: 'advertiser',
        userId: imobiliaria.id,
        content:
          'Olá, João! Sim, está disponível. Gostaria de agendar uma visita?',
        status: 'DELIVERED',
        createdAt: new Date('2025-01-20T11:00:00'),
      },
      {
        conversationId: conversa1.id,
        senderType: 'customer',
        customerId: clienteJoao.id,
        content: 'Olá! O apartamento ainda está disponível?',
        status: 'READ',
        createdAt: new Date('2025-01-20T10:30:00'),
      },
    ],
  });

  const conversa2 = await prisma.conversation.create({
    data: {
      propertyId: apto3.id,
      customerId: clienteAna.id,
      userId: corretor.id,
      lastMessage: 'Seria possível visitar no próximo fim de semana?',
      lastMessageAt: new Date('2025-01-22T15:00:00'),
      lastMessageBy: 'customer',
      isRead: false,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversa2.id,
        senderType: 'customer',
        customerId: clienteAna.id,
        content:
          'Boa tarde, Carlos! Vi a cobertura no portal e fiquei muito interessada.',
        status: 'READ',
        createdAt: new Date('2025-01-22T14:00:00'),
      },
      {
        conversationId: conversa2.id,
        senderType: 'advertiser',
        userId: corretor.id,
        content:
          'Olá, Ana! Que ótimo! A cobertura é realmente um imóvel único. Posso te passar mais detalhes?',
        status: 'READ',
        createdAt: new Date('2025-01-22T14:30:00'),
      },
      {
        conversationId: conversa2.id,
        senderType: 'customer',
        customerId: clienteAna.id,
        content: 'Seria possível visitar no próximo fim de semana?',
        status: 'DELIVERED',
        createdAt: new Date('2025-01-22T15:00:00'),
      },
    ],
  });

  console.log('   ✅ 2 conversas com mensagens criadas');

  // -------------------------------------------------------------------------
  // 11. AVALIAÇÕES
  // -------------------------------------------------------------------------
  console.log('\n⭐ Criando avaliações...');

  await prisma.review.createMany({
    data: [
      {
        userId: corretor.id,
        customerId: clienteJoao.id,
        rating: 5,
        title: 'Excelente corretor!',
        comment:
          'Carlos foi muito atencioso e profissional. Me ajudou a encontrar o imóvel ideal dentro do meu orçamento. Super recomendo!',
        isVerified: true,
        isPublished: true,
      },
      {
        propertyId: apto1.id,
        customerId: clienteAna.id,
        rating: 4,
        title: 'Apartamento muito bem conservado',
        comment:
          'Visitei o apartamento e ficou acima das expectativas. Localização ótima e acabamento de qualidade. Só achei o preço um pouco alto para o metro quadrado.',
        isVerified: true,
        isPublished: true,
      },
    ],
  });

  console.log('   ✅ 2 avaliações criadas');

  // -------------------------------------------------------------------------
  // 12. VISITA AGENDADA
  // -------------------------------------------------------------------------
  console.log('\n🗓️ Criando visita...');

  await prisma.visit.create({
    data: {
      propertyId: apto1.id,
      customerId: clienteJoao.id,
      status: 'SCHEDULED',
      name: clienteJoao.name!,
      email: clienteJoao.email!,
      phone: clienteJoao.phone!,
      scheduledDate: new Date('2025-02-28T10:00:00'),
      notes: 'Cliente prefere visitar pela manhã. Tem carro para ver a vaga.',
    },
  });

  console.log('   ✅ 1 visita agendada');

  // -------------------------------------------------------------------------
  // 13. PROPOSTA
  // -------------------------------------------------------------------------
  console.log('\n📝 Criando proposta...');

  await prisma.proposal.create({
    data: {
      propertyId: apto1.id,
      customerId: clienteRoberto.id,
      status: 'PENDING',
      name: clienteRoberto.name!,
      email: clienteRoberto.email!,
      phone: clienteRoberto.phone!,
      proposedPrice: 135000000, // R$ 1.350.000 (oferta abaixo do pedido)
      message: 'Tenho interesse no imóvel. Proponho R$ 1.350.000 à vista.',
      financingNeeded: false,
      expiresAt: new Date('2025-03-10'),
    },
  });

  console.log('   ✅ 1 proposta criada');

  // -------------------------------------------------------------------------
  // 14. DENÚNCIA
  // -------------------------------------------------------------------------
  console.log('\n🚨 Criando denúncia...');

  await prisma.report.create({
    data: {
      propertyId: aptoDraft.id,
      customerId: clienteAna.id,
      reason: 'FAKE_LISTING',
      description:
        'As fotos desse anúncio parecem ser de outro imóvel. Suspeito de anúncio falso.',
      status: 'PENDING',
    },
  });

  console.log('   ✅ 1 denúncia criada');

  // -------------------------------------------------------------------------
  // 15. FAVORITOS
  // -------------------------------------------------------------------------
  console.log('\n❤️  Criando favoritos...');

  await prisma.favoriteProperty.createMany({
    data: [
      { customerId: clienteJoao.id, propertyId: apto1.id },
      { customerId: clienteJoao.id, propertyId: casa1.id },
      { customerId: clienteAna.id, propertyId: apto3.id },
      { customerId: clienteRoberto.id, propertyId: apto1.id },
    ],
  });

  console.log('   ✅ 4 favoritos criados');

  // -------------------------------------------------------------------------
  // Resumo final
  // -------------------------------------------------------------------------
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.property.count(),
    prisma.propertyMedia.count(),
    prisma.amenity.count(),
    prisma.lead.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.review.count(),
    prisma.visit.count(),
    prisma.proposal.count(),
    prisma.listingPlan.count(),
  ]);

  console.log('\n═══════════════════════════════════════');
  console.log('✅ SEED CONCLUÍDO COM SUCESSO!');
  console.log('═══════════════════════════════════════');
  console.log(`   👤 Usuários:        ${counts[0]}`);
  console.log(`   👥 Clientes:        ${counts[1]}`);
  console.log(
    `   🏠 Imóveis:         ${counts[2]} (7 detalhados + 50 de teste em lote)`,
  );
  console.log(`   📸 Mídias:          ${counts[3]}`); // imagens + vídeos
  console.log(`   🏊 Comodidades:     ${counts[4]}`);
  console.log(`   📋 Planos:          ${counts[11]}`);
  console.log(`   📬 Leads:           ${counts[5]}`);
  console.log(`   💬 Conversas:       ${counts[6]}`);
  console.log(`   ✉️  Mensagens:       ${counts[7]}`);
  console.log(`   ⭐ Avaliações:      ${counts[8]}`);
  console.log(`   🗓️  Visitas:         ${counts[9]}`);
  console.log(`   📝 Propostas:       ${counts[10]}`);
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('🔑 Usuário de teste em lote:');
  console.log(
    `   keycloakId: ${process.env.SEED_OWNER_KEYCLOAK_ID ?? 'kc-seed-bulk-001'}`,
  );
  console.log(
    '   Para logar como este usuário no Keycloak, certifique-se de que',
  );
  console.log(
    '   o UUID acima corresponde ao sub do JWT do seu usuário Keycloak.',
  );
  console.log(
    '   Defina SEED_OWNER_KEYCLOAK_ID=<seu-uuid> no .env do backend.',
  );
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
