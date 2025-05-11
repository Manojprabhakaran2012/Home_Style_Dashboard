import { db } from "./db";
import { users, categories, products } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log("Starting database seeding...");

  // First check if we already have data
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length > 0) {
    console.log("Database already contains data, skipping seed");
    return;
  }

  // Add categories
  console.log("Adding categories...");
  await db.insert(categories).values([
    { 
      name: "Furniture", 
      description: "Quality furniture for your home", 
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" 
    },
    { 
      name: "Mattresses", 
      description: "Premium mattresses for better sleep", 
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" 
    },
    { 
      name: "Home Decor", 
      description: "Beautiful decorative items for your home", 
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" 
    },
    { 
      name: "Lighting", 
      description: "Illuminate your space with our lighting collection", 
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" 
    }
  ]);

  // Add products
  console.log("Adding products...");
  await db.insert(products).values([
    {
      name: "Modern Luxe Sofa",
      description: "Premium comfort with elegant design",
      price: 29999,
      salePrice: 34999,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      categoryId: 1,
      rating: 4.5,
      reviewCount: 24,
      inStock: true,
      isFeatured: true,
      isNew: true,
      isBestseller: false,
      isSale: false
    },
    {
      name: "Orthopedic Memory Foam Mattress",
      description: "Superior support for better sleep",
      price: 12499,
      salePrice: 15999,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      categoryId: 2,
      rating: 5.0,
      reviewCount: 36,
      inStock: true,
      isFeatured: true,
      isNew: false,
      isBestseller: false,
      isSale: true
    },
    {
      name: "Wooden Coffee Table",
      description: "Handcrafted solid wood design",
      price: 8999,
      salePrice: 10499,
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      categoryId: 1,
      rating: 4.0,
      reviewCount: 18,
      inStock: true,
      isFeatured: true,
      isNew: false,
      isBestseller: false,
      isSale: false
    },
    {
      name: "Decorative Ceramic Vase",
      description: "Elegant addition to any home",
      price: 1299,
      salePrice: 1899,
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      categoryId: 3,
      rating: 4.5,
      reviewCount: 42,
      inStock: true,
      isFeatured: true,
      isNew: false,
      isBestseller: true,
      isSale: false
    },
    {
      name: "Premium Spring Mattress",
      description: "Luxurious comfort with pocket springs",
      price: 18999,
      salePrice: 22999,
      image: "https://images.unsplash.com/photo-1631046263435-ef4dc319cca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80",
      categoryId: 2,
      rating: 4.7,
      reviewCount: 29,
      inStock: true,
      isFeatured: false,
      isNew: false,
      isBestseller: true,
      isSale: true
    },
    {
      name: "Natural Latex Mattress",
      description: "Eco-friendly and sustainable comfort",
      price: 21999,
      salePrice: 25999,
      image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80",
      categoryId: 2,
      rating: 4.8,
      reviewCount: 31,
      inStock: true,
      isFeatured: false,
      isNew: true,
      isBestseller: false,
      isSale: true
    },
    {
      name: "Gel Memory Foam Mattress",
      description: "Cooling technology for better sleep",
      price: 19999,
      salePrice: 23999,
      image: "https://images.unsplash.com/photo-1592229505726-ca121723b8ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300&q=80",
      categoryId: 2,
      rating: 4.6,
      reviewCount: 24,
      inStock: true,
      isFeatured: true,
      isNew: false,
      isBestseller: false,
      isSale: false
    },
    {
      name: "Pendant Ceiling Light",
      description: "Modern design with warm illumination",
      price: 2999,
      salePrice: 4299,
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      categoryId: 4,
      rating: 4.3,
      reviewCount: 15,
      inStock: true,
      isFeatured: false,
      isNew: true,
      isBestseller: false,
      isSale: true
    }
  ]);

  // Add test user
  console.log("Adding test user...");
  const hashedPassword = await hashPassword("password123");
  await db.insert(users).values({
    username: "testuser",
    email: "test@example.com",
    password: hashedPassword,
    firstName: "Test",
    lastName: "User",
  });

  console.log("Database seeding completed successfully!");
}

seedDatabase().catch(console.error);