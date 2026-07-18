"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, FileText, Download, Printer, Truck, CheckCircle, Clock, XCircle, AlertCircle, ShoppingBag, Send, MessagesSquare, Box, ArrowRightLeft, MapPin, Receipt, CreditCard } from 'lucide-react';

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  // Mock data for order details
  const [orderStatus, setOrderStatus] = useState('awaiting_payment');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [internalNote, setInternalNote] = useState('');
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-500" /> Sifariş: {orderId}
            </h2>
            <p className="text-sm text-slate-400 mt-1">24 Oktyabr 2023, 14:30 • Əli Həsənov tərəfindən yaradılıb</p>
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
        
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Controllers */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-lg font-black text-white mb-5 uppercase tracking-wider flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" /> Sifariş Statusu
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Çatdırılma / Ümumi Status</label>
                <select 
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none font-medium"
                >
                  <option value="awaiting_payment">Gözləyir (Ödəniş)</option>
                  <option value="processing">Hazırlanır (Paketlənmə)</option>
                  <option value="ready">Çatdırılmaya Hazırdır</option>
                  <option value="shipped">Kargoya Verilib / Yoldadır</option>
                  <option value="delivered">Çatdırılıb</option>
                  <option value="on_hold">Gözlədilir (Hold)</option>
                  <option value="cancelled">Ləğv Edilib</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ödəniş Statusu (Manual)</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none font-medium"
                >
                  <option value="unpaid">Ödənilməyib</option>
                  <option value="partial">Qismən Ödənilib</option>
                  <option value="paid">Tam Ödənilib (Təsdiqləndi)</option>
                  <option value="refunded">Geri Qaytarılıb (Refund)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-soft-md">
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-500" /> Sifariş Məhsulları
              </h3>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {[
                  { name: 'GAN 14 MagLev', sku: 'GAN14-ML', price: '109.00 ₼', qty: 1, total: '109.00 ₼' },
                  { name: 'MoYu RS3M V5', sku: 'MY-RS3M-BC', price: '15.50 ₼', qty: 1, total: '15.50 ₼' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                        <Box className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-1">SKU: {item.sku}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white font-bold">{item.total}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.qty} x {item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-sm text-slate-400 font-mono">
                  <span>Subtotal:</span>
                  <span>124.50 ₼</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 font-mono">
                  <span>Çatdırılma:</span>
                  <span>5.00 ₼</span>
                </div>
                <div className="flex justify-between text-lg font-black text-white font-mono mt-2 pt-2 border-t border-slate-800/50">
                  <span>Cəmi:</span>
                  <span className="text-amber-500">129.50 ₼</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Engine (Timeline) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Sifariş Tarixçəsi
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-800">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-900 bg-amber-500 text-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-soft-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-soft-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">Status Yeniləndi</h4>
                    <time className="font-mono text-xs text-slate-500">Bu gün 10:15</time>
                  </div>
                  <p className="text-sm text-slate-400">Ödəniş təsdiqləndi (Manual: WhatsApp qəbzi)</p>
                </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-soft-sm">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 shadow-soft-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">Sifariş Yaradıldı</h4>
                    <time className="font-mono text-xs text-slate-500">Dünən 14:30</time>
                  </div>
                  <p className="text-sm text-slate-400">Müştəri tərəfindən vebsaytdan yaradıldı.</p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
        
        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* Logistics Hub */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" /> Logistika (Kargo)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">İzləmə Nömrəsi (Tracking No)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Məs: AZ1002345"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-800">
                  <Box className="w-4 h-4" /> Parçalanmış Çatdırılma (Split)
                </button>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> Müştəri Məlumatları
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ad Soyad</div>
                <div className="text-sm text-white font-medium mt-0.5">Əli Həsənov</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Telefon / WhatsApp</div>
                <div className="text-sm text-blue-400 font-mono mt-0.5 underline cursor-pointer">+994 50 123 45 67</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Çatdırılma Ünvanı</div>
                <div className="text-sm text-slate-300 mt-0.5">Bakı ş., Nəsimi r-nu, Nizami küç. 100, Mənzil 42</div>
              </div>
            </div>
          </div>

          {/* Document Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-500" /> Sənədlər & Çap
            </h3>
            
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-sm text-slate-300 font-medium">
                <span className="flex items-center gap-2"><Receipt className="w-4 h-4" /> İnvoys (PDF)</span>
                <Download className="w-4 h-4 text-slate-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-sm text-slate-300 font-medium">
                <span className="flex items-center gap-2"><Box className="w-4 h-4" /> Qaimə (Packing Slip)</span>
                <Printer className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Financial Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" /> Maliyyə Əməliyyatları
            </h3>
            
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-colors border border-red-500/20">
                Geri Ödəniş (Refund)
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-sm font-bold rounded-xl transition-colors border border-slate-800">
                Qismən Geri Ödəniş
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <MessagesSquare className="w-4 h-4 text-amber-500" /> Daxili Qeydlər
            </h3>
            
            <div className="space-y-3">
              <textarea 
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Yalnız adminlər görə bilər..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
              ></textarea>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors border border-slate-700">
                <Send className="w-4 h-4" /> Qeyd Əlavə Et
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
