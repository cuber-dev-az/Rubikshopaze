'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShoppingBag,
  Truck,
  Gift,
  Building2,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Star,
  Users,
  BookOpen,
  MessageSquare,
  Flame,
  Search,
  Grid3X3,
  Droplet,
  Timer,
  Layers,
  ChevronDown
} from 'lucide-react';
import type { ApplicationDictionary } from '@/types/application.types';
import { useCartStore } from '@/store/useCartStore';

interface Product {
  id: string;
  title: string;
  price_azn: number;
  image_url: string;
  stock_quantity: number;
  compare_at_price_azn?: number;
  original_price_azn?: number;
  discount_percent?: number;
}

interface HomepageContentProps {
  products: Product[];
  dict: ApplicationDictionary;
  locale: string;
  banners?: any[];
}

export function HomepageContent({ products, dict, locale, banners = [] }: HomepageContentProps) {
  const [activeTab, setActiveTab] = React.useState<'new' | 'best' | 'sale'>('new');
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);
  React.useEffect(() => {
    if (banners && banners.length > 1) {
      const interval = setInterval(() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length), 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);
  const addItem = useCartStore((state) => state.addItem);

  // Localization translator helper
  const t = (obj: { az: string; en: string; ru: string }) => {
    return obj[locale as 'az' | 'en' | 'ru'] || obj.az;
  };

  const currentProducts = products;

  // Filter products into tab items
  const newArrivals = currentProducts.slice(0, 4);
  const bestSellers = currentProducts.filter(p => p.stock_quantity > 0).slice(0, 4);
  
  const saleProducts = currentProducts
    .filter(p => {
      const origPrice = p.original_price_azn || p.compare_at_price_azn;
      return origPrice && origPrice > p.price_azn;
    })
    .map(p => ({
      ...p,
      original_price: p.original_price_azn || p.compare_at_price_azn
    }));

  const activeSaleProducts = saleProducts.length > 0 ? saleProducts.slice(0, 4) : currentProducts.slice(0, 4);

  const getActiveProducts = () => {
    switch (activeTab) {
      case 'best': return bestSellers;
      case 'sale': return activeSaleProducts;
      default: return newArrivals;
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity <= 0) return;
    addItem({
      id: product.id,
      title: product.title,
      price_azn: product.price_azn,
      quantity: 1,
      image_url: product.image_url,
    });
  };

  // FAQ contents
  const faqs = [
    {
      q: {
        az: 'Sifarişlər nə qədər vaxta çatdırılır?',
        en: 'How long does delivery take?',
        ru: 'Сколько времени занимает доставка?'
      },
      a: {
        az: 'Bakı daxilində sifarişləriniz 24 saat ərzində sürətli kuryer vasitəsilə çatdırılır. Azərbaycanın digər rayon və şəhərlərinə isə "Azərpoçt" ilə 2-3 iş günü ərzində etibarlı şəkildə göndərilir.',
        en: 'Orders in Baku are delivered within 24 hours via express courier. For other regions and cities of Azerbaijan, it is safely shipped via "Azerpost" within 2-3 business days.',
        ru: 'Заказы в Баку доставляются в течение 24 часов экспресс-курьером. В другие регионы и города Азербайджана отправка осуществляется надежно через «Азерпочта» в течение 2-3 рабочих дней.'
      }
    },
    {
      q: {
        az: 'Mağazada satılan məhsullar orijinaldır?',
        en: 'Are the products sold in the store original?',
        ru: 'Оригинальные ли товары продаются в магазине?'
      },
      a: {
        az: 'Bəli, tamamilə! Biz yalnız GAN, MoYu, QiYi, X-Man və DaYan kimi dünyanın lider speedcubing istehsalçıları ilə birbaşa əməkdaşlıq edirik və bütün məhsullara rəsmi orijinallıq zəmanəti veririk.',
        en: 'Yes, absolutely! We only cooperate directly with the worlds leading speedcubing manufacturers such as GAN, MoYu, QiYi, X-Man, and DaYan, providing an official guarantee of authenticity for all items.',
        ru: 'Да, абсолютно! Мы сотрудничаем напрямую только с ведущими мировыми производителями спидкубинга, такими как GAN, MoYu, QiYi, X-Man и DaYan, предоставляя официальную гарантию подлинности на все товары.'
      }
    },
    {
      q: {
        az: 'Yeni başlayanlar üçün hansı kubu tövsiyə edirsiniz?',
        en: 'Which cube do you recommend for beginners?',
        ru: 'Какой кубик вы рекомендуете новичкам?'
      },
      a: {
        az: 'Yeni başlayanlar üçün həm qiyməti uyğun, həm də içində maqnit sistemi olan QiYi MS Magnetic və ya MoYu RS3M V2 modelini tövsiyə edirik. Maqnit sistemi kubu daha asan idarə etməyə və öyrənməyə kömək edir.',
        en: 'For beginners, we highly recommend the QiYi MS Magnetic or MoYu RS3M V2, which are both budget-friendly and equipped with magnetic alignment systems. Magnets help you control and learn the cube much easier.',
        ru: 'Для новичков мы рекомендуем QiYi MS Magnetic или MoYu RS3M V2, которые экономичны и оснащены системами магнитного позиционирования. Магниты помогают легче контролировать и осваивать куб.'
      }
    },
    {
      q: {
        az: 'Professional kubların gərginliyini necə nizamlamaq olar?',
        en: 'How to adjust the tension of professional cubes?',
        ru: 'Как отрегулировать натяжение профессиональных кубиков?'
      },
      a: {
        az: 'Bizim Rubikshop Premium Quraşdırma (Setup) xidmətimizdən istifadə edə bilərsiniz! Ekspertlərimiz kubun yaylarını və maqnit gərginliyini sizin fırlatma tərzinizə uyğun şəkildə xüsusi alətlərlə tam pulsuz tənzimləyəcək.',
        en: 'You can use our Rubikshop Premium Setup service! Our experts will fine-tune the springs and magnet tension of your cube to perfectly match your turning style using professional tools.',
        ru: 'Вы можете воспользоваться нашей услугой премиум-настройки Rubikshop! Наши специалисты бесплатно настроят пружины и натяжение магнитов вашего кубика в соответствии с вашим стилем вращения.'
      }
    }
  ];

  // Blog posts
  const blogPosts = [
    {
      id: 1,
      title: {
        az: '2026-cı ilin Ən Sürətli Flaqman Kubları: Müqayisəli Təhlil',
        en: 'The Fastest Flagship Cubes of 2026: Comparative Analysis',
        ru: 'Самые быстрые флагманские кубики 2026 года: сравнительный анализ'
      },
      desc: {
        az: 'GAN 14, MoYu WeiLong V9 və Tornado V3 modellərinin ətraflı testi. Hansı kub sizin sürətiniz üçün daha uyğundur?',
        en: 'In-depth test of GAN 14, MoYu WeiLong V9, and Tornado V3 models. Which cube matches your turning style best?',
        ru: 'Подробный тест моделей GAN 14, MoYu WeiLong V9 и Tornado V3. Какой куб лучше всего подходит для вашей скорости?'
      },
      date: '11.07.2026',
      readTime: '5 min',
      image: 'https://picsum.photos/seed/blog1/800/500'
    },
    {
      id: 2,
      title: {
        az: 'MagLev Texnologiyası Nədir və Sürətə Necə Təsir Edir?',
        en: 'What is MagLev Technology and How Does It Affect Speed?',
        ru: 'Что такое технология MagLev и как она влияет на скорость?'
      },
      desc: {
        az: 'Klassik yay mexanizmini əvəz edən maqnit asqısı sayəsində sürtünmənin minimuma enməsi və rekord həll sirləri.',
        en: 'Friction reduction through magnetic repulsion replacing standard springs, leading to record-breaking solves.',
        ru: 'Снижение трения за счет магнитной подвески, заменяющей стандартные пружины, что ведет к рекордным сборкам.'
      },
      date: '08.07.2026',
      readTime: '4 min',
      image: 'https://picsum.photos/seed/blog2/800/500'
    },
    {
      id: 3,
      title: {
        az: 'Kubun Düzgün Yağlanması Qaydaları: Silikon vs Su Əsaslı',
        en: 'Proper Cube Lubrication: Silicone vs Water-Based Lubes',
        ru: 'Правильная смазка куба: силиконовая против водной'
      },
      desc: {
        az: 'Kubun həm daxili nüvəsini, həm də üzlərini hansı ardıcıllıqla yağlamalıyıq? Professional məsləhətlər.',
        en: 'How to properly apply core and piece lubes in a precise step-by-step sequence. Professional tips.',
        ru: 'Как правильно наносить смазку на крестовину и детали кубика в точной последовательности. Советы профи.'
      },
      date: '05.07.2026',
      readTime: '6 min',
      image: 'https://picsum.photos/seed/blog3/800/500'
    }
  ];

  return (
    <div className="w-full bg-background overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-rubik-charcoal via-rubik-charcoal-dark to-black text-white py-16 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-border/5 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3182ce_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {banners.length > 0 ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentBannerIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-7 space-y-6 md:space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rubik-brand/20 border border-rubik-brand/40 text-rubik-brand text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  <span>{banners[currentBannerIndex][`subtitle_${locale}`] || banners[currentBannerIndex].subtitle_az || t({ az: 'Xüsusi Təklif', en: 'Special Offer', ru: 'Специальное предложение' })}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white font-sans">
                  {banners[currentBannerIndex][`title_${locale}`] || banners[currentBannerIndex].title_az}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={banners[currentBannerIndex].link_url || '#'}
                    className="px-8 py-4 bg-rubik-brand text-white font-bold rounded-xl shadow-lg hover:bg-rubik-brand-dark hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group cursor-pointer"
                  >
                    <span>{banners[currentBannerIndex][`button_text_${locale}`] || banners[currentBannerIndex].button_text_az || t({ az: 'Kəşf Et', en: 'Explore', ru: 'Исследовать' })}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="lg:col-span-5 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-sm rounded-3xl overflow-hidden shadow-soft-2xl relative aspect-square"
                >
                  <Image
                    src={banners[currentBannerIndex].image_url || "https://picsum.photos/seed/flagship3x3/500/500"}
                    alt={banners[currentBannerIndex][`title_${locale}`] || 'Banner Image'}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {banners.length > 1 && (
              <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'w-8 bg-rubik-brand' : 'w-2 bg-gray-600 hover:bg-gray-400'}`} 
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rubik-brand/20 border border-rubik-brand/40 text-rubik-brand text-xs font-bold uppercase tracking-wider animate-pulse">
                <Sparkles className="h-4 w-4" />
                <span>{t({ az: 'Azərbaycan Speedcubing Flaqmanı', en: 'Azerbaijan Speedcubing Flagship', ru: 'Флагман Спидкубинга в Азербайджане' })}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white font-sans">
                <span>
                  {t({
                    az: 'Sürətli Həllin Yeni Sərhədləri!',
                    en: 'New Frontiers of Speedcubing!',
                    ru: 'Новые рубежи спидкубинга!'
                  })}
                </span>
                {" "}
                <br />
                <span className="bg-gradient-to-r from-rubik-brand via-rubik-yellow to-rubik-green bg-clip-text text-transparent">
                  RubikShop.az
                </span>
              </h1>
              <p className="text-base md:text-xl text-gray-300 font-sans leading-relaxed max-w-2xl">
                {t({
                  az: 'Azərbaycanın ilk və tək ixtisaslaşmış mağazasında 100% orijinal GAN, MoYu və QiYi flaqmanlarını kəşf edin. Premium tənzimləmə xidməti ilə rekordlarınızı alt-üst edin!',
                  en: 'Discover 100% genuine GAN, MoYu, and QiYi flagships in Azerbaijan’s premier puzzle boutique. Destroy your personal records with our fine-tuning service!',
                  ru: 'Откройте для себя 100% оригинальные флагманы GAN, MoYu и QiYi в первом специализированном магазине Азербайджана. Побейте рекорды!'
                })}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    const element = document.getElementById('catalog-grid');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-rubik-brand text-white font-bold rounded-xl shadow-lg hover:bg-rubik-brand-dark hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group cursor-pointer"
                >
                  <span>{t({ az: 'Kataloqu Kəşf Et', en: 'Explore Catalog', ru: 'Исследовать каталог' })}</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('learning-section');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-rubik-charcoal-light/60 border border-border/20 hover:border-rubik-brand/40 text-gray-200 font-bold rounded-xl hover:bg-rubik-charcoal transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  <span>{t({ az: 'Alqoritmlər & Öyrənmə', en: 'Learn Algorithms', ru: 'Изучить алгоритмы' })}</span>
                </button>
              </div>

              {/* Quick Stats Banner */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/10 max-w-lg">
                <div>
                  <span className="block text-2xl md:text-3xl font-black text-rubik-brand font-mono">24h</span>
                  <span className="text-xs text-gray-400 font-sans">{t({ az: 'Sürətli Çatdırılma', en: 'Fast Delivery', ru: 'Быстрая доставка' })}</span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-black text-rubik-yellow font-mono">100%</span>
                  <span className="text-xs text-gray-400 font-sans">{t({ az: 'Orijinal Brendlər', en: 'Genuine Brand', ru: 'Оригинальные бренды' })}</span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-black text-rubik-green font-mono">5k+</span>
                  <span className="text-xs text-gray-400 font-sans">{t({ az: 'Məmnun Müştəri', en: 'Happy Cubers', ru: 'Довольные клиенты' })}</span>
                </div>
              </div>
            </div>

            {/* Right-side high-tech preview card */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="w-full max-w-sm bg-gradient-to-b from-rubik-charcoal-light to-rubik-charcoal border border-border/20 rounded-3xl p-6 shadow-soft-2xl relative"
              >
                <div className="absolute top-4 right-4 bg-rubik-yellow/15 border border-rubik-yellow/40 text-rubik-yellow text-[10px] font-black uppercase px-2 py-1 rounded-md">
                  HOT FLAGSHIP
                </div>

                <div className="relative aspect-square w-full bg-black/30 rounded-2xl overflow-hidden p-4 mb-5 flex items-center justify-center">
                  <Image
                    src="https://picsum.photos/seed/flagship3x3/500/500"
                    alt="Flagship Speedcube"
                    fill
                    referrerPolicy="no-referrer"
                    className="object-contain p-6 transform hover:rotate-12 transition-transform duration-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">GAN 14 MagLev Pro 3x3</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">360° Ball-Core | UV-Coated</p>
                    </div>
                    <span className="text-xl font-black text-rubik-brand">159.00 AZN</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    <span className="px-2 py-0.5 bg-black/40 text-gray-300 text-[10px] font-bold rounded">MagLev</span>
                    <span className="px-2 py-0.5 bg-black/40 text-gray-300 text-[10px] font-bold rounded">UV Coated</span>
                    <span className="px-2 py-0.5 bg-black/40 text-gray-300 text-[10px] font-bold rounded">Ball-Core</span>
                    <span className="px-2 py-0.5 bg-black/40 text-gray-300 text-[10px] font-bold rounded">Adjustable</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart({
                      id: 'gan-14-pro-flagship',
                      title: 'GAN 14 MagLev Pro 3x3 Speedcube',
                      price_azn: 159.00,
                      image_url: 'https://picsum.photos/seed/flagship3x3/500/500',
                      stock_quantity: 4
                    })}
                    className="w-full mt-3 bg-rubik-brand hover:bg-rubik-brand-dark text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{dict.product.add_to_cart}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </section>
      
      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-sans">
            {t({ az: 'Kateqoriyalar üzrə Kəşf Edin', en: 'Explore by Category', ru: 'Исследуйте по категориям' })}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            {t({
              az: 'İstər sürət kubları, istərsə də professional taymer və aksesuarlar — bütün seçimlər bir kliklə qapınızda.',
              en: 'From high speed cubes to professional timers and lubes — find everything you need instantly.',
              ru: 'От скоростных кубиков до профессиональных таймеров и смазок — найдите все, что вам нужно.'
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { id: '3x3', slug: '3x3', icon: Grid3X3, title: { az: '3x3 Kublar', en: '3x3 Cubes', ru: 'Кубы 3x3' }, bg: 'bg-rubik-brand/10 hover:bg-rubik-brand/20 text-rubik-brand' },
            { id: 'big-cubes', slug: '4x4', icon: Layers, title: { az: 'Böyük Kublar', en: 'Big Cubes', ru: 'Большие кубики' }, bg: 'bg-rubik-green/10 hover:bg-rubik-green/20 text-rubik-green' },
            { id: 'minx-skewb', slug: 'pyraminx', icon: Award, title: { az: 'Piramida / Skewb', en: 'Pyraminx & Skewb', ru: 'Пирамидка / Скьюб' }, bg: 'bg-rubik-yellow/10 hover:bg-rubik-yellow/20 text-rubik-yellow' },
            { id: 'lubes', slug: 'lubes', icon: Droplet, title: { az: 'Kub Yağları', en: 'Silicone Lubes', ru: 'Смазки для куба' }, bg: 'bg-rubik-blue-light/10 hover:bg-rubik-blue-light/20 text-rubik-blue-light' },
            { id: 'timers-mats', slug: 'timers', icon: Timer, title: { az: 'Taymer & Mat', en: 'Timer & Mats', ru: 'Таймеры и маты' }, bg: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500' },
            { id: 'bundles', slug: 'bundles', icon: Gift, title: { az: 'Endirimli Dəstlər', en: 'Special Bundles', ru: 'Наборы со скидкой' }, bg: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-500' }
          ].map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/${locale}?category=${cat.slug}`}
                className="group flex flex-col items-center justify-center p-6 bg-card border border-border hover:border-foreground/20 rounded-2xl shadow-soft-sm hover:shadow-soft-md transition-all duration-300 text-center space-y-4"
              >
                <div className={`p-4 rounded-xl ${cat.bg} transition-transform duration-300 group-hover:scale-110`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-foreground group-hover:text-rubik-brand transition-colors">
                  {t(cat.title)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. PRODUCT SHOWCASES SECTION */}
      <section id="catalog-grid" className="py-20 bg-muted/35 border-y border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border pb-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h2 className="text-3xl font-black text-foreground font-sans tracking-tight">
                {t({ az: 'Mağaza Vitrini', en: 'Our Showcase', ru: 'Витрина магазина' })}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t({
                  az: 'Professional turnir sertifikatlı orijinal yarış kubları.',
                  en: 'Professional tournament-certified genuine speedcubes.',
                  ru: 'Оригинальные кубики с профессиональной сертификацией.'
                })}
              </p>
            </div>

            {/* Showcase Tabs */}
            <div role="tablist" aria-label="Məhsul nümayişi" className="flex items-center gap-1.5 bg-card p-1 border border-border rounded-xl shadow-soft-sm">
              {[
                { id: 'new', title: { az: 'Yeni Gələnlər', en: 'New Arrivals', ru: 'Новинки' } },
                { id: 'best', title: { az: 'Çox Satılanlar', en: 'Best Sellers', ru: 'Популярное' } },
                { id: 'sale', title: { az: 'Endirimlər', en: 'Special Deals', ru: 'Скидки' } }
              ].map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-rubik-brand text-white shadow-soft-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(tab.title)}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Loop Grid */}

          {getActiveProducts().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border rounded-2xl bg-muted/20">
              <Sparkles className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t({ az: 'Məhsullar tapılmadı', en: 'No products found', ru: 'Продукты не найдены' })}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t({ az: 'Tezliklə yeni məhsullar əlavə ediləcək.', en: 'New products will be added soon.', ru: 'Скоро будут добавлены новые продукты.' })}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {getActiveProducts().map((product) => {

              const isOutOfStock = product.stock_quantity <= 0;
              const originalPrice = product.original_price_azn || product.compare_at_price_azn;
              const hasSale = originalPrice && originalPrice > product.price_azn;
              const discountPercent = hasSale ? Math.round(((originalPrice - product.price_azn) / originalPrice) * 100) : 0;
              return (
                <div
                  key={product.id}
                  className="flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-soft-md hover:border-foreground/10 transition-all duration-300 group"
                >
                  <div className="relative aspect-square w-full bg-muted/40 flex items-center justify-center p-4">
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-6 transform group-hover:scale-105 transition-transform duration-300"
                    />

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-white text-xs font-black tracking-wider px-3 py-1 bg-red-600 rounded-lg">
                          {dict.product.out_of_stock}
                        </span>
                      </div>
                    )}

                    {hasSale && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-soft-sm">
                        -{discountPercent}% ENDİRİM
                      </div>
                    )}
                  </div>

                  <div className="p-4 md:p-5 flex flex-col flex-grow space-y-2.5">
                    <h2 className="text-sm md:text-base font-bold text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-rubik-brand transition-colors">
                      {product.title}
                    </h2>

                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-base md:text-lg font-black text-foreground">
                        {product.price_azn.toFixed(2)} AZN
                      </span>
                      {hasSale && (
                        <span className="text-xs text-muted-foreground line-through">
                          {originalPrice.toFixed(2)} AZN
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`w-full py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isOutOfStock
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-foreground text-card hover:bg-rubik-brand hover:text-white active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>{isOutOfStock ? dict.product.out_of_stock : dict.product.add_to_cart}</span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </section>

      {/* 4. PROMO BANNERS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Shipping Banner */}
          <div className="bg-rubik-charcoal border border-slate-800 text-white p-8 rounded-xl shadow-md flex flex-col justify-between space-y-6 group hover:-translate-y-1 transition-all duration-300">
            <div className="p-3 bg-white/5 rounded-xl w-fit">
              <Truck className="h-6 w-6 text-rubik-brand" />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">
                {t({ az: '24 Saat Daxilində Sürətli Çatdırılma!', en: '24-Hour Express Courier!', ru: 'Экспресс курьер за 24 часа!' })}
              </h3>
              <p className="text-xs md:text-sm text-gray-300 mt-2">
                {t({
                  az: 'Bakı daxilində eyni gün kuryer çatdırılması. Sifarişi qapıda yoxlayaraq, nağd və ya kartla ödəniş imkanı.',
                  en: 'Same day shipping within Baku. Double-check your cube at your door, then pay cash or card.',
                  ru: 'Доставка в тот же день по Баку. Проверьте заказ на пороге и оплатите наличными или картой.'
                })}
              </p>
            </div>
          </div>

          {/* Gift Card Banner */}
          <div className="bg-rubik-charcoal border border-slate-800 text-white p-8 rounded-xl shadow-md flex flex-col justify-between space-y-6 group hover:-translate-y-1 transition-all duration-300">
            <div className="p-3 bg-white/5 rounded-xl w-fit">
              <Gift className="h-6 w-6 text-rubik-brand" />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">
                {t({ az: 'RubikShop Hədiyyə Kartları', en: 'Premium Gift Cards', ru: 'Подарочные карты' })}
              </h3>
              <p className="text-xs md:text-sm text-gray-300 mt-2">
                {t({
                  az: 'Doğmalarınız və speedcuber dostlarınız üçün ideal intellektual hədiyyə kartları. 20 - 200 AZN dəyərində.',
                  en: 'Perfect intellectual gift cards for speedcubers and family. Value from 20 to 200 AZN.',
                  ru: 'Идеальные интеллектуальные подарочные карты для спидкуберов. Номинал от 20 до 200 AZN.'
                })}
              </p>
            </div>
          </div>

          {/* Wholesale Banner */}
          <div className="bg-rubik-charcoal border border-slate-800 text-white p-8 rounded-xl shadow-md flex flex-col justify-between space-y-6 group hover:-translate-y-1 transition-all duration-300 md:col-span-2 lg:col-span-1">
            <div className="p-3 bg-white/5 rounded-xl w-fit">
              <Building2 className="h-6 w-6 text-rubik-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">
                {t({ az: 'Məktəblər & Klublar üçün Topdan Satış', en: 'Schools & Clubs Wholesale', ru: 'Опт для школ и клубов' })}
              </h3>
              <p className="text-xs md:text-sm text-gray-300 mt-2">
                {t({
                  az: 'Dərnəklər, məktəb layihələri və intellektual oyun qrupları üçün xüsusi endirimli topdan qiymətlər və əlaqə.',
                  en: 'Special high-volume discounts for classrooms, puzzle clubs, and intellect leagues with full supply.',
                  ru: 'Специальные скидки на большие объемы для учебных заведений, кружков и интеллектуальных лиг.'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Special Bundle Section */}
        <div className="bg-gradient-to-r from-rubik-charcoal to-rubik-charcoal-dark border border-border/10 rounded-xl p-8 lg:p-12 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="px-3 py-1 bg-rubik-brand/20 border border-rubik-brand/40 text-rubik-brand text-xs font-bold rounded-full uppercase tracking-wider">
              {t({ az: 'MƏHDUD DƏST TEKLİFİ', en: 'LIMITED EDITION BUNDLE', ru: 'ЛИМИТИРОВАННЫЙ НАБОР' })}
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-white">
              {t({
                az: 'Professional Speedcuber Başlanğıc Paketi!',
                en: 'Professional Speedcuber Starter Pack!',
                ru: 'Профессиональный стартовый набор спидкубера!'
              })}
            </h2>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-xl">
              {t({
                az: 'Dəstə daxildir: MoYu Super RS3M V2 Maqnitli kub, GAN Lube Premium silikon yağlama maddəsi və Rubikshop sürətli masaüstü xalçası. Ayrı-ayrılıqda 82 AZN deyil, cəmi 59 AZN!',
                en: 'Includes: MoYu Super RS3M V2 Magnetic cube, GAN Lube Premium silicone compound, and a Rubikshop training mat. Only 59 AZN instead of 82 AZN!',
                ru: 'В комплекте: магнитный кубик MoYu Super RS3M V2, силиконовая смазка премиум-класса GAN Lube и коврик. Всего 59 AZN!'
              })}
            </p>
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl md:text-3xl font-black text-rubik-brand">59.00 AZN</span>
              <span className="text-sm text-gray-500 line-through">82.00 AZN</span>
            </div>
            <button
              onClick={() => handleAddToCart({
                id: 'special-starter-bundle-combo',
                title: 'Professional Speedcuber Starter Pack (RS3M V2 + GAN Lube + Mat)',
                price_azn: 59.00,
                image_url: 'https://picsum.photos/seed/bundlepack/600/600',
                stock_quantity: 10
              })}
              className="px-6 py-3 bg-rubik-brand hover:bg-rubik-brand-dark text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t({ az: 'Paketi Səbətə Əlavə Et', en: 'Add Bundle to Cart', ru: 'Добавить набор в корзину' })}</span>
            </button>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 bg-black/40 rounded-2xl border border-border/10 p-4 flex items-center justify-center">
              <Image
                src="https://picsum.photos/seed/bundlepack/600/600"
                alt="Starter Pack Bundle"
                fill
                referrerPolicy="no-referrer"
                className="object-contain p-6 hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST & COMMUNITY SECTION */}
      <section className="py-20 bg-muted/20 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Trust Badges Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: { az: '100% Orijinal Brendlər', en: '100% Authentic Brands', ru: '100% Оригинальные бренды' }, desc: { az: 'Birbaşa rəsmi GAN, MoYu, QiYi zavodlarından idxal.', en: 'Direct source importing from manufacturers.', ru: 'Прямой импорт от производителей.' }, color: 'text-rubik-brand' },
              { icon: Award, title: { az: 'WCA Sertifikatlı', en: 'WCA Tournament Ready', ru: 'Сертифицировано WCA' }, desc: { az: 'Beynəlxalq yarış qaydaları ilə tam uyğun kublar.', en: 'Completely tournament legal puzzles.', ru: 'Кубики полностью соответствуют турнирным правилам.' }, color: 'text-rubik-green' },
              { icon: Truck, title: { az: 'Sürətli Çatdırılma', en: 'Lightning Fast Shipping', ru: 'Молниеносная доставка' }, desc: { az: 'Bütün sifarişlər 24 saat ərzində qapınızda.', en: 'Express courier delivery right to your door.', ru: 'Курьерская доставка прямо до вашей двери.' }, color: 'text-rubik-yellow' },
              { icon: Sparkles, title: { az: 'Ekspert Dəstəyi', en: 'Expert Support Line', ru: 'Экспертная поддержка' }, desc: { az: 'Speedcubing ustaları tərəfindən məsləhətlər.', en: 'Get advices from experienced local masters.', ru: 'Советы от опытных местных спидкуберов.' }, color: 'text-indigo-500' }
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-soft-sm">
                  <div className={`p-3 bg-muted rounded-xl ${badge.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-foreground">{t(badge.title)}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(badge.desc)}</p>
                </div>
              );
            })}
          </div>

          {/* Brand Logos */}
          <div className="text-center space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {t({ az: 'RƏSMİ DISTRİBYUTOR BRENDLƏRİ', en: 'OFFICIAL DISTRIBUTED BRANDS', ru: 'ОФИЦИАЛЬНО ДИСТРИБЬЮТИРУЕМЫЕ БРЕНДЫ' })}
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-65 grayscale hover:grayscale-0 transition-all duration-500">
              {['GAN Cube', 'MoYu Culture', 'QiYi Toys', 'DaYan', 'X-Man Design', 'YuXin'].map((brand, idx) => (
                <span key={idx} className="text-lg md:text-xl font-sans font-black tracking-wider hover:text-rubik-brand transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-foreground font-sans tracking-tight">
                {t({ az: 'Yerli Speedcuberlərin Rəyləri', en: 'Loved by Local Cubers', ru: 'Отзывы местных спидкуберов' })}
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                {t({
                  az: 'Azərbaycanın fərqli yaş qruplarından olan rəsmi yarış iştirakçılarının rəyləri.',
                  en: 'Hear from official Azerbaijani tournament speedcubers who solve with our gear.',
                  ru: 'Отзывы официальных участников соревнований из Азербайджана.'
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Kənan M.', solveTime: '8.45s', text: { az: 'Rubikshop-dan aldığım Tornado V3 sayəsində rəsmi turnirdə 8 saniyəlik rekordumu qırdım. Məhsullar əladır!', en: 'Thanks to Tornado V3 I bought from Rubikshop, I broke my official sub-9 barrier in Baku! Awesome quality.', ru: 'Благодаря Tornado V3 из Rubikshop я обновил рекорд!' }, role: 'Azərbaycan Yarışçısı' },
                { name: 'Aydan M.', solveTime: '12.10s', text: { az: 'Ölkədə belə bir ixtisaslaşmış mağazanın olması fəxrdir. Yağlama xidmətləri kubumu möhtəşəm dərəcədə sürətləndirdi.', en: 'Im proud to have a local specialized shop here. Lubrication service accelerated my GAN cube beyond expectations.', ru: 'Отличный специализированный магазин. Смазка ускорила мой куб!' }, role: 'Gənc Yarışçı' },
                { name: 'Sənan S.', solveTime: '9.32s', text: { az: 'Müştəri xidmətləri suallarıma dərhal cavab verdi. 24 saat tamam olmadan kuryer kubumu qapıda təhvil verdi. Təşəkkür edirəm.', en: 'Customer service answered my config question immediately. Express courier delivered the box within 18 hours.', ru: 'Поддержка ответила на все вопросы сразу. Экспресс-доставка за 18 часов!' }, role: 'Speedcubing Ustası' }
              ].map((test, idx) => (
                <div key={idx} className="bg-card border border-border p-6 rounded-3xl relative shadow-soft-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex gap-1 text-rubik-yellow">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-foreground/80 italic leading-relaxed">&quot;{t(test.text)}&quot;</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-6">
                    <div>
                      <span className="block text-sm font-bold text-foreground">{test.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{test.role}</span>
                    </div>
                    <span className="text-xs font-black bg-rubik-brand/10 text-rubik-brand px-2.5 py-1 rounded-md">
                      PB: {test.solveTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Team Sponsorship */}
          <div className="bg-rubik-charcoal border border-slate-800 rounded-xl p-8 lg:p-12 text-white text-center space-y-6 max-w-4xl mx-auto shadow-md">
            <Users className="h-10 w-10 text-rubik-brand mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black">
                {t({ az: 'Sponsorluq Proqramına Qoşulun!', en: 'Apply for Team Sponsorship!', ru: 'Подайте заявку на спонсорство!' })}
              </h2>
              <p className="text-xs md:text-sm text-indigo-100 max-w-xl mx-auto leading-relaxed">
                {t({
                  az: 'Siz rəsmi WCA yarışlarında iştirak edirsiniz? Ölkə rekordçusunuz yoxsa gələcək vəd edən gənc speedcubersiniz? Rubikshop AZ sizə peşəkar kub dəstəyi təklif edir.',
                  en: 'Do you participate in official WCA events or hold national records? Apply to join Rubikshop AZ professional racing team!',
                  ru: 'Участвуете в официальных соревнованиях WCA? Подайте заявку в команду Rubikshop AZ!'
                })}
              </p>
            </div>
            <button className="px-6 py-3 bg-rubik-brand hover:bg-rubik-brand-dark text-white text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer">
              {t({ az: 'İndi Müraciət Et', en: 'Apply Now', ru: 'Подать заявку сейчас' })}
            </button>
          </div>

          {/* Learning Section */}
          <div id="learning-section" className="bg-card border border-border rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="px-3 py-1 bg-rubik-green/15 text-rubik-green text-[10px] font-black rounded-full uppercase tracking-wider">
                CUBING ACADEMY
              </span>
              <h2 className="text-2xl lg:text-3xl font-black text-foreground">
                {t({ az: 'Kubun Sirrlərini Pulsuz Öyrənin!', en: 'Master the Cube for Free!', ru: 'Освойте сборку кубика бесплатно!' })}
              </h2>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                {t({
                  az: 'Peşəkar speedcubing-ə ilk addımlarınızı atın. Bizim öyrədici materiallarımız və alqoritm cədvəllərimiz vasitəsilə 3x3 kubu 1 dəqiqənin altında həll etməyi asanlıqla öyrənin. Dərsliklər və WCA rəsmi qaydaları burada.',
                  en: 'Get your official speedcubing journey started. Use our charts to learn CFOP (F2L, OLL, PLL) algorithms and solve the cube in under 1 minute.',
                  ru: 'Начните свое официальное путешествие спидкубера. С нашими схемами вы научитесь собирать кубик менее чем за 1 минуту.'
                })}
              </p>
              <div className="space-y-2 text-xs md:text-sm font-semibold">
                <div className="flex items-center gap-2 text-rubik-brand">
                  <CheckCircle className="h-4 w-4" />
                  <span>3x3 Başlanğıc LBL Metodu</span>
                </div>
                <div className="flex items-center gap-2 text-rubik-green">
                  <CheckCircle className="h-4 w-4" />
                  <span>Peşəkar CFOP Alqoritmlər siyahısı (F2L/OLL/PLL)</span>
                </div>
                <div className="flex items-center gap-2 text-rubik-yellow">
                  <CheckCircle className="h-4 w-4" />
                  <span>Fingertricks (Sürətli barmaq hərəkətləri) qaydaları</span>
                </div>
              </div>
            </div>
            <div className="bg-muted p-6 rounded-2xl border border-border">
              <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider text-center">F2L Cheat-Sheet Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-muted-foreground">
                <div className="bg-card border border-border p-3 rounded-xl">
                  <span className="block font-bold text-rubik-brand">Case 1: R U R&apos;</span>
                  <span className="text-[10px]">Corner in top layer, edge in middle</span>
                </div>
                <div className="bg-card border border-border p-3 rounded-xl">
                  <span className="block font-bold text-rubik-green">Case 2: R U&apos; R&apos; U2 R U&apos; R&apos;</span>
                  <span className="text-[10px]">Opposite colors on top</span>
                </div>
                <div className="bg-card border border-border p-3 rounded-xl">
                  <span className="block font-bold text-rubik-yellow">Case 3: U&apos; R U R&apos; U R U R&apos;</span>
                  <span className="text-[10px]">Same colors on top layer</span>
                </div>
                <div className="bg-card border border-border p-3 rounded-xl">
                  <span className="block font-bold text-indigo-500">Case 4: R U2 R&apos; U&apos; R U R&apos;</span>
                  <span className="text-[10px]">Corner facing up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTENT TEASERS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 border-t border-border/40">
        {/* Blog Teasers */}
        <div className="space-y-10">
          <div className="flex items-end justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground font-sans tracking-tight">
                {t({ az: 'Bloq və Xəbərnəvislik', en: 'Blog & News Hub', ru: 'Блог и центр новостей' })}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {t({ az: 'Speedcubing sənətinin sirləri, gərginlik ayarları və son xəbərlər.', en: 'Tips, setup tutorials, and major speedcubing news.', ru: 'Советы, руководства по настройке и спидкубинг-новости.' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div key={post.id} className="group flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-soft-sm hover:shadow-soft-md transition-all duration-300">
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={post.image}
                    alt={t(post.title)}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {post.readTime}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-3">
                  <span className="text-[10px] font-bold text-rubik-brand tracking-wider">{post.date}</span>
                  <h3 className="text-base font-bold text-foreground group-hover:text-rubik-brand transition-colors line-clamp-2 leading-snug">
                    {t(post.title)}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {t(post.desc)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Teaser Accordion */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <HelpCircle className="h-8 w-8 text-rubik-brand mx-auto animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-black text-foreground font-sans">
              {t({ az: 'Tez-Tez Verilən Suallar', en: 'Frequently Asked Questions', ru: 'Часто задаваемые вопросы' })}
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <span>{t(faq.q)}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 text-muted-foreground ${
                      activeFaq === idx ? 'rotate-180 text-rubik-brand' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-muted-foreground border-t border-border/30 leading-relaxed bg-muted/10">
                        {t(faq.a)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-rubik-brand to-rubik-brand-dark rounded-xl p-8 lg:p-16 text-white text-center space-y-6 shadow-md max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              {t({
                az: 'Saniyələrinizi Qənaət Etməyə Hazırsınız?',
                en: 'Ready to Save Your Precious Seconds?',
                ru: 'Готовы сэкономить драгоценные секунды?'
              })}
            </h2>
            <p className="text-sm md:text-base text-white/95 max-w-lg mx-auto leading-relaxed">
              {t({
                az: 'Daha yaxşı kəsiklər, daha hamar fırlanma mexanizmi və peşəkar tənzimləmə sayəsində növbəti PB-nizi təyin edin.',
                en: 'Get your next personal best today. Enjoy fast corner cuttings, smooth rotations, and official setup services.',
                ru: 'Получите свой следующий личный рекорд уже сегодня. Наслаждайтесь быстрыми поворотами и плавной сборкой.'
              })}
            </p>
          </div>
          <div className="relative z-10 pt-2">
            <button
              onClick={() => {
                const element = document.getElementById('catalog-grid');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-rubik-brand font-black rounded-xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 mx-auto cursor-pointer text-sm"
            >
              <span>{t({ az: 'Məhsulları Alın', en: 'Shop Speedcubes', ru: 'Купить кубики' })}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
