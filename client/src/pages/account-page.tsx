import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge,
  Separator,
  Textarea,
  Avatar,
  AvatarFallback,
} from "@/components/ui/index";
import { User, Package, CreditCard, LogOut, Loader2, ExternalLink } from "lucide-react";
import { Order, OrderItem } from "@shared/schema";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function AccountPage() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get active tab from query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabParam || "profile");

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/account?tab=${value}`, { replace: true });
  };

  // Fetch orders for the current user
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch order details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);

  const fetchOrderDetails = async (orderId: number) => {
    setIsLoadingOrderDetails(true);
    try {
      const response = await apiRequest("GET", `/api/orders/${orderId}`);
      const data = await response.json();
      setSelectedOrder(data);
      setOrderItems(data.items || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      await apiRequest("PUT", "/api/profile", data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Account Sidebar */}
          <div>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-medium">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === "profile" ? "bg-gray-100" : ""}`}
                    onClick={() => handleTabChange("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === "orders" ? "bg-gray-100" : ""}`}
                    onClick={() => handleTabChange("orders")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === "payment" ? "bg-gray-100" : ""}`}
                    onClick={() => handleTabChange("payment")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Button>

                  <Separator className="my-4" />

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full justify-start border-b pb-px mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and address
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
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
                                    <Input {...field} />
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
                                    <Input disabled {...field} />
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
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Separator />
                          <h3 className="font-medium">Address Information</h3>

                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                    value={field.value || ""}
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
                                    <Input {...field} value={field.value || ""} />
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
                                    <Input {...field} value={field.value || ""} />
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
                                    <Input {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="bg-primary hover:bg-primary/90"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View and track your recent orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="space-y-6">
                        {selectedOrder ? (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <Button
                                variant="ghost"
                                onClick={() => setSelectedOrder(null)}
                              >
                                ← Back to Orders
                              </Button>
                              <Badge variant="outline">
                                {selectedOrder.status.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base">Order Details</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                  <dl className="space-y-1">
                                    <div className="flex justify-between">
                                      <dt className="text-gray-500">Order ID:</dt>
                                      <dd>{selectedOrder.id}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-gray-500">Date:</dt>
                                      <dd>{new Date(selectedOrder.createdAt).toLocaleDateString()}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-gray-500">Status:</dt>
                                      <dd>
                                        <Badge variant="outline" className="capitalize">
                                          {selectedOrder.status}
                                        </Badge>
                                      </dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-gray-500">Total:</dt>
                                      <dd className="font-medium">
                                        ₹{selectedOrder.total.toLocaleString('en-IN')}
                                      </dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-gray-500">Payment Method:</dt>
                                      <dd className="capitalize">{selectedOrder.paymentMethod || "Cash on Delivery"}</dd>
                                    </div>
                                  </dl>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base">Shipping Address</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                  <address className="not-italic">
                                    {user.firstName} {user.lastName}<br />
                                    {selectedOrder.address}<br />
                                    {selectedOrder.city}, {selectedOrder.state} {selectedOrder.zipCode}<br />
                                    {user.phone}
                                  </address>
                                </CardContent>
                              </Card>
                            </div>

                            <h3 className="font-medium mb-4">Order Items</h3>
                            {isLoadingOrderDetails ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {orderItems.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{`Product #${item.productId}`}</TableCell>
                                      <TableCell>₹{item.price.toLocaleString('en-IN')}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell className="text-right font-medium">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orders.map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-medium">#{order.id}</TableCell>
                                  <TableCell>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {order.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>₹{order.total.toLocaleString('en-IN')}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => fetchOrderDetails(order.id)}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-4">
                          You haven't placed any orders yet.
                        </p>
                        <Button onClick={() => navigate("/products")}>
                          Start Shopping
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your saved payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No payment methods saved</h3>
                      <p className="text-gray-500 mb-4">
                        You don't have any saved payment methods yet.
                      </p>
                      <Button>Add Payment Method</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
