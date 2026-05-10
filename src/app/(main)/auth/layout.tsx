import React from "react";
import Testimonial from "./_components/testimonial";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex items-center justify-center py-20 w-full container mx-auto">
      <div className="lg:w-6/12 w-full">
        <Testimonial />
      </div>
      <div className="lg:w-6/12 w-full">{children}</div>
    </div>
  );
};

export default AuthLayout;
