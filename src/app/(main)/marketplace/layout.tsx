const MarketplaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="pb-10 bg-[url('/img/home-page-bg.png')] bg-[no-repeat] bg-[center center] bg-[cover]">
      {children}
    </main>
  );
};

export default MarketplaceLayout;
