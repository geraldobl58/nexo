import { Header } from "@/components/header";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <header>
        <Header />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
