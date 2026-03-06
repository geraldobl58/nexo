import Link from "next/link";
import { Logo } from "@/components/ui/Logo/Logo";

export const Footer = () => {
  return (
    <div>
      <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-10">
        <div className="space-y-4 w-60">
          <Logo />
          <p className="text-sm font-normal text-gray-500 mt-2">
            A plataforma imobiliária mais confiável do Brasil. Conectamos sonhos
            a novos lares com tecnologia e segurança.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Explorar</h3>
          <ul>
            <li className="flex flex-col gap-2">
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Comprar imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Alugar imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Vender imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Lançamentos
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Anunciar grátis
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Explorar</h3>
          <ul>
            <li className="flex flex-col gap-2">
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Comprar imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Alugar imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Vender imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Lançamentos
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Anunciar grátis
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Explorar</h3>
          <ul>
            <li className="flex flex-col gap-2">
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Comprar imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Alugar imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Vender imóveis
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Lançamentos
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Anunciar grátis
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between border-t max-w-screen-2xl mx-auto px-4 py-6 text-sm text-gray-500">
        <div>© 2026 Nexo Imobiliária. Todos os direitos reservados.</div>
        <div>Nexo sua plataforma para realizar sonhos.</div>
      </div>
    </div>
  );
};
