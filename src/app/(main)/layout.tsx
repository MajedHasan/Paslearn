import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import ExperienceLayout from "@/components/global/layouts/ExperienceLayout";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-full">
      <ExperienceLayout>
        <Header />
        {children}
        <Footer />
      </ExperienceLayout>
    </main>
  );
};

export default layout;
