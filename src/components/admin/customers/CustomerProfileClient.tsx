"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, MapPin, ShoppingBag, Heart, Star, Briefcase, Mail, Phone, Calendar, Clock, CreditCard, UserCheck, ShieldAlert, FileText, Plus } from 'lucide-react';

export default function CustomerProfileClient({ customerId }: { customerId: string }) {
  const [activeTab, setActiveTab] = useState('orders'); // orders, wishlist, addresses
  const [customerType, setCustomerType] = useState('B2C');
  const [customerSegment, setCustomerSegment] = useState('VIP');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-amber-500" /> Müştəri Profili
            </h2>
            <p className="text-sm text-slate-400 mt-1">ID: {customerId} • Qeydiyyat: 15 Yanvar 2023</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors border border-slate-700">
            <Edit className="w-4 h-4" /> Düzəliş Et
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
            <Save className="w-4 h-4" /> Dəyişiklikləri Saxla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Sidebar - Profile & CRM */}
        <div className="space-y-6">
          
          {/* Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
                ƏH
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Əli Həsənov</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                    Aktiv
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <a href="mailto:ali.hasanov@example.com" className="text-sm text-white hover:text-amber-500 transition-colors">ali.hasanov@example.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-500" />
                <a href="tel:+994501234567" className="text-sm text-white hover:text-amber-500 transition-colors font-mono">+994 50 123 45 67</a>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-300 font-mono">15 Yan 2023 (10 ay)</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Lifetime Value (LTV)</div>
                <div className="text-xl font-black text-amber-500 font-mono">1,245.00 ₼</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Sifarişlər</div>
                <div className="text-lg font-bold text-white font-mono">12</div>
              </div>
            </div>
          </div>

          {/* CRM Tools */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-sm font-black text-white mb-5 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" /> CRM Tənzimləmələri
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Müştəri Tipi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setCustomerType('B2C')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      customerType === 'B2C' 
                        ? 'bg-amber-500 text-slate-950 shadow-soft-sm' 
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    B2C (Pərakəndə)
                  </button>
                  <button 
                    onClick={() => setCustomerType('B2B')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-1 ${
                      customerType === 'B2B' 
                        ? 'bg-purple-500 text-white shadow-soft-sm' 
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    B2B <Briefcase className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Seqment / Qrup</label>
                <select 
                  value={customerSegment}
                  onChange={(e) => setCustomerSegment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none font-medium"
                >
                  <option value="New">Yeni (New)</option>
                  <option value="Regular">Daimi (Regular)</option>
                  <option value="VIP">VIP</option>
                  <option value="Wholesale">Topdansatış (Wholesale)</option>
                  <option value="Churn Risk">Risk (Churn Risk)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Teqlər (Tags)</label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700">Yüksək büdcəli</span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700">Tez qərar verən</span>
                  <button className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-500 text-xs font-bold rounded-lg border border-slate-800 border-dashed transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Əlavə et
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" /> Daxili Qeydlər
            </h3>
            <textarea 
              rows={4}
              placeholder="Yalnız adminlər görə bilər..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
              defaultValue="VIP müştəridir. Çatdırılmada xüsusi diqqət tələb edir. Keçən dəfə gecikməyə görə 10% endirim verilib."
            ></textarea>
          </div>

        </div>

        {/* Right Column - Data & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar bg-slate-900 p-2 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'orders' 
                  ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Sifariş Tarixçəsi
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'wishlist' 
                  ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Heart className="w-4 h-4" /> İstək Siyahısı (Wishlist)
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'addresses' 
                  ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4" /> Ünvanlar
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md min-h-[500px]">
            
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Sifariş Tarixçəsi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs uppercase font-black text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Sifariş Nö.</th>
                        <th className="px-4 py-3">Tarix</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Məbləğ</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      <tr>
                        <td className="px-4 py-4 font-bold text-white"><Link href="/admin/orders/ORD-2023-1042" className="hover:text-amber-500">ORD-2023-1042</Link></td>
                        <td className="px-4 py-4 font-mono text-xs">2023-10-24 14:30</td>
                        <td className="px-4 py-4"><span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Ödəniş Gözləyir</span></td>
                        <td className="px-4 py-4 font-mono font-bold text-white">124.50 ₼</td>
                        <td className="px-4 py-4 text-right">
                          <Link href="/admin/orders/ORD-2023-1042" className="text-slate-400 hover:text-white text-xs font-bold transition-colors">Bax</Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4 font-bold text-white"><Link href="/admin/orders/ORD-2023-0850" className="hover:text-amber-500">ORD-2023-0850</Link></td>
                        <td className="px-4 py-4 font-mono text-xs">2023-09-12 11:15</td>
                        <td className="px-4 py-4"><span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">Çatdırılıb</span></td>
                        <td className="px-4 py-4 font-mono font-bold text-white">89.00 ₼</td>
                        <td className="px-4 py-4 text-right">
                          <Link href="/admin/orders/ORD-2023-0850" className="text-slate-400 hover:text-white text-xs font-bold transition-colors">Bax</Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">İstək Siyahısı (Bəyənilənlər)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">Img</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">GAN 14 MagLev</h4>
                      <div className="text-amber-500 font-bold font-mono text-sm mt-1">109.00 ₼</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">Img</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">MoYu RS3M V5</h4>
                      <div className="text-amber-500 font-bold font-mono text-sm mt-1">15.50 ₼</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Yadda Saxlanılan Ünvanlar</h3>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors">
                    <Plus className="w-3 h-3" /> Yeni Ünvan
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/50 border border-amber-500/50 rounded-2xl relative">
                    <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Əsas</span>
                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> Ev Ünvanı
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Bakı şəhəri, Nəsimi rayonu,<br />
                      Nizami küçəsi 100, Mənzil 42<br />
                      AZ1000
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button className="text-xs text-slate-400 hover:text-white font-bold transition-colors">Düzəliş et</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
