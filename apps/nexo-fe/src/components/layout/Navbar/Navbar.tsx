import Link from "next/link";

export const NavBar = () => {
  return (
    <nav className="flex items-center justify-center">
      <ul className="flex items-center gap-8 text-sm font-medium uppercase">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">Sobre</Link>
        </li>
        <li>
          <Link href="/about">Comprar</Link>
        </li>
        <li>
          <Link href="/about">Alugar</Link>
        </li>
        <li>
          <Link href="/about">Imobiliárias</Link>
        </li>
        <li>
          <Link href="/about">Faq</Link>
        </li>
      </ul>
    </nav>
  );
};
