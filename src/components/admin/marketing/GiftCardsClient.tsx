"use client";

import React from 'react';
import { Plus, Gift, CreditCard, Send, Search } from 'lucide-react';

const MOCK_GIFTCARDS = [
  { id: '1', code: 'XXXX-XXXX-1234', customer: 'Əli Həsənov', initialValue: 100, currentBalance: 45.50, status: 'active', issued: '2023-09-15' },
  { id: '2', code: 'XXXX-XXXX-9876', customer: 'Aysel Məmmədova', initialValue: 50, currentBalance: 0, status: 'depleted', issued: '2023-10-01' },
];

export default function GiftCardsClient() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-500" /> Hədiyyə Kartları & Store Credit
          </h2>
          <p className="text-sm text-slate-400 mt-1">Müştərilər üçün mağaza krediti və hədiyyə kartlarının idarəedilməsi.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors border border-slate-700">
            <CreditCard className="w-4 h-4" /> Store Credit Təyin Et
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4" /> Yeni Hədiyyə Kartı
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Kod və ya Müştəri..." className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Kart Kodu</th>
                <th className="px-6 py-4">Müştəri / Alıcı</th>
                <th className="px-6 py-4">İlkin Dəyər</th>
                <th className="px-6 py-4">Cari Balans</th>
                <th className="px-6 py-4">Tarix</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_GIFTCARDS.map((card) => (
                <tr key={card.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">{card.code}</td>
                  <td className="px-6 py-4">{card.customer}</td>
                  <td className="px-6 py-4 font-mono">{card.initialValue.toFixed(2)} ₼</td>
                  <td className="px-6 py-4 font-mono font-bold text-amber-500">{card.currentBalance.toFixed(2)} ₼</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{card.issued}</td>
                  <td className="px-6 py-4">
                    {card.status === 'active' 
                      ? <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Aktiv</span>
                      : <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700">Bitib</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Emaillə Təkrar Göndər">
                      <Send className="w-4 h-4" />
                    </button>
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
