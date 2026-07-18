"use client";

import React from 'react';
import { Truck, Save, Plus, Edit3, Trash2 } from 'lucide-react';

export default function ShippingSettingsClient() {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-6 h-6 text-amber-500" /> Çatdırılma & Vergi
        </h2>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Save className="w-4 h-4" /> Yadda Saxla
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-8">
        
        {/* Delivery Methods */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Çatdırılma Metodları</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors border border-slate-700">
              <Plus className="w-3 h-3" /> Yeni Metod
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 1, name: 'Metroya Çatdırılma', price: 2.00, time: '1-2 iş günü' },
              { id: 2, name: 'Ünvana Çatdırılma (Kuryer)', price: 5.00, time: '1-2 iş günü' },
              { id: 3, name: 'Poçtla Çatdırılma (Rayonlar)', price: 3.50, time: '3-5 iş günü' },
              { id: 4, name: 'Mağazadan Götürmə', price: 0.00, time: 'Eyni gün' },
            ].map(method => (
              <div key={method.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{method.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Müddət: {method.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="font-mono font-bold text-amber-500">{method.price.toFixed(2)} ₼</div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Taxes */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Vergi Tənzimləmələri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white text-sm">Qiymətlərə vergi daxildir</div>
                <div className="text-xs text-slate-500 mt-0.5">Məhsul qiymətlərində ƏDV hesablanıb</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Standart Vergi Dərəcəsi (%)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" defaultValue="18" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
