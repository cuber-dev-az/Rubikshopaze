"use client";

import React from 'react';
import { CreditCard, Save, Smartphone } from 'lucide-react';

export default function PaymentSettingsClient() {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-amber-500" /> Ödəniş & Checkout
        </h2>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Save className="w-4 h-4" /> Yadda Saxla
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-8">
        
        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Aktiv Ödəniş Metodları</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-amber-500/50 rounded-xl">
              <div>
                <div className="font-bold text-white text-sm">Qapıda Ödəniş (Cash on Delivery)</div>
                <div className="text-xs text-slate-500 mt-0.5">Sifariş təhvil veriləndə nağd ödəniş</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-amber-500/50 rounded-xl">
              <div>
                <div className="font-bold text-white text-sm">Bank Köçürməsi (Card to Card)</div>
                <div className="text-xs text-slate-500 mt-0.5">Sifarişdən sonra WhatsApp vasitəsilə kart məlumatları göndərilir</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl opacity-60">
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">Onlayn Kartla Ödəniş <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded uppercase">Tezliklə</span></div>
                <div className="text-xs text-slate-500 mt-0.5">Stripe və ya yerli bank inteqrasiyası</div>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input type="checkbox" className="sr-only peer" disabled />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer"></div>
              </label>
            </div>

          </div>
        </div>

        {/* WhatsApp Integration */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-500" /> WhatsApp İnteqrasiyası
          </h3>
          <p className="text-sm text-slate-400 mb-6">Sifarişlərin manual idarəolunması və müştəri xidmətləri üçün nömrə.</p>
          
          <div className="max-w-md">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Aktiv WhatsApp Nömrəsi</label>
            <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-green-500" defaultValue="+994506684925" />
            <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Beynəlxalq formatda (Məs: +994501234567)</p>
          </div>
        </div>

      </div>
    </div>
  );
}
