import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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

const settingsFilePath = join(process.cwd(), 'data', 'payment-settings.json');

function readSettings(): PaymentSettings[] {
  try {
    const data = readFileSync(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeSettings(settings: PaymentSettings[]): void {
  writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
}

export function getAllSettings(): PaymentSettings[] {
  return readSettings();
}

export function getSettingByMethod(method: string): PaymentSettings | null {
  const settings = readSettings();
  return settings.find(s => s.id === method) || null;
}

export function updateSetting(settingData: Omit<PaymentSettings, 'updatedAt'>): PaymentSettings {
  const settings = readSettings();
  const index = settings.findIndex(s => s.id === settingData.id);
  
  const updatedSetting: PaymentSettings = {
    ...settingData,
    updatedAt: new Date().toISOString(),
  };
  
  if (index >= 0) {
    settings[index] = updatedSetting;
  } else {
    settings.push(updatedSetting);
  }
  
  writeSettings(settings);
  return updatedSetting;
}

export function deleteSetting(id: string): boolean {
  const settings = readSettings();
  const filtered = settings.filter(s => s.id !== id);
  
  if (filtered.length === settings.length) {
    return false;
  }
  
  writeSettings(filtered);
  return true;
}
