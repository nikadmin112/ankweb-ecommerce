"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface CryptoNetwork {
  id: string;
  name: string;
  fullName: string;
  depositAddress: string;
}

interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  displayName: string;
  networks: CryptoNetwork[];
  createdAt: string;
  updatedAt: string;
}

export function CryptoSettingsTab() {
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [editingCoin, setEditingCoin] = useState<CryptoCoin | null>(null);
  const [editingNetwork, setEditingNetwork] = useState<CryptoNetwork | null>(null);
  const [selectedCoinId, setSelectedCoinId] = useState<string>('');
  const [expandedCoins, setExpandedCoins] = useState<Set<string>>(new Set());

  const [coinFormData, setCoinFormData] = useState({
    symbol: '',
    name: '',
  });

  const [networkFormData, setNetworkFormData] = useState({
    name: '',
    fullName: '',
    depositAddress: '',
  });

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      const response = await fetch('/api/crypto-coins');
      const data = await response.json();
      setCoins(data);
    } catch (error) {
      console.error('Failed to fetch coins:', error);
      toast.error('Failed to load crypto coins');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCoin = async () => {
    try {
      const displayName = `${coinFormData.symbol} ${coinFormData.name}`.trim();
      
      if (editingCoin) {
        const response = await fetch(`/api/crypto-coins/${editingCoin.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: coinFormData.symbol,
            name: coinFormData.name,
            displayName,
          }),
        });

        if (!response.ok) throw new Error('Failed to update coin');
        toast.success('Coin updated successfully!');
      } else {
        const response = await fetch('/api/crypto-coins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: coinFormData.symbol,
            name: coinFormData.name,
            displayName,
            networks: [],
          }),
        });

        if (!response.ok) throw new Error('Failed to create coin');
        toast.success('Coin created successfully!');
      }

      setShowCoinModal(false);
      resetCoinForm();
      fetchCoins();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save coin');
    }
  };

  const handleSaveNetwork = async () => {
    try {
      if (editingNetwork) {
        const response = await fetch(`/api/crypto-coins/${selectedCoinId}/networks`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            networkId: editingNetwork.id,
            ...networkFormData,
          }),
        });

        if (!response.ok) throw new Error('Failed to update network');
        toast.success('Network updated successfully!');
      } else {
        const response = await fetch(`/api/crypto-coins/${selectedCoinId}/networks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(networkFormData),
        });

        if (!response.ok) throw new Error('Failed to add network');
        toast.success('Network added successfully!');
      }

      setShowNetworkModal(false);
      resetNetworkForm();
      fetchCoins();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save network');
    }
  };

  const handleDeleteCoin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coin? This will also delete all its networks.')) return;

    try {
      const response = await fetch(`/api/crypto-coins/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete coin');
      
      toast.success('Coin deleted successfully!');
      fetchCoins();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete coin');
    }
  };

  const handleDeleteNetwork = async (coinId: string, networkId: string) => {
    if (!confirm('Are you sure you want to delete this network?')) return;

    try {
      const response = await fetch(`/api/crypto-coins/${coinId}/networks?networkId=${networkId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete network');
      
      toast.success('Network deleted successfully!');
      fetchCoins();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete network');
    }
  };

  const openEditCoin = (coin: CryptoCoin) => {
    setEditingCoin(coin);
    setCoinFormData({
      symbol: coin.symbol,
      name: coin.name,
    });
    setShowCoinModal(true);
  };

  const openEditNetwork = (coinId: string, network: CryptoNetwork) => {
    setSelectedCoinId(coinId);
    setEditingNetwork(network);
    setNetworkFormData({
      name: network.name,
      fullName: network.fullName,
      depositAddress: network.depositAddress,
    });
    setShowNetworkModal(true);
  };

  const openAddNetwork = (coinId: string) => {
    setSelectedCoinId(coinId);
    setEditingNetwork(null);
    resetNetworkForm();
    setShowNetworkModal(true);
  };

  const resetCoinForm = () => {
    setEditingCoin(null);
    setCoinFormData({
      symbol: '',
      name: '',
    });
  };

  const resetNetworkForm = () => {
    setEditingNetwork(null);
    setNetworkFormData({
      name: '',
      fullName: '',
      depositAddress: '',
    });
  };

  const toggleCoinExpand = (coinId: string) => {
    const newExpanded = new Set(expandedCoins);
    if (newExpanded.has(coinId)) {
      newExpanded.delete(coinId);
    } else {
      newExpanded.add(coinId);
    }
    setExpandedCoins(newExpanded);
  };

  if (loading) {
    return <div className="text-zinc-500">Loading cryptocurrency settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cryptocurrency Settings</h2>
          <p className="text-zinc-500">Manage supported coins and their networks</p>
        </div>
        <button
          onClick={() => {
            resetCoinForm();
            setShowCoinModal(true);
          }}
          className="rounded-lg bg-purple-600 border border-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-500 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Coin
        </button>
      </div>

      {/* Coins List */}
      <div className="space-y-3">
        {coins.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-12 text-center">
            <p className="text-zinc-500">No coins configured yet. Click "Add Coin" to get started.</p>
          </div>
        ) : (
          coins.map((coin) => (
            <div
              key={coin.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden"
            >
              {/* Coin Header */}
              <div className="p-4 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleCoinExpand(coin.id)}
                    className="text-zinc-400 hover:text-white transition"
                  >
                    {expandedCoins.has(coin.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{coin.displayName}</h3>
                    <p className="text-xs text-zinc-500">
                      {coin.networks.length} network{coin.networks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAddNetwork(coin.id)}
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700 transition flex items-center gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Network
                  </button>
                  <button
                    onClick={() => openEditCoin(coin)}
                    className="rounded-lg bg-zinc-800 border border-zinc-700 p-2 text-white hover:bg-zinc-700 transition"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoin(coin.id)}
                    className="rounded-lg bg-red-950/50 border border-red-800/50 p-2 text-red-400 hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Networks List */}
              {expandedCoins.has(coin.id) && (
                <div className="p-4 space-y-3">
                  {coin.networks.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">
                      No networks added yet. Click "Add Network" to add one.
                    </p>
                  ) : (
                    coin.networks.map((network) => (
                      <div
                        key={network.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">
                              {network.name} - {network.fullName}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditNetwork(coin.id, network)}
                              className="rounded bg-zinc-800 p-1.5 text-zinc-400 hover:text-white transition"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteNetwork(coin.id, network.id)}
                              className="rounded bg-red-950/50 p-1.5 text-red-400 hover:text-red-300 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-700">
                          <p className="text-xs text-zinc-500 mb-1">Deposit Address</p>
                          <p className="text-sm font-mono text-white break-all">{network.depositAddress}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Coin Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl">
            <button
              onClick={() => {
                setShowCoinModal(false);
                resetCoinForm();
              }}
              className="absolute right-4 top-4 rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">
              {editingCoin ? 'Edit Coin' : 'Add New Coin'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  required
                  value={coinFormData.symbol}
                  onChange={(e) => setCoinFormData({ ...coinFormData, symbol: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none uppercase"
                  placeholder="USDT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={coinFormData.name}
                  onChange={(e) => setCoinFormData({ ...coinFormData, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                  placeholder="TetherUS"
                />
              </div>

              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-1">Preview</p>
                <p className="text-sm font-semibold text-white">
                  {coinFormData.symbol || 'SYMBOL'} {coinFormData.name || 'Name'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCoinModal(false);
                    resetCoinForm();
                  }}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-semibold text-white hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCoin}
                  disabled={!coinFormData.symbol || !coinFormData.name}
                  className="flex-1 rounded-lg bg-purple-600 border border-purple-500 px-4 py-3 font-semibold text-white hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Coin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Network Modal */}
      {showNetworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowNetworkModal(false);
                resetNetworkForm();
              }}
              className="absolute right-4 top-4 rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">
              {editingNetwork ? 'Edit Network' : 'Add New Network'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Network Short Name *
                </label>
                <input
                  type="text"
                  required
                  value={networkFormData.name}
                  onChange={(e) => setNetworkFormData({ ...networkFormData, name: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none uppercase"
                  placeholder="BSC"
                />
                <p className="text-xs text-zinc-500 mt-1">Example: BSC, TRX, ETH, TON</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Network Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={networkFormData.fullName}
                  onChange={(e) => setNetworkFormData({ ...networkFormData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                  placeholder="BNB Smart Chain (BEP20)"
                />
                <p className="text-xs text-zinc-500 mt-1">Example: BNB Smart Chain (BEP20)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Deposit Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={networkFormData.depositAddress}
                  onChange={(e) => setNetworkFormData({ ...networkFormData, depositAddress: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none font-mono text-sm"
                  placeholder="0x1284ebf089cdb12fd950af769346b845be61ffb4"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowNetworkModal(false);
                    resetNetworkForm();
                  }}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-semibold text-white hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNetwork}
                  disabled={!networkFormData.name || !networkFormData.fullName || !networkFormData.depositAddress}
                  className="flex-1 rounded-lg bg-purple-600 border border-purple-500 px-4 py-3 font-semibold text-white hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Network
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
