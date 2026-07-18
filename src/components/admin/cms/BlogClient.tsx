"use client";

import React, { useState } from 'react';
import { FileText, Plus, Search, Edit3, Trash2, Check, X, Image as ImageIcon, Eye } from 'lucide-react';

const MOCK_POSTS = [
  { id: '1', title: 'Rubik kubunu necə tez yığmaq olar?', category: 'Təlimat', author: 'Admin', status: 'published', date: '2023-10-20', views: 1250 },
  { id: '2', title: 'Yeni GAN 14 MagLev İcmalı', category: 'İcmal', author: 'Əli H.', status: 'published', date: '2023-10-15', views: 890 },
  { id: '3', title: '2023-cü ilin ən yaxşı büdcəli kubları', category: 'Siyahı', author: 'Admin', status: 'draft', date: '-', views: 0 },
];

export default function BlogClient() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" /> Blog İdarəetməsi
          </h2>
          <p className="text-sm text-slate-400 mt-1">Məqalələrin, kateqoriyaların və müəlliflərin idarəedilməsi.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Ləğv Et' : 'Yeni Məqalə'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Məqalə Yaradılması / Redaktə</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Başlıq</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" placeholder="Məqalə başlığı..." />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Məzmun (Rich Text)</label>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <div className="flex items-center gap-2 p-2 border-b border-slate-800 bg-slate-900">
                    <button className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 font-bold">B</button>
                    <button className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 italic">I</button>
                    <button className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 underline">U</button>
                    <div className="w-px h-4 bg-slate-700 mx-1"></div>
                    <button className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"><ImageIcon className="w-4 h-4" /></button>
                  </div>
                  <textarea 
                    rows={15}
                    className="w-full bg-transparent text-white p-4 focus:outline-none resize-none"
                    placeholder="Məqalənin məzmununu bura yazın..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ön Şəkil (Featured Image)</label>
                <div className="border-2 border-dashed border-slate-700 rounded-2xl h-40 flex flex-col items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-colors cursor-pointer bg-slate-950/50">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm font-bold">Şəkil Yüklə</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Kateqoriya</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 appearance-none font-medium">
                  <option value="tutorial">Təlimat (Tutorial)</option>
                  <option value="review">İcmal (Review)</option>
                  <option value="news">Xəbərlər (News)</option>
                  <option value="list">Siyahı (List)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Müəllif</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 appearance-none font-medium">
                  <option value="admin">Admin</option>
                  <option value="ali">Əli H.</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">SEO Açıqlama</label>
                <textarea 
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 resize-none text-sm"
                  placeholder="Meta description..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-800">
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
              Qaralama Kimi Saxla
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
              <Check className="w-5 h-5" /> Yaddaşda Saxla & Yayımla
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Məqalə axtar..." className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Başlıq</th>
                <th className="px-6 py-4">Kateqoriya</th>
                <th className="px-6 py-4">Müəllif</th>
                <th className="px-6 py-4">Tarix</th>
                <th className="px-6 py-4">Baxış</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_POSTS.map((post) => (
                <tr key={post.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{post.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded border border-slate-700">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{post.author}</td>
                  <td className="px-6 py-4 font-mono text-xs">{post.date}</td>
                  <td className="px-6 py-4 font-mono text-xs">{post.views.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {post.status === 'published' 
                      ? <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Yayımlanıb</span>
                      : <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">Qaralama</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Bax">
                        <Eye className="w-4 h-4" />
                      </button>
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
