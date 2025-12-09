import fs from 'fs/promises';
import path from 'path';

const PROMO_PATH = path.join(process.cwd(), 'data', 'promo-codes.json');

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'bogo' | 'free_service';
  value: string;
  description?: string;
  minCartValue?: number;
  created_at?: string;
}

async function ensurePromoCodesExists() {
  try {
    const dir = path.dirname(PROMO_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(PROMO_PATH);
    } catch {
      await fs.writeFile(PROMO_PATH, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring promo codes file exists:', error);
    throw error;
  }
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  await ensurePromoCodesExists();
  const data = await fs.readFile(PROMO_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const promoCodes = await getAllPromoCodes();
  return promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase()) || null;
}

export async function createPromoCode(promo: Omit<PromoCode, 'id' | 'created_at'>): Promise<PromoCode> {
  const promoCodes = await getAllPromoCodes();
  const newPromo: PromoCode = {
    ...promo,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  promoCodes.push(newPromo);
  await fs.writeFile(PROMO_PATH, JSON.stringify(promoCodes, null, 2));
  return newPromo;
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const promoCodes = await getAllPromoCodes();
  const filtered = promoCodes.filter(p => p.id !== id);
  
  if (filtered.length === promoCodes.length) return false;
  
  await fs.writeFile(PROMO_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
