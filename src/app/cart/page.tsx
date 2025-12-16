"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '@/components/cart-context';
import { useCurrency } from '@/components/currency-context';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, addToCart, removeFromCart, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = items.reduce((sum, item: any) => {
    const basePrice = item.isPromoFree ? 0 : item.price;
    const itemPrice = item.discount ? basePrice * (1 - item.discount / 100) : basePrice;
    return sum + itemPrice * item.quantity;
  }, 0);

  let discount = 0;
  let freeItems: any[] = [];

  if (appliedPromo) {
    console.log('🎫 Cart Page - Promo applied:', appliedPromo);
    
    if (appliedPromo.discount_type === 'percentage') {
      discount = (subtotal * Number(appliedPromo.discount_value)) / 100;
      console.log(`✅ Percentage: ${appliedPromo.discount_value}% of ${subtotal} = ${discount}`);
    } else if (appliedPromo.discount_type === 'fixed') {
      discount = Number(appliedPromo.discount_value);
      console.log(`✅ Fixed: ${discount}`);
    } else if (appliedPromo.discount_type === 'bogo') {
      // Check if any single item has quantity >= 2
      const itemWithMultipleQty = items.find(item => item.quantity >= 2);
      
      if (itemWithMultipleQty) {
        // Apply 50% discount on the item with multiple quantity
        const itemPrice = itemWithMultipleQty.discount 
          ? itemWithMultipleQty.price * (1 - itemWithMultipleQty.discount / 100) 
          : itemWithMultipleQty.price;
        // Discount is 50% of (price * quantity)
        discount = (itemPrice * itemWithMultipleQty.quantity) * 0.5;
        console.log(`✅ BOGO (same product x${itemWithMultipleQty.quantity}): 50% off = ${discount}`);
      } else if (items.length >= 2) {
        // BOGO: Sort by price ASC, make the cheapest one free
        const sortedByPrice = [...items].sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        const cheapestItem = sortedByPrice[0];
        freeItems = [cheapestItem];
        const cheapestPrice = cheapestItem.discount ? cheapestItem.price * (1 - cheapestItem.discount / 100) : cheapestItem.price;
        discount = cheapestPrice;
        console.log(`✅ BOGO (different products): ${cheapestItem.name} free = ${discount}`);
      }
    } else if (appliedPromo.discount_type === 'free_service') {
      // free_service is modeled as an added free item (price 0), not a monetary discount.
      discount = 0;
    }
    console.log('💰 Final discount:', discount);
  }

  const total = Math.max(0, subtotal - discount);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const response = await fetch('/api/promo-codes');
      const promoCodes = await response.json();
      const promo = promoCodes.find((p: any) => p.code.toUpperCase() === promoCode.toUpperCase());

      if (promo) {
        // Check if promo is active
        if (!promo.is_active) {
          toast.error('This promo code is no longer active');
          setPromoLoading(false);
          return;
        }
        
        // Check minimum cart value requirement
        if (promo.minCartValue && subtotal < promo.minCartValue) {
          toast.error(`Minimum cart value of ${formatPrice(promo.minCartValue)} required to use this promo code`);
          setPromoLoading(false);
          return;
        }

        // If free service, fetch the product and add it to cart as ₹0
        if (promo.discount_type === 'free_service' && promo.free_product_id) {
          const existing = items.find((i: any) => i.id === promo.free_product_id);
          if (!existing) {
            const freeRes = await fetch(`/api/products/${promo.free_product_id}`, { cache: 'no-store' });
            if (!freeRes.ok) {
              toast.error('Free product not found');
              setPromoLoading(false);
              return;
            }
            const freeProduct = await freeRes.json();
            addToCart({ ...freeProduct, promoOriginalPrice: freeProduct.price, price: 0, isPromoFree: true });
          }
        }
        setAppliedPromo(promo);
        console.log('✅ Promo applied successfully:', promo);
        
        // Show specific success message
        if (promo.discount_type === 'percentage') {
          toast.success(`${promo.discount_value}% discount applied!`);
        } else if (promo.discount_type === 'fixed') {
          toast.success(`₹${promo.discount_value} discount applied!`);
        } else if (promo.discount_type === 'bogo') {
          toast.success(`Buy 1 Get 1 Free applied!`);
        } else if (promo.discount_type === 'free_service') {
          toast.success(`Free service promo applied!`);
        } else {
          toast.success(`Promo code ${promo.code} applied!`);
        }
      } else {
        toast.error('Invalid promo code');
      }
    } catch (error) {
      toast.error('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    if (appliedPromo?.discount_type === 'free_service' && appliedPromo?.free_product_id) {
      const promoItem = items.find((i: any) => i.id === appliedPromo.free_product_id && i.isPromoFree);
      if (promoItem) {
        removeFromCart(appliedPromo.free_product_id);
      }
    }
    setAppliedPromo(null);
    setPromoCode('');
    toast.success('Promo code removed');
  };

  const updateQuantity = (item: (typeof items)[0], delta: number) => {
    if (delta > 0) {
      addToCart(item);
    } else if (item.quantity > 1) {
      // Decrement by creating modified item (cart context doesn't have decrement, so we remove and re-add)
      removeFromCart(item.id);
      for (let i = 0; i < item.quantity - 1; i++) {
        addToCart(item);
      }
    } else {
      removeFromCart(item.id);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-zinc-700" />
          <h1 className="mt-4 text-2xl font-semibold text-white">Your cart is empty</h1>
          <p className="mt-2 text-zinc-400">Add services from the shop to get started.</p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-lg bg-purple-600 border border-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500"
          >
            Browse services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {items.map((item: any) => {
            const isFree = freeItems.some(f => f.id === item.id) || item.isPromoFree;
            const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
            const mrpPrice = typeof item.promoOriginalPrice === 'number' ? item.promoOriginalPrice : itemPrice;
            
            return (
              <article
                key={item.id}
                className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg"
              >
                <div className="flex-1">
                  <Link href={`/shop/${item.id}`} className="group">
                    <h3 className="text-lg font-semibold text-white transition group-hover:text-purple-400">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                  <div className="mt-2 space-y-1">
                    {isFree ? (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-semibold text-green-400">Price: {currency.symbol}0</p>
                          <span className="rounded bg-green-600/20 border border-green-500/50 px-2 py-0.5 text-xs font-medium text-green-400">
                            FREE
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500">
                          M.R.P: <span className="line-through">{formatPrice(mrpPrice)}</span>
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.discount && item.discount > 0 && (
                          <>
                            <p className="text-sm text-zinc-500 line-through">{formatPrice(item.price)}</p>
                            <span className="text-xs text-purple-400">-{item.discount}%</span>
                          </>
                        )}
                        <p className="text-xl font-semibold text-white">
                          {formatPrice(itemPrice)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              <div className="flex flex-col items-end justify-between">
                {!item.isPromoFree && (
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-full border border-zinc-800 p-2 text-zinc-500 transition hover:border-red-500/50 hover:text-red-400"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                {!item.isPromoFree ? (
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900">
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      className="p-2 text-zinc-500 transition hover:text-white"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item, 1)}
                      className="p-2 text-zinc-500 transition hover:text-white"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-500/50 bg-green-600/10 px-3 py-2">
                    <p className="text-xs text-green-400 font-semibold">Promo Gift</p>
                  </div>
                )}
              </div>
            </article>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Order Summary</h2>
            
            {/* Promo Code Section */}
            <div className="mt-4 border-t border-zinc-800 pt-4 space-y-3">
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
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
            </div>

            <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-800 pt-3 text-lg font-semibold text-white">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href={appliedPromo ? `/checkout?promo=${appliedPromo.code}` : '/checkout'}
              className="mt-6 block w-full rounded-lg bg-purple-600 border border-purple-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500"
            >
              Proceed to Checkout
            </Link>

            {/* Trust Badges */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <svg className="h-4 w-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Trusted by 500+ Customers</span>
              </div>
            </div>

            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
