import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ProductsPage() {
  const [, params] = useRoute("/products/category/:categoryId");
  const [location] = useLocation();
  const categoryId = params?.categoryId ? parseInt(params.categoryId) : null;
  const [filters, setFilters] = useState({
    inStock: false,
    isSale: false,
    isNew: false,
    isBestseller: false,
    minPrice: 0,
    maxPrice: 50000,
  });
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  
  // Get search param if any
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get("search");

  // Fetch all products
  const { data: allProducts, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch category-specific products if categoryId is provided
  const { data: categoryProducts, isLoading: isLoadingCategoryProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/category", categoryId],
    enabled: categoryId !== null,
  });

  // Filter and sort products
  const filterProducts = (products: Product[]) => {
    if (!products) return [];

    let filteredProducts = [...products];

    // Apply filters
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(p => p.inStock);
    }
    if (filters.isSale) {
      filteredProducts = filteredProducts.filter(p => p.isSale);
    }
    if (filters.isNew) {
      filteredProducts = filteredProducts.filter(p => p.isNew);
    }
    if (filters.isBestseller) {
      filteredProducts = filteredProducts.filter(p => p.isBestseller);
    }

    // Price range filter
    filteredProducts = filteredProducts.filter(
      p => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    // Sort products
    switch (sortBy) {
      case "price_low":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filteredProducts = filteredProducts.filter(p => p.isNew).concat(
          filteredProducts.filter(p => !p.isNew)
        );
        break;
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      default: // featured (default)
        filteredProducts = filteredProducts.filter(p => p.isFeatured).concat(
          filteredProducts.filter(p => !p.isFeatured)
        );
    }

    return filteredProducts;
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  // Search products if search query exists
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery) {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);

  // Determine which products to show
  let productsToShow: Product[] = [];
  let isLoading = isLoadingProducts || isLoadingCategories;
  
  if (searchResults) {
    productsToShow = filterProducts(searchResults);
  } else if (categoryId && categoryProducts) {
    productsToShow = filterProducts(categoryProducts);
    isLoading = isLoadingCategoryProducts;
  } else if (allProducts) {
    productsToShow = filterProducts(allProducts);
  }

  // Get current category name
  const currentCategory = categoryId && categories
    ? categories.find(c => c.id === categoryId)
    : null;

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">
            {searchQuery 
              ? `Search Results for "${searchQuery}"`
              : currentCategory 
                ? currentCategory.name 
                : "All Products"}
          </h1>
          <Separator className="mt-4" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Mobile View */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between border-dashed"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filters</span>
              </div>
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showFilters && (
              <Card className="mt-2">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Categories</h3>
                      <div className="space-y-2">
                        {categories?.map(category => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={categoryId === category.id}
                              onCheckedChange={() => window.location.href = `/products/category/${category.id}`}
                            />
                            <label
                              htmlFor={`category-${category.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Price Range */}
                    <div>
                      <h3 className="font-medium mb-3">Price Range</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={[filters.minPrice, filters.maxPrice]}
                          max={50000}
                          step={1000}
                          onValueChange={(value) => {
                            handleFilterChange("minPrice", value[0]);
                            handleFilterChange("maxPrice", value[1]);
                          }}
                        />
                        <div className="flex justify-between mt-2 text-sm">
                          <span>₹{filters.minPrice.toLocaleString('en-IN')}</span>
                          <span>₹{filters.maxPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Availability Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Availability</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="instock-mobile"
                            checked={filters.inStock}
                            onCheckedChange={(checked) => handleFilterChange("inStock", checked)}
                          />
                          <label htmlFor="instock-mobile" className="text-sm cursor-pointer">
                            In Stock Only
                          </label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Product Status */}
                    <div>
                      <h3 className="font-medium mb-3">Product Status</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sale-mobile"
                            checked={filters.isSale}
                            onCheckedChange={(checked) => handleFilterChange("isSale", checked)}
                          />
                          <label htmlFor="sale-mobile" className="text-sm cursor-pointer">
                            On Sale
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="new-mobile"
                            checked={filters.isNew}
                            onCheckedChange={(checked) => handleFilterChange("isNew", checked)}
                          />
                          <label htmlFor="new-mobile" className="text-sm cursor-pointer">
                            New Arrivals
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="bestseller-mobile"
                            checked={filters.isBestseller}
                            onCheckedChange={(checked) => handleFilterChange("isBestseller", checked)}
                          />
                          <label htmlFor="bestseller-mobile" className="text-sm cursor-pointer">
                            Bestsellers
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Filters - Desktop View */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories?.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={categoryId === category.id}
                          onCheckedChange={() => window.location.href = `/products/category/${category.id}`}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[filters.minPrice, filters.maxPrice]}
                      max={50000}
                      step={1000}
                      onValueChange={(value) => {
                        handleFilterChange("minPrice", value[0]);
                        handleFilterChange("maxPrice", value[1]);
                      }}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>₹{filters.minPrice.toLocaleString('en-IN')}</span>
                      <span>₹{filters.maxPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Availability Filter */}
                <div>
                  <h3 className="font-medium mb-3">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="instock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) => handleFilterChange("inStock", checked)}
                      />
                      <label htmlFor="instock" className="text-sm cursor-pointer">
                        In Stock Only
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Product Status */}
                <div>
                  <h3 className="font-medium mb-3">Product Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sale"
                        checked={filters.isSale}
                        onCheckedChange={(checked) => handleFilterChange("isSale", checked)}
                      />
                      <label htmlFor="sale" className="text-sm cursor-pointer">
                        On Sale
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new"
                        checked={filters.isNew}
                        onCheckedChange={(checked) => handleFilterChange("isNew", checked)}
                      />
                      <label htmlFor="new" className="text-sm cursor-pointer">
                        New Arrivals
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bestseller"
                        checked={filters.isBestseller}
                        onCheckedChange={(checked) => handleFilterChange("isBestseller", checked)}
                      />
                      <label htmlFor="bestseller" className="text-sm cursor-pointer">
                        Bestsellers
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                Showing {productsToShow.length} products
              </p>
              <div className="w-48">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : productsToShow.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsToShow.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
