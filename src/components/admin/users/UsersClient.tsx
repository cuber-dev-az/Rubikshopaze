"use client";

import React, { useState } from 'react';
import { Users, Plus, Search, MoreVertical, Edit, Trash2, Shield, User, ShieldCheck } from 'lucide-react';

const MOCK_USERS = [
  { id: 1, name: 'Mirselim Sahbazov', email: 'mirselimsahbazov2@gmail.com', role: 'Super Admin', status: 'Aktiv', lastLogin: '2 dəqiqə əvvəl' },
  { id: 2, name: 'Tural Əliyev', email: 'tural.ali@rubikshop.az', role: 'Admin', status: 'Aktiv', lastLogin: '1 saat əvvəl' },
  { id: 3, name: 'Aygün Həsənova', email: 'aygun.h@rubikshop.az', role: 'Menecer', status: 'Aktiv', lastLogin: 'Dünən' },
  { id: 4, name: 'Kərim Kərimov', email: 'kerim.k@rubikshop.az', role: 'Dəstək (Support)', status: 'Deaktiv', lastLogin: '5 gün əvvəl' },
];

export default function UsersClient() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> İstifadəçilər və Rollar
        </h2>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Plus className="w-4 h-4" /> Yeni İstifadəçi
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-6">
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ad və ya email ilə axtar..." 
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <select className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 appearance-none font-medium min-w-[150px]">
            <option value="">Bütün Rollar</option>
            <option value="admin">Admin</option>
            <option value="manager">Menecer</option>
            <option value="support">Dəstək (Support)</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">İstifadəçi</th>
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Rol</th>
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Son Giriş</th>
                <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {user.role === 'Super Admin' && <ShieldCheck className="w-4 h-4 text-amber-500" />}
                      {user.role === 'Admin' && <Shield className="w-4 h-4 text-blue-500" />}
                      {user.role !== 'Super Admin' && user.role !== 'Admin' && <User className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm font-bold text-slate-300">{user.role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      user.status === 'Aktiv' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400 font-medium">
                    {user.lastLogin}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors" title="Düzəliş et">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.role !== 'Super Admin' && (
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Sil">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
