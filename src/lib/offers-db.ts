import fs from 'fs/promises';
import path from 'path';

const OFFERS_PATH = path.join(process.cwd(), 'data', 'offers.json');

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  created_at?: string;
  updated_at?: string;
}

async function ensureOffersExists() {
  try {
    const dir = path.dirname(OFFERS_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(OFFERS_PATH);
    } catch {
      const defaultOffers: Offer[] = [
        {
          id: '1',
          title: 'Special Offer',
          description: 'Get 20% off on all services',
          image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
          link: '/shop',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Limited Time Deal',
          description: 'Premium packages at exclusive prices',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          link: '/shop',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'New Services',
          description: 'Explore our latest offerings',
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
          link: '/shop',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(OFFERS_PATH, JSON.stringify(defaultOffers, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring offers file exists:', error);
    throw error;
  }
}

export async function getAllOffers(): Promise<Offer[]> {
  await ensureOffersExists();
  const data = await fs.readFile(OFFERS_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const offers = await getAllOffers();
  return offers.find(o => o.id === id) || null;
}

export async function createOffer(offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>): Promise<Offer> {
  const offers = await getAllOffers();
  const newOffer: Offer = {
    ...offer,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  offers.push(newOffer);
  await fs.writeFile(OFFERS_PATH, JSON.stringify(offers, null, 2));
  return newOffer;
}

export async function updateOffer(id: string, updates: Partial<Omit<Offer, 'id' | 'created_at'>>): Promise<Offer | null> {
  const offers = await getAllOffers();
  const index = offers.findIndex(o => o.id === id);
  
  if (index === -1) return null;
  
  offers[index] = {
    ...offers[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  await fs.writeFile(OFFERS_PATH, JSON.stringify(offers, null, 2));
  return offers[index];
}

export async function deleteOffer(id: string): Promise<boolean> {
  const offers = await getAllOffers();
  const filtered = offers.filter(o => o.id !== id);
  
  if (filtered.length === offers.length) return false;
  
  await fs.writeFile(OFFERS_PATH, JSON.stringify(filtered, null, 2));
  return true;
}
