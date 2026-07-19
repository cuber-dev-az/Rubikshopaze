"use client";

import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Edit3, Trash2, Check, X, MoveUp, MoveDown, LayoutTemplate } from 'lucide-react';

const MOCK_BANNERS = [
  { id: '1', title: 'Black Friday Hero', location: 'homepage_hero', link: '/collections/black-friday', status: 'active', order: 1 },
  { id: '2', title: 'Yeni GAN 14', location: 'homepage_hero', link: '/products/gan-14', status: 'active', order: 2 },
  { id: '3', title: 'Pulsuz Çatdırılma Promo', location: 'promo_bar', link: '/shipping', status: 'active', order: 1 },
];

export default function BannersClient() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-amber-500" /> Bannerlər & Slayderlər
          </h2>
          <p className="text-sm text-slate-400 mt-1">Ana səhifə hero bölməsi və promo bannerlərin idarəedilməsi.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Ləğv Et' : 'Yeni Banner'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Banner Yaradılması</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Başlıq (Daxili adlandırma)</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" placeholder="Məs: Black Friday Hero" />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Yerləşmə (Location)</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 appearance-none font-medium">
                  <option value="homepage_hero">Ana Səhifə (Hero Slider)</option>
                  <option value="promo_bar">Üst Promo Bar</option>
                  <option value="category_banner">Kateqoriya Banneri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Keçid Linki (URL)</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 text-slate-400 font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" placeholder="/collections/sale" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Başlama Tarixi</label>
                  <input type="date" className="w-full bg-slate-950 border border-slate-800 text-slate-400 font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Bitmə Tarixi</label>
                  <input type="date" className="w-full bg-slate-950 border border-slate-800 text-slate-400 font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Desktop Şəkli (1920x800)</label>
                <div className="border-2 border-dashed border-slate-700 rounded-2xl h-32 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-colors cursor-pointer bg-slate-950/50">
                  <ImageIcon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Şəkil Yüklə</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Mobil Şəkli (1080x1080) - Opsional</label>
                <div className="border-2 border-dashed border-slate-700 rounded-2xl h-32 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-colors cursor-pointer bg-slate-950/50">
                  <ImageIcon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Mobil Üçün Şəkil Yüklə</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-800">
            <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
              <Check className="w-5 h-5" /> Yaddaşda Saxla
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Şəkil</th>
                <th className="px-6 py-4">Başlıq</th>
                <th className="px-6 py-4">Yerləşmə</th>
                <th className="px-6 py-4">Sıra</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_BANNERS.map((banner, index) => (
                <tr key={banner.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-16 h-10 bg-slate-800 rounded flex items-center justify-center text-slate-500 border border-slate-700">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{banner.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded border border-slate-700">
                      {banner.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white bg-slate-950 border border-slate-800 w-8 h-8 flex items-center justify-center rounded-lg">{banner.order}</span>
                      <div className="flex flex-col">
                        <button className="text-slate-500 hover:text-white" disabled={index === 0}><MoveUp className="w-3 h-3" /></button>
                        <button className="text-slate-500 hover:text-white" disabled={index === MOCK_BANNERS.length - 1}><MoveDown className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {banner.status === 'active' 
                      ? <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Aktiv</span>
                      : <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">Passiv</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Redaktə">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Sil">
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
