import { getServiceClient } from './supabase';

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

function fromDbCoin(dbCoin: any, networks: any[]): CryptoCoin {
  return {
    id: dbCoin.id,
    symbol: dbCoin.symbol,
    name: dbCoin.name,
    displayName: dbCoin.display_name,
    networks: networks.map(n => ({
      id: n.id,
      name: n.name,
      fullName: n.full_name,
      depositAddress: n.deposit_address,
    })),
    createdAt: dbCoin.created_at,
    updatedAt: dbCoin.updated_at,
  };
}

function toDbCoin(coin: any): any {
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    display_name: coin.displayName,
  };
}

function toDbNetwork(network: any, coinId: string): any {
  return {
    id: network.id,
    coin_id: coinId,
    name: network.name,
    full_name: network.fullName,
    deposit_address: network.depositAddress,
  };
}

export async function getAllCoins(): Promise<CryptoCoin[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];

  const { data: coins, error: coinsError } = await supabase
    .from('crypto_coins')
    .select('*')
    .order('created_at', { ascending: true });

  if (coinsError || !coins) return [];

  const { data: networks, error: networksError } = await supabase
    .from('crypto_networks')
    .select('*');

  if (networksError) return [];

  return coins.map(coin => {
    const coinNetworks = (networks || []).filter(n => n.coin_id === coin.id);
    return fromDbCoin(coin, coinNetworks);
  });
}

export async function getCoinById(id: string): Promise<CryptoCoin | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data: coin, error: coinError } = await supabase
    .from('crypto_coins')
    .select('*')
    .eq('id', id)
    .single();

  if (coinError || !coin) return null;

  const { data: networks, error: networksError } = await supabase
    .from('crypto_networks')
    .select('*')
    .eq('coin_id', id);

  if (networksError) return null;

  return fromDbCoin(coin, networks || []);
}

export async function createCoin(coinData: Omit<CryptoCoin, 'id' | 'createdAt' | 'updatedAt'>): Promise<CryptoCoin> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const newCoinId = `coin-${coinData.symbol.toLowerCase()}`;
  const dbCoin = toDbCoin({
    ...coinData,
    id: newCoinId,
  });

  const { data: coin, error: coinError } = await supabase
    .from('crypto_coins')
    .insert([dbCoin] as any)
    .select()
    .single();

  if (coinError) throw coinError;

  // Insert networks if provided
  if (coinData.networks && coinData.networks.length > 0) {
    const dbNetworks = coinData.networks.map(n => toDbNetwork(n, newCoinId));
    await supabase.from('crypto_networks').insert(dbNetworks as any);
  }

  return fromDbCoin(coin, coinData.networks || []);
}

export async function updateCoin(id: string, coinData: Partial<Omit<CryptoCoin, 'id' | 'createdAt'>>): Promise<CryptoCoin | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const updateData: any = {};
  if (coinData.symbol) updateData.symbol = coinData.symbol;
  if (coinData.name) updateData.name = coinData.name;
  if (coinData.displayName) updateData.display_name = coinData.displayName;

  const { data: coin, error } = await supabase
    .from('crypto_coins')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error || !coin) return null;

  const { data: networks } = await supabase
    .from('crypto_networks')
    .select('*')
    .eq('coin_id', id);

  return fromDbCoin(coin, networks || []);
}

export async function deleteCoin(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) return false;

  // Delete networks first (foreign key cascade should handle this, but being explicit)
  await supabase.from('crypto_networks').delete().eq('coin_id', id);

  const { error } = await supabase.from('crypto_coins').delete().eq('id', id);
  return !error;
}

export async function addNetworkToCoin(coinId: string, network: Omit<CryptoNetwork, 'id'>): Promise<CryptoCoin | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const newNetworkId = `net-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const dbNetwork = toDbNetwork({ ...network, id: newNetworkId }, coinId);

  const { error } = await supabase
    .from('crypto_networks')
    .insert([dbNetwork] as any);

  if (error) return null;

  return await getCoinById(coinId);
}

export async function updateNetwork(coinId: string, networkId: string, networkData: Partial<Omit<CryptoNetwork, 'id'>>): Promise<CryptoCoin | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const updateData: any = {};
  if (networkData.name) updateData.name = networkData.name;
  if (networkData.fullName) updateData.full_name = networkData.fullName;
  if (networkData.depositAddress) updateData.deposit_address = networkData.depositAddress;

  const { error } = await supabase
    .from('crypto_networks')
    .update(updateData as any)
    .eq('id', networkId)
    .eq('coin_id', coinId);

  if (error) return null;

  return await getCoinById(coinId);
}

export async function deleteNetwork(coinId: string, networkId: string): Promise<CryptoCoin | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { error } = await supabase
    .from('crypto_networks')
    .delete()
    .eq('id', networkId)
    .eq('coin_id', coinId);

  if (error) return null;

  return await getCoinById(coinId);
}
