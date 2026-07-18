'use client';

import * as React from 'react';
import { Search, Clock, Wrench, PackageCheck, AlertTriangle } from 'lucide-react';

interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  servicesSelected: string[];
  status: 'pending_setup' | 'tuning_in_progress' | 'ready_for_shipping';
  date: string;
  notes?: string;
}

const MOCK_ORDERS: ServiceOrder[] = [
  {
    id: 'so-1',
    orderNumber: '#ORD-9021',
    customerName: 'Mirsəlim Şahbazov',
    productName: 'GAN 14 MagLev UV',
    servicesSelected: ['Premium Lube Setup', 'Custom Tensioning (Soft)'],
    status: 'pending_setup',
    date: '2026-07-11 14:30',
    notes: 'Sürətli və səssiz istəyir. Tension: 3, Center travel: 2.',
  },
  {
    id: 'so-2',
    orderNumber: '#ORD-9018',
    customerName: 'Tariyel Ağayev',
    productName: 'MoYu WeiLong WRM V9',
    servicesSelected: ['Core Lubing & Spring Noise Fix'],
    status: 'tuning_in_progress',
    date: '2026-07-11 11:15',
  },
  {
    id: 'so-3',
    orderNumber: '#ORD-8995',
    customerName: 'Aylin Məmmədova',
    productName: 'X-Man Tornado V3 Pioneer',
    servicesSelected: ['Premium Lube Setup'],
    status: 'ready_for_shipping',
    date: '2026-07-10 18:45',
  }
];

export default function ServiceOrdersClient() {
  const [orders, setOrders] = React.useState<ServiceOrder[]>(MOCK_ORDERS);

  const getStatusBadge = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'pending_setup':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            Setup Gözləyir
          </span>
        );
      case 'tuning_in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Wrench className="h-3.5 w-3.5" />
            Tuning Edilir
          </span>
        );
      case 'ready_for_shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PackageCheck className="h-3.5 w-3.5" />
            Çatdırılmaya Hazır
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-amber-500" />
            Gözləyən Setup Sifarişləri
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Sifariş no, müştəri..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-64 transition-all focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <th className="p-4 whitespace-nowrap">Sifariş</th>
                <th className="p-4">Müştəri / Məhsul</th>
                <th className="p-4">Tələb Olunan Xidmətlər</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{order.orderNumber}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {order.date}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200">{order.customerName}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{order.productName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      {order.servicesSelected.map((srv, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-amber-400 border border-amber-500/20 w-fit">
                          + {srv}
                        </span>
                      ))}
                      {order.notes && (
                        <div className="mt-1 text-xs text-slate-400 bg-slate-950 p-2 rounded-md border border-slate-800 border-l-2 border-l-amber-500">
                          <span className="font-bold text-slate-300 block mb-0.5">Qeyd:</span>
                          {order.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={order.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as ServiceOrder['status'];
                        setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                      }}
                      className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="pending_setup">Setup Gözləyir</option>
                      <option value="tuning_in_progress">Tuning Edilir</option>
                      <option value="ready_for_shipping">Çatdırılmaya Hazır</option>
                    </select>
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
