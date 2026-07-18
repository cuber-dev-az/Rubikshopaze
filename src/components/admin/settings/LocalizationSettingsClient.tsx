"use client";

import React from 'react';
import { Globe, Save, Check } from 'lucide-react';

export default function LocalizationSettingsClient() {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-6 h-6 text-amber-500" /> Dil və Valyuta
        </h2>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Save className="w-4 h-4" /> Yadda Saxla
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-8">
        
        {/* Languages */}
        <div>
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Dəstəklənən Dillər</h3>
          <div className="space-y-3">
            {[
              { code: 'az', name: 'Azərbaycan', active: true, default: true },
              { code: 'en', name: 'İngilis (English)', active: true, default: false },
              { code: 'ru', name: 'Rus (Русский)', active: true, default: false },
              { code: 'tr', name: 'Türk (Türkçe)', active: false, default: false },
            ].map(lang => (
              <div key={lang.code} className={`flex items-center justify-between p-4 rounded-xl border ${lang.active ? 'bg-slate-950 border-slate-700' : 'bg-slate-950/50 border-slate-800 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${lang.active ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-600'}`}>
                    {lang.active && <Check className="w-3 h-3 font-bold" />}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{lang.name}</span>
                    <span className="ml-2 text-xs font-mono text-slate-500 uppercase tracking-wider">({lang.code})</span>
                  </div>
                </div>
                {lang.default ? (
                  <span className="inline-block px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider rounded border border-amber-500/20">
                    Əsas Dil
                  </span>
                ) : (
                  lang.active && <button className="text-xs text-slate-400 hover:text-white font-bold transition-colors">Əsas Et</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Əsas Valyuta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mağaza Valyutası</label>
              <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 appearance-none font-medium">
                <option value="AZN">AZN (₼) - Azərbaycan Manatı</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Valyuta Formatı</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" defaultValue="{{amount}} ₼" />
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Nümunə: 15.00 ₼</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
