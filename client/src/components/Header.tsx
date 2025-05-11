import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingCart, User, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchBox from "./SearchBox";

// Temporary mock data for developing UI
const mockCategories = [
  { id: 1, name: "Mattresses" },
  { id: 2, name: "Beds" },
  { id: 3, name: "Pillows" },
  { id: 4, name: "Furniture" }
];

interface HeaderProps {
  openCart: () => void;
}

export default function Header({ openCart }: HeaderProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Temporary placeholder until auth context is fixed
  const user = null;
  const itemCount = 0;
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    // Placeholder for logout functionality
    console.log("Logout clicked");
  };

  return (
    <header className="bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="text-sm">
            <span className="mr-4"><span className="mr-2">📞</span>+91 8754545656</span>
            <span className="hidden md:inline"><span className="mr-2">✉️</span>info@homestyleerode.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-sm hover:text-secondary transition">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-sm hover:text-secondary transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-sm hover:text-secondary transition">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="font-serif text-2xl font-bold text-primary">
              HomeStyle <span className="text-secondary">Erode</span>
            </Link>
          </div>

          <div className="w-full md:w-1/2 lg:w-1/3 relative mb-4 md:mb-0">
            <SearchBox />
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 hover:text-primary transition">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Account</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <Link href="/account">
                      <DropdownMenuItem className="cursor-pointer">
                        My Account
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/account?tab=orders">
                      <DropdownMenuItem className="cursor-pointer">
                        My Orders
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <Link href="/auth">
                      <DropdownMenuItem className="cursor-pointer">
                        Login
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/auth">
                      <DropdownMenuItem className="cursor-pointer">
                        Register
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              className="relative flex items-center hover:text-primary transition"
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-1 hidden md:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <nav className="bg-gray-100 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <button 
              className="lg:hidden py-3 flex items-center" 
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 mr-2" />
              ) : (
                <Menu className="h-5 w-5 mr-2" />
              )}
              Categories
            </button>
            
            <ul className="hidden lg:flex">
              <li>
                <Link href="/" className={`block py-3 px-4 hover:text-primary transition ${location === '/' ? 'font-medium text-primary' : ''}`}>
                  Home
                </Link>
              </li>
              {mockCategories.map(category => (
                <li key={category.id}>
                  <Link 
                    href={`/products/category/${category.id}`} 
                    className={`block py-3 px-4 hover:text-primary transition ${location === `/products/category/${category.id}` ? 'font-medium text-primary' : ''}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className={`block py-3 px-4 hover:text-primary transition ${location === '/contact' ? 'font-medium text-primary' : ''}`}>
                  Contact
                </Link>
              </li>
            </ul>
            
            <div className="hidden lg:block">
              <Link href="/products" className="py-3 inline-block text-primary">
                <span className="mr-1">%</span> Today's Deals
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white shadow-lg absolute z-20 w-full">
            <ul className="container mx-auto px-4 py-2">
              <li>
                <Link 
                  href="/" 
                  className="block py-2 px-4 hover:bg-gray-100 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              {mockCategories.map(category => (
                <li key={category.id}>
                  <Link 
                    href={`/products/category/${category.id}`} 
                    className="block py-2 px-4 hover:bg-gray-100 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/contact" 
                  className="block py-2 px-4 hover:bg-gray-100 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/products" 
                  className="block py-2 px-4 hover:bg-gray-100 transition text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-1">%</span> Today's Deals
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
