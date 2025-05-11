import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  
  const handleQuantityChange = (productId: number, quantity: string) => {
    const newQuantity = parseInt(quantity);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: number) => {
    removeItem(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    // Simulate coupon validation
    setTimeout(() => {
      setIsApplyingCoupon(false);
      
      // Mock validation - in a real app this would be an API call
      if (couponCode.toLowerCase() === "welcome10") {
        setCouponSuccess("Coupon applied! 10% discount");
      } else {
        setCouponError("Invalid or expired coupon code");
      }
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-3xl font-serif font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary
  const subtotal = totalPrice;
  const shipping = subtotal > 5000 ? 0 : 250;
  const discount = couponSuccess ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Product</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const unitPrice = item.product.salePrice || item.product.price;
                        const itemTotal = unitPrice * item.quantity;
                        
                        return (
                          <TableRow key={item.product.id}>
                            <TableCell>
                              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link href={`/products/${item.product.id}`} className="font-medium hover:text-primary">
                                {item.product.name}
                              </Link>
                            </TableCell>
                            <TableCell>₹{unitPrice.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) => handleQuantityChange(item.product.id, value)}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue placeholder={item.quantity.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="font-medium">₹{itemTotal.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveItem(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-dashed"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
                <Link href="/products">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Cart Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  
                  {couponError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>{couponError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {couponSuccess && (
                    <Alert className="py-2 bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{couponSuccess}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator />

                {/* Summary Details */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link href="/checkout" className="block w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <div className="text-xs text-gray-500 mt-4">
                  <p>* Free shipping on orders above ₹5,000</p>
                  <p>* Taxes included in the price</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
