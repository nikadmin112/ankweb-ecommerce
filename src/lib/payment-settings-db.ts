import { getServiceClient } from './supabase';

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  address: string;
}

export interface PaymentSettings {
  id: string;
  method: 'remitly' | 'paysend' | 'westernUnion' | 'amazonGiftCard' | 'crypto';
  upiId?: string;
  bankDetails?: BankDetails;
  email?: string; // For Amazon Gift Card
  cryptoAddress?: string;
  cryptoNetwork?: string;
  updatedAt: string;
}

function fromDbSetting(dbSetting: any): PaymentSettings {
  return {
    id: dbSetting.id,
    method: dbSetting.method,
    upiId: dbSetting.upi_id,
    bankDetails: dbSetting.bank_details,
    email: dbSetting.email,
    cryptoAddress: dbSetting.crypto_address,
    cryptoNetwork: dbSetting.crypto_network,
    updatedAt: dbSetting.updated_at,
  };
}

function toDbSetting(setting: any): any {
  return {
    id: setting.id,
    method: setting.method,
    upi_id: setting.upiId,
    bank_details: setting.bankDetails,
    email: setting.email,
    crypto_address: setting.cryptoAddress,
    crypto_network: setting.cryptoNetwork,
  };
}

export async function getAllSettings(): Promise<PaymentSettings[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || !data) return [];
  return data.map(fromDbSetting);
}

export async function getSettingByMethod(method: string): Promise<PaymentSettings | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('id', method)
    .single();

  if (error || !data) return null;
  return fromDbSetting(data);
}

export async function updateSetting(settingData: Omit<PaymentSettings, 'updatedAt'>): Promise<PaymentSettings> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const dbSetting = toDbSetting(settingData);

  const { data, error } = await supabase
    .from('payment_settings')
    .upsert([dbSetting] as any)
    .select()
    .single();

  if (error) throw error;
  return fromDbSetting(data);
}

export async function deleteSetting(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('payment_settings')
    .delete()
    .eq('id', id);

  return !error;
}
