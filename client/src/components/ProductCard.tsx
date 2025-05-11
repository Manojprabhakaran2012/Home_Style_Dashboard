import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  
  // Temporary cart handler until context is fixed
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Show toast instead of adding to cart
    toast({
      title: "Coming soon",
      description: "Cart functionality is being updated",
      duration: 2000,
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden group">
      <Link href={`/products/${product.id}`}>
        <div 
          className="relative h-64 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover transition duration-500 ${isHovered ? 'scale-110' : ''}`}
          />
          
          {/* Product badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-secondary text-primary px-2 py-1">NEW</Badge>
            )}
            {product.isSale && (
              <Badge className="bg-red-600 text-white px-2 py-1">SALE</Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-green-600 text-white px-2 py-1">BESTSELLER</Badge>
            )}
          </div>
          
          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovered ? 'opacity-10' : 'opacity-0'}`}></div>
          
          {/* Action buttons */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <div className="flex justify-center space-x-2">
              {/* Only show Add to Cart button for mattress products */}
              {product.categoryId === 2 && ( // Assuming categoryId 2 is for mattresses
                <Button 
                  size="icon"
                  variant="outline"
                  className="bg-white text-primary hover:bg-primary hover:text-white rounded-full"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
              <Button 
                size="icon"
                variant="outline"
                className="bg-white text-primary hover:bg-primary hover:text-white rounded-full"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button 
                size="icon"
                variant="outline"
                className="bg-white text-primary hover:bg-primary hover:text-white rounded-full"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Rating stars */}
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => {
                const rating = product.rating || 0;
                return (
                  <span key={i}>
                    {i < Math.floor(rating) ? (
                      <i className="fas fa-star"></i>
                    ) : i < Math.ceil(rating) && rating % 1 !== 0 ? (
                      <i className="fas fa-star-half-alt"></i>
                    ) : (
                      <i className="far fa-star"></i>
                    )}
                  </span>
                );
              })}
            </div>
            <span className="text-xs text-gray-500 ml-2">({product.reviewCount || 0} reviews)</span>
          </div>
          
          <h3 className="font-medium text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-primary font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              {product.salePrice && (
                <span className="text-gray-400 line-through text-sm ml-2">
                  ₹{product.salePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
