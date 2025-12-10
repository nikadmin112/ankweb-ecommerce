"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-context';
import { useAuth } from '@/components/auth-context';
import { useCurrency } from '@/components/currency-context';
import { ShieldCheck, Award, Lock, Upload, CheckCircle, Clock, Globe, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes
  const [showQR, setShowQR] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [expandedCountries, setExpandedCountries] = useState<string | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [cryptoCoins, setCryptoCoins] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [upiSettings, setUpiSettings] = useState<any>(null);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: '',
    paymentNationality: 'indian' as 'indian' | 'international' | 'crypto',
    internationalMethod: '' as 'gift-card' | 'remitly' | 'paysend' | 'western-union' | '',
    notes: '',
  });

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  // Calculate discount from promo
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'percentage') {
      discount = (subtotal * Number(appliedPromo.discount_value)) / 100;
    } else if (appliedPromo.discount_type === 'fixed') {
      discount = Number(appliedPromo.discount_value);
    } else if (appliedPromo.discount_type === 'bogo' && items.length >= 2) {
      const sortedByPrice = [...items].sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceA - priceB;
      });
      const cheapestItem = sortedByPrice[0];
      const cheapestPrice = cheapestItem.discount ? cheapestItem.price * (1 - cheapestItem.discount / 100) : cheapestItem.price;
      discount = cheapestPrice;
    } else if (appliedPromo.discount_type === 'free_service' && appliedPromo.free_product_id) {
      const freeProduct = items.find(i => i.id === appliedPromo.free_product_id);
      if (freeProduct) {
        const freePrice = freeProduct.discount ? freeProduct.price * (1 - freeProduct.discount / 100) : freeProduct.price;
        discount = freePrice;
      }
    }
  }

  const total = Math.max(0, subtotal - discount);

  // Fetch promo code from URL and validate it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promoCode = params.get('promo');
    if (promoCode) {
      fetch('/api/promo-codes')
        .then(res => res.json())
        .then(promoCodes => {
          const promo = promoCodes.find((p: any) => p.code.toUpperCase() === promoCode.toUpperCase());
          if (promo && promo.is_active) {
            setAppliedPromo(promo);
            console.log('✅ Promo loaded from cart:', promo);
          } else if (promo && !promo.is_active) {
            console.log('⚠️ Promo code is inactive:', promo.code);
            toast.error('This promo code is no longer active');
          }
        })
        .catch(err => console.error('Failed to load promo:', err));
    }
  }, []);

  // Fetch crypto coins and UPI settings on mount
  useEffect(() => {
    fetchCryptoCoins();
    fetchUpiSettings();
  }, []);

  // Fetch payment settings when international method changes
  useEffect(() => {
    if (formData.internationalMethod) {
      fetchPaymentSettings(formData.internationalMethod);
    }
  }, [formData.internationalMethod]);

  const fetchCryptoCoins = async () => {
    try {
      const response = await fetch('/api/crypto-coins');
      if (response.ok) {
        const data = await response.json();
        setCryptoCoins(data);
      }
    } catch (error) {
      console.error('Failed to fetch crypto coins:', error);
    }
  };

  const fetchUpiSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings/upi');
      if (response.ok) {
        const data = await response.json();
        setUpiSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch UPI settings:', error);
    }
  };

  const fetchPaymentSettings = async (method: string) => {
    try {
      const response = await fetch(`/api/payment-settings/${method}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error);
    }
  };

  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    setScreenshots(prev => [...prev, ...validFiles]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleScreenshotSubmit = async () => {
    if (screenshots.length === 0) {
      toast.error('Please attach at least one screenshot');
      return;
    }

    setUploadingScreenshot(true);
    try {
      // Upload all screenshots
      const uploadPromises = screenshots.map(async (file) => {
        const formData = new FormData();
        formData.append('screenshot', file);
        formData.append('orderId', createdOrderId);
        
        const response = await fetch('/api/upload-screenshot', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
      });

      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);

      // Update order with screenshots
      const updateResponse = await fetch('/api/orders/update-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrderId,
          screenshotUrl: urls.join(','), // Store as comma-separated URLs
        }),
      });

      if (!updateResponse.ok) throw new Error('Failed to update order');

      setPaymentConfirmed(true);
      setShowScreenshotModal(false);
      toast.success('Screenshots uploaded successfully!');
      
      setTimeout(() => {
        router.push(`/orders/${createdOrderId}`);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload screenshots');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (showQR && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setShowQR(false);
            setQrCodeUrl('');
            toast.error('QR code expired. Please place order again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQR, timeRemaining]);

  const generateQRCode = async (amount: number) => {
    try {
      const upiId = upiSettings?.upiId || 'webpay111@slc'; // Fallback to default
      const upiString = `upi://pay?pa=${upiId}&pn=Payment&am=${amount}&cu=INR`;
      const qrDataUrl = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine payment method label
      let paymentMethodLabel = 'UPI Payment';
      if (formData.paymentNationality === 'international') {
        const methodLabels = {
          'gift-card': 'Amazon India Gift Card',
          'remitly': 'Remitly',
          'paysend': 'Paysend',
          'western-union': 'Western Union',
        };
        paymentMethodLabel = formData.internationalMethod 
          ? methodLabels[formData.internationalMethod] 
          : 'International Payment';
      } else if (formData.paymentNationality === 'crypto') {
        paymentMethodLabel = 'Cryptocurrency';
      }

      const orderData = {
        customerId: user?.id || 'guest',
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount,
          image: item.image,
        })),
        subtotal,
        discount,
        total,
        promo_code: appliedPromo?.code || null,
        status: 'order-placed' as const,
        paymentMethod: paymentMethodLabel,
        paymentNationality: formData.paymentNationality,
        notes: formData.notes,
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const order = await response.json();
      setCreatedOrderId(order.id);
      setOrderCreated(true);
      setOrderTotal(total);
      
      // Handle different payment methods
      if (formData.paymentNationality === 'indian') {
        // Indian UPI payment
        await generateQRCode(total);
        setShowQR(true);
        setTimeRemaining(120);
        clearCart();
        toast.success('Order placed! Please scan QR code to pay.');
      } else if (formData.internationalMethod === 'gift-card') {
        // Amazon Gift Card - redirect and show screenshot modal
        clearCart();
        setShowScreenshotModal(true);
        window.open('https://www.mtcgame.com/amazon/amazon-gift-cards-inr', '_blank');
        toast.success('Order placed! Complete payment and upload screenshot.');
      } else if (formData.internationalMethod === 'remitly' || formData.internationalMethod === 'paysend') {
        // Remitly/Paysend - show payment details
        clearCart();
        setShowPaymentDetails(true);
        toast.success('Order placed! Check payment details below.');
      } else if (formData.internationalMethod === 'western-union') {
        // Western Union - redirect
        clearCart();
        setShowScreenshotModal(true);
        window.open('https://www.westernunion.com', '_blank');
        toast.success('Order placed! Complete payment and upload screenshot.');
      } else {
        // Crypto or other
        clearCart();
        setShowScreenshotModal(true);
        toast.success('Order placed! Complete payment and upload screenshot.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingScreenshot(true);

    try {
      // Upload screenshot
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('orderId', createdOrderId);

      const uploadResponse = await fetch('/api/upload-screenshot', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload screenshot');

      const { url } = await uploadResponse.json();

      // Update order with screenshot
      const updateResponse = await fetch('/api/orders/update-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrderId,
          screenshotUrl: url,
        }),
      });

      if (!updateResponse.ok) throw new Error('Failed to update order');

      setPaymentConfirmed(true);
      toast.success('Screenshot uploaded successfully!');
      
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        router.push(`/orders/${createdOrderId}`);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload screenshot. Please try again.');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  // Redirect to cart if no items AND no order created
  useEffect(() => {
    if (items.length === 0 && !orderCreated) {
      router.push('/cart');
    }
  }, [items.length, orderCreated, router]);

  if (items.length === 0 && !orderCreated) {
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      {/* Trust Badges */}
      <div className="mb-8 grid grid-cols-3 gap-4 rounded-xl bg-zinc-950 border border-zinc-800 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full bg-green-600/10 p-3 border border-green-600/30">
            <ShieldCheck className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-sm font-semibold text-white">Secure Checkout</p>
          <p className="text-xs text-zinc-500">256-bit SSL Encrypted</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full bg-purple-600/10 p-3 border border-purple-600/30">
            <Award className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-sm font-semibold text-white">Verified Business</p>
          <p className="text-xs text-zinc-500">Trusted by 500+ clients</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full bg-blue-600/10 p-3 border border-blue-600/30">
            <Lock className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-white">100% Satisfaction</p>
          <p className="text-xs text-zinc-500">Money-back guarantee</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-zinc-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                {/* Indian Payment */}
                <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 cursor-pointer hover:border-purple-500/50 transition">
                  <input
                    type="radio"
                    name="paymentNationality"
                    value="indian"
                    checked={formData.paymentNationality === 'indian'}
                    onChange={(e) => setFormData({ ...formData, paymentNationality: 'indian', internationalMethod: '' })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Indian Payment
                    </p>
                    <p className="text-xs text-zinc-500">Pay via UPI (QR Code)</p>
                  </div>
                </label>

                {/* International Payment */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900">
                  <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800/50 transition rounded-t-lg">
                    <input
                      type="radio"
                      name="paymentNationality"
                      value="international"
                      checked={formData.paymentNationality === 'international'}
                      onChange={(e) => setFormData({ ...formData, paymentNationality: 'international' })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        International Payment
                      </p>
                      <p className="text-xs text-zinc-500">Select payment method below</p>
                    </div>
                  </label>

                  {/* International Payment Options */}
                  {formData.paymentNationality === 'international' && (
                    <div className="border-t border-zinc-800 p-4 space-y-3">
                      {/* Amazon India Gift Card */}
                      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50">
                        <label className="flex items-start gap-3 p-3 cursor-pointer hover:border-purple-500/50 transition">
                          <input
                            type="radio"
                            name="internationalMethod"
                            value="gift-card"
                            checked={formData.internationalMethod === 'gift-card'}
                            onChange={(e) => setFormData({ ...formData, internationalMethod: 'gift-card' })}
                            className="mt-0.5 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Amazon India Gift Card</p>
                            <p className="text-xs text-zinc-400 mt-1">Available globally</p>
                          </div>
                        </label>
                        {formData.internationalMethod === 'gift-card' && paymentSettings?.email && (
                          <div className="px-3 pb-3 space-y-2">
                            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                              <p className="text-xs text-zinc-400 mb-1">Send Gift Card to:</p>
                              <p className="text-sm font-semibold text-purple-400">{paymentSettings.email}</p>
                            </div>
                            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
                              <p className="text-xs text-blue-400 font-medium">
                                📝 Buy Gift Card Similar to your total Amount ({formatPrice(total)})
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Remitly */}
                      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50">
                        <label className="flex items-start gap-3 p-3 cursor-pointer hover:border-purple-500/50 transition">
                          <input
                            type="radio"
                            name="internationalMethod"
                            value="remitly"
                            checked={formData.internationalMethod === 'remitly'}
                            onChange={(e) => setFormData({ ...formData, internationalMethod: 'remitly' })}
                            className="mt-0.5 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Remitly</p>
                            <div className="mt-1">
                              <p className="text-xs text-zinc-400">
                                {expandedCountries === 'remitly' ? (
                                  <span>Supports: USA, Australia, Canada, Germany, New Zealand, Singapore, UAE, UK</span>
                                ) : (
                                  <span>Supports: USA, Australia, Canada +5 more</span>
                                )}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpandedCountries(expandedCountries === 'remitly' ? null : 'remitly');
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 mt-1 flex items-center gap-1"
                              >
                                {expandedCountries === 'remitly' ? '- Show less' : '+ Show all countries'}
                              </button>
                            </div>
                          </div>
                        </label>
                        {formData.internationalMethod === 'remitly' && (
                          <div className="px-3 pb-3 space-y-2">
                            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3">
                              <p className="text-xs text-green-400 font-medium">
                                💡 USE UPI Payment option for faster payment or Bank account also works
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setShowPaymentDetails(true)}
                                className="rounded-lg bg-purple-600 border border-purple-500 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition"
                              >
                                Get UPI ID
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowPaymentDetails(true)}
                                className="rounded-lg bg-purple-600 border border-purple-500 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition"
                              >
                                Get Bank Details
                              </button>
                              <button
                                type="button"
                                onClick={() => window.open('https://www.remitly.com/', '_blank', 'noopener')}
                                className="rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-600 transition"
                              >
                                Go to Remitly
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Paysend */}
                      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50">
                        <label className="flex items-start gap-3 p-3 cursor-pointer hover:border-purple-500/50 transition">
                          <input
                            type="radio"
                            name="internationalMethod"
                            value="paysend"
                            checked={formData.internationalMethod === 'paysend'}
                            onChange={(e) => setFormData({ ...formData, internationalMethod: 'paysend' })}
                            className="mt-0.5 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Paysend</p>
                            <div className="mt-1">
                              <p className="text-xs text-zinc-400">
                                {expandedCountries === 'paysend' ? (
                                  <span>Supports: Australia, Belgium, Brazil, Bulgaria, Canada, Colombia, Czech Republic, Finland, France, Germany, Israel, Italy, Kazakhstan, Mexico, Netherlands, Spain, Switzerland, United Kingdom, USA</span>
                                ) : (
                                  <span>Supports: Australia, Canada, USA +16 more</span>
                                )}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExpandedCountries(expandedCountries === 'paysend' ? null : 'paysend');
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 mt-1 flex items-center gap-1"
                              >
                                {expandedCountries === 'paysend' ? '- Show less' : '+ Show all countries'}
                              </button>
                            </div>
                          </div>
                        </label>
                        {formData.internationalMethod === 'paysend' && (
                          <div className="px-3 pb-3 space-y-2">
                            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3">
                              <p className="text-xs text-green-400 font-medium">
                                💡 USE UPI Payment option for faster payment or Bank account also works
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setShowPaymentDetails(true)}
                                className="rounded-lg bg-purple-600 border border-purple-500 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition"
                              >
                                Get UPI ID
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowPaymentDetails(true)}
                                className="rounded-lg bg-purple-600 border border-purple-500 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition"
                              >
                                Get Bank Details
                              </button>
                              <button
                                type="button"
                                onClick={() => window.open('https://paysend.com', '_blank', 'noopener')}
                                className="rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-600 transition"
                              >
                                Go to Paysend
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Western Union */}
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 cursor-pointer hover:border-purple-500/50 transition">
                        <input
                          type="radio"
                          name="internationalMethod"
                          value="western-union"
                          checked={formData.internationalMethod === 'western-union'}
                          onChange={(e) => setFormData({ ...formData, internationalMethod: 'western-union' })}
                          className="mt-0.5 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">Western Union</p>
                          <p className="text-xs text-zinc-400 mt-1">Mostly for UAE and Saudi Arabia</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Crypto Payment */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900">
                  <label className="flex items-center gap-3 p-4 cursor-pointer hover:border-purple-500/50 transition">
                    <input
                      type="radio"
                      name="paymentNationality"
                      value="crypto"
                      checked={formData.paymentNationality === 'crypto'}
                      onChange={(e) => {
                        setFormData({ ...formData, paymentNationality: 'crypto', internationalMethod: '' });
                        setSelectedCoin(null);
                        setSelectedNetwork(null);
                      }}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white flex items-center gap-2">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
                        </svg>
                        Cryptocurrency
                      </p>
                      <p className="text-xs text-zinc-500">Select coin and network below</p>
                    </div>
                  </label>

                  {/* Crypto Selection Options */}
                  {formData.paymentNationality === 'crypto' && (
                    <div className="px-4 pb-4 space-y-4 border-t border-zinc-800 pt-4">
                      {/* Select Coin */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Select Coin *
                        </label>
                        <select
                          value={selectedCoin?.id || ''}
                          onChange={(e) => {
                            const coin = cryptoCoins.find(c => c.id === e.target.value);
                            setSelectedCoin(coin);
                            setSelectedNetwork(null);
                          }}
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="">Choose a cryptocurrency</option>
                          {cryptoCoins.map((coin) => (
                            <option key={coin.id} value={coin.id}>
                              {coin.symbol} {coin.name && <span className="text-zinc-400 text-sm">- {coin.name}</span>}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Select Network */}
                      {selectedCoin && selectedCoin.networks.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Select Network *
                          </label>
                          <select
                            value={selectedNetwork?.id || ''}
                            onChange={(e) => {
                              const network = selectedCoin.networks.find((n: any) => n.id === e.target.value);
                              setSelectedNetwork(network);
                            }}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                          >
                            <option value="">Choose a network</option>
                            {selectedCoin.networks.map((network: any) => (
                              <option key={network.id} value={network.id}>
                                {network.name} - {network.fullName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Deposit Address Display */}
                      {selectedCoin && selectedNetwork && (
                        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                          <p className="text-xs text-zinc-400 mb-2">Deposit Address</p>
                          <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-700 mb-2">
                            <p className="text-sm font-mono text-white break-all">{selectedNetwork.depositAddress}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedNetwork.depositAddress);
                              toast.success('Deposit address copied!');
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                          >
                            📋 Copy Address
                          </button>
                        </div>
                      )}

                      {selectedCoin && selectedCoin.networks.length === 0 && (
                        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
                          <p className="text-xs text-yellow-400">
                            ⚠️ No networks configured for this coin yet. Please contact admin.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6">
              <label htmlFor="notes" className="block text-sm font-medium text-zinc-300 mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                placeholder="Any special requirements or instructions..."
              />
            </div>

            {!orderCreated && (
              <>
                <button
                  type="submit"
                  disabled={
                    loading || 
                    (formData.paymentNationality === 'international' && !formData.internationalMethod) ||
                    (formData.paymentNationality === 'crypto' && (!selectedCoin || !selectedNetwork))
                  }
                  className="w-full rounded-lg bg-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 border border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="h-5 w-5" />
                  {loading ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                </button>
                {formData.paymentNationality === 'international' && !formData.internationalMethod && (
                  <p className="mt-2 text-sm text-yellow-400 text-center">
                    Please select an international payment method above
                  </p>
                )}
                {formData.paymentNationality === 'crypto' && (!selectedCoin || !selectedNetwork) && (
                  <p className="mt-2 text-sm text-yellow-400 text-center">
                    Please select a cryptocurrency and network above
                  </p>
                )}
              </>
            )}
          </form>

          {/* QR Code Modal Popup */}
          {orderCreated && showQR && qrCodeUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => {
                    setShowQR(false);
                    setQrCodeUrl('');
                    router.push(`/orders/${createdOrderId}`);
                  }}
                  className="absolute right-4 top-4 rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-white mb-2">Scan QR Code to Pay</h3>
                  <p className="text-sm text-zinc-400 mb-4">Open any UPI app and scan the QR code below</p>
                  
                  {/* Timer */}
                  <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-yellow-600/10 border border-yellow-600/30 p-3">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-400">
                      {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-zinc-500">remaining</span>
                  </div>

                  {/* Payment Apps Banner */}
                  <div className="mb-4 rounded-lg bg-zinc-900 border border-zinc-800 p-3">
                    <p className="text-xs text-zinc-400 text-center mb-2">Scan and pay with any BHIM UPI app</p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <div className="text-xs text-zinc-300 font-semibold">BHIM | UPI</div>
                      <div className="text-xs text-zinc-400">•</div>
                      <div className="text-xs text-zinc-300">GPay</div>
                      <div className="text-xs text-zinc-400">•</div>
                      <div className="text-xs text-zinc-300">PhonePe</div>
                      <div className="text-xs text-zinc-400">•</div>
                      <div className="text-xs text-zinc-300">Paytm</div>
                      <div className="text-xs text-zinc-400">•</div>
                      <div className="text-xs text-zinc-300">Amazon Pay</div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                      <img src={qrCodeUrl} alt="UPI QR Code" className="w-72 h-72" />
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-600/10 border border-blue-600/30 p-4 mb-6">
                    <p className="text-sm text-blue-400">
                      Amount to Pay: <span className="text-3xl font-bold text-white">₹{orderTotal.toFixed(0)}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">UPI ID: {upiSettings?.upiId || 'webpay111@slc'}</p>
                  </div>

                  {/* Payment Confirmation */}
                  {!paymentConfirmed && (
                    <div className="space-y-4">
                      <div className="border-t border-zinc-800 pt-4">
                        <p className="text-sm text-zinc-400 mb-3">After completing payment, upload screenshot</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingScreenshot}
                          className="w-full rounded-lg bg-green-600 border border-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition hover:bg-green-500 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Upload className="h-5 w-5" />
                          {uploadingScreenshot ? 'Uploading...' : 'Click if Paid - Upload Screenshot'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {paymentConfirmed && (
                    <div className="rounded-lg bg-green-600/10 border border-green-600/30 p-6">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-white mb-2">Screenshot Uploaded Successfully!</h4>
                      <p className="text-sm text-zinc-400">Check your order status for more updates.</p>
                      <p className="text-xs text-zinc-500 mt-2">Redirecting to orders page...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* International Payment Message */}
          {orderCreated && formData.paymentNationality === 'international' && (
            <div className="mt-6 rounded-xl bg-zinc-950 border border-zinc-800 p-6">
              <div className="text-center">
                <Globe className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {formData.internationalMethod === 'gift-card' && 'Amazon India Gift Card Payment'}
                  {formData.internationalMethod === 'remitly' && 'Remitly Payment'}
                  {formData.internationalMethod === 'paysend' && 'Paysend Payment'}
                  {formData.internationalMethod === 'western-union' && 'Western Union Payment'}
                  {!formData.internationalMethod && 'International Payment'}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Your order has been placed successfully. Please contact admin for {formData.internationalMethod ? 'payment' : 'international payment'} details.
                </p>
                <p className="text-xs text-zinc-500">Check your email for further instructions.</p>
              </div>
            </div>
          )}

          {/* Crypto Payment Message */}
          {orderCreated && formData.paymentNationality === 'crypto' && (
            <div className="mt-6 rounded-xl bg-zinc-950 border border-zinc-800 p-6">
              <div className="text-center">
                <svg className="h-12 w-12 text-purple-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Cryptocurrency Payment</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Your order has been placed successfully. Please contact admin for crypto wallet address and payment instructions.
                </p>
                <p className="text-xs text-zinc-500">Check your email for further instructions.</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const itemPrice = item.discount 
                  ? item.price * (1 - item.discount / 100) 
                  : item.price;
                
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {formatPrice(itemPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">
                      Discount {appliedPromo?.code && `(${appliedPromo.code})`}
                    </span>
                    <span className="text-green-400 font-semibold">-{formatPrice(discount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-zinc-800 pt-2">
                <span className="text-white">Total</span>
                <span className="text-purple-400">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-green-600/10 border border-green-600/30 p-3">
              <p className="text-xs text-green-400 text-center">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal (Remitly/Paysend) */}
      {showPaymentDetails && paymentSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowPaymentDetails(false)}
              className="absolute right-4 top-4 rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-semibold text-white mb-6">
              {formData.internationalMethod === 'remitly' ? 'Remitly' : 'Paysend'} Payment Details
            </h3>

            <div className="space-y-4">
              {paymentSettings.upiId && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-400 mb-2">UPI ID</p>
                  <div className="flex items-center justify-between bg-zinc-950 rounded px-3 py-2 border border-zinc-700">
                    <p className="text-sm font-mono text-white">{paymentSettings.upiId}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentSettings.upiId);
                        toast.success('UPI ID copied!');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {paymentSettings.bankDetails && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                  <p className="text-sm font-semibold text-white mb-3">Bank Details</p>
                  
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Account Holder Name</p>
                    <p className="text-sm text-white font-medium">{paymentSettings.bankDetails.accountHolderName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Account Number</p>
                    <div className="flex items-center justify-between bg-zinc-950 rounded px-3 py-2 border border-zinc-700">
                      <p className="text-sm font-mono text-white">{paymentSettings.bankDetails.accountNumber}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentSettings.bankDetails.accountNumber);
                          toast.success('Account number copied!');
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-1">IFSC Code</p>
                    <div className="flex items-center justify-between bg-zinc-950 rounded px-3 py-2 border border-zinc-700">
                      <p className="text-sm font-mono text-white">{paymentSettings.bankDetails.ifscCode}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentSettings.bankDetails.ifscCode);
                          toast.success('IFSC code copied!');
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Address</p>
                    <p className="text-sm text-white">{paymentSettings.bankDetails.address}</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-xs text-yellow-400">
                  After completing payment, click "Place Order" and upload screenshot as proof.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPaymentDetails(false);
                  setShowScreenshotModal(true);
                }}
                className="w-full rounded-lg bg-purple-600 border border-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-500 transition"
              >
                I've Completed Payment - Upload Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Upload Modal */}
      {showScreenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl">
            <button
              onClick={() => !uploadingScreenshot && setShowScreenshotModal(false)}
              disabled={uploadingScreenshot}
              className="absolute right-4 top-4 rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-semibold text-white mb-2">Upload Payment Proof</h3>
            <p className="text-sm text-zinc-400 mb-6">Attach screenshot(s) of your payment confirmation</p>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-purple-500/50 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotSelect}
                  className="hidden"
                  id="screenshot-upload"
                  disabled={uploadingScreenshot}
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white mb-1">Click to upload screenshots</p>
                  <p className="text-xs text-zinc-500">PNG, JPG up to 5MB each</p>
                </label>
              </div>

              {screenshots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">Selected Files ({screenshots.length})</p>
                  {screenshots.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-white truncate max-w-xs">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeScreenshot(index)}
                        disabled={uploadingScreenshot}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleScreenshotSubmit}
                disabled={screenshots.length === 0 || uploadingScreenshot}
                className="w-full rounded-lg bg-purple-600 border border-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingScreenshot ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Submit & Complete Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
