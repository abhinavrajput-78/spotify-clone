import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="app-bg min-h-screen text-white">
      <div className="min-h-screen">{children}</div>
    </div>
  );
};

export default Layout;