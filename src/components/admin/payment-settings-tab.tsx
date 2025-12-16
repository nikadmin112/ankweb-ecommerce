"use client";

import { useState, useEffect } from 'react';
import { Save, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  address: string;
}

interface PaymentSettings {
  id: string;
  method: 'upi' | 'bankIndia' | 'remitly' | 'paysend' | 'westernUnion' | 'amazonGiftCard' | 'crypto';
  upiId?: string;
  bankDetails?: BankDetails;
  email?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  updatedAt: string;
}

export function PaymentSettingsTab() {
  const [settings, setSettings] = useState<PaymentSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMethod, setActiveMethod] = useState<string>('remitly');

  const [formData, setFormData] = useState({
    upiId: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    address: '',
    email: '',
    cryptoAddress: '',
    cryptoNetwork: 'Bitcoin (BTC)',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    loadMethodSettings(activeMethod);
  }, [activeMethod, settings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const loadMethodSettings = (method: string) => {
    const setting = settings.find(s => s.id === method);
    if (setting) {
      setFormData({
        upiId: setting.upiId || '',
        accountHolderName: setting.bankDetails?.accountHolderName || '',
        accountNumber: setting.bankDetails?.accountNumber || '',
        ifscCode: setting.bankDetails?.ifscCode || '',
        address: setting.bankDetails?.address || '',
        email: setting.email || '',
        cryptoAddress: setting.cryptoAddress || '',
        cryptoNetwork: setting.cryptoNetwork || 'Bitcoin (BTC)',
      });
    } else {
      setFormData({
        upiId: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        address: '',
        email: '',
        cryptoAddress: '',
        cryptoNetwork: 'Bitcoin (BTC)',
      });
    }
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        id: activeMethod,
        method: activeMethod,
      };

      if (activeMethod === 'upi') {
        payload.upiId = formData.upiId;
      } else if (activeMethod === 'bankIndia') {
        if (formData.accountHolderName || formData.accountNumber || formData.ifscCode || formData.address) {
          payload.bankDetails = {
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            address: formData.address,
          };
        }
      } else if (activeMethod === 'remitly' || activeMethod === 'paysend') {
        if (formData.upiId) payload.upiId = formData.upiId;
        if (formData.accountHolderName || formData.accountNumber) {
          payload.bankDetails = {
            accountHolderName: formData.accountHolderName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            address: formData.address,
          };
        }
      } else if (activeMethod === 'amazonGiftCard') {
        payload.email = formData.email;
      } else if (activeMethod === 'crypto') {
        payload.cryptoAddress = formData.cryptoAddress;
        payload.cryptoNetwork = formData.cryptoNetwork;
      }

      const response = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  };

  const paymentMethods = [
    { id: 'upi', label: 'UPI (India)', icon: DollarSign },
    { id: 'bankIndia', label: 'Bank (India)', icon: CreditCard },
    { id: 'remitly', label: 'Remitly', icon: DollarSign },
    { id: 'paysend', label: 'Paysend', icon: DollarSign },
    { id: 'westernUnion', label: 'Western Union', icon: DollarSign },
    { id: 'amazonGiftCard', label: 'Amazon Gift Card', icon: CreditCard },
    { id: 'crypto', label: 'Cryptocurrency', icon: CreditCard },
  ];

  if (loading) {
    return <div className="text-zinc-500">Loading payment settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Payment Settings</h2>
        <p className="text-zinc-500">Configure international payment methods</p>
      </div>

      {/* Method Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setActiveMethod(method.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeMethod === method.id
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <method.icon className="h-4 w-4" />
            {method.label}
          </button>
        ))}
      </div>

      {/* Settings Form - WRAPPED IN DIV TO FIX JSX */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        {activeMethod === 'upi' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              UPI Payment Details (For QR Code Generation)
            </h3>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                UPI ID *
              </label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                placeholder="yourname@upi"
              />
              <p className="mt-2 text-sm text-zinc-500">
                This UPI ID will be used to generate QR codes for customer payments
              </p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
            >
              <Save className="h-4 w-4" />
              Save UPI Settings
            </button>
          </div>
        )}
        {/* Bank (India) Payment Option */}
        {activeMethod === 'bankIndia' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Bank (India) Payment Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Account Holder Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Account Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                  placeholder="IFSC Code"
                />
              </div>
            </div>
            {/* Screenshot Upload (same as UPI) */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Screenshot</label>
              {/* TODO: Integrate ImageUpload component here for screenshot upload */}
              <input type="file" accept="image/*" className="w-full" />
              <p className="mt-2 text-xs text-zinc-500">Upload screenshot of your bank payment for verification.</p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
            >
              <Save className="h-4 w-4" />
              Save Bank Settings
            </button>
          </div>
        )}

        {(activeMethod === 'remitly' || activeMethod === 'paysend') && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {activeMethod === 'remitly' ? 'Remitly' : 'Paysend'} Payment Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                placeholder="example@upi"
              />
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <h4 className="text-sm font-semibold text-white mb-4">Bank Details (Optional)</h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                    placeholder="ABCD0123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                    placeholder="123 Street, City"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMethod === 'amazonGiftCard' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Amazon Gift Card Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email to Receive Gift Card
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                placeholder="ankiitasharmmaa@gmail.com"
              />
              <p className="text-xs text-zinc-500 mt-2">
                This email will be displayed to customers when they select Amazon Gift Card payment
              </p>
            </div>
          </div>
        )}

        {activeMethod === 'crypto' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cryptocurrency Payment Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Crypto Network
              </label>
              <select
                value={formData.cryptoNetwork}
                onChange={(e) => setFormData({ ...formData, cryptoNetwork: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                <option>Bitcoin (BTC)</option>
                <option>Ethereum (ETH)</option>
                <option>USDT (TRC20)</option>
                <option>USDT (ERC20)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={formData.cryptoAddress}
                onChange={(e) => setFormData({ ...formData, cryptoAddress: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none font-mono text-sm"
                placeholder="Enter your wallet address"
              />
            </div>
          </div>
        )}

        {activeMethod === 'westernUnion' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Western Union Details
            </h3>
            <p className="text-zinc-500">
              Western Union settings coming soon. Users will be directed to Western Union website.
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-6 pt-6 border-t border-zinc-800">
          <button
            onClick={handleSave}
            className="rounded-lg bg-purple-600 border border-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-500 transition flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
