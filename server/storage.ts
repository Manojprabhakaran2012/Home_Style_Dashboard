import { users, categories, products, orders, orderItems, reviews, 
  type User, type InsertUser, type Category, type InsertCategory, 
  type Product, type InsertProduct, type Order, type InsertOrder, 
  type OrderItem, type InsertOrderItem, type Review, type InsertReview 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, or, like, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  getBestsellerProducts(): Promise<Product[]>;
  getSaleProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Order methods
  getOrders(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review methods
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  
  sessionStore: session.Store;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }
  
  async getNewProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isNew
    );
  }
  
  async getBestsellerProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isBestseller
    );
  }
  
  async getSaleProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isSale
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery))
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = await this.getOrderById(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Review methods
  async getReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date() 
    };
    this.reviews.set(id, newReview);
    return newReview;
  }
  
  // Initialize with sample data
  private initializeData(): void {
    // Add categories
    const categories = [
      { name: "Furniture", description: "Quality furniture for your home", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" },
      { name: "Mattresses", description: "Premium mattresses for better sleep", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" },
      { name: "Home Decor", description: "Beautiful decorative items for your home", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" },
      { name: "Lighting", description: "Illuminate your space with our lighting collection", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80" }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Add products
    const products = [
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
    ];
    
    products.forEach(product => {
      this.createProduct(product);
    });
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isFeatured, true));
  }

  async getNewProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isNew, true));
  }

  async getBestsellerProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isBestseller, true));
  }

  async getSaleProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isSale, true));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(products).where(
      or(
        like(sql`LOWER(${products.name})`, lowerQuery),
        like(sql`LOWER(${products.description})`, lowerQuery)
      )
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderData = {
      ...insertOrder,
      createdAt: new Date()
    };
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }

  // Review methods
  async getReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const reviewData = {
      ...insertReview,
      createdAt: new Date()
    };
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();