import { SectionForm } from "./SearchForm";

export const SectionHero = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 mx-auto px-4 py-12 md:py-24 bg-primary/5">
      <div className="text-center">
        <h1 className="text-3xl md:text-6xl font-bold">
          Encontre, anuncie ou alugue
        </h1>
        <h1 className="text-3xl md:text-6xl font-bold text-primary">
          imóveis com facilidade
        </h1>
      </div>
      <p className="mt-2 text-base md:text-lg text-muted-foreground text-center max-w-2xl">
        O Nexo conecta você a imóveis exclusivos e anunciantes confiáveis. A
        maneira mais segura de fechar negócio no Brasil.
      </p>

      <SectionForm />
    </div>
  );
};
