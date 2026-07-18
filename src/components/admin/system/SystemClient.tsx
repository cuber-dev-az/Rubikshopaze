"use client";

import React, { useState } from 'react';
import { Activity, ShieldAlert, Key, Search, Server, Database, ShieldCheck } from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  { id: 1, user: 'Mirselim Sahbazov', action: 'Məhsul qiyməti dəyişdirildi', target: 'Moyu RS3M 2020', time: '10 dəqiqə əvvəl', type: 'update' },
  { id: 2, user: 'Tural Əliyev', action: 'Sifariş statusu yeniləndi', target: '#ORD-1029', time: '1 saat əvvəl', type: 'update' },
  { id: 3, user: 'Aygün Həsənova', action: 'Yeni kateqoriya yaradıldı', target: 'Aksesuarlar', time: 'Dünən', type: 'create' },
  { id: 4, user: 'Sistem', action: 'Gündəlik ehtiyat nüsxə (Backup) alındı', target: 'Database', time: 'Dünən 23:59', type: 'system' },
  { id: 5, user: 'Mirselim Sahbazov', action: 'İstifadəçi silindi', target: 'Kərim Kərimov', time: '3 gün əvvəl', type: 'delete' },
];

export default function SystemClient() {
  const [activeTab, setActiveTab] = useState<'audit' | 'health' | 'api'>('audit');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-500" /> Sistem və Audit
        </h2>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-800 pb-2">
        <button 
          onClick={() => setActiveTab('audit')}
          className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'audit' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}
        >
          Audit Loqları
        </button>
        <button 
          onClick={() => setActiveTab('health')}
          className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'health' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}
        >
          Sistem Vəziyyəti
        </button>
        <button 
          onClick={() => setActiveTab('api')}
          className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'api' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}
        >
          API İnteqrasiyalar
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
        
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Əməliyyat Tarixçəsi</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Loqlarda axtar..." 
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Zaman</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">İstifadəçi</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Əməliyyat</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Hədəf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {MOCK_AUDIT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4 text-xs text-slate-500 font-mono">{log.time}</td>
                      <td className="py-4 px-4 font-bold text-sm text-white">{log.user}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {log.type === 'update' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                          {log.type === 'create' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                          {log.type === 'delete' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                          {log.type === 'system' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                          <span className="text-sm text-slate-300">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-mono text-slate-400">{log.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Sistem Metrikləri (Simulyasiya)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Server className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-green-500 uppercase px-2 py-1 bg-green-500/10 rounded">Normal</span>
                </div>
                <div className="text-3xl font-black text-white font-mono mb-1">99.9%</div>
                <div className="text-sm text-slate-500 font-bold">Server Uptime</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-blue-500 uppercase px-2 py-1 bg-blue-500/10 rounded">Optimizə edilib</span>
                </div>
                <div className="text-3xl font-black text-white font-mono mb-1">12ms</div>
                <div className="text-sm text-slate-500 font-bold">Database Response</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-amber-500 uppercase px-2 py-1 bg-amber-500/10 rounded">Aktiv</span>
                </div>
                <div className="text-3xl font-black text-white font-mono mb-1">0</div>
                <div className="text-sm text-slate-500 font-bold">Təhlükəsizlik İnsidentləri</div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Xarici İnteqrasiyalar & Açarlar</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Supabase Anon Key</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">eyJh... (Gizli)</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-black uppercase tracking-wider rounded border border-green-500/20">Aktiv</span>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-slate-950 border border-slate-800 rounded-xl opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">Stripe API <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded uppercase">Quraşdırılmayıb</span></div>
                    <div className="text-xs text-slate-500 mt-0.5">Ödəniş qəbulu üçün tələb olunur.</div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">
                  Quraşdır
                </button>
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
