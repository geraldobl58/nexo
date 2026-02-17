import { Header } from "@/components/header";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div>
      <header>
        <Header />
      </header>
      <main>{children}</main>
    </div>
  );
}
