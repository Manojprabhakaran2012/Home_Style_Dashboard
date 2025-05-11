import { Button } from "@/components/ui/button";
import { X, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  // Temporary placeholders until context is fixed
  const items: any[] = [];
  const totalPrice = 0;
  const itemCount = 0;

  // Close the cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && target.classList.contains('cart-overlay')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    // Prevent scrolling when cart is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 cart-overlay bg-black bg-opacity-50">
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">Your Cart ({itemCount} items)</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-gray-500 mb-6">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button variant="outline" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div>
                {/* Cart items will be rendered here when context is fixed */}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between font-medium mb-4">
                <span>Subtotal:</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
