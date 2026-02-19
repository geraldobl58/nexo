"use client";

import { useState } from "react";
import Link from "next/link";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Sobre", href: "/about" },
  { label: "Comprar", href: "/comprar" },
  { label: "Alugar", href: "/alugar" },
  { label: "Imobiliárias", href: "/imobiliarias" },
  { label: "FAQ", href: "/faq" },
];

interface MobileSidebarProps {
  onLogin: () => void;
}

export const MobileSidebar = ({ onLogin }: MobileSidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão hamburguer — visível apenas em mobile */}
      <IconButton
        onClick={() => setOpen(true)}
        className="!flex md:!hidden"
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            className: "!w-[280px] flex flex-col",
          },
        }}
      >
        {/* Header do drawer */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <Logo />
          <IconButton onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </IconButton>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 px-4 py-6">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-sm font-medium uppercase tracking-wide hover:bg-violet-50 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Ações no rodapé do drawer */}
        <div className="flex flex-col gap-3 px-4 py-6 border-t">
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setOpen(false);
              onLogin();
            }}
            className="!normal-case !font-medium !rounded-xl"
          >
            Entrar
          </Button>
          <Button
            variant="contained"
            fullWidth
            component={Link}
            href="/panel"
            onClick={() => setOpen(false)}
            className="!normal-case !font-bold !rounded-xl !shadow-none hover:!shadow-none"
          >
            Anuncie Grátis
          </Button>
        </div>
      </Drawer>
    </>
  );
};
