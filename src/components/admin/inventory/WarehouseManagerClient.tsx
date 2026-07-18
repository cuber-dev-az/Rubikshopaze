"use client";

import React, { useState } from 'react';
import { Building, MapPin, Truck, Shield, Bell, Plus, Edit3, Trash2 } from 'lucide-react';

const MOCK_WAREHOUSES = [
  { id: 'wh_1', name: 'Mərkəzi Anbar (Bakı)', address: 'Nərimanov r-nu, Əhməd Rəcəbli 22', isPickup: true, isDropShip: false, roles: ['Admin', 'Stok Meneceri'] },
  { id: 'wh_2', name: 'Sumqayıt Filialı', address: 'Sülh küçəsi 14', isPickup: true, isDropShip: false, roles: ['Admin', 'Filial Meneceri'] },
  { id: 'wh_3', name: 'Xarici Tədarükçü (Çin)', address: 'Shenzhen, CN', isPickup: false, isDropShip: true, roles: ['Admin'] },
];

export default function WarehouseManagerClient() {
  const [globalReorder, setGlobalReorder] = useState(10);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Global Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Qlobal Stok Alarmları
          </h3>
          <p className="text-sm text-slate-400 mt-1">Sistem üzrə standart reorder point (minimum stok səviyyəsi) konfiqurasiyası.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global Reorder Point</label>
          <input 
            type="number" 
            value={globalReorder}
            onChange={(e) => setGlobalReorder(Number(e.target.value))}
            className="w-24 bg-slate-950 border border-slate-800 text-white font-mono rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors text-center" 
          />
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-colors">
            Yadda Saxla
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-white">Anbarlar & Lokasiyalar</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20">
          <Plus className="w-4 h-4" /> Yeni Anbar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_WAREHOUSES.map(wh => (
          <div key={wh.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-xl text-amber-500">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-white text-lg">{wh.name}</h4>
                  <p className="text-sm text-slate-400 font-mono mt-0.5">{wh.address}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
              <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Pickup Point</div>
                    <div className="text-[9px] text-slate-500">Müştəri təhvil ala bilər</div>
                  </div>
                </div>
                <div className={`w-8 h-5 rounded-full p-1 transition-colors ${wh.isPickup ? 'bg-green-500' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${wh.isPickup ? 'translate-x-3' : 'translate-x-0'}`} />
                </div>
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Drop Ship</div>
                    <div className="text-[9px] text-slate-500">Birbaşa göndərilir</div>
                  </div>
                </div>
                <div className={`w-8 h-5 rounded-full p-1 transition-colors ${wh.isDropShip ? 'bg-purple-500' : 'bg-slate-700'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${wh.isDropShip ? 'translate-x-3' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>

            <div className="pt-2">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> İcazəli Rollar (Warehouse Roles)
              </h5>
              <div className="flex flex-wrap gap-2">
                {wh.roles.map((role, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700">
                    {role}
                  </span>
                ))}
                <button className="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Rol Əlavə Et
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
