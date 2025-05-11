import { ReactNode, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";
import InstallAppBanner from "./InstallAppBanner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header openCart={openCart} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
      <InstallAppBanner />
    </div>
  );
}
