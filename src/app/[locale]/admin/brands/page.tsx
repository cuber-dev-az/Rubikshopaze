'use client';
import { Package } from 'lucide-react';

export default function AdminBrandsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-rubik-primary" />
            Brendlər
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sistemdəki bütün brendlər.</p>
        </div>
        <button className="bg-rubik-primary text-black px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
          + Yeni Brend
        </button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <Package className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Brendlər tezliklə</h3>
        <p className="text-gray-500 max-w-sm">
          Bu bölmə hal-hazırda hazırlıq mərhələsindədir. Tezliklə istifadəyə veriləcək.
        </p>
      </div>
    </div>
  );
}
