"use client";

import React from 'react';
import { Settings, Save, Image as ImageIcon } from 'lucide-react';

export default function GeneralSettingsClient() {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" /> Ümumi Tənzimləmələr
        </h2>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Save className="w-4 h-4" /> Yadda Saxla
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Mağaza Məlumatları</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mağaza Adı</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" defaultValue="RubikShop.az" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Əlaqə Email</label>
              <input type="email" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" defaultValue="info@rubikshop.az" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Əlaqə Nömrəsi</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" defaultValue="+994 50 668 49 25" />
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ünvan</label>
              <textarea rows={3} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 resize-none" defaultValue="Bakı şəhəri..."></textarea>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mağaza Loqosu</label>
              <div className="border-2 border-dashed border-slate-700 rounded-2xl h-40 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-colors cursor-pointer bg-slate-950/50">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">Loqo Yüklə (PNG, SVG)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Favicon</label>
              <div className="border-2 border-dashed border-slate-700 rounded-2xl h-24 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-colors cursor-pointer bg-slate-950/50 w-32">
                <ImageIcon className="w-5 h-5 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider">32x32 ICO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
