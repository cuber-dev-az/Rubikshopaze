'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, Trash2, CheckCircle2, Search, Filter, ShieldCheck, RefreshCw } from 'lucide-react';

interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export default function AdminReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      productName: 'Moyu RS3M 2020 3x3 Magnetic Cube',
      customerName: 'Əli Məmmədov',
      rating: 5,
      comment: 'Əla sürət kubudur! Çox rahat fırlanır və maqnitləri tam balanslıdır. Bakı metrosuna çatdırılma çox sürətli oldu.',
      date: '2026-07-28',
      status: 'Approved'
    },
    {
      id: 'rev-2',
      productName: 'GAN 12 MagLev 3x3 Matte',
      customerName: 'Kamran Əliyev',
      rating: 5,
      comment: 'Premial kub! Səsi çox sakindir, buğda kimi fırlanır. Qiyməti RubikShop-da ən münasib idi.',
      date: '2026-07-25',
      status: 'Approved'
    },
    {
      id: 'rev-3',
      productName: 'QiYi Warrior S 3x3',
      customerName: 'Rauf Qasımov',
      rating: 4,
      comment: 'Yeni başlayanlar üçün ən yaxşı seçimdir. Plastiki keyfiyyətlidir.',
      date: '2026-07-22',
      status: 'Pending'
    }
  ]);

  const toggleStatus = (id: string, newStatus: 'Approved' | 'Pending' | 'Rejected') => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r => {
    const matchesSearch = r.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-black text-amber-500 uppercase tracking-widest mb-2">
            <Star className="w-3.5 h-3.5" /> Məhsul Rəyləri & Reytinqlər
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">Rəylərin İdarə Edilməsi</h1>
          <p className="text-slate-400 text-xs mt-1">Müştərilərin məhsullar haqqında yazdığı rəyləri təsdiqləyin, redaktə edin və ya moderatorluq edin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {}} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" /> Yenilə
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ümumi Rəylər</span>
          <span className="text-2xl font-black text-white mt-1 block">{reviews.length}</span>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Təsdiqlənənlər</span>
          <span className="text-2xl font-black text-green-400 mt-1 block">{reviews.filter(r => r.status === 'Approved').length}</span>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gözləyənlər</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{reviews.filter(r => r.status === 'Pending').length}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Məhsul və ya müştəri axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">Bütün Statuslar</option>
            <option value="Approved">Təsdiqlənənlər</option>
            <option value="Pending">Gözləyənlər</option>
            <option value="Rejected">Rədd edilənlər</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider">
                <th className="p-4">Məhsul</th>
                <th className="p-4">Müştəri</th>
                <th className="p-4">Reytinq</th>
                <th className="p-4">Rəy</th>
                <th className="p-4">Tarix</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white max-w-[200px] truncate">{rev.productName}</td>
                  <td className="p-4 text-slate-300 font-medium">{rev.customerName}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 max-w-[300px]">{rev.comment}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{rev.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      rev.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      rev.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {rev.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {rev.status !== 'Approved' && (
                      <button 
                        onClick={() => toggleStatus(rev.id, 'Approved')}
                        className="px-2 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Təsdiqlə
                      </button>
                    )}
                    <button 
                      onClick={() => deleteReview(rev.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
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
