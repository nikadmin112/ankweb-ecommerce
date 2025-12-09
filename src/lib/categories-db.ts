import fs from 'fs/promises';
import path from 'path';

const CATEGORIES_PATH = path.join(process.cwd(), 'data', 'categories.json');

export interface Category {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react or custom URL
  created_at?: string;
  updated_at?: string;
}

async function ensureCategoriesExists() {
  try {
    const dir = path.dirname(CATEGORIES_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(CATEGORIES_PATH);
    } catch {
      const defaultCategories: Category[] = [
        {
          id: '1',
          name: 'Consulting',
          icon: 'MessageSquare',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Audits',
          icon: 'FileCheck',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Systems',
          icon: 'Settings',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(CATEGORIES_PATH, JSON.stringify(defaultCategories, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring categories file exists:', error);
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  await ensureCategoriesExists();
  const data = await fs.readFile(CATEGORIES_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find(c => c.id === id) || null;
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  try {
    console.log('Creating category:', category);
    const categories = await getAllCategories();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    categories.push(newCategory);
    await fs.writeFile(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
    console.log('Category created successfully:', newCategory);
    return newCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category | null> {
  const categories = await getAllCategories();
  const index = categories.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  categories[index] = {
    ...categories[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
  return categories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await getAllCategories();
  const filtered = categories.filter(c => c.id !== id);
  
  if (filtered.length === categories.length) return false;
  
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
