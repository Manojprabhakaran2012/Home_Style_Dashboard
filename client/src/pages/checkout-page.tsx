import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const checkoutFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  paymentMethod: z.enum(["cod", "card", "upi"]),
  saveAddress: z.boolean().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Initialize form with user data if available
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      paymentMethod: "cod",
      saveAddress: false,
    },
  });

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  // Calculate order summary
  const subtotal = totalPrice;
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setIsSubmitting(true);

      // Prepare order items
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price
      }));

      // Create order
      await apiRequest("POST", "/api/orders", {
        total,
        items: orderItems,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        paymentMethod: data.paymentMethod
      });

      // Save address to user profile if requested
      if (data.saveAddress) {
        await apiRequest("PUT", "/api/profile", {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        });
      }

      // Clear cart after successful order
      clearCart();

      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your purchase!",
      });

      // Navigate to order confirmation or account page
      navigate("/account?tab=orders");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold mb-4">Checkout</h1>
        
        {/* Mattresses-only notification */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Online Purchasing Information</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>HomeStyle Erode currently offers online purchase only for mattresses. Other furniture items are displayed as a showcase gallery and can be purchased in-store.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your full address"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                  <SelectItem value="Kerala">Kerala</SelectItem>
                                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                                  <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                                  <SelectItem value="Telangana">Telangana</SelectItem>
                                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                  <SelectItem value="Gujarat">Gujarat</SelectItem>
                                  <SelectItem value="Delhi">Delhi</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter ZIP code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="saveAddress"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Save this address for future orders</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer bg-gray-50">
                                <RadioGroupItem value="cod" id="cod" />
                                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Cash on Delivery</div>
                                  <div className="text-sm text-gray-500">Pay when you receive your order</div>
                                </Label>
                                <i className="fas fa-money-bill text-gray-400"></i>
                              </div>
                              
                              <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer bg-gray-50">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Credit/Debit Card</div>
                                  <div className="text-sm text-gray-500">Pay securely with your card</div>
                                </Label>
                                <i className="far fa-credit-card text-gray-400"></i>
                              </div>
                              
                              <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer bg-gray-50">
                                <RadioGroupItem value="upi" id="upi" />
                                <Label htmlFor="upi" className="flex-1 cursor-pointer">
                                  <div className="font-medium">UPI</div>
                                  <div className="text-sm text-gray-500">Pay using UPI apps like Google Pay, PhonePe</div>
                                </Label>
                                <i className="fas fa-mobile-alt text-gray-400"></i>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => {
                    const unitPrice = item.product.salePrice || item.product.price;
                    const itemTotal = unitPrice * item.quantity;
                    
                    return (
                      <div key={item.product.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm truncate w-32 sm:w-40">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Qty: {item.quantity} × ₹{unitPrice.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

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
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  <p>* Free shipping on orders above ₹5,000</p>
                  <p>* Taxes included in the price</p>
                  <p>* Order will be delivered within 3-5 business days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
