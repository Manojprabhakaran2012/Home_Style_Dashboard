import { useState } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import AccountPage from "@/pages/account-page";
import ContactPage from "@/pages/contact-page";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";
import InstallAppBanner from "./components/InstallAppBanner";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <>
      <Toaster />
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header openCart={openCart} />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/products" component={ProductsPage} />
              <Route path="/products/category/:categoryId" component={ProductsPage} />
              <Route path="/products/:id" component={ProductDetailPage} />
              <Route path="/cart" component={CartPage} />
              <ProtectedRoute path="/checkout" component={CheckoutPage} />
              <ProtectedRoute path="/account" component={AccountPage} />
              <Route path="/contact" component={ContactPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
          <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
          <InstallAppBanner />
        </div>
      </TooltipProvider>
    </>
  );
}

export default App;
