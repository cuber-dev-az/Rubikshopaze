'use client';

import * as React from 'react';
import Link from 'next/link';
import { Send, Mail, MapPin, Phone, ShieldCheck, Heart, AlertCircle, Package } from 'lucide-react';
import type { ApplicationDictionary } from '@/types/application.types';
import { useAuthUser } from '@/hooks/useAuthUser';
import { subscribeToNewsletter } from '@/lib/actions/community';

interface FooterProps {
  dict: ApplicationDictionary;
  locale: string;
}

export function Footer({ dict, locale }: FooterProps) {
  const { userRole } = useAuthUser();
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const [subscribing, setSubscribing] = React.useState(false);
  
  const [phone, setPhone] = React.useState('+994 50 668 49 25');
  const [emailVal, setEmailVal] = React.useState('info@rubikshop.az');
  const [addressVal, setAddressVal] = React.useState('Bakı şəhəri, Azərbaycan');

  const t = (obj: { az: string; en: string; ru: string }) => {
    return obj[locale as keyof typeof obj] || obj.az;
  };

  React.useEffect(() => {
    async function loadFooterSettings() {
      try {
        const { getSettings } = await import('@/lib/actions/settings');
        const res = await getSettings('general');
        if (res.success && res.data) {
          if (res.data.contactPhone && !res.data.contactPhone.includes('000 00') && res.data.contactPhone !== '+994 50 000 00 00') {
            setPhone(res.data.contactPhone);
          }
          if (res.data.contactEmail) setEmailVal(res.data.contactEmail);
          if (res.data.address) setAddressVal(res.data.address);
        }
      } catch (err) {
        console.error('Error loading footer settings:', err);
      }
    }
    loadFooterSettings();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    
    try {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        alert(res.error || 'Xəta baş verdi, xahiş olunur yenidən cəhd edin.');
      }
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFFFFF] text-[#17181C] font-sans border-t border-[#E5E7EB]">
      {/* Newsletter Accent Segment */}
      <div className="border-b border-[#E5E7EB] bg-[#F6F6F8]">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-lg md:text-xl font-bold text-[#17181C] flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#D8232A]" />
              <span>{dict.footer?.newsletter_title || "Yeniliklərdən xəbərdar olun"}</span>
            </h3>
            <p className="text-xs md:text-sm text-[#6B7280] mt-1.5">
              {dict.footer?.newsletter_desc || "Yeni gələn professional kublar, endirimlər və Azərbaycan speedcubing turnirləri haqqında ilk siz eşidin."}
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              aria-label="E-poçt ünvanı"
              placeholder={dict.footer?.newsletter_placeholder || "E-poçt ünvanınızı daxil edin"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-sm text-[#17181C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D8232A] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={subscribing || subscribed}
              className="px-6 py-3 bg-[#D8232A] text-white text-sm font-semibold rounded-lg hover:bg-[#B31B21] active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>
                {subscribing
                  ? 'Gözləyin...'
                  : subscribed
                  ? (dict.footer?.newsletter_subscribed || 'Abunə olundu!')
                  : (dict.footer?.newsletter_button || 'Abunə ol')}
              </span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Company Bio column */}
        <div className="space-y-4">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#D8232A] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-sans font-black text-[#D8232A] text-xl md:text-2xl tracking-tight">
              RubikShop<span className="text-[#17181C] text-sm md:text-base font-bold ml-0.5">.az</span>
            </span>
          </Link>
          <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed max-w-sm">
            {dict.footer?.bio_desc || "Azərbaycanın ilk və tək ixtisaslaşmış professional sürətli kub yarışı (speedcubing) platforması. Dünya səviyyəli brendlər və xidmət keyfiyyəti."}
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-[#374151] mt-3 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{dict.footer?.wca_notice || "WCA rəsmi qaydaları ilə tam uyğun məhsullar."}</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-[#17181C] uppercase tracking-wider">{dict.footer?.useful_links || "Faydalı Keçidlər"}</h4>
          <ul className="space-y-2.5 text-xs md:text-sm">
            <li>
              <Link href={`/${locale}`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                <span>{locale === 'en' ? 'Home' : (locale === 'ru' ? 'Главная' : (dict.navigation?.home || 'Ana Səhifə'))}</span>
              </Link>
            </li>
            {(userRole === 'admin' || userRole === 'manager') && (
              <li>
                <Link href={`/${locale}/admin`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                  <span>{dict.navigation?.admin || 'İdarəetmə Paneli'}</span>
                </Link>
              </li>
            )}
            <li>
              <Link href={`/${locale}/track-order`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                <span>{locale === 'en' ? 'Track Order' : (locale === 'ru' ? 'Отследить заказ' : 'Sifarişi İzlə')}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}?category=learning-content`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                <span>{dict.header?.nav_learning || "Alqoritmlər & Öyrənmə"}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}?category=bundles`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                <span>{locale === 'en' ? 'Discount Bundles' : (locale === 'ru' ? 'Наборы со скидкой' : 'Endirimli Dəstlər')}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Policies column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-[#17181C] uppercase tracking-wider">{dict.footer?.support_policies || "Dəstək və Şərtlər"}</h4>
          <ul className="space-y-2.5 text-xs md:text-sm">
            <li>
              <Link href={`/${locale}/pages/terms-of-service`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                <span>{dict.footer?.terms_of_service || "İstifadə Şərtləri"}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/pages/privacy-policy`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                <span>{dict.footer?.privacy_policy || "Məxfilik Siyasəti"}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/pages/return-policy`} className="text-[#6B7280] hover:text-[#D8232A] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                <span>{dict.footer?.return_policy || "Geri Qaytarma Qaydaları"}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-[#17181C] uppercase tracking-wider">{dict.footer?.contact_us || "Bizimlə Əlaqə"}</h4>
          <ul className="space-y-3.5 text-xs md:text-sm text-[#6B7280]">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-5 w-5 text-[#D8232A] shrink-0" />
              <span>{addressVal}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-[#6B7280] shrink-0" />
              <span>{emailVal}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[#16A34A] shrink-0" />
              <a href={`tel:${phone}`} className="hover:text-[#D8232A] transition-colors">{phone}</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Payments bar */}
      <div className="border-t border-[#E5E7EB] bg-[#F6F6F8] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-[#6B7280] text-center md:text-left leading-relaxed">
            © {currentYear} RubikShop.az. {dict.footer?.all_rights_reserved || "Bütün hüquqlar qorunur."} <br className="hidden sm:block" />
            Azərbaycanlı sürətli kubçular üçün <Heart className="h-3 w-3 text-[#D8232A] inline fill-[#D8232A] mx-0.5" /> ilə hazırlanıb.
          </p>

          {/* Secure Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase text-[#6B7280] font-bold tracking-widest mr-2">
              {dict.footer?.secure_payment || "Təhlükəsiz Ödəniş"}
            </span>
            <div className="flex gap-2">
              <span className="bg-[#FFFFFF] text-[#17181C] text-[10px] font-bold px-2.5 py-1.5 rounded border border-[#E5E7EB] tracking-wider shadow-sm">
                💳 Visa / MasterCard
              </span>
              <span className="bg-[#FFFFFF] text-[#17181C] text-[10px] font-bold px-2.5 py-1.5 rounded border border-[#E5E7EB] tracking-wider shadow-sm">
                📱 Apple Pay
              </span>
              <span className="bg-[#FFFFFF] text-[#17181C] text-[10px] font-bold px-2.5 py-1.5 rounded border border-[#E5E7EB] tracking-wider shadow-sm">
                💵 Qapıda Ödəniş
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
