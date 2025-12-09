import fs from 'fs/promises';
import path from 'path';
import type { Product } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'products.json');

export interface LocalProduct extends Product {
  created_at?: string;
  updated_at?: string;
}

async function ensureDbExists() {
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(DB_PATH);
    } catch {
      // File doesn't exist, create with default products
      const defaultProducts: LocalProduct[] = [
        {
          id: '1',
          name: '1:1 Strategy Call',
          description: 'Get personalized advice on your business automation and growth strategy',
          price: 149,
          badge: 'Popular',
          category: 'Consulting',
          fullDescription: 'Book a private 60-minute strategy session where we dive deep into your business challenges. Build a custom roadmap for automation, systems optimization, and sustainable growth.',
          features: [
            '60-minute video call',
            'Custom action plan',
            'Follow-up email summary',
            'Resource recommendations'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Full Business Audit',
          description: 'Comprehensive analysis of your workflows, systems, and automation opportunities',
          price: 199,
          badge: 'Limited',
          category: 'Audits',
          fullDescription: 'Get a complete breakdown of your current business operations. Receive a detailed report identifying bottlenecks, automation opportunities, and efficiency improvements with prioritized action items.',
          features: [
            'Detailed workflow analysis',
            'Written audit report (15 plus pages)',
            'Priority recommendations',
            '30-day email support'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Custom Automation Setup',
          description: 'Fully built automation system tailored to your business needs',
          price: 349,
          badge: 'New',
          category: 'Systems',
          fullDescription: 'Stop wasting time on manual tasks. Build a custom automation workflow using tools like Zapier, Notion, Airtable, or Make. Includes workflow design, setup, testing, and a training video so your team can maintain it.',
          features: [
            'Custom workflow design',
            'Complete setup and integration',
            'Testing and optimization',
            'Training video walkthrough',
            '60-day maintenance support'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(DB_PATH, JSON.stringify(defaultProducts, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring database exists:', error);
    throw error;
  }
}

export async function getAllProducts(): Promise<LocalProduct[]> {
  await ensureDbExists();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getProductById(id: string): Promise<LocalProduct | null> {
  const products = await getAllProducts();
  return products.find(p => p.id === id) || null;
}

export async function createProduct(product: Omit<LocalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<LocalProduct> {
  const products = await getAllProducts();
  const newProduct: LocalProduct = {
    ...product,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  products.push(newProduct);
  await fs.writeFile(DB_PATH, JSON.stringify(products, null, 2));
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Omit<LocalProduct, 'id' | 'created_at'>>): Promise<LocalProduct | null> {
  const products = await getAllProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  products[index] = {
    ...products[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  await fs.writeFile(DB_PATH, JSON.stringify(products, null, 2));
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const products = await getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    
    if (filtered.length === products.length) {
      console.log('Product not found:', id);
      return false;
    }
    
    await fs.writeFile(DB_PATH, JSON.stringify(filtered, null, 2));
    console.log('Product deleted successfully:', id);
    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}
