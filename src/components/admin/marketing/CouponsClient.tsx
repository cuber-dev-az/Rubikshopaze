"use client";

import React, { useState } from 'react';
import { Plus, Search, Tag, Calendar, Percent, Edit3, Trash2, Check, X } from 'lucide-react';

const MOCK_COUPONS = [
  { id: '1', code: 'RUBIK20', type: 'percentage', value: 20, minSpend: 50, usageLimit: 100, used: 45, status: 'active', expiry: '2023-12-31' },
  { id: '2', code: 'FREESHIP', type: 'free_shipping', value: 0, minSpend: 100, usageLimit: null, used: 12, status: 'active', expiry: '2023-11-30' },
  { id: '3', code: 'WELCOME10', type: 'fixed', value: 10, minSpend: 30, usageLimit: 500, used: 500, status: 'expired', expiry: '2023-10-01' },
];

export default function CouponsClient() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" /> Kuponlar & Endirimlər
          </h2>
          <p className="text-sm text-slate-400 mt-1">Promo kodların yaradılması və idarəedilməsi.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Ləğv Et' : 'Yeni Kupon'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Kupon Yaradılması</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Kupon Kodu</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 uppercase" placeholder="Məs: YAY2024" />
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Endirim Tipi</label>
              <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 appearance-none font-medium">
                <option value="percentage">Faiz Endirimi (%)</option>
                <option value="fixed">Sabit Məbləğ (₼)</option>
                <option value="free_shipping">Pulsuz Çatdırılma</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Dəyər</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" placeholder="10" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Minimum Sifariş (₼)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" placeholder="50" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">İstifadə Limiti (Ümumi)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" placeholder="Məs: 100 (Boş = Limitsiz)" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Bitmə Tarixi</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
              <Check className="w-5 h-5" /> Yadda Saxla
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Aktiv & Keçmiş Kuponlar</h3>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Kod axtar..." className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Kod</th>
                <th className="px-6 py-4">Endirim</th>
                <th className="px-6 py-4">Şərtlər</th>
                <th className="px-6 py-4">İstifadə</th>
                <th className="px-6 py-4">Bitmə Tarixi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_COUPONS.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-slate-800 text-white font-mono font-bold rounded-lg border border-slate-700">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {coupon.type === 'percentage' && `${coupon.value}%`}
                    {coupon.type === 'fixed' && `${coupon.value} ₼`}
                    {coupon.type === 'free_shipping' && 'Pulsuz Çatdırılma'}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    Min. {coupon.minSpend} ₼
                  </td>
                  <td className="px-6 py-4 font-mono">
                    {coupon.used} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{coupon.expiry}</td>
                  <td className="px-6 py-4">
                    {coupon.status === 'active' 
                      ? <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Aktiv</span>
                      : <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">Bitib</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
