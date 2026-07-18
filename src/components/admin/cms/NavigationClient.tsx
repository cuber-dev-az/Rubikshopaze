"use client";

import React, { useState } from 'react';
import { Menu, Plus, GripVertical, Trash2, Edit3, HelpCircle, Layout } from 'lucide-react';

const MOCK_MENU = [
  { id: '1', title: 'Kublar', link: '/collections/cubes', type: 'category', order: 1 },
  { id: '2', title: 'Aksesuarlar', link: '/collections/accessories', type: 'category', order: 2 },
  { id: '3', title: 'Haqqımızda', link: '/about-us', type: 'page', order: 3 },
  { id: '4', title: 'Əlaqə', link: '/contact', type: 'page', order: 4 },
];

const MOCK_FAQ = [
  { id: '1', question: 'Çatdırılma nə qədər vaxt aparır?', answer: 'Bakı daxili sifarişlər eyni gün və ya növbəti gün çatdırılır.', order: 1 },
  { id: '2', question: 'Məhsulu necə qaytara bilərəm?', answer: '14 gün ərzində qəbzlə birlikdə mağazamıza yaxınlaşaraq qaytara bilərsiniz.', order: 2 },
];

export default function NavigationClient() {
  const [activeTab, setActiveTab] = useState('menu'); // menu, faq

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-6 h-6 text-amber-500" /> Naviqasiya & FAQ
          </h2>
          <p className="text-sm text-slate-400 mt-1">Menyuların və Tez-tez Verilən Sualların (FAQ) idarəedilməsi.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'menu' 
              ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Menu className="w-4 h-4" /> Baş Menyu (Header)
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'faq' 
              ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> FAQ (Suallar)
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md min-h-[500px]">
        
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Menyu Linkləri</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all">
                <Plus className="w-3 h-3" /> Yeni Link
              </button>
            </div>
            
            <div className="space-y-3">
              {MOCK_MENU.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl group hover:border-slate-700 transition-colors">
                  <div className="cursor-grab text-slate-500 hover:text-white"><GripVertical className="w-5 h-5" /></div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Ad</span>
                      <span className="font-bold text-white text-sm">{item.title}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Keçid (Link)</span>
                      <span className="font-mono text-slate-400 text-sm">{item.link}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Tip</span>
                      <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded border border-slate-700">
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Tez-tez Verilən Suallar</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all">
                <Plus className="w-3 h-3" /> Yeni Sual
              </button>
            </div>
            
            <div className="space-y-3">
              {MOCK_FAQ.map((faq) => (
                <div key={faq.id} className="flex gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl group hover:border-slate-700 transition-colors items-start">
                  <div className="cursor-grab text-slate-500 hover:text-white mt-1"><GripVertical className="w-5 h-5" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="font-bold text-white">{faq.question}</div>
                    <div className="text-sm text-slate-400 leading-relaxed">{faq.answer}</div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
