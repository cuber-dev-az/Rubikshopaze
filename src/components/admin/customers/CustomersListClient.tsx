"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, MoreVertical, Users, Star, UserCheck, Briefcase, Mail, Phone, ChevronRight } from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Əli Həsənov', email: 'ali.hasanov@example.com', phone: '+994 50 123 45 67', type: 'B2C', segment: 'VIP', orders: 12, ltv: '1,245.00 ₼', registered: '2023-01-15' },
  { id: 'CUST-002', name: 'Nərmin Quliyeva', email: 'n.quliyeva@example.com', phone: '+994 55 987 65 43', type: 'B2C', segment: 'Regular', orders: 3, ltv: '185.50 ₼', registered: '2023-05-22' },
  { id: 'CUST-003', name: 'Rəşad Rüstəmov (TechStore MMC)', email: 'rashad@techstore.az', phone: '+994 70 555 44 33', type: 'B2B', segment: 'Wholesale', orders: 45, ltv: '15,400.00 ₼', registered: '2022-11-05' },
  { id: 'CUST-004', name: 'Aysel Məmmədova', email: 'aysel.m@example.com', phone: '+994 51 222 33 44', type: 'B2C', segment: 'New', orders: 1, ltv: '45.00 ₼', registered: '2023-10-20' },
  { id: 'CUST-005', name: 'Tural Abbasov', email: 'tural.a@example.com', phone: '+994 50 999 88 77', type: 'B2C', segment: 'Churn Risk', orders: 2, ltv: '65.00 ₼', registered: '2023-02-10' },
];

export default function CustomersListClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, B2C, B2B

  const filteredCustomers = MOCK_CUSTOMERS.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getSegmentBadge = (segment: string) => {
    switch(segment) {
      case 'VIP':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20"><Star className="w-3 h-3" /> VIP</span>;
      case 'Wholesale':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20"><Briefcase className="w-3 h-3" /> Wholesale</span>;
      case 'Regular':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Regular</span>;
      case 'New':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">New</span>;
      case 'Churn Risk':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">Risk</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400">{segment}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Müştərilər & CRM</h2>
          <p className="text-sm text-slate-400 mt-1">Müştəri bazası, seqmentasiya və əlaqə idarəetməsi.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ümumi Müştəri', value: '1,248', icon: Users, color: 'text-blue-400' },
          { label: 'Aktiv (Son 30 gün)', value: '842', icon: UserCheck, color: 'text-green-400' },
          { label: 'VIP Müştərilər', value: '156', icon: Star, color: 'text-amber-500' },
          { label: 'B2B / Topdansatış', value: '45', icon: Briefcase, color: 'text-purple-400' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-soft-md">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-slate-950 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/50">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'B2C', 'B2B'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  typeFilter === t 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {t === 'all' ? 'Bütün Tiplər' : t}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Ad, Email və ya Nömrə..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Müştəri / Əlaqə</th>
                <th className="px-6 py-4">Tip</th>
                <th className="px-6 py-4">Seqment</th>
                <th className="px-6 py-4">Sifarişlər</th>
                <th className="px-6 py-4">LTV (Lifetime Value)</th>
                <th className="px-6 py-4">Qeydiyyat</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white mb-1">{customer.name}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail className="w-3 h-3" /> {customer.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Phone className="w-3 h-3" /> {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      customer.type === 'B2B' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getSegmentBadge(customer.segment)}</td>
                  <td className="px-6 py-4 font-mono">{customer.orders}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white">{customer.ltv}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{customer.registered}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/customers/${customer.id}`} className="inline-flex p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">Müştəri tapılmadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
