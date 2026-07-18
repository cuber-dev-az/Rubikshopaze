'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Wrench, 
  Search, 
  Plus, 
  Edit2, 
  Trash2,
  Droplet,
  Zap,
  ShieldCheck,
  ListTodo,
  X,
  Save
} from 'lucide-react';
import ServiceOrdersClient from './ServiceOrdersClient';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  isActive: boolean;
}

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    title: 'Premium Lube Setup',
    description: 'Kubun daxili mexanizminin xüsusi silikon yağlarla yağlanması və təmizlənməsi. Sürət və nəzarəti artırır.',
    price: 5.00,
    icon: 'Droplet',
    isActive: true,
  },
  {
    id: 'srv-2',
    title: 'Custom Tensioning',
    description: 'Müştərinin istəyinə uyğun olaraq kubun gərginliyinin (tension) nizamlanması. Yayların optimallaşdırılması.',
    price: 3.50,
    icon: 'Settings',
    isActive: true,
  },
  {
    id: 'srv-3',
    title: 'Magnet Swaps (Pro)',
    description: 'Standart maqnitlərin daha güclü və ya zəif N35/N48 maqnitlərlə əvəzlənməsi. Stabil hissi artırır.',
    price: 15.00,
    icon: 'Zap',
    isActive: true,
  },
  {
    id: 'srv-4',
    title: 'Core Lubing & Spring Noise Fix',
    description: 'Nüvənin yağlanması və yay səs-küyünün (spring noise) tamamilə aradan qaldırılması.',
    price: 8.00,
    icon: 'ShieldCheck',
    isActive: true,
  },
];

export default function ServicesClient() {
  const [activeTab, setActiveTab] = React.useState<'management' | 'orders'>('management');
  const [services, setServices] = React.useState<Service[]>(INITIAL_SERVICES);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  
  // Form state
  const [formData, setFormData] = React.useState<Partial<Service>>({
    title: '',
    description: '',
    price: 0,
    icon: 'Settings',
    isActive: true,
  });

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        icon: 'Settings',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? { ...s, ...formData } as Service : s));
    } else {
      const newService: Service = {
        ...(formData as Service),
        id: `srv-${Date.now()}`,
      };
      setServices([...services, newService]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if(confirm('Silmək istədiyinizə əminsiniz?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wrench className="h-6 w-6 text-amber-500" />
            Xidmətlər (Custom Setup)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Nis xidmətlərin (yağlama, tənzimləmə) idarəedilməsi və sifariş növbəsi.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('management')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'management'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          Xidmət Növləri
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Sifariş Növbəsi
          <span className="flex items-center justify-center bg-red-500 text-white text-[10px] h-5 w-5 rounded-full font-black">
            3
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'management' ? (
          <motion.div
            key="management"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Xidmət axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4 text-amber-500" />
                Yeni Xidmət
              </button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors group relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 shrink-0">
                      {service.icon === 'Droplet' && <Droplet className="h-6 w-6" />}
                      {service.icon === 'Settings' && <Settings className="h-6 w-6" />}
                      {service.icon === 'Zap' && <Zap className="h-6 w-6" />}
                      {service.icon === 'ShieldCheck' && <ShieldCheck className="h-6 w-6" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        service.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {service.isActive ? 'Aktiv' : 'Passiv'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-grow">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-auto">
                    <div className="text-lg font-black text-amber-500">
                      +{service.price.toFixed(2)} AZN
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(service)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ServiceOrdersClient />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
                <h3 className="text-xl font-bold text-white">
                  {editingService ? 'Xidməti Yenilə' : 'Yeni Xidmət Yarat'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Başlıq</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="Məs: Premium Lube Setup"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Təsvir</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                    placeholder="Xidmətin detalları..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-300">Qiymət (AZN)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-300">İkon</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Settings">Settings</option>
                      <option value="Droplet">Droplet</option>
                      <option value="Zap">Zap</option>
                      <option value="ShieldCheck">ShieldCheck</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                      formData.isActive ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className="text-sm font-semibold text-slate-300">
                    {formData.isActive ? 'Xidmət aktivdir' : 'Xidmət passivdir'}
                  </span>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Yadda Saxla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
