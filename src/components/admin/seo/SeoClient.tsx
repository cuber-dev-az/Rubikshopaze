"use client";

import React from 'react';
import { Search, Save, Image as ImageIcon, Link2 } from 'lucide-react';

export default function SeoClient() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Search className="w-6 h-6 text-amber-500" /> Qlobal SEO Meneceri
        </h2>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Save className="w-4 h-4" /> Yadda Saxla
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-8">
        
        {/* Global Meta Tags */}
        <div>
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Qlobal Meta Teqlər</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Əsas Səhifə Başlığı (Title)</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                defaultValue="RubikShop.az - Ən yaxşı rubik kubları və puzzle oyuncaqlar" 
              />
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Tövsiyə edilən uzunluq: 50-60 simvol</p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Qlobal Meta Açıqlama (Description)</label>
              <textarea 
                rows={3} 
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 resize-none" 
                defaultValue="RubikShop.az Azərbaycanda ən böyük zəka oyuncaqları və rubik kubları mağazasıdır. Orijinal məhsullar və sürətli çatdırılma."
              ></textarea>
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Tövsiyə edilən uzunluq: 150-160 simvol</p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Açar Sözlər (Keywords)</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                defaultValue="rubik kub, puzzle, zəka oyuncaqları, moyu, gan, bakı" 
              />
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Vergüllə ayırın</p>
            </div>
          </div>
        </div>

        {/* Social Sharing (OpenGraph) */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Link2 className="w-5 h-5 text-amber-500" /> Sosial Şəbəkə Paylaşımı (OpenGraph)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">OG:Title</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                  defaultValue="RubikShop.az - Zəka Oyuncaqları Mərkəzi" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">OG:Description</label>
                <textarea 
                  rows={2} 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 resize-none" 
                  defaultValue="Ən yeni və keyfiyyətli zəka oyuncaqlarını bizdən kəşf edin."
                ></textarea>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">OG:Image (Defolt Şəkil)</label>
              <div className="border-2 border-dashed border-slate-700 rounded-2xl h-32 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-colors cursor-pointer bg-slate-950/50">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">OG Şəkil Yüklə</span>
                <span className="text-[10px] mt-1 font-mono uppercase tracking-wider">Tövsiyə edilən: 1200x630px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical SEO */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Texniki SEO</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">Sitemap.xml Avtomatik Yaradılma</div>
                <div className="text-xs text-slate-500 mt-0.5">Məhsul və kateqoriya dəyişdikdə sitemap avtomatik güncəllənir</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white text-sm">Robots.txt İdarəetməsi</div>
                <div className="text-xs text-slate-500 mt-0.5">Axtarış motorları üçün icazələri tənzimləyir</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
