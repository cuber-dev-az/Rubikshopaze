"use client";

import React, { useState } from 'react';
import { Star, Users, Mail, Plus, Edit3, Settings } from 'lucide-react';

export default function LoyaltyClient() {
  const [activeTab, setActiveTab] = useState('loyalty'); // loyalty, referrals, newsletter

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" /> Loyallıq & İcma (Community)
          </h2>
          <p className="text-sm text-slate-400 mt-1">Sadiqlik proqramı, referallar və xəbər bülleteni.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors border border-slate-700">
          <Settings className="w-4 h-4" /> Proqram Tənzimləmələri
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'loyalty' 
              ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Star className="w-4 h-4" /> Loyallıq Xalları (Points)
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'referrals' 
              ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" /> Referal Sistemi
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'newsletter' 
              ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Mail className="w-4 h-4" /> Xəbər Bülleteni (Newsletter)
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md min-h-[400px]">
        {activeTab === 'loyalty' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Müştəri Xalları</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-bold rounded-xl transition-colors border border-amber-500/20">
                <Plus className="w-3 h-3" /> Manual Xal Əlavə Et
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Müştəri</th>
                    <th className="px-4 py-3">Cari Xal (Balance)</th>
                    <th className="px-4 py-3">Ömürlük Toplanan (Lifetime)</th>
                    <th className="px-4 py-3">Səviyyə (Tier)</th>
                    <th className="px-4 py-3 text-right">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="px-4 py-4 font-bold text-white">Əli Həsənov</td>
                    <td className="px-4 py-4 font-mono font-bold text-amber-500">1,250 Xal</td>
                    <td className="px-4 py-4 font-mono">5,400 Xal</td>
                    <td className="px-4 py-4"><span className="inline-block px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase tracking-wider rounded">Qızıl Səviyyə</span></td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Referal Liderləri</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Müştəri (Referrer)</th>
                    <th className="px-4 py-3">Referal Kodu</th>
                    <th className="px-4 py-3">Cəlb Edilən (Signups)</th>
                    <th className="px-4 py-3">Qazanılan (Rewards)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="px-4 py-4 font-bold text-white">Rəşad Rüstəmov</td>
                    <td className="px-4 py-4 font-mono">REF-RASHAD-99</td>
                    <td className="px-4 py-4 font-mono">12</td>
                    <td className="px-4 py-4 font-mono text-green-400">120.00 ₼ (Store Credit)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Abunəçilər</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Abunə Tarixi</th>
                    <th className="px-4 py-3">Mənbə</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="px-4 py-4 font-medium text-white">newsreader@example.com</td>
                    <td className="px-4 py-4 font-mono text-xs">2023-10-20</td>
                    <td className="px-4 py-4 text-xs text-slate-400">Footer Form</td>
                    <td className="px-4 py-4"><span className="text-green-400 text-xs font-bold">Subscribed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
