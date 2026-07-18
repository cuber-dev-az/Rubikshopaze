"use client";

import React from 'react';
import { Bell, Save, MessageSquare } from 'lucide-react';

export default function NotificationSettingsClient() {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-500" /> Bildirişlər
        </h2>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Save className="w-4 h-4" /> Yadda Saxla
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-8">
        
        {/* Admin Notifications */}
        <div>
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider">Admin Bildirişləri</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white text-sm">Yeni Sifariş Email Bildirişi</div>
                <div className="text-xs text-slate-500 mt-0.5">Mağazaya yeni sifariş daxil olduqda email göndərilir.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white text-sm">Stok Xəbərdarlığı</div>
                <div className="text-xs text-slate-500 mt-0.5">Məhsulun sayı 5-dən aşağı düşdükdə bildiriş göndər.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

          </div>
        </div>

        {/* Customer SMS/WhatsApp Templates */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" /> Sifariş Statusu Şablonları
          </h3>
          <p className="text-sm text-slate-400 mb-6">Müştəriyə WhatsApp və ya Email vasitəsilə göndəriləcək avtomatik mesajlar.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Sifariş Qəbul Edildi</label>
              <textarea 
                rows={3} 
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 resize-none" 
                defaultValue="Salam {customer_name}! Sifarişiniz (# {order_number}) qəbul edildi. Tezliklə sizinlə əlaqə saxlayacağıq. Təşəkkürlər! - RubikShop"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Sifariş Göndərildi (Kuryerdə)</label>
              <textarea 
                rows={3} 
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 resize-none" 
                defaultValue="Salam {customer_name}. Sifarişiniz yola düşdü. Kuryer: {courier_phone}. Bizi seçdiyiniz üçün təşəkkürlər!"
              ></textarea>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
