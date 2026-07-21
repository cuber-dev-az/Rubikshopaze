'use client';

import * as React from 'react';
import { signIn } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Truck,
  CreditCard,
  Gift,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Percent,
  Lock,
  Wallet,
  Building,
  Loader2
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { submitOrderAtomic } from '@/lib/actions/order';
import { validateCoupon } from '@/lib/actions/coupons';
import { validateGiftCard } from '@/lib/actions/gift-cards';
import type { ApplicationDictionary } from '@/types/application.types';

interface CheckoutFormProps {
  dict: ApplicationDictionary;
  locale: string;
}

export function CheckoutForm({ dict, locale }: CheckoutFormProps) {
  const router = useRouter();
  const {
    items,
    appliedCoupon,
    clearCart
  } = useCartStore();

  const t = React.useCallback((obj: { az: string; en: string; ru: string }) => {
    return obj[locale as keyof typeof obj] || obj.az;
  }, [locale]);

  // Authentication State Simulation
  const [checkoutMode, setCheckoutMode] = React.useState<'guest' | 'login'>('guest');
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Form Field States
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [instagram, setInstagram] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [selectedMetroStation, setSelectedMetroStation] = React.useState('');
  const [deliveryMethod, setDeliveryMethod] = React.useState<'standard' | 'express' | 'metro'>('standard');
  const [paymentMethod, setPaymentMethod] = React.useState<'bank_transfer' | 'cod'>('bank_transfer');
  
  // Extra Checkout Perks
  const [isGift, setIsGift] = React.useState(false);
  const [giftNote, setGiftNote] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Validation & Loading States
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [couponInput, setCouponInput] = React.useState('');
  const { applyCoupon } = useCartStore();

  const subtotal = useCartStore((state) => state.items.reduce((total, item) => total + item.price_azn * item.quantity, 0));
  const discountAmount = useCartStore((state) => {
    const subtotal = state.items.reduce((total, item) => total + item.price_azn * item.quantity, 0);
    if (state.discountType === 'percentage') return (subtotal * state.discountValue) / 100;
    if (state.discountType === 'fixed') return state.discountValue;
    return 0;
  });
  const freeShippingThreshold = 100;

  // Load settings from Supabase
  const [waNumber, setWaNumber] = React.useState('994506684925');
  const [shippingPrices, setShippingPrices] = React.useState({
    standard: 3,
    express: 7,
    metro: 0
  });

  React.useEffect(() => {
    async function fetchCheckoutSettings() {
      try {
        const { getSettings } = await import('@/lib/actions/settings');
        const [paymentRes, shippingRes] = await Promise.all([
          getSettings('payment'),
          getSettings('shipping')
        ]);
        if (paymentRes.success && paymentRes.data?.whatsappNumber) {
          const raw = paymentRes.data.whatsappNumber.replace(/[^0-9]/g, '');
          setWaNumber(raw ? raw : '994506684925');
        }
        if (shippingRes.success && shippingRes.data) {
          const methods = shippingRes.data.deliveryMethods || [];
          const standardMethod = methods.find((m: any) => m.name.toLowerCase().includes('kuryer') || m.name.toLowerCase().includes('ünvan') || m.id === 2);
          const expressMethod = methods.find((m: any) => m.name.toLowerCase().includes('express') || m.name.toLowerCase().includes('sürətli') || m.id === 3);
          const metroMethod = methods.find((m: any) => m.name.toLowerCase().includes('metro') || m.id === 1);

          setShippingPrices({
            standard: standardMethod ? Number(standardMethod.price) : 3,
            express: expressMethod ? Number(expressMethod.price) : 7,
            metro: metroMethod ? Number(metroMethod.price) : 0
          });
        }
      } catch (err) {
        console.error('Error fetching checkout settings:', err);
      }
    }
    fetchCheckoutSettings();
  }, []);

  const shippingCost = React.useMemo(() => {
    if (subtotal >= freeShippingThreshold || subtotal === 0) return 0;
    if (deliveryMethod === 'express') return shippingPrices.express;
    if (deliveryMethod === 'metro') return shippingPrices.metro;
    return shippingPrices.standard;
  }, [subtotal, deliveryMethod, shippingPrices]);

  const [couponError, setCouponError] = React.useState('');
  const [isCouponLoading, setIsCouponLoading] = React.useState(false);
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setIsCouponLoading(true);
    
    const res = await validateCoupon(couponInput, subtotal);
    if (res.success && res.coupon) {
      applyCoupon(res.coupon.code, res.coupon.discount_type as any, res.coupon.discount_value);
      setCouponInput('');
    } else {
      const gcRes = await validateGiftCard(couponInput);
      if (gcRes.success && gcRes.giftCard) {
        applyCoupon(gcRes.giftCard.code, 'fixed', gcRes.giftCard.current_balance);
        setCouponInput('');
      } else {
        setCouponError(res.error || gcRes.error || t({
          az: 'Daxil edilən kod keçərsizdir.',
          en: 'The code entered is invalid.',
          ru: 'Введенный код недействителен.'
        }));
      }
    }
    setIsCouponLoading(false);
  };

  const totalAmount = React.useMemo(() => {
    return Math.max(0, subtotal - discountAmount) + shippingCost;
  }, [subtotal, discountAmount, shippingCost]);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="p-4 bg-rubik-brand/10 text-rubik-brand rounded-full">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-black text-foreground uppercase tracking-wide">
          {dict.cart.empty}
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          {t({
            az: 'Çatdırılma qeydiyyatı etmək üçün zəhmət olmasa səbətinizə məhsul əlavə edin. Sürətli kubları kəşf edib rekordlarınızı yeniləyin!',
            en: 'Please add products to your cart to register delivery. Discover speedcubes and renew your records!',
            ru: 'Пожалуйста, добавьте товары в корзину для оформления доставки. Откройте для себя скоростные кубики и обновите свои рекорды!'
          })}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-rubik-brand hover:bg-rubik-brand-dark text-white font-black text-xs rounded-xl hover:shadow-soft-md transition-all cursor-pointer gap-2"
        >
          <span>{t({ az: 'Kataloqa keçid', en: 'Go to Catalog', ru: 'Перейти в каталог' })}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    const formData = new FormData();
    formData.append('email', loginEmail);
    formData.append('password', loginPassword);

    const res = await signIn(formData);
    setIsAuthLoading(false);

    if (res.error) {
      setAuthError(res.error);
    } else {
      window.location.reload();
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = dict.checkout?.validation_name_required || t({
        az: 'Ad və Soyad sahəsi mütləqdir.',
        en: 'Name and Surname is required.',
        ru: 'Имя и Фамилия обязательны для заполнения.'
      });
    } else if (name.trim().length < 2) {
      errors.name = t({
        az: 'Zəhmət olmasa ən azı 2 simvoldan ibarət ad qeyd edin.',
        en: 'Please enter a name of at least 2 characters.',
        ru: 'Пожалуйста, введите имя не менее чем из 2 символов.'
      });
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '+994' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('994')) {
      formattedPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+') && cleanPhone) {
      formattedPhone = '+994' + cleanPhone;
    }

    if (!cleanPhone) {
      errors.phone = dict.checkout?.validation_phone_required || t({
        az: 'Mobil nömrə sahəsi mütləqdir.',
        en: 'Mobile number is required.',
        ru: 'Мобильный номер обязателен.'
      });
    } else if (!/^\+994(50|51|55|70|77|99|10|60)[0-9]{7}$/.test(formattedPhone)) {
      errors.phone = t({
        az: 'Doğru Azərbaycan nömrəsi daxil edin. Məs: +994501234567',
        en: 'Enter a valid Azerbaijani number. E.g.: +994501234567',
        ru: 'Введите корректный азербайджанский номер. Напр: +994501234567'
      });
    }

    if (deliveryMethod !== 'metro') {
      if (!address.trim()) {
        errors.address = dict.checkout?.validation_address_required || t({
          az: 'Çatdırılma ünvanı mütləqdir.',
          en: 'Delivery address is required.',
          ru: 'Адрес доставки обязателен.'
        });
      } else if (address.trim().length < 5) {
        errors.address = t({
          az: 'Zəhmət olmasa daha ətraflı ünvan daxil edin (ən azı 5 simvol).',
          en: 'Please enter a more detailed address (at least 5 characters).',
          ru: 'Пожалуйста, введите более подробный адрес (не менее 5 символов).'
        });
      }
    } else {
      if (!selectedMetroStation) {
        errors.metroStation = dict.checkout?.validation_metro_required || t({
          az: 'Zəhmət olmasa çatdırılma üçün metro stansiyasını seçin.',
          en: 'Please select a metro station for delivery.',
          ru: 'Пожалуйста, выберите станцию метро для доставки.'
        });
      }
    }

    if (!termsAccepted) {
      errors.terms = dict.checkout?.validation_terms_required || t({
        az: 'Sifariş üçün alış-veriş şərtlərini qəbul etməlisiniz.',
        en: 'You must accept the terms and conditions to order.',
        ru: 'Вы должны принять условия покупки для совершения заказа.'
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsProcessing(true);

    try {
      const cleanPhone = phone.replace(/\s+/g, '');
      let formattedPhone = cleanPhone;
      if (cleanPhone.startsWith('0')) {
        formattedPhone = '+994' + cleanPhone.slice(1);
      } else if (cleanPhone.startsWith('994')) {
        formattedPhone = '+' + cleanPhone;
      } else if (!cleanPhone.startsWith('+')) {
        formattedPhone = '+994' + cleanPhone;
      }

      const tMsg = {
        title: t({ az: 'YENİ SİFARİŞ', en: 'NEW ORDER', ru: 'НОВЫЙ ЗАКАЗ' }),
        customer: t({ az: 'Müştəri', en: 'Customer', ru: 'Клиент' }),
        phone: t({ az: 'Telefon', en: 'Phone', ru: 'Телефон' }),
        instagram: t({ az: 'Instagram', en: 'Instagram', ru: 'Instagram' }),
        delivery: t({ az: 'Çatdırılma Metodu', en: 'Delivery Method', ru: 'Метод Доставки' }),
        address: t({ az: 'Ünvan', en: 'Address', ru: 'Адрес' }),
        metro: t({ az: 'Görüş stansiyası', en: 'Metro Station', ru: 'Станция Метро' }),
        gift: t({ az: 'Hədiyyə Qeydi', en: 'Gift Note', ru: 'Подарочная Запись' }),
        products: t({ az: 'Sifariş Məhsulları', en: 'Ordered Products', ru: 'Товары в Заказе' }),
        coupon: t({ az: 'Kupon', en: 'Coupon', ru: 'Купон' }),
        payment: t({ az: 'Ödəniş Metodu', en: 'Payment Method', ru: 'Метод Оплаты' }),
        paymentBank: t({ az: 'Kartdan Karta (Bank köçürməsi)', en: 'Card Transfer (Bank Transfer)', ru: 'Перевод на Карту (Банковский перевод)' }),
        paymentCod: t({ az: 'Qapıda Nəğd Ödəniş', en: 'Cash on Delivery', ru: 'Оплата наличными при получении' }),
        total: t({ az: 'Yekun Cəm', en: 'Total Amount', ru: 'Итоговая Сумма' }),
        footer: t({
          az: 'Zəhmət olmasa, sifarişi təsdiqləmək və çatdırılmanı təşkil etmək üçün bu mesajı bizə göndərin.',
          en: 'Please send this message to us to confirm the order and arrange delivery.',
          ru: 'Пожалуйста, отправьте это сообщение нам, чтобы подтвердить заказ и организовать доставку.'
        })
      };

      const deliveryLabelMap = {
        standard: t({ az: 'Kuryer Çatdırılması (1-2 Gün)', en: 'Courier Delivery (1-2 Days)', ru: 'Доставка Курьером (1-2 Дня)' }),
        express: t({ az: 'Sürətli Çatdırılma (3 Saat)', en: 'Express Delivery (3 Hours)', ru: 'Экспресс Доставка (3 Часа)' }),
        metro: t({ az: `Metro stansiyası: ${selectedMetroStation}`, en: `Metro station: ${selectedMetroStation}`, ru: `Станция метро: ${selectedMetroStation}` })
      };

      const payload = {
        customer_name: name.trim(),
        customer_phone: formattedPhone,
        customer_instagram: instagram.trim() || 'Yoxdur',
        delivery_address: deliveryMethod === 'metro' ? `${selectedMetroStation} Metrosu` : address.trim(),
        delivery_method: deliveryMethod === 'metro' ? 'Metro' : 'Courier',
        total_amount_azn: totalAmount,
        checkout_platform: 'whatsapp' as const,
        subtotal: subtotal,
        discount: discountAmount,
        shipping_fee: shippingCost,
        coupon_code: appliedCoupon || null,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price_azn: item.price_azn,
          subtotal_azn: item.price_azn * item.quantity
        }))
      };

      const response = await submitOrderAtomic(payload);

      if (response.success && response.orderId) {
        const formattedOrderId = response.orderId.substring(0, 8).toUpperCase();
        
        let message = `🔴 *RUBIKSHOP.AZ - ${tMsg.title} (#${formattedOrderId})* 🔴\n\n`;
        message += `👤 *${tMsg.customer}:* ${name.trim()}\n`;
        message += `📞 *${tMsg.phone}:* ${formattedPhone}\n`;
        message += `📸 *${tMsg.instagram}:* @${instagram.trim() || 'Yoxdur'}\n\n`;
        
        message += `🚚 *${tMsg.delivery}:* ${deliveryLabelMap[deliveryMethod]}\n`;
        if (deliveryMethod !== 'metro') {
          message += `📍 *${tMsg.address}:* ${address.trim()}\n`;
        } else {
          message += `📍 *${tMsg.metro}:* ${selectedMetroStation} ${t({ az: 'metrosu', en: 'metro', ru: 'метро' })}\n`;
        }
        
        if (isGift && giftNote) {
          message += `🎁 *${tMsg.gift}:* "${giftNote}"\n`;
        }
        
        message += `\n📦 *${tMsg.products}:*\n`;
        items.forEach((item) => {
          message += `• ${item.title} (x${item.quantity}) — ${(item.price_azn * item.quantity).toFixed(2)} AZN\n`;
        });

        if (appliedCoupon) {
          message += `\n🎫 *${tMsg.coupon}:* ${appliedCoupon} (-${discountAmount.toFixed(2)} AZN)\n`;
        }
        
        message += `\n💳 *${tMsg.payment}:* ${paymentMethod === 'bank_transfer' ? tMsg.paymentBank : tMsg.paymentCod}\n`;
        message += `💰 *${tMsg.total}:* *${totalAmount.toFixed(2)} AZN*\n\n`;
        message += `⚡ _${tMsg.footer}_`;

        const encodedMessage = encodeURIComponent(message);
        const waLink = `https://wa.me/${waNumber}?text=${encodedMessage}`;

        clearCart();

        if (typeof window !== 'undefined') {
          window.open(waLink, '_blank');
          router.push(`/${locale}/checkout/success?orderId=${response.orderId}&payment=${paymentMethod}&total=${totalAmount.toFixed(2)}&name=${encodeURIComponent(name)}`);
        }
      } else {
        setIsProcessing(false);
        setValidationErrors({
          submit: response.error || t({
            az: 'Sifariş qeyd edilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
            en: 'An error occurred while placing the order. Please try again.',
            ru: 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.'
          })
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setValidationErrors({
        submit: t({
          az: 'Gözlənilməyən xəta baş verdi. İnternet əlaqənizi yoxlayın.',
          en: 'An unexpected error occurred. Please check your internet connection.',
          ru: 'Произошла непредвиденная ошибка. Пожалуйста, проверьте интернет-соединение.'
        })
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href={`/${locale}/cart`}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-rubik-brand transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t({ az: 'Səbətə qayıt', en: 'Back to Cart', ru: 'Назад в корзину' })}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Steps */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Guest / Account Choice Step */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rubik-brand text-white text-xs font-black">
                  1
                </span>
                <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                  {t({ az: 'Müştəri məlumatları', en: 'Customer Information', ru: 'Информация о клиенте' })}
                </h2>
              </div>

              {!isLoggedIn && (
                <div className="flex bg-muted p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setCheckoutMode('guest')}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      checkoutMode === 'guest'
                        ? 'bg-card text-foreground shadow-soft-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t({ az: 'Qonaq qismində', en: 'As Guest', ru: 'Как Гость' })}
                  </button>
                  <button
                    onClick={() => setCheckoutMode('login')}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      checkoutMode === 'login'
                        ? 'bg-card text-foreground shadow-soft-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t({ az: 'Daxil olmaqla', en: 'With Login', ru: 'С Входом' })}
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isLoggedIn ? (
                <motion.div
                  key="logged-in"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-xs font-bold text-green-900">
                        {t({ az: 'Hesabınıza daxil olmusunuz', en: 'Logged in successfully', ru: 'Вы вошли в систему' })}
                      </p>
                      <p className="text-[10px] text-green-700">
                        {t({ az: 'Məlumatlarınız avtomatik olaraq dolduruldu.', en: 'Your info was auto-filled.', ru: 'Ваши данные были заполнены автоматически.' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setName('');
                      setPhone('');
                      setAddress('');
                    }}
                    className="text-[10px] text-green-800 underline font-bold hover:text-green-950"
                  >
                    {t({ az: 'Çıxış et', en: 'Sign Out', ru: 'Выйти' })}
                  </button>
                </motion.div>
              ) : checkoutMode === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleLogin}
                  className="space-y-4 max-w-md"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        {t({ az: 'E-poçt ünvanı', en: 'Email Address', ru: 'Эл. Почта' })}
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="example@rubikshop.az"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        {t({ az: 'Şifrə', en: 'Password', ru: 'Пароль' })}
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>
                  </div>
                  {authError && <p className="text-xs text-red-600 font-bold">{authError}</p>}
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="px-5 py-2.5 bg-foreground text-card hover:bg-rubik-brand hover:text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAuthLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                    <span>{t({ az: 'Daxil ol və Doldur', en: 'Login & Autofill', ru: 'Войти и заполнить' })}</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="guest-inputs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" /> {dict.checkout?.name || "Ad və Soyad"} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={dict.checkout?.name_placeholder || "Məs: Mirsəlim Şahbazov"}
                      className={`w-full bg-muted border rounded-xl px-3.5 py-2.5 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand ${
                        validationErrors.name ? 'border-red-500 bg-red-50/10' : 'border-border'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="text-[9px] text-red-600 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {dict.checkout?.phone || "Mobil Nömrə"} *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={dict.checkout?.phone_placeholder || "+994 50 123 45 67"}
                      className={`w-full bg-muted border rounded-xl px-3.5 py-2.5 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand ${
                        validationErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-border'
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="text-[9px] text-red-600 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                      <span>{dict.checkout?.instagram || "Instagram"}</span>
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder={dict.checkout?.instagram_placeholder || "Məs: rubikshop.az (Könüllü)"}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Delivery & Shipping Method */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rubik-brand text-white text-xs font-black">
                2
              </span>
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                {dict.checkout?.delivery_details || "Çatdırılma detalları"}
              </h2>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod('standard')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  deliveryMethod === 'standard'
                    ? 'border-rubik-brand bg-rubik-brand/5'
                    : 'border-border hover:border-foreground/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-1.5 bg-muted rounded-lg text-foreground">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  {deliveryMethod === 'standard' && (
                    <span className="text-rubik-brand bg-white p-0.5 rounded-full border border-rubik-brand">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-foreground">{dict.checkout?.delivery_kuryer || "Kuryer (Standart)"}</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                  {dict.checkout?.delivery_kuryer_desc || "Ünvana kuryer vasitəsilə 1-2 iş günü ərzində çatdırılır."}
                </p>
                <span className="block mt-3 text-xs font-mono font-bold text-foreground">
                  {subtotal >= freeShippingThreshold ? (dict.checkout?.free_delivery || 'Pulsuz') : `${shippingPrices.standard.toFixed(2)} AZN`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('express')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  deliveryMethod === 'express'
                    ? 'border-rubik-brand bg-rubik-brand/5'
                    : 'border-border hover:border-foreground/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-1.5 bg-muted rounded-lg text-foreground">
                    <Truck className="h-4.5 w-4.5 text-yellow-500 animate-pulse" />
                  </div>
                  {deliveryMethod === 'express' && (
                    <span className="text-rubik-brand bg-white p-0.5 rounded-full border border-rubik-brand">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-foreground">{dict.checkout?.delivery_express || "Sürətli Çatdırılma"}</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                  {dict.checkout?.delivery_express_desc || "Bakı daxili 3 saat ərzində çatdırılma."}
                </p>
                <span className="block mt-3 text-xs font-mono font-bold text-foreground">
                  {subtotal >= freeShippingThreshold ? (dict.checkout?.free_delivery || 'Pulsuz') : `${shippingPrices.express.toFixed(2)} AZN`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('metro')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  deliveryMethod === 'metro'
                    ? 'border-rubik-brand bg-rubik-brand/5'
                    : 'border-border hover:border-foreground/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-1.5 bg-muted rounded-lg text-foreground">
                    <Building className="h-4.5 w-4.5" />
                  </div>
                  {deliveryMethod === 'metro' && (
                    <span className="text-rubik-brand bg-white p-0.5 rounded-full border border-rubik-brand">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-foreground">{dict.checkout?.delivery_metro || "Metroya Çatdırılma"}</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                  {dict.checkout?.delivery_metro_desc || "İstənilən metro stansiyasına çatdırılma."}
                </p>
                <span className="block mt-3 text-xs font-mono font-bold text-green-600 font-black">
                  {shippingPrices.metro === 0 ? (dict.checkout?.free_delivery || 'Pulsuz') : `${shippingPrices.metro.toFixed(2)} AZN`}
                </span>
              </button>
            </div>

            {/* Address textarea or Metro Dropdown */}
            <AnimatePresence mode="wait">
              {deliveryMethod !== 'metro' ? (
                <motion.div
                  key="address-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {dict.checkout?.address || "Çatdırılma Ünvanı"} *
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={dict.checkout?.address_placeholder || "Məsələn: Nizami küçəsi 142, bina 3..."}
                    className={`w-full bg-muted border rounded-xl px-3.5 py-2.5 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand ${
                      validationErrors.address ? 'border-red-500 bg-red-50/10' : 'border-border'
                    }`}
                  />
                  {validationErrors.address && (
                    <p className="text-[9px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.address}
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="metro-select"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Building className="h-3 w-3" /> {dict.checkout?.select_metro || "Metro stansiyası seçin"} *
                  </label>
                  <select
                    value={selectedMetroStation}
                    onChange={(e) => setSelectedMetroStation(e.target.value)}
                    className={`w-full bg-muted border rounded-xl px-3.5 py-2.5 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand ${
                      validationErrors.metroStation ? 'border-red-500 bg-red-50/10' : 'border-border'
                    }`}
                  >
                    <option value="">-- {dict.checkout?.select_metro || "Metro stansiyası seçin"} --</option>
                    {[
                      'İçərişəhər', 'Sahil', '28 May', 'Gənclik', 'Nəriman Nərimanov', 'Ulduz', 'Koroğlu', 
                      'Qara Qarayev', 'Nefçilər', 'Xalqlar Dostluğu', 'Əhmədli', 'Həzi Aslanov', 
                      'Elmlər Akademiyası', 'İnşaatçılar', '20 Yanvar', 'Memar Əcəmi', 'Nəsimi', 
                      'Azadlıq Prospekti', 'Dərnəgül', 'Xətai', 'Cəfər Cabbarlı', '8 Noyabr', 'Avtovağzal'
                    ].map((station) => (
                      <option key={station} value={station}>
                        {station} {t({ az: 'stansiyası', en: 'station', ru: 'станция' })}
                      </option>
                    ))}
                  </select>
                  {validationErrors.metroStation && (
                    <p className="text-[9px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.metroStation}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gift Wrapping */}
            <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-3.5">
              <label className="flex items-center gap-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-rubik-brand focus:ring-rubik-brand cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 select-none">
                  <Gift className="h-4 w-4 text-rubik-brand" />
                  {dict.checkout?.gift_option || "Bu sifariş hədiyyədir? (Hədiyyə kağızı pulsuzdur)"}
                </span>
              </label>

              <AnimatePresence>
                {isGift && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden pt-1"
                  >
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                      {dict.checkout?.gift_note || "Hədiyyə qeydi (Könüllü)"}
                    </label>
                    <input
                      type="text"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder={t({
                        az: 'Ad günün mübarək! Ümid edirəm bu flaqman Maqnetik Kubu bəyənəcəksən...',
                        en: 'Happy Birthday! Hope you love this flagship magnetic cube...',
                        ru: 'С Днем Рождения! Надеюсь, тебе понравится этот флагманский магнитный кубик...'
                      })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-[16px] text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rubik-brand text-white text-xs font-black">
                3
              </span>
              <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                {dict.checkout?.payment_details || "Ödəniş detalları"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-rubik-brand bg-rubik-brand/5'
                    : 'border-border hover:border-foreground/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="p-1.5 bg-muted rounded-lg text-foreground">
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    {paymentMethod === 'bank_transfer' && (
                      <span className="text-rubik-brand bg-white p-0.5 rounded-full border border-rubik-brand">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-foreground">{dict.checkout?.payment_bank || "Kartla / Köçürmə ilə Ödəniş"}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {dict.checkout?.payment_bank_desc || "Kartdan karta və ya hesaba köçürmə."}
                  </p>
                </div>
                <span className="block mt-4 text-[9px] font-black text-rubik-brand uppercase tracking-wider">
                  {t({ az: 'Ən çox seçilən', en: 'Most Popular', ru: 'Самый Популярный' })}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-rubik-brand bg-rubik-brand/5'
                    : 'border-border hover:border-foreground/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="p-1.5 bg-muted rounded-lg text-foreground">
                      <Wallet className="h-4.5 w-4.5" />
                    </div>
                    {paymentMethod === 'cod' && (
                      <span className="text-rubik-brand bg-white p-0.5 rounded-full border border-rubik-brand">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-foreground">{dict.checkout?.payment_cod || "Qapıda Nəğd Ödəniş"}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {dict.checkout?.payment_cod_desc || "Məhsulu kuryerdən təslim alarkən yerində nəğd ödəniş edin."}
                  </p>
                </div>
                <span className="block mt-4 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                  {t({ az: 'Təhlükəsiz limitli', en: 'Secure COD', ru: 'Надежный Наложенный' })}
                </span>
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="space-y-2.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-border text-rubik-brand focus:ring-rubik-brand cursor-pointer"
              />
              <span className="text-xs text-muted-foreground leading-relaxed select-none">
                {dict.checkout?.accept_terms || "İstifadə Şərtlərini qəbul edirəm"}
              </span>
            </label>
            {validationErrors.terms && (
              <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 px-1">
                <AlertCircle className="h-3 w-3" /> {validationErrors.terms}
              </p>
            )}
          </div>

        </div>

        {/* Right Sidebar: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-5">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider pb-3.5 border-b border-border flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-rubik-brand" />
              {dict.checkout?.order_summary || "Sifariş Xülasəsi"}
            </h3>

            {/* Cart products list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-border/60 pr-1 space-y-3.5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative w-12 h-12 bg-muted/30 border border-border rounded-xl overflow-hidden p-1 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-foreground leading-snug line-clamp-2">{item.title}</h4>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-muted-foreground font-mono">
                        {dict.cart.quantity || "Say"}: {item.quantity}
                      </span>
                      <span className="font-bold text-foreground font-mono">{(item.price_azn * item.quantity).toFixed(2)} AZN</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            {!appliedCoupon && (
              <div className="pt-4 border-t border-border/80">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2 block">
                  {t({ az: 'Promo Kodunuz Var?', en: 'Have a Promo Code?', ru: 'Есть Промо-Код?' })}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Məsələn: PROMO10"
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-rubik-brand transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isCouponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {isCouponLoading ? (t({ az: 'Yoxlanır...', en: 'Checking...', ru: 'Проверка...' })) : (dict.checkout?.apply_coupon || 'Tətbiq Et')}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-[10px] mt-1 font-bold">{couponError}</p>}
              </div>
            )}
            
            {/* Coupon display */}
            {appliedCoupon && (
              <div className="flex justify-between items-center bg-green-50 text-green-700 p-2.5 rounded-xl border border-green-100 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5" />
                  <span>{t({ az: `Kupon (${appliedCoupon})`, en: `Coupon (${appliedCoupon})`, ru: `Купон (${appliedCoupon})` })}</span>
                </span>
                <span className="font-mono">-{discountAmount.toFixed(2)} AZN</span>
              </div>
            )}

            {/* Financial breakdown */}
            <div className="pt-4 border-t border-border/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{dict.cart.total || "Cəm"}</span>
                <span className="font-bold text-foreground font-mono">{subtotal.toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{dict.checkout?.delivery_fee || "Çatdırılma"}</span>
                <span className="font-bold text-foreground font-mono">
                  {shippingCost === 0 ? (dict.checkout?.free_delivery || 'Pulsuz') : `${shippingCost.toFixed(2)} AZN`}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>{dict.checkout?.discount || "Endirim"}</span>
                  <span className="font-mono">-{discountAmount.toFixed(2)} AZN</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-foreground pt-3.5 border-t border-border">
                <span>{t({ az: 'YEKUN CƏM', en: 'TOTAL AMOUNT', ru: 'ИТОГОВАЯ СУММА' })}</span>
                <span className="font-mono text-base text-rubik-brand">{totalAmount.toFixed(2)} AZN</span>
              </div>
            </div>

            {validationErrors.submit && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl">
                {validationErrors.submit}
              </div>
            )}

            {/* Main Checkout button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center py-4 bg-rubik-brand hover:bg-rubik-brand-dark text-white font-black text-sm rounded-2xl hover:shadow-soft-lg active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <ShoppingBag className="h-4.5 w-4.5" />
              )}
              <span>
                {isProcessing
                  ? t({ az: 'Sifarişiniz hazırlanır...', en: 'Preparing your order...', ru: 'Ваш заказ обрабатывается...' })
                  : dict.checkout?.submit_whatsapp || 'Sifarişi WhatsApp-a Göndər'}
              </span>
              {!isProcessing && <ChevronRight className="h-4 w-4" />}
            </button>

            <div className="text-center">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3" /> {dict.checkout?.security_notice || "Bütün sifarişlər dərhal qorunur."}
              </span>
            </div>
          </div>

          {/* Guarantee Panel */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-4">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-4.5 w-4.5 text-green-600" /> {t({ az: 'Peşəkar Dəstək', en: 'Professional Support', ru: 'Профессиональная Поддержка' })}
            </h4>
            <p className="text-[10px] text-muted-foreground leading-normal">
              {t({
                az: 'Sifarişiniz dərhal peşəkar sürətli kubçulardan ibarət komandamız tərəfindən idarə olunacaqdır. Hər bir kub yola salınmazdan əvvəl xüsusi silikon yağları ilə yağlanıb optimal vəziyyətə gətirilir.',
                en: 'Your order will be handled immediately by our professional speedcubing experts. Each cube is lubed with specialized silicone compounds before dispatch.',
                ru: 'Ваш заказ будет немедленно обработан нашей профессиональной командой спидкуберов. Каждая головоломка смазывается силиконовыми смазками перед отправкой.'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
