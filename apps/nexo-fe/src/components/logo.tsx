import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/images/logo.png" alt="Nexo Logo" width={32} height={32} />
      <h1 className="font-black text-2xl">Nexo</h1>
    </Link>
  );
};
