"use client";

import React, { useState } from 'react';
import { Plus, Minus, ArrowRightLeft, ShieldAlert, Archive, FileText, Check } from 'lucide-react';

export default function StockOperationsClient() {
  const [opType, setOpType] = useState('in'); // in, out, transfer, damaged, reserve

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { id: 'in', label: 'Stok Girişi (Stock In)', icon: Plus, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
          { id: 'out', label: 'Stok Çıxışı (Stock Out)', icon: Minus, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
          { id: 'transfer', label: 'Transfer (Transfer)', icon: ArrowRightLeft, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
          { id: 'damaged', label: 'Zədəli (Damaged)', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { id: 'reserve', label: 'Rezerv & Ön Sifariş', icon: Archive, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
        ].map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setOpType(type.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                opType === type.id 
                  ? `${type.bg} ${type.border} shadow-soft-sm scale-[1.02]` 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 w-fit rounded-xl mb-3 ${opType === type.id ? 'bg-slate-950/50' : type.bg} ${type.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className={`font-black text-sm ${opType === type.id ? type.color : 'text-slate-300'}`}>{type.label}</h3>
            </button>
          )
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          Əməliyyat Forması
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Məhsul SKU / Adı</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors" placeholder="Məsələn: GAN14-ML" />
            </div>

            {opType === 'transfer' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mənbə Anbar (From)</label>
                  <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                    <option>Mərkəzi Anbar (Bakı)</option>
                    <option>Sumqayıt Filialı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Hədəf Anbar (To)</label>
                  <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                    <option>Sumqayıt Filialı</option>
                    <option>Mərkəzi Anbar (Bakı)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Lokasiya / Anbar</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                  <option>Mərkəzi Anbar (Bakı)</option>
                  <option>Sumqayıt Filialı</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Miqdar (Qty)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors" placeholder="0" />
            </div>

            {opType === 'reserve' && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Rezerv Tipi</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                  <option>Preorder Allocation (Ön Sifariş)</option>
                  <option>Backorder Fulfillment</option>
                  <option>Manual Reserve</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">İzləmə Məlumatları (Tracking)</label>
              <div className="space-y-3 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Purchase Order (PO) Linki</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500" placeholder="PO-2023-0891" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Batch / Lot Nömrəsi</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500" placeholder="LOT-88A2" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Serial Tracking (Seriya Nömrələri)</label>
                  <textarea rows={2} className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 resize-none" placeholder="Seriya nömrələrini vergüllə ayırın..."></textarea>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Qeyd (Reason)</label>
              <textarea rows={3} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="Səbəb və ya əlavə məlumat..."></textarea>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
            <Check className="w-5 h-5" /> Əməliyyatı Təsdiqlə
          </button>
        </div>
      </div>
    </div>
  );
}
