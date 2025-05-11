import { useCart, CartItem as CartItemType } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

interface CartItemProps {
  item: CartItemType;
  onClose?: () => void;
}

export default function CartItem({ item, onClose }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const handleRemove = () => {
    removeItem(product.id);
  };

  const unitPrice = product.salePrice || product.price;
  const totalPrice = unitPrice * quantity;

  return (
    <Card className="flex items-center p-3 mb-3 border rounded-md">
      <Link href={`/products/${product.id}`} onClick={onClose}>
        <div className="w-16 h-16 bg-gray-100 rounded mr-3 flex-shrink-0 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="flex-grow">
        <Link href={`/products/${product.id}`} onClick={onClose}>
          <p className="font-medium text-sm">{product.name}</p>
        </Link>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">₹{unitPrice.toLocaleString('en-IN')} × {quantity}</p>
          <p className="font-medium">₹{totalPrice.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={handleDecrement}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="mx-2 text-sm w-5 text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={handleIncrement}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
