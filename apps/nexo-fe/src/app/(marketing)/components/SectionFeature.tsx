"use client";

import React from "react";

import { Card } from "../../../components/ui/Card/Card";
import { Heading } from "@/components/ui/Heading/Heading";
import { Carousel } from "@/components/ui/Carousel/Carousel";

const CARDS = Array.from({ length: 8 });

const carouselItems = CARDS.map((_, i) => (
  <Card key={i} badge badgeText="Destaque" favorite />
));

export const SectionFeature = () => {
  return (
    <div className="w-full bg-primary/5">
      <div className="flex flex-col space-y-6 max-w-7xl mx-auto px-6 py-12 md:py-24">
        <Heading
          title="Imóveis exclusivos, anunciantes confiáveis"
          description="O Nexo conecta você a imóveis exclusivos e anunciantes confiáveis. A maneira mais segura de fechar negócio no Brasil."
        />
        <Carousel
          items={carouselItems}
          dots={true}
          arrows={true}
          infinite={false}
          slidesToShow={3}
          slidesToScroll={2}
        />
      </div>
    </div>
  );
};
