'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Send, Mail, MapPin, Phone, HelpCircle, ShieldCheck, Heart, BookOpen, AlertCircle } from 'lucide-react';
import type { ApplicationDictionary } from '@/types/application.types';

interface FooterProps {
  dict: ApplicationDictionary;
  locale: string;
}

export function Footer({ dict, locale }: FooterProps) {





  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rubik-charcoal text-gray-300 font-sans border-t border-border/10">
      {/* Newsletter Accent Segment */}
      <div className="border-b border-border/10 bg-rubik-charcoal-dark/50">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-rubik-brand" />
              <span>Yeniliklərdən xəbərdar olun</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1.5">
              Yeni gələn professional kublar, endirimlər və Azərbaycan speedcubing turnirləri haqqında ilk siz eşidin.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              placeholder="E-poçt ünvanınızı daxil edin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-rubik-charcoal border border-border/20 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rubik-brand focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-rubik-brand text-white text-sm font-semibold rounded-lg hover:bg-rubik-brand-dark active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>{subscribed ? 'Abunə olundu!' : 'Abunə ol'}</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Company Bio column */}
        <div className="space-y-4">
          <Link href={`/${locale}`} className="inline-block">
            <span className="text-xl md:text-2xl font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg shadow-soft-sm tracking-tight">
              RubikShop<span className="text-rubik-yellow">.az</span>
            </span>
          </Link>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-sm">
            Azərbaycanın ilk və tək ixtisaslaşmış professional sürətli kub yarışı (speedcubing) platforması. Dünya səviyyəli brendlər və xidmət keyfiyyəti.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3 bg-rubik-charcoal-light/40 p-2.5 rounded-lg border border-border/5">
            <AlertCircle className="h-4 w-4 text-rubik-yellow shrink-0 animate-pulse" />
            <span>WCA rəsmi qaydaları ilə tam uyğun məhsullar.</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Faydalı Keçidlər</h4>
          <ul className="space-y-2.5 text-xs md:text-sm">
            <li>
              <Link href={`/${locale}`} className="hover:text-rubik-brand transition-colors flex items-center gap-1.5">
                <span>{dict.navigation.home}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin`} className="hover:text-rubik-brand transition-colors flex items-center gap-1.5">
                <span>{dict.navigation.admin}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}?category=learning-content`} className="hover:text-rubik-brand transition-colors flex items-center gap-1.5">
                <span>Alqoritmlər & Öyrənmə</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}?category=bundles`} className="hover:text-rubik-brand transition-colors flex items-center gap-1.5">
                <span>Endirimli Dəstlər (Bundles)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Policies column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Dəstək və Şərtlər</h4>
          <ul className="space-y-2.5 text-xs md:text-sm">
            <li>
              <span className="hover:text-rubik-brand transition-colors cursor-pointer flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-rubik-yellow" />
                <span>Tez-tez verilən suallar (FAQ)</span>
              </span>
            </li>
            <li>
              <span className="hover:text-rubik-brand transition-colors cursor-pointer flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-rubik-green" />
                <span>İstifadəçi Şərtləri & Gizlilik</span>
              </span>
            </li>
            <li>
              <span className="hover:text-rubik-brand transition-colors cursor-pointer flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-rubik-blue-light" />
                <span>Bloq və Cubing Xəbərləri</span>
              </span>
            </li>
            <li>
              <span className="hover:text-rubik-brand transition-colors cursor-pointer flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rubik-brand" />
                <span>Sponsorluq Şərtləri</span>
              </span>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bizimlə Əlaqə</h4>
          <ul className="space-y-3.5 text-xs md:text-sm text-gray-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-5 w-5 text-rubik-brand shrink-0" />
              <span>Bakı şəhəri, Azərbaycan</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-rubik-yellow shrink-0" />
              <span>info@rubikshop.az</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-rubik-green shrink-0" />
              <span>+994 50 000 00 00</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Payments bar */}
      <div className="border-t border-border/10 bg-rubik-charcoal-dark py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-400 text-center md:text-left leading-relaxed">
            © {currentYear} RubikShop.az. Bütün hüquqlar qorunur. <br className="hidden sm:block" />
            Designed with <Heart className="h-3 w-3 text-rubik-brand inline" /> in Azerbaijan for speedcubers.
          </p>

          {/* Secure Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mr-2">Təhlükəsiz Ödəniş</span>
            <div className="flex gap-2">
              <span className="bg-rubik-charcoal text-white text-[10px] font-bold px-2.5 py-1.5 rounded border border-border/10 tracking-wider shadow-soft-sm">
                💳 Visa / MasterCard
              </span>
              <span className="bg-rubik-charcoal text-white text-[10px] font-bold px-2.5 py-1.5 rounded border border-border/10 tracking-wider shadow-soft-sm">
                📱 Apple Pay
              </span>
              <span className="bg-rubik-charcoal text-white text-[10px] font-bold px-2.5 py-1.5 rounded border border-border/10 tracking-wider shadow-soft-sm">
                💵 Qapıda Ödəniş
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
