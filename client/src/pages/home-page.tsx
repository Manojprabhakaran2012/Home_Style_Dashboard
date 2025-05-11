import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Category, Product } from "@shared/schema";
import ProductCard from "@/components/ProductCard";
import { Check, ChevronLeft, ChevronRight, Truck, Medal, Shield } from "lucide-react";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      title: "Furniture that defines style",
      description: "Discover our exclusive collection of high-quality furniture to transform your home.",
    },
    {
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      title: "Sleep Better, Live Better",
      description: "Experience unparalleled comfort with our premium mattress collection.",
    },
    {
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      title: "Decor that Inspires",
      description: "Elevate your space with our curated home decor collection.",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const filteredProducts = activeTab === 'all' 
    ? featuredProducts 
    : featuredProducts?.filter(product => {
        if (activeTab === 'furniture') return product.categoryId === 1;
        if (activeTab === 'mattresses') return product.categoryId === 2;
        if (activeTab === 'decor') return product.categoryId === 3;
        return true;
      });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-black/20">
        <div className="w-full h-[500px] overflow-hidden relative">
          <div className="absolute inset-0">
            <img 
              src={heroSlides[currentSlide].image} 
              alt="Hero banner" 
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-lg text-white mb-6">
                  {heroSlides[currentSlide].description}
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link href="/products">
                    <Button className="bg-primary text-white py-3 px-6 rounded-md font-medium hover:bg-primary/90 transition">
                      Shop Now
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="bg-white text-primary py-3 px-6 rounded-md font-medium hover:bg-gray-100 transition">
                      Explore Collections
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
            {heroSlides.map((_, index) => (
              <button 
                key={index}
                className={`h-3 w-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                onClick={() => setCurrentSlide(index)}
              ></button>
            ))}
          </div>
        </div>
        <button 
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 p-3 rounded-full cursor-pointer hover:bg-white transition z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </button>
        <button 
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 p-3 rounded-full cursor-pointer hover:bg-white transition z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold mb-2">Shop By Category</h2>
            <p className="text-neutral-700">Explore our wide range of home furnishing products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <Link key={category.id} href={`/products/category/${category.id}`} className="group">
                <div className="overflow-hidden rounded-lg shadow-md bg-white h-40 md:h-60 relative">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white p-3 text-center">
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold mb-2">Featured Products</h2>
            <p className="text-neutral-700">Handpicked collections from our experts</p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 border-b overflow-x-auto">
              <button 
                className={`py-3 px-5 ${activeTab === 'all' ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-600 hover:text-primary transition'}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button 
                className={`py-3 px-5 ${activeTab === 'furniture' ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-600 hover:text-primary transition'}`}
                onClick={() => setActiveTab('furniture')}
              >
                Furniture
              </button>
              <button 
                className={`py-3 px-5 ${activeTab === 'mattresses' ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-600 hover:text-primary transition'}`}
                onClick={() => setActiveTab('mattresses')}
              >
                Mattresses
              </button>
              <button 
                className={`py-3 px-5 ${activeTab === 'decor' ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-600 hover:text-primary transition'}`}
                onClick={() => setActiveTab('decor')}
              >
                Decor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/products">
              <Button variant="outline" className="border-2 border-primary text-primary font-medium py-2 px-6 rounded-md hover:bg-primary hover:text-white transition">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mattress Showcase */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-10">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
              <Badge className="text-primary bg-primary/10 mb-2">Premium Collection</Badge>
              <h2 className="text-3xl font-serif font-bold mb-4">Luxury Mattresses</h2>
              <p className="text-gray-600 mb-6">
                Experience unparalleled comfort with our premium mattress collection. Designed with advanced technology and premium materials to ensure the perfect night's sleep.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="text-green-600 mt-1 mr-2 h-5 w-5" />
                  <span>Orthopedic support for better spinal alignment</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-600 mt-1 mr-2 h-5 w-5" />
                  <span>Memory foam adapts to your body shape</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-600 mt-1 mr-2 h-5 w-5" />
                  <span>Cooling technology regulates temperature</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-600 mt-1 mr-2 h-5 w-5" />
                  <span>Hypoallergenic and dust-mite resistant</span>
                </li>
              </ul>
              <Link href="/products/category/2">
                <Button className="bg-primary text-white font-medium py-3 px-6 rounded-md hover:bg-primary/90 transition">
                  Explore Mattresses
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80" 
                    alt="Luxury Mattress" 
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1631046263435-ef4dc319cca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80" 
                    alt="Premium Mattress" 
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80" 
                    alt="Memory Foam Mattress" 
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80" 
                    alt="Orthopedic Mattress" 
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg">Free Delivery</h3>
              </div>
              <p className="text-gray-600">Free delivery across Erode on all mattress orders above ₹5,000.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                  <Medal className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg">100-Night Trial</h3>
              </div>
              <p className="text-gray-600">Try our mattress for 100 nights. Not satisfied? Get a full refund.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg">10-Year Warranty</h3>
              </div>
              <p className="text-gray-600">All our premium mattresses come with an extended 10-year warranty.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold mb-2">What Our Customers Say</h2>
            <p className="text-neutral-700">Read testimonials from our satisfied customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex text-yellow-400 mb-4">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="text-gray-600 mb-6">
                "The memory foam mattress I purchased has completely transformed my sleep. I used to wake up with back pain, but now I sleep soundly through the night. The quality is outstanding!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/24.jpg" alt="Customer" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium">Priya Sharma</h4>
                  <p className="text-sm text-gray-500">Chennai</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex text-yellow-400 mb-4">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
              <p className="text-gray-600 mb-6">
                "The sofa set I ordered is not only beautiful but extremely comfortable. The delivery was prompt and the team helped set everything up. Highly recommend HomeStyle Erode for quality furniture!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Customer" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-500">Coimbatore</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex text-yellow-400 mb-4">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="text-gray-600 mb-6">
                "I've furnished my entire living room with pieces from HomeStyle Erode. The quality is exceptional, and the customer service team was incredibly helpful in selecting the right pieces for my space."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/46.jpg" alt="Customer" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium">Ananya Patel</h4>
                  <p className="text-sm text-gray-500">Erode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">Join Our Newsletter</h2>
            <p className="mb-8">Subscribe to receive updates on new arrivals, special offers, and home decor inspiration.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <Button type="submit" className="bg-secondary text-primary font-medium px-6 py-3 rounded-md hover:bg-secondary/90 transition">
                Subscribe
              </Button>
            </form>
            <p className="text-sm mt-4 text-white/70">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
