import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  Plus,
  Heart,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function ProductDetailPage() {
  const [match, params] = useRoute("/products/:id");
  const productId = match ? parseInt(params.id) : 0;
  const [quantity, setQuantity] = useState(1);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Fetch product reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });

  // Fetch related products from the same category
  const { data: relatedProducts, isLoading: isLoadingRelated } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${product?.categoryId}`],
    enabled: !!product?.categoryId,
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const onSubmitReview = async (data: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/reviews", {
        productId,
        rating: data.rating,
        comment: data.comment,
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setIsReviewDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-80">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-4">The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Create dummy image array for the gallery (using the same image multiple times)
  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image,
  ];

  const nextImage = () => {
    setSelectedImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  // Filter out the current product from related products
  const filteredRelatedProducts = relatedProducts
    ? relatedProducts.filter(p => p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="relative bg-white rounded-lg overflow-hidden border h-80 md:h-96">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full"
                    onClick={prevImage}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full"
                    onClick={nextImage}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {/* Product badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.isNew && (
                  <Badge className="bg-secondary text-primary">NEW</Badge>
                )}
                {product.isSale && (
                  <Badge className="bg-red-600 text-white">SALE</Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-green-600 text-white">BESTSELLER</Badge>
                )}
              </div>
            </div>
            {productImages.length > 1 && (
              <div className="flex mt-4 space-x-2">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 border rounded cursor-pointer overflow-hidden ${
                      selectedImage === index ? "border-primary border-2" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(product.rating) ? (
                      <i className="fas fa-star"></i>
                    ) : i < Math.ceil(product.rating) && product.rating % 1 !== 0 ? (
                      <i className="fas fa-star-half-alt"></i>
                    ) : (
                      <i className="far fa-star"></i>
                    )}
                  </span>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-primary mr-3">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.salePrice && (
                <span className="text-gray-400 line-through text-lg">
                  ₹{product.salePrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.salePrice && (
                <Badge className="ml-3 bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
                  {Math.round(((product.salePrice - product.price) / product.salePrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-1 mb-2">
                <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                  <i className={`fas ${product.inStock ? "fa-check-circle" : "fa-times-circle"}`}></i>
                </span>
                <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Only show purchase options for mattresses (category ID 2) */}
            {product.categoryId === 2 ? (
              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex items-center">
                  <button
                    onClick={decrementQuantity}
                    className="bg-gray-100 px-3 py-2 rounded-l-md border border-gray-300"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-2 border-t border-b border-gray-300 text-center min-w-[60px]">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="bg-gray-100 px-3 py-2 rounded-r-md border border-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="bg-primary hover:bg-primary/90 flex-1"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="border-2 border-gray-300">
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Wishlist
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">This product is available for viewing only.</p>
                  <p className="text-sm text-gray-600">For purchase inquiries, please contact us:</p>
                  <div className="flex items-center mt-3">
                    <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <Truck className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Free delivery on orders above ₹5,000</span>
              </div>
              <div className="flex items-start">
                <RefreshCcw className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Easy 30-day returns</span>
              </div>
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>1-year warranty on all products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b pb-px">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700">
                    {product.description}
                    {/* Extended description */}
                    <br /><br />
                    Experience unmatched quality and craftsmanship with our {product.name}. 
                    Designed with careful attention to detail, this product combines functionality 
                    with aesthetic appeal to enhance your living space.
                    <br /><br />
                    Our products are made from premium materials that ensure durability and long-lasting 
                    performance. Whether you're furnishing a new home or upgrading your existing space, 
                    this piece is the perfect addition.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Material</p>
                        <p className="text-gray-600">Premium Quality</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Dimensions</p>
                        <p className="text-gray-600">Standard Size</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Weight</p>
                        <p className="text-gray-600">Medium Weight</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Color</p>
                        <p className="text-gray-600">Natural</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Warranty</p>
                        <p className="text-gray-600">1 Year</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Made In</p>
                        <p className="text-gray-600">India</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Customer Reviews</h3>
                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Write a Review</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Write a Review</DialogTitle>
                          <DialogDescription>
                            Share your experience with this product
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="rating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rating</FormLabel>
                                  <FormControl>
                                    <div className="flex space-x-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          className={`text-2xl ${
                                            star <= field.value ? "text-yellow-400" : "text-gray-300"
                                          }`}
                                          onClick={() => field.onChange(star)}
                                        >
                                          <i className="fas fa-star"></i>
                                        </button>
                                      ))}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="comment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Review</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Share your experience with this product..."
                                      rows={5}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end">
                              <Button type="submit">Submit Review</Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {isLoadingReviews ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6">
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                  {i < review.rating ? (
                                    <i className="fas fa-star"></i>
                                  ) : (
                                    <i className="far fa-star"></i>
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No reviews yet</p>
                      <Button onClick={() => setIsReviewDialogOpen(true)}>Be the first to review</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {!isLoadingRelated && filteredRelatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
