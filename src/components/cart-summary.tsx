"use client";

import { useState } from 'react';
import { Trash2, Tag } from 'lucide-react';
import { useCart } from './cart-context';
import { useCurrency } from './currency-context';
import toast from 'react-hot-toast';

export function CartSummary() {
  const { items, removeFromCart, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  let discount = 0;
  let freeItems: any[] = [];

  if (appliedPromo) {
    console.log('🎫 Promo applied:', {
      code: appliedPromo.code,
      type: appliedPromo.discount_type,
      discount_value: appliedPromo.discount_value,
      free_product_id: appliedPromo.free_product_id,
      subtotal,
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity }))
    });

    if (appliedPromo.discount_type === 'percentage') {
      discount = (subtotal * Number(appliedPromo.discount_value)) / 100;
      console.log(`✅ Applied ${appliedPromo.discount_value}% OFF - Discount: ₹${discount}`);
      toast.success(`${appliedPromo.discount_value}% OFF applied! Saved ₹${discount.toFixed(2)}`);
    } else if (appliedPromo.discount_type === 'fixed') {
      discount = Number(appliedPromo.discount_value);
      console.log(`✅ Applied FIXED ₹${discount} OFF`);
      toast.success(`₹${discount} OFF applied!`);
    } else if (appliedPromo.discount_type === 'bogo' && items.length >= 2) {
      // Sort by price descending to find most expensive item
      const sortedItems = [...items].sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceA - priceB; // Ascending order
      });
      // Make the cheapest item free
      const cheapestItem = sortedItems[0];
      const cheapestPrice = cheapestItem.discount 
        ? cheapestItem.price * (1 - cheapestItem.discount / 100) 
        : cheapestItem.price;
      freeItems = [cheapestItem];
      discount = cheapestPrice;
      console.log(`✅ BOGO Applied - ${cheapestItem.name} is FREE (₹${cheapestPrice})`);
      toast.success(`BOGO: ${cheapestItem.name} is FREE!`);
    } else if (appliedPromo.discount_type === 'bogo' && items.length < 2) {
      console.log('⚠️ BOGO requires 2+ items in cart');
      toast.error('BOGO requires at least 2 items in cart');
    } else if (appliedPromo.discount_type === 'free_service' && appliedPromo.free_product_id) {
      const freeProduct = items.find(i => i.id === appliedPromo.free_product_id);
      console.log(`🔍 Looking for product ${appliedPromo.free_product_id}, found:`, freeProduct);
      if (freeProduct) {
        const freePrice = freeProduct.discount 
          ? freeProduct.price * (1 - freeProduct.discount / 100) 
          : freeProduct.price;
        freeItems = [freeProduct];
        discount = freePrice;
        console.log(`✅ FREE SERVICE Applied - ${freeProduct.name} is FREE (₹${freePrice})`);
        toast.success(`${freeProduct.name} is FREE!`);
      } else {
        console.log('⚠️ Free product not in cart');
        toast.error('Add the free service to your cart first');
      }
    } else if (appliedPromo.discount_type === 'free_service' && !appliedPromo.free_product_id) {
      console.log('⚠️ Free service promo missing product ID');
      toast.error('Invalid promo configuration');
    }

    console.log('💰 Final discount:', discount);
  }

  const total = subtotal - discount;

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const response = await fetch('/api/promo-codes');
      const promoCodes = await response.json();
      console.log('📋 All promo codes:', promoCodes);
      const promo = promoCodes.find((p: any) => p.code.toUpperCase() === promoCode.toUpperCase());

      if (promo) {
        console.log('✅ Found promo:', promo);
        setAppliedPromo(promo);
        toast.success(`Promo code ${promo.code} applied!`);
      } else {
        console.log('❌ Promo code not found:', promoCode);
        toast.error('Invalid promo code');
      }
    } catch (error) {
      console.error('❌ Error applying promo:', error);
      toast.error('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.success('Promo code removed');
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400 shadow-2xl">
        Your cart is empty. Add services to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Cart Total</p>
          <p className="text-3xl font-bold text-white">{formatPrice(total)}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-zinc-500 hover:text-white transition"
        >
          Clear cart
        </button>
      </div>

      <div className="divide-y divide-zinc-800">
        {items.map((item) => {
          const isFree = freeItems.some(f => f.id === item.id);
          const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
          
          return (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div className="flex-1">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-sm text-zinc-500">Qty {item.quantity}</p>
                {item.discount && item.discount > 0 && (
                  <span className="text-xs text-purple-400">-{item.discount}% discount</span>
                )}
                {isFree && (
                  <span className="ml-2 rounded bg-green-600/20 border border-green-500/50 px-2 py-0.5 text-xs font-medium text-green-400">
                    FREE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {item.discount && item.discount > 0 && (
                    <p className="text-xs text-zinc-500 line-through">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  )}
                  <p className={`text-white ${isFree ? 'line-through text-zinc-500' : ''}`}>
                    {formatPrice(itemPrice * item.quantity)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-lg border border-zinc-800 p-2 text-zinc-500 hover:border-red-500/50 hover:text-red-400 transition"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo Code Section */}
      <div className="border-t border-zinc-800 pt-4 space-y-3">
        {!appliedPromo ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            <button
              onClick={applyPromoCode}
              disabled={promoLoading}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500 disabled:opacity-50 transition"
            >
              Apply
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-green-500/50 bg-green-600/10 p-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-sm font-semibold text-green-400">{appliedPromo.code}</p>
                <p className="text-xs text-zinc-400">{appliedPromo.description}</p>
              </div>
            </div>
            <button
              onClick={removePromo}
              className="text-sm text-zinc-500 hover:text-red-400 transition"
            >
              Remove
            </button>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-800 pt-2 text-lg font-bold text-white">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <button className="w-full rounded-lg bg-purple-600 border border-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500">
        Checkout
      </button>
    </div>
  );
}
