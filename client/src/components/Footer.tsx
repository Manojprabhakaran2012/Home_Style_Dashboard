import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">
              HomeStyle <span className="text-secondary">Erode</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Bringing style, comfort, and quality to your home since 2005. We offer a wide range of furniture and home decor products at competitive prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white transition">Products</Link></li>
              <li><Link href="/products/category/2" className="text-gray-400 hover:text-white transition">Mattresses</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link href="/account" className="text-gray-400 hover:text-white transition">My Account</Link></li>
              <li><Link href="/account?tab=orders" className="text-gray-400 hover:text-white transition">Track Your Order</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition">Return Policy</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Contact Information</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-secondary"></i>
                <span className="text-gray-400">123 Main Street, Erode, Tamil Nadu, India - 638001</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-3 text-secondary"></i>
                <span className="text-gray-400">+91 8754545656</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-secondary"></i>
                <span className="text-gray-400">info@homestyleerode.com</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-clock mr-3 text-secondary"></i>
                <span className="text-gray-400">Mon-Sat: 10:00 AM - 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; 2023 HomeStyle Erode. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
