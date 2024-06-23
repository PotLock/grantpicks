import React from "react";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="max-w-[2560px] min-h-screen font-titilumWeb relative m-0 p-0">
      {children}
    </main>
  );
};

export default BaseLayout;
