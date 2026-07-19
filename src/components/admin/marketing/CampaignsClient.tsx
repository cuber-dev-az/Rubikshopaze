"use client";

import React, { useState } from 'react';
import { Plus, Zap, Calendar, Play, Square, Trash2 } from 'lucide-react';

const MOCK_CAMPAIGNS = [
  { id: '1', title: 'Black Friday 2023', type: 'flash_sale', discount: '20% off all GAN', start: '2023-11-24', end: '2023-11-27', status: 'scheduled' },
  { id: '2', title: 'Yay Endirimi', type: 'auto_discount', discount: '10% off entire order', start: '2023-06-01', end: '2023-08-31', status: 'ended' },
  { id: '3', title: 'Həftəsonu Lube Aksiyası', type: 'flash_sale', discount: 'Buy 2 Get 1 Free (Lubes)', start: '2023-10-28', end: '2023-10-29', status: 'active' },
];

export default function CampaignsClient() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" /> Kampaniyalar & Flash Satışlar
          </h2>
          <p className="text-sm text-slate-400 mt-1">Avtomatik endirimlər və xüsusi tədbirlərin idarəedilməsi.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Plus className="w-4 h-4" /> Yeni Kampaniya
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Kampaniya Adı</th>
                <th className="px-6 py-4">Tip</th>
                <th className="px-6 py-4">Endirim Şərti</th>
                <th className="px-6 py-4">Müddət</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_CAMPAIGNS.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">{camp.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded border border-slate-700">
                      {camp.type === 'flash_sale' ? 'Flash Sale' : 'Avto. Endirim'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{camp.discount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                      <Calendar className="w-3 h-3" /> {camp.start} / {camp.end}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {camp.status === 'active' && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Aktiv</span>}
                    {camp.status === 'scheduled' && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Planlanıb</span>}
                    {camp.status === 'ended' && <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700">Bitib</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {camp.status === 'active' ? (
                        <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Dayandır">
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors" title="Başlat">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
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
