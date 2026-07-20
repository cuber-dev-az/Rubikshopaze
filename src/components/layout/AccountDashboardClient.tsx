'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Award,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check,
  Percent,
  TrendingUp,
  Share2,
  Copy,
  Plus,
  Compass,
  AlertCircle,
  Truck,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { OrderTracker } from '@/components/account/OrderTracker';
import { Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { ApplicationDictionary } from '@/types/application.types';
import { supabase } from '@/lib/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

interface AccountDashboardClientProps {
  locale: string;
  dict: ApplicationDictionary;
  initialProfile: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    address: string;
  };
}

import { signOut } from '@/lib/actions/auth';

export function AccountDashboardClient({ locale, dict, initialProfile }: AccountDashboardClientProps) {
  const { user, loading } = useAuthUser();

  // Navigation tabs state
  const [activeTab, setActiveTab] = React.useState<'overview' | 'profile' | 'orders' | 'wishlist' | 'loyalty' | 'settings'>('overview');

  // Customer Personal states
  const [fullName, setFullName] = React.useState(initialProfile?.fullName || '');
  const [phone, setPhone] = React.useState(initialProfile?.phone || '');
  const [email, setEmail] = React.useState(initialProfile?.email || '');

  React.useEffect(() => {
    if (user) {
      if (!fullName && user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }
      if (!email && user.email) {
        setEmail(user.email);
      }
    }
  }, [user, fullName, email]);

  const [instagram, setInstagram] = React.useState('mirselim.sh');
  const [selectedAddressIndex, setSelectedAddressIndex] = React.useState(0);
  const [addresses, setAddresses] = React.useState<{ id: string; label: string; address: string; city: string }[]>([]);
  const [newAddressInput, setNewAddressInput] = React.useState('');
  const [newAddressLabel, setNewAddressLabel] = React.useState('Ev');

  // Address deletion states
  const [addressToDelete, setAddressToDelete] = React.useState<string | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = React.useState(false);

  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete || !user) return;
    setIsDeletingAddress(true);
    await new Promise(resolve => setTimeout(resolve, 350));
    const updated = addresses.filter(a => a.id !== addressToDelete);
    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    setAddressToDelete(null);
    setIsDeletingAddress(false);
  };

  // Profile / Address state updates
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = React.useState(false);

  // Loyalty states
  const [points, setPoints] = React.useState(350);
  const [referralCode] = React.useState('RUBIK-MIRS-2026');
  const [copiedReferral, setCopiedReferral] = React.useState(false);

  // Tickets support states
  const [ticketSubject, setTicketSubject] = React.useState('');
  const [ticketMessage, setTicketMessage] = React.useState('');
  const [ticketPriority, setTicketPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [ticketSubmitSuccess, setTicketSubmitSuccess] = React.useState(false);
  const [tickets, setTickets] = React.useState<any[]>([]);

  // Wishlist / compare simulation
  const [wishlist, setWishlist] = React.useState([
    {
      id: 'gan-14-maglev',
      title: 'GAN 14 MagLev Magnetic flagship 3x3',
      price_azn: 130.00,
      image_url: 'https://picsum.photos/seed/gan14/200/200',
      brand: 'GAN'
    },
    {
      id: 'moyu-rs3m-v5',
      title: 'MoYu RS3M V5 Ball-Core UV 3x3',
      price_azn: 45.00,
      image_url: 'https://picsum.photos/seed/moyu5/200/200',
      brand: 'MoYu'
    }
  ]);

  // Order List
  const [orders, setOrders] = React.useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);

  // Loading states
  const [loadingOrders, setLoadingOrders] = React.useState(true);
  const [loadingTickets, setLoadingTickets] = React.useState(true);
  const [loadingAddresses, setLoadingAddresses] = React.useState(true);

  // Fetch real-time data from Supabase tables
  React.useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      // 1. Fetch Orders from 'orders' table
      try {
        setLoadingOrders(true);
        const userEmail = user.email || email;
        const userPhone = user.user_metadata?.phone || phone;
        
        let query = supabase
          .from('orders')
          .select('*, order_items(*, variants(*, products(*)))')
          .order('created_at', { ascending: false });

        if (userEmail && userPhone) {
          query = query.or(`email.eq.${userEmail},phone.eq.${userPhone}`);
        } else if (userEmail) {
          query = query.eq('email', userEmail);
        } else if (userPhone) {
          query = query.eq('phone', userPhone);
        }

        const { data: ordersData, error: ordersErr } = await query;

        if (ordersErr) {
          console.error('Error fetching orders:', ordersErr);
        } else if (ordersData) {
          const mappedOrders = ordersData.map((order: any) => {
            const shippingAddressStr = order.shipping_address || '';
            const hasInstagram = shippingAddressStr.includes(' | Instagram: @');
            const deliveryAddress = hasInstagram 
              ? shippingAddressStr.split(' | Instagram: @')[0] 
              : shippingAddressStr;
            const customerInstagram = hasInstagram 
              ? shippingAddressStr.split(' | Instagram: @')[1] 
              : 'Yoxdur';

            return {
              id: order.id,
              customer_name: order.full_name,
              customer_phone: order.phone,
              customer_instagram: customerInstagram,
              delivery_address: deliveryAddress,
              delivery_method: deliveryAddress.includes('Metrosu') ? 'Metro' : 'Courier',
              total_amount_azn: Number(order.total),
              checkout_platform: 'whatsapp',
              status: order.shipping_status || 'pending',
              created_at: new Date(order.created_at).toLocaleDateString('az-AZ'),
              items: order.order_items?.map((item: any) => ({
                id: item.id,
                product_title: item.variants?.products?.title_az || 'Məhsul',
                quantity: item.quantity,
                unit_price_azn: Number(item.price_azn),
                subtotal_azn: Number(item.total_azn),
                image_url: item.variants?.products?.image_url || 'https://picsum.photos/seed/boxart/200/200'
              })) || []
            };
          });
          setOrders(mappedOrders);
          if (mappedOrders.length > 0) {
            setSelectedOrder(mappedOrders[0]);
          }
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
      } finally {
        setLoadingOrders(false);
      }

      // 2. Fetch Support Tickets from 'tickets' table
      try {
        setLoadingTickets(true);
        const { data: ticketsData, error: ticketsErr } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ticketsErr) {
          console.error('Error fetching tickets:', ticketsErr);
        } else if (ticketsData) {
          const mappedTickets = ticketsData.map((t: any) => ({
            id: t.id,
            subject: t.subject,
            message: t.message,
            status: t.status === 'open' ? 'Açıq' : (t.status === 'resolved' ? 'Cavablandırılıb' : 'Bağlı'),
            date: new Date(t.created_at).toLocaleDateString('az-AZ'),
            priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium'
          }));
          setTickets(mappedTickets);
        }
      } catch (err) {
        console.error('Tickets fetch error:', err);
      } finally {
        setLoadingTickets(false);
      }

      // 3. Load/Fetch saved Addresses
      try {
        setLoadingAddresses(true);
        const cached = localStorage.getItem(`addresses_${user.id}`);
        if (cached) {
          setAddresses(JSON.parse(cached));
        } else {
          const defaultAddrs = [];
          if (initialProfile?.address) {
            defaultAddrs.push({
              id: 'addr_initial',
              label: 'Ev',
              address: initialProfile.address,
              city: 'Bakı'
            });
          } else {
            defaultAddrs.push(
              { id: 'addr_1', label: 'Ev', address: 'Xətai rayonu, Nobel prospekti 15, mənzil 42', city: 'Bakı' },
              { id: 'addr_2', label: 'Ofis', address: 'Yasamal rayonu, Cəfər Cabbarlı küçəsi 44', city: 'Bakı' }
            );
          }
          setAddresses(defaultAddrs);
          localStorage.setItem(`addresses_${user.id}`, JSON.stringify(defaultAddrs));
        }
      } catch (err) {
        console.error('Addresses load error:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchDashboardData();
  }, [user, initialProfile, email, phone]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] py-12 bg-card border border-border rounded-3xl p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rubik-brand"></div>
        <p className="text-xs text-muted-foreground mt-4">Məlumatlar yüklənir...</p>
      </div>
    );
  }

  // Copy Referral Handler
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://rubikshop.az/${locale}/register?ref=${referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 3000);
  };

  // Add Address Handler
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.trim() || !user) return;
    const updated = [
      ...addresses,
      {
        id: `addr_${Date.now()}`,
        label: newAddressLabel,
        address: newAddressInput,
        city: 'Bakı'
      }
    ];
    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    setNewAddressInput('');
    setNewAddressLabel('Ev');
  };

  // Submit Support Ticket Handler
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim() || !user) return;
    try {
      const { data: ticketData, error: ticketErr } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          subject: ticketSubject,
          message: ticketMessage,
          status: 'open',
          priority: ticketPriority,
          contact_email: email || user.email || null,
        })
        .select()
        .single();

      if (ticketErr) {
        console.error('Error inserting support ticket:', ticketErr);
        return;
      }

      const newTicket = {
        id: ticketData.id,
        subject: ticketSubject,
        message: ticketMessage,
        status: 'Açıq',
        date: new Date().toLocaleDateString('az-AZ'),
        priority: ticketPriority.charAt(0).toUpperCase() + ticketPriority.slice(1)
      };

      setTickets([newTicket, ...tickets]);
      setTicketSubject('');
      setTicketMessage('');
      setTicketSubmitSuccess(true);
      setTimeout(() => setTicketSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Submit ticket error:', err);
    }
  };

  // Update Profile Info
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 4000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3 space-y-4">
        {/* User Card */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-soft-sm text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full bg-rubik-brand/10 border border-rubik-brand/20 flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-rubik-brand" />
            <span className="absolute bottom-0 right-0 bg-green-500 border-2 border-card w-4 h-4 rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">{fullName}</h3>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{email}</p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rubik-brand/10 text-rubik-brand font-black text-[10px] rounded-full uppercase tracking-wider">
              <Award className="h-3.5 w-3.5 animate-bounce" /> {points} Loyalty Points
            </span>
          </div>
        </div>

        {/* Sidebar Links */}
        <div className="bg-card border border-border rounded-3xl p-3 shadow-soft-sm space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible">
          {[
            { id: 'overview', label: 'Ümumi Baxış', icon: Compass },
            { id: 'profile', label: 'Profil & Ünvanlar', icon: MapPin },
            { id: 'orders', label: 'Sifarişlər & İzləmə', icon: ShoppingBag },
            { id: 'wishlist', label: 'İstək Siyahısı', icon: Heart },
            { id: 'loyalty', label: 'Loyallıq & Referral', icon: Award },
            { id: 'settings', label: 'Ayarlar', icon: Settings }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl flex items-center justify-between transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal shrink-0 ${
                  isActive
                    ? 'bg-rubik-brand text-white shadow-soft-md scale-102 font-black'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                <ChevronRight className="h-4 w-4 hidden lg:block opacity-60" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Welcome banner */}
              <div className="relative bg-gradient-to-r from-rubik-brand to-rubik-brand-dark rounded-xl p-6 md:p-8 text-white shadow-md overflow-hidden space-y-3">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full w-fit">VIP Müştəri</span>
                <h2 className="text-xl md:text-3xl font-black">Xoş gəldiniz, {fullName}!</h2>
                <p className="text-xs text-white/90 max-w-md leading-relaxed">
                  İdman kubları və professional puzzle dünyasındakı xüsusi səyahətiniz üçün fərdi kabinetiniz tam hazırdır. Sifarişləri canlı izləyə bilərsiniz.
                </p>
              </div>

              {/* Grid Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Loyalty ring card */}
                <div className="bg-card border border-border rounded-3xl p-5 shadow-soft-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Xal Balansı</span>
                      <Award className="h-5 w-5 text-rubik-brand" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground font-mono">{points}</span>
                      <span className="text-xs text-muted-foreground">points</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-rubik-brand h-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4">
                    Gümüş statusa çatmaq üçün daha <strong>150 xal</strong> lazımdır.
                  </p>
                </div>

                {/* Tracking stats card */}
                <div className="bg-card border border-border rounded-3xl p-5 shadow-soft-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Aktiv Sifarişlər</span>
                      <Truck className="h-5 w-5 text-blue-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground font-mono">1</span>
                      <span className="text-xs text-muted-foreground">yoldadır</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-rubik-brand hover:underline mt-4 text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>Sifarişimi canlı izlə</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Support tickests card */}
                <div className="bg-card border border-border rounded-3xl p-5 shadow-soft-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Dəstək biletləri</span>
                      <HelpCircle className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground font-mono">{tickets.filter(t => t.status !== 'Bağlı').length}</span>
                      <span className="text-xs text-muted-foreground">açıq sorğu</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-4">
                    Bizə ünvanladığınız bütün sorğular ən geci 1 saat ərzində cavablandırılır.
                  </span>
                </div>

              </div>

              {/* Recent Orders Overview */}
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-soft-sm">
                <div className="px-6 py-4.5 bg-muted/40 border-b border-border flex justify-between items-center">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="h-4.5 w-4.5 text-rubik-brand" />
                    Son Sifarişlər
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-[11px] font-bold text-rubik-brand hover:underline cursor-pointer"
                  >
                    Hamısına bax
                  </button>
                </div>

                <div className="divide-y divide-border/60">
                  {orders.slice(0, 2).map((order) => (
                    <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="p-3 bg-muted rounded-2xl flex-shrink-0 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground font-mono">#{order.id.substring(0, 8).toUpperCase()}</span>
                            <span className="text-[10px] text-muted-foreground">• {order.created_at}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 font-medium leading-relaxed">
                            {order.items.map((i) => `${i.product_title} (x${i.quantity})`).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0">
                        <span className="text-xs font-black text-foreground font-mono">{order.total_amount_azn.toFixed(2)} AZN</span>
                        <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider ${
                          order.status === 'shipped'
                            ? 'bg-orange-50 text-orange-600 border border-orange-200'
                            : 'bg-green-50 text-green-600 border border-green-200'
                        }`}>
                          {order.status === 'shipped' ? 'Yoldadır' : 'Təslim edilib'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support ticketing widget */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
                <div className="border-b border-border pb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-rubik-brand" />
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider">İnzibatçıya Dəstək Sorğusu</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Sualınız və ya rəyiniz var? Bizə dərhal yazın, komandamız sizə kömək etsin.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Mövzu</label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Məsələn: Sürətli kubun yağlanması qaydaları"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Prioritet</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      >
                        <option value="low">Aşağı</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksək</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Mesajınız</label>
                    <textarea
                      rows={3}
                      required
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Geri bildiriminiz və ya probleminizi ətraflı qeyd edin..."
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rubik-brand text-white font-black text-xs rounded-xl hover:bg-rubik-brand-dark transition-colors cursor-pointer"
                  >
                    Sorğunu Göndər
                  </button>

                  {ticketSubmitSuccess && (
                    <p className="text-[11px] text-green-600 font-bold flex items-center gap-1 bg-green-50 p-2 rounded-lg border border-green-200">
                      <Check className="h-4 w-4" /> Dəstək biletiniz uğurla daxil edildi. Ən yaxın zamanda cavab alacaqsınız!
                    </p>
                  )}
                </form>

                {/* Tickets History list short */}
                {loadingTickets ? (
                  <div className="pt-4 border-t border-border space-y-2 animate-pulse">
                    <div className="h-3.5 w-32 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded-xl"></div>
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="pt-4 border-t border-border space-y-3">
                    <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider">Öncəki Sorğularınız:</span>
                    <div className="space-y-2.5">
                      {tickets.map((t) => (
                        <div key={t.id} className="flex justify-between items-center text-xs p-3 bg-muted/40 rounded-xl border border-border/60">
                          <div>
                            <span className="font-bold text-foreground block">{t.subject}</span>
                            <span className="text-[9px] text-muted-foreground">ID: #{t.id.toString().substring(0, 8)} • Tarix: {t.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            t.status === 'Bağlı'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-green-50 text-green-600 border border-green-200'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border text-center py-2">
                    <p className="text-[11px] text-muted-foreground font-semibold">Heç bir dəstək sorğunuz yoxdur.</p>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* TAB 2: PROFILE & ADDRESSES */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Şəxsi Məlumatlar</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Fərdi məlumatlarınızı və profil bəndlərini dəyişdirə bilərsiniz.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Ad və Soyad</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Mobil Telefon</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">E-poçt ünvanı</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Instagram ID</label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-5 py-2.5 bg-rubik-brand text-white font-black text-xs rounded-xl hover:bg-rubik-brand-dark transition-colors cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Yenilənir...' : 'Profili Saxla'}
                  </button>

                  {profileSuccessMsg && (
                    <p className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                      <Check className="h-4 w-4" /> Profil uğurla yeniləndi!
                    </p>
                  )}
                </form>
              </div>

              {/* Address Book Management */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
                <div className="border-b border-border pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Ünvan Kitabçası</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Sürətli çatdırılma üçün qeydə aldığınız ünvanlar.</p>
                  </div>
                  <span className="text-[10px] bg-muted px-2.5 py-1 rounded-lg font-bold text-muted-foreground">
                    {loadingAddresses ? '...' : `${addresses.length} Ünvan`}
                  </span>
                </div>

                {loadingAddresses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                    <div className="h-24 bg-muted rounded-2xl"></div>
                    <div className="h-24 bg-muted rounded-2xl"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground font-semibold">Hələ ki heç bir ünvan daxil etməmisiniz.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl border text-left relative transition-all ${
                          selectedAddressIndex === idx
                            ? 'border-rubik-brand bg-rubik-brand/5'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-foreground bg-muted px-2.5 py-1 rounded-lg">
                            {addr.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedAddressIndex(idx)}
                              className="text-[10px] text-rubik-brand hover:underline font-black cursor-pointer"
                            >
                              Əsas seç
                            </button>
                            <button
                              onClick={() => setAddressToDelete(addr.id)}
                              className="text-[10px] text-red-500 hover:underline font-black cursor-pointer"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-foreground mt-2 leading-relaxed">{addr.address}</p>
                        <span className="block text-[10px] text-muted-foreground font-semibold mt-1">{addr.city}, Azərbaycan</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new address */}
                <form onSubmit={handleAddAddress} className="pt-4 border-t border-border space-y-4">
                  <span className="block text-xs font-black text-foreground uppercase tracking-wider">Yeni Ünvan Əlavə Et</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Ünvan Növü</label>
                      <select
                        value={newAddressLabel}
                        onChange={(e) => setNewAddressLabel(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      >
                        <option value="Ev">Ev</option>
                        <option value="Ofis">Ofis</option>
                        <option value="Digər">Digər</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Ünvan məlumatı</label>
                      <input
                        type="text"
                        required
                        value={newAddressInput}
                        onChange={(e) => setNewAddressInput(e.target.value)}
                        placeholder="Məsələn: Nizami küçəsi 142, bina 3, mənzil 12"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-foreground text-card hover:bg-rubik-brand hover:text-white font-black text-xs rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Əlavə et</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-3xl p-6 animate-pulse space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                      </div>
                      <div className="h-10 w-full bg-muted rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[250px] py-12 bg-card border border-border rounded-3xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground opacity-60" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground uppercase tracking-wider">Hələ ki heç bir sifarişiniz yoxdur</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                      Sifariş etdiyiniz kublar və aksesuarlar burada görünəcəkdir. İlk alış-verişinizi etmək üçün mağazamıza keçin!
                    </p>
                  </div>
                  <Link href={`/${locale}/`} className="px-5 py-2.5 bg-rubik-brand text-white font-black text-xs rounded-xl uppercase tracking-wider hover:bg-rubik-brand/90 transition-all">
                    Kataloqa keç
                  </Link>
                </div>
              ) : (
                <>
                  {/* Order Tracking component if an order is active / selected */}
                  {selectedOrder && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Seçilən Sifarişin Statusu</h3>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-xs text-rubik-brand hover:underline font-black cursor-pointer"
                        >
                          Siyahıya qayıt
                        </button>
                      </div>
                      <OrderTracker status={selectedOrder.status} orderId={selectedOrder.id} />
                    </div>
                  )}

                  {/* Order History list */}
                  <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-soft-sm">
                    <div className="px-6 py-5 bg-muted/40 border-b border-border flex items-center justify-between">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Bütün Sifarişləriniz ({orders.length})</h3>
                    </div>

                    <div className="divide-y divide-border/60">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className={`p-6 hover:bg-muted/10 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer ${
                            selectedOrder?.id === order.id ? 'bg-rubik-brand/[0.02]' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-foreground font-mono">#{order.id.toString().substring(0, 8).toUpperCase()}</span>
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> {order.created_at}
                              </span>
                              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-bold">
                                {order.delivery_method}
                              </span>
                            </div>
                            
                            {/* Subproducts */}
                            <div className="flex flex-wrap gap-4 pt-1">
                              {order.items.map((i: any) => (
                                <div key={i.id} className="flex items-center gap-2">
                                  <div className="relative w-8 h-8 rounded-lg bg-muted border border-border p-0.5 flex items-center justify-center">
                                    <img src={i.image_url} alt={i.product_title} className="w-full h-full object-contain" />
                                  </div>
                                  <span className="text-[10px] text-foreground font-bold line-clamp-1 max-w-[140px]">{i.product_title}</span>
                                  <span className="text-[9px] text-muted-foreground">x{i.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-2 md:pt-0">
                            <span className="text-xs font-black text-foreground font-mono">{order.total_amount_azn.toFixed(2)} AZN</span>
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider ${
                                order.status === 'shipped' || order.status === 'pending'
                                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                  : 'bg-green-50 text-green-600 border border-green-200'
                              }`}>
                                {order.status === 'shipped' ? 'Yoldadır' : (order.status === 'pending' ? 'Gözləmədə' : 'Təslim edilib')}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 4: WISHLIST & COMPARE */}
          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
                <div className="border-b border-border pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider">İstək Siyahınız</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Bəyəndiyiniz və gələcəkdə almağı düşündüyünüz professional kublar.</p>
                  </div>
                  <span className="text-[10px] bg-muted px-2.5 py-1 rounded-lg font-bold text-muted-foreground">
                    {wishlist.length} Məhsul
                  </span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h4 className="text-sm font-black text-foreground">İstək siyahınız boşdur</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">Sürətli kolleksiyalarımızdan yeni kublar əlavə edin.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="p-4 rounded-2xl border border-border flex items-center justify-between gap-4 bg-muted/20 hover:border-rubik-brand/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center p-1 shrink-0">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-rubik-brand uppercase">{item.brand}</span>
                            <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">{item.title}</h4>
                            <span className="text-[10px] font-black text-foreground font-mono">{item.price_azn.toFixed(2)} AZN</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${locale}/product/${item.id}`}
                            className="px-3 py-1.5 bg-foreground text-card hover:bg-rubik-brand hover:text-white font-black text-[10px] rounded-lg transition-colors cursor-pointer"
                          >
                            İncele
                          </Link>
                          <button
                            onClick={() => setWishlist(wishlist.filter((w) => w.id !== item.id))}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compare History Simulation */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Müqayisə Tarixçəniz</h4>
                <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 text-center">
                  <p className="text-xs text-muted-foreground">Son müqayisə edilən: <strong>GAN 14 MagLev vs MoYu RS3M V5</strong></p>
                  <p className="text-[10px] text-muted-foreground mt-1">İki flaqman kub arasındakı Ball-Core fərqləri araşdırıldı.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: LOYALTY & REFERRALS */}
          {activeTab === 'loyalty' && (
            <motion.div
              key="loyalty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Point visual board */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Mövcud Səviyyə</span>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-yellow-500 text-white rounded-xl">
                      <Award className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-foreground uppercase">Bürünc Üzv</h4>
                      <p className="text-[10px] text-muted-foreground">Daimi 2% Endirim xüsusiyyəti</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Hədəf Balansı</span>
                  <p className="text-xs text-foreground font-semibold">Gümüş Üzv (500 Xal)</p>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <span className="text-3xl font-black text-rubik-brand font-mono">{points}</span>
                  <span className="text-xs text-muted-foreground block font-bold mt-0.5">Xal</span>
                </div>
              </div>

              {/* Referral gamification panel */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Dostunu Dəvət Et (Referral proqramı)</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Dostlarınızı dəvət edin, hər ikiniz hər alış-verişdə 10 AZN qazanın.</p>
                </div>

                <div className="bg-muted p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider">Dəvət Linkiniz</span>
                    <span className="text-xs font-mono text-foreground font-semibold leading-none break-all">
                      https://rubikshop.az/{locale}/register?ref={referralCode}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyReferral}
                    className="px-4 py-2 bg-rubik-brand text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedReferral ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
                  </button>
                </div>

                {/* Referral tracker steps details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                  <div className="space-y-1.5 p-4 bg-muted/40 rounded-xl border border-border/60">
                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white rounded-full text-[10px] font-black">1</span>
                    <h5 className="font-bold text-foreground">Dəvət et</h5>
                    <p className="text-[10px] text-muted-foreground">Xüsusi dəvət linkinizi dostlarınızla paylaşın.</p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-muted/40 rounded-xl border border-border/60">
                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white rounded-full text-[10px] font-black">2</span>
                    <h5 className="font-bold text-foreground">Dostun Alış-veriş etsin</h5>
                    <p className="text-[10px] text-muted-foreground">Onlar ilk alış-verişlərində xüsusi 10% kupon qazanacaqlar.</p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-muted/40 rounded-xl border border-border/60">
                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white rounded-full text-[10px] font-black">3</span>
                    <h5 className="font-bold text-foreground">10 AZN Balans qazan</h5>
                    <p className="text-[10px] text-muted-foreground">Sifariş təsdiqləndikdən dərhal sonra balansınıza 10 AZN köçürülür.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Security password settings change */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-6">
                <div className="border-b border-border pb-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Şifrəni Yenilə</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Təhlükəsizlik üçün mütəmadi olaraq şifrənizi dəyişdirməyiniz tövsiyə olunur.</p>
                </div>

                <form className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Cari Şifrə</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Yeni Şifrə</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    />
                  </div>

                  <button
                    type="button"
                    className="px-5 py-2.5 bg-rubik-brand text-white font-black text-xs rounded-xl hover:bg-rubik-brand-dark transition-colors cursor-pointer"
                  >
                    Şifrəni dəyişdir
                  </button>
                </form>
              </div>

              {/* Communication Preferences */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Bildiriş Ayarları</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-border text-rubik-brand focus:ring-rubik-brand cursor-pointer"
                    />
                    <span className="text-xs text-foreground select-none">Məhsul status yeniləmələrini WhatsApp və ya SMS ilə göndər</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-border text-rubik-brand focus:ring-rubik-brand cursor-pointer"
                    />
                    <span className="text-xs text-foreground select-none">Yeni gələn professional kub kampaniyaları haqqında elektron məktub al</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ADDRESS DELETE CONFIRMATION MODAL */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-wider mb-2">Ünvanı silmək</h3>
              <p className="text-sm text-muted-foreground mb-6">Bu elementi silmək istədiyinizə əminsiniz?</p>
              
              <div className="flex justify-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setAddressToDelete(null)} 
                  disabled={isDeletingAddress}
                  className="px-5 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Ləğv Et
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmDeleteAddress} 
                  disabled={isDeletingAddress}
                  className="px-5 py-2.5 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeletingAddress ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Silinir...
                    </>
                  ) : (
                    'Sil'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
