import { SectionForm } from "../app/(marketing)/components/search-form";

export const SectionHero = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 mx-auto py-24 bg-primary/5">
      <div className="text-center">
        <h1 className="text-6xl font-bold">Encontre, anuncie ou alugue</h1>
        <h1 className="text-6xl font-bold text-primary">
          imóveis com facilidade
        </h1>
      </div>
      <p className=" mt-4 text-lg text-muted-foreground text-center max-w-3xl">
        O Nexo conecta você a imóveis exclusivos e anunciantes confiáveis. A
        maneira mais segura de fechar negócio no Brasil.
      </p>

      <SectionForm />
    </div>
  );
};
