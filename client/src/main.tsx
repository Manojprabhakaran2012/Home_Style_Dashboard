import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import { CartProvider } from "./hooks/use-cart";

// Render the app
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Register service worker
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => console.log('Offline capability enabled.'),
    onUpdate: () => console.log('New content available, please refresh.')
  });
}
