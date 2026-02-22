import { Header } from "@/components/layout/Header/Header";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex flex-col">
      <header>
        <Header />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
