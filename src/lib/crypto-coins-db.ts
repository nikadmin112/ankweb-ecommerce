import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface CryptoNetwork {
  id: string;
  name: string;
  fullName: string;
  depositAddress: string;
}

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  displayName: string; // e.g., "USDT TetherUS"
  networks: CryptoNetwork[];
  createdAt: string;
  updatedAt: string;
}

const coinsFilePath = join(process.cwd(), 'data', 'crypto-coins.json');

function readCoins(): CryptoCoin[] {
  try {
    const data = readFileSync(coinsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeCoins(coins: CryptoCoin[]): void {
  writeFileSync(coinsFilePath, JSON.stringify(coins, null, 2));
}

export function getAllCoins(): CryptoCoin[] {
  return readCoins();
}

export function getCoinById(id: string): CryptoCoin | null {
  const coins = readCoins();
  return coins.find(c => c.id === id) || null;
}

export function createCoin(coinData: Omit<CryptoCoin, 'id' | 'createdAt' | 'updatedAt'>): CryptoCoin {
  const coins = readCoins();
  const newCoin: CryptoCoin = {
    ...coinData,
    id: `coin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  coins.push(newCoin);
  writeCoins(coins);
  return newCoin;
}

export function updateCoin(id: string, coinData: Partial<Omit<CryptoCoin, 'id' | 'createdAt'>>): CryptoCoin | null {
  const coins = readCoins();
  const index = coins.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  coins[index] = {
    ...coins[index],
    ...coinData,
    updatedAt: new Date().toISOString(),
  };
  
  writeCoins(coins);
  return coins[index];
}

export function deleteCoin(id: string): boolean {
  const coins = readCoins();
  const filtered = coins.filter(c => c.id !== id);
  
  if (filtered.length === coins.length) {
    return false;
  }
  
  writeCoins(filtered);
  return true;
}

export function addNetworkToCoin(coinId: string, network: Omit<CryptoNetwork, 'id'>): CryptoCoin | null {
  const coin = getCoinById(coinId);
  if (!coin) return null;
  
  const newNetwork: CryptoNetwork = {
    ...network,
    id: `net-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  
  coin.networks.push(newNetwork);
  return updateCoin(coinId, { networks: coin.networks });
}

export function updateNetwork(coinId: string, networkId: string, networkData: Partial<Omit<CryptoNetwork, 'id'>>): CryptoCoin | null {
  const coin = getCoinById(coinId);
  if (!coin) return null;
  
  const networkIndex = coin.networks.findIndex(n => n.id === networkId);
  if (networkIndex === -1) return null;
  
  coin.networks[networkIndex] = {
    ...coin.networks[networkIndex],
    ...networkData,
  };
  
  return updateCoin(coinId, { networks: coin.networks });
}

export function deleteNetwork(coinId: string, networkId: string): CryptoCoin | null {
  const coin = getCoinById(coinId);
  if (!coin) return null;
  
  coin.networks = coin.networks.filter(n => n.id !== networkId);
  return updateCoin(coinId, { networks: coin.networks });
}
