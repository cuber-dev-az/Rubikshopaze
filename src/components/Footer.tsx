import Link from 'next/link';
import type { ApplicationDictionary } from '@/types/application.types';

interface FooterProps {
  dict: ApplicationDictionary;
  locale: string;
}

export function Footer({ dict, locale }: FooterProps) {
  return (
    <footer className="bg-rubik-secondary text-gray-400 py-12 mt-auto">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href={`/${locale}`} className="inline-block mb-4 text-xl font-bold bg-rubik-primary text-black px-2 py-1 rounded">
              RubikShop
            </Link>
            <p className="text-sm max-w-xs">
              Premium speedcubing products and accessories. Designed for professional cubers.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Məlumat / Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}`} className="hover:text-white transition-colors">{dict.navigation.home}</Link></li>
              <li><Link href={`/${locale}/admin`} className="hover:text-white transition-colors">{dict.navigation.admin}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Əlaqə / Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Baku, Azerbaijan</li>
              <li>info@rubikshop.az</li>
              <li>+994 50 000 00 00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>© {new Date().getFullYear()} RubikShop. Bütün hüquqlar qorunur.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-white cursor-pointer transition-colors">WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
