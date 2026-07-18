"use client";

import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, Search, Download } from 'lucide-react';

const MOCK_INVENTORY = [
  { id: 'inv_1', sku: 'GAN14-ML', name: 'GAN 14 MagLev', warehouse: 'Mərkəzi Anbar (Bakı)', qty: 24, minQty: 10, status: 'ok' },
  { id: 'inv_2', sku: 'MY-RS3M-BC', name: 'MoYu RS3M V5', warehouse: 'Mərkəzi Anbar (Bakı)', qty: 3, minQty: 15, status: 'low' },
  { id: 'inv_3', sku: 'XMT-V3-PIO', name: 'Tornado V3', warehouse: 'Sumqayıt Filialı', qty: 0, minQty: 5, status: 'out' },
  { id: 'inv_4', sku: 'GAN-LUB-10', name: 'GAN Lube 10ml', warehouse: 'Mərkəzi Anbar (Bakı)', qty: 150, minQty: 20, status: 'ok' },
];

export default function InventoryDashboardClient() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_INVENTORY.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-amber-500 font-black text-sm uppercase tracking-wider mb-1">Low Stock Alert (Azalan Stok)</h3>
            <p className="text-slate-300 text-sm">1 məhsul minimum stok limitinin (Reorder point) altına düşüb.</p>
          </div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-500 font-black text-sm uppercase tracking-wider mb-1">Out of Stock Alert (Bitmiş Stok)</h3>
            <p className="text-slate-300 text-sm">1 məhsul tamamilə tükənib. Təcili tədarük tələb olunur.</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/50">
          <h3 className="text-white font-black uppercase tracking-wider text-sm">Cari Stok Vəziyyəti</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="SKU və ya Ad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-colors border border-slate-700">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Məhsul / SKU</th>
                <th className="px-6 py-4">Lokasiya (Anbar)</th>
                <th className="px-6 py-4">Min. Stok</th>
                <th className="px-6 py-4">Mövcud Stok</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="font-mono text-xs text-slate-500 mt-1">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4">{item.warehouse}</td>
                  <td className="px-6 py-4">{item.minQty} ədəd</td>
                  <td className="px-6 py-4 font-bold text-white font-mono">{item.qty} ədəd</td>
                  <td className="px-6 py-4">
                    {item.status === 'ok' && <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Kafi</span>}
                    {item.status === 'low' && <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Azalır</span>}
                    {item.status === 'out' && <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">Bitib</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Məlumat tapılmadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
