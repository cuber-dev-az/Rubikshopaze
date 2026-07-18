"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Trash2, 
  Settings, 
  Tag, 
  Layers, 
  Globe, 
  Eye, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { createProduct, updateProduct, getProductById } from '@/lib/actions/catalog';

interface ProductFormClientProps {
  isNew: boolean;
  productId?: string;
}

export default function ProductFormClient({ isNew, productId }: ProductFormClientProps) {
  const [activeTab, setActiveTab] = useState('core');
  
  // Form State Placeholders
  const [title_az, setTitle_az] = useState(isNew ? '' : 'GAN 14 MagLev flagship 3x3');
  const [title_en, setTitle_en] = useState(isNew ? '' : 'GAN 14 MagLev flagship 3x3');
  const [title_ru, setTitle_ru] = useState(isNew ? '' : 'GAN 14 MagLev флагманский 3x3');
  const [description_az, setDescription_az] = useState(isNew ? '' : 'Dünyanın ən qabaqcıl sürət kubu.');
  const [description_en, setDescription_en] = useState(isNew ? '' : "The world's most advanced speed cube.");
  const [description_ru, setDescription_ru] = useState(isNew ? '' : 'Самый продвинутый скоростной куб в мире.');
  const [price_azn, setPrice_azn] = useState(isNew ? '' : '145.00');
  const [slug, setSlug] = useState(isNew ? '' : 'gan-14-maglev-flagship-3x3');
  const [productType, setProductType] = useState('standard');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState('gan, flagship, maglev');
  
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const [variants, setVariants] = useState<any[]>(
    isNew 
      ? [
          { id: 1, sku: 'GAN14-ML-UV', name: 'UV Coated', price: '145.00', stock: 10 },
          { id: 2, sku: 'GAN14-ML-FROSTED', name: 'Frosted', price: '135.00', stock: 24 }
        ]
      : []
  );

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Hydrate product details when editing
  React.useEffect(() => {
    if (!isNew && productId) {
      const loadProduct = async () => {
        setLoadingProduct(true);
        setErrorMsg('');
        try {
          const res = await getProductById(productId);
          if (res.success && res.data) {
            const prod = res.data;
            setTitle_az(prod.title_az || '');
            setTitle_en(prod.title_en || '');
            setTitle_ru(prod.title_ru || '');
            setDescription_az(prod.description_az || '');
            setDescription_en(prod.description_en || '');
            setDescription_ru(prod.description_ru || '');
            setPrice_azn(prod.price_azn !== undefined ? String(prod.price_azn) : '');
            setSlug(prod.slug || '');
            setStatus(prod.is_active ? 'publish' : 'draft');
            setIsFeatured(prod.is_featured || false);
            
            if (prod.variants && Array.isArray(prod.variants)) {
              setVariants(prod.variants.map((v: any, index: number) => ({
                id: v.id || index + 1,
                sku: v.sku || '',
                name: v.name || '',
                price: v.price !== undefined ? String(v.price) : '',
                stock: v.stock || 0
              })));
            }
          } else {
            setErrorMsg(res.error || 'Məhsul yüklənərkən xəta baş verdi');
          }
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : 'Gözlənilməz xəta baş verdi');
        } finally {
          setLoadingProduct(false);
        }
      };
      loadProduct();
    }
  }, [isNew, productId]);

  const handleAddVariant = () => {
    const nextId = variants.length > 0 ? Math.max(...variants.map(v => typeof v.id === 'number' ? v.id : 0)) + 1 : 1;
    setVariants([...variants, { id: nextId, sku: '', name: '', price: '', stock: 0 }]);
  };

  const [variantToDelete, setVariantToDelete] = useState<number | string | null>(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);
  const [showProductDeleteConfirm, setShowProductDeleteConfirm] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const handleDeleteVariantClick = (id: number | string) => {
    setVariantToDelete(id);
  };

  const handleConfirmDeleteVariant = async () => {
    if (variantToDelete === null) return;
    setIsDeletingVariant(true);
    await new Promise(resolve => setTimeout(resolve, 350));
    setVariants(variants.filter(v => v.id !== variantToDelete));
    setVariantToDelete(null);
    setIsDeletingVariant(false);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productId) return;
    setIsDeletingProduct(true);
    try {
      const res = await supabase.from('products').delete().eq('id', productId);
      if (res.error) {
        setErrorMsg('Silinmə zamanı xəta baş verdi: ' + res.error.message);
      } else {
        setSuccessMsg('Məhsul uğurla silindi!');
        setTimeout(() => {
          window.location.href = '/az/admin/products';
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg('Silinmə zamanı xəta baş verdi: ' + (err.message || err));
    } finally {
      setIsDeletingProduct(false);
      setShowProductDeleteConfirm(false);
    }
  };

  const handleUpdateVariant = (id: number | string, field: string, value: any) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Normalize decimal (accepts "8,90" or "8.90"), keep two decimals
      const parsedPrice = parseFloat(String(price_azn).replace(',', '.'));
      const priceNumber = !isNaN(parsedPrice) && isFinite(parsedPrice) ? Math.round(parsedPrice * 100) / 100 : 0;

      const payloadVariants = variants.map(v => {
        const parsedVariantPrice = parseFloat(String(v.price).replace(',', '.'));
        const roundedPrice = !isNaN(parsedVariantPrice) && isFinite(parsedVariantPrice) ? Math.round(parsedVariantPrice * 100) / 100 : 0;
        return {
          sku: v.sku || '',
          name: v.name || '',
          price: roundedPrice,
          stock: Number(v.stock) || 0
        };
      });

      const payload = {
        title_az,
        title_en,
        title_ru,
        description_az,
        description_en,
        description_ru,
        slug: slug || title_az.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        price_azn: priceNumber,
        is_active: status === 'publish',
        variants: payloadVariants,
      };

      let res;
      if (isNew) {
        res = await createProduct(payload);
      } else if (productId) {
        res = await updateProduct(productId, payload);
      }

      if (res && res.success) {
        setSuccessMsg(isNew ? 'Məhsul uğurla yaradıldı!' : 'Məhsul uğurla yeniləndi!');
      } else {
        setErrorMsg(res?.error || 'Xəta baş verdi');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gözlənilməz xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'core', label: 'Əsas Məlumatlar', icon: Settings },
    { id: 'media', label: 'Media Mərkəzi', icon: ImageIcon },
    { id: 'variants', label: 'Variantlar', icon: Layers },
    { id: 'seo', label: 'SEO & Meta', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/az/admin/products" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              {isNew ? 'Yeni Məhsul' : 'Məhsulu Redaktə Et'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">Məhsul detallarını konfiqurasiya edin.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-colors border border-slate-700">
            <Eye className="w-4 h-4" /> Önizləmə
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4" /> {loading ? 'Gözləyin...' : (isNew ? 'Yarat' : 'Yadda Saxla')}
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar bg-slate-900 p-2 rounded-2xl border border-slate-800">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-slate-800 text-amber-500 shadow-soft-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content: Core */}
          {activeTab === 'core' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Məhsul Adı (AZ)</label>
                    <input 
                      type="text" 
                      value={title_az}
                      onChange={(e) => setTitle_az(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Məsələn: MoYu RS3M 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Product Name (EN)</label>
                    <input 
                      type="text" 
                      value={title_en}
                      onChange={(e) => setTitle_en(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="e.g. MoYu RS3M 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Название товара (RU)</label>
                    <input 
                      type="text" 
                      value={title_ru}
                      onChange={(e) => setTitle_ru(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Например: MoYu RS3M 2020"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Məhsul Linki (Slug)</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="moyu-rs3m-2020"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Açıqlama (Azərbaycan dili)</label>
                    <textarea 
                      value={description_az}
                      onChange={(e) => setDescription_az(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      placeholder="Məhsul haqqında ətraflı məlumat (AZ)..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Description (English)</label>
                    <textarea 
                      value={description_en}
                      onChange={(e) => setDescription_en(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      placeholder="Detailed product information (EN)..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Описание (Русский)</label>
                    <textarea 
                      value={description_ru}
                      onChange={(e) => setDescription_ru(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      placeholder="Подробная информация о товаре (RU)..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Qiymət (AZN)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="^\d+([.,]\d{1,2})?$"
                      value={price_azn}
                      onChange={(e) => setPrice_azn(e.target.value.replace(',', '.'))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="E.g.: 55.45"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Açar Sözlər (Tags)</label>
                    <div className="relative">
                      <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="Vergüllə ayırın..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Məhsul Tipi</label>
                    <select 
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                    >
                      <option value="standard">Standard Məhsul</option>
                      <option value="service">Xidmət Məhsulu (Məsələn: Setup)</option>
                      <option value="bundle">Bundle (Paket)</option>
                      <option value="preorder">Pre-order (Ön Sifariş)</option>
                      <option value="wholesale">Topdan Satış</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab Content: Media */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" /> Şəkil Meneceri
                </h3>
                <div className="border-2 border-dashed border-slate-700 bg-slate-950/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">Şəkilləri bura sürükləyin və ya klikləyin</p>
                  <p className="text-xs text-slate-500">PNG, JPG, WEBP (Max 5MB)</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {[1, 2].map(i => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 group">
                      <Image src={`https://picsum.photos/seed/prod${i}/200/200`} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-2 bg-slate-800 hover:bg-red-500 text-white rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {i === 1 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded uppercase tracking-wider shadow-md">
                          Əsas
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" /> Video Meneceri
                </h3>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">YouTube Video Linki</label>
                  <input 
                    type="url" 
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Variants */}
          {activeTab === 'variants' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Variantlar Mühərriki</h3>
                  <p className="text-xs text-slate-400 mt-1">Rəng, mexanika və ölçü variantları əlavə edin.</p>
                </div>
                <button 
                  onClick={handleAddVariant}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-colors border border-slate-700"
                >
                  <Plus className="w-4 h-4" /> Yeni Variant
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((v, i) => (
                  <div key={v.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Variant Adı</label>
                        <input 
                          type="text" 
                          value={v.name || ''} 
                          onChange={(e) => handleUpdateVariant(v.id, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">SKU</label>
                        <input 
                          type="text" 
                          value={v.sku || ''} 
                          onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Qiymət (AZN)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="^\d+([.,]\d{1,2})?$"
                          value={String(v.price)}
                          onChange={(e) => {
                            const val = e.target.value.replace(',', '.');
                            handleUpdateVariant(v.id, 'price', val);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Stok</label>
                        <input 
                          type="number" 
                          value={v.stock !== undefined ? String(v.stock) : ''} 
                          onChange={(e) => handleUpdateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>
                    <div className="pt-5 sm:pt-4">
                      <button 
                        onClick={() => handleDeleteVariantClick(v.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: SEO */}
          {activeTab === 'seo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-soft-md space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-black text-white">SEO & Axtarış Optimizasiyası</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Meta Title</label>
                  <input 
                    type="text" 
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Maksimum 60 simvol..."
                  />
                  <div className="text-right text-[10px] text-slate-500 mt-1">{seoTitle.length} / 60</div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Meta Description</label>
                  <textarea 
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="Maksimum 160 simvol..."
                  />
                  <div className="text-right text-[10px] text-slate-500 mt-1">{seoDesc.length} / 160</div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl mt-4">
                  <h4 className="text-xs font-bold text-slate-400 mb-2">Google Önizləmə</h4>
                  <div className="space-y-1">
                    <div className="text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate">
                      {seoTitle || title_az || 'Məhsul Adı Burada Görünəcək'}
                    </div>
                    <div className="text-green-500 text-sm truncate">
                      https://rubikshop.az/products/{slug || 'məhsul-linki'}
                    </div>
                    <div className="text-slate-300 text-sm line-clamp-2">
                      {seoDesc || description_az || 'Məhsul haqqında qısa açıqlama burada görünəcək. Google axtarışlarında müştəriləri cəlb etmək üçün maraqlı mətn yazın.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-soft-md space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">Nəşr Statusu</h3>
            
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                status === 'publish' ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${status === 'publish' ? 'border-green-500' : 'border-slate-600'}`}>
                    {status === 'publish' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${status === 'publish' ? 'text-green-400' : 'text-slate-300'}`}>Aktiv (Publish)</div>
                    <div className="text-[10px] text-slate-500">Müştərilər görə bilər</div>
                  </div>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                status === 'draft' ? 'bg-slate-800 border-slate-600' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${status === 'draft' ? 'border-slate-400' : 'border-slate-600'}`}>
                    {status === 'draft' && <div className="w-2 h-2 rounded-full bg-slate-400" />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${status === 'draft' ? 'text-white' : 'text-slate-300'}`}>Qaralama (Draft)</div>
                    <div className="text-[10px] text-slate-500">Hazırlanma mərhələsində</div>
                  </div>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                status === 'archive' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${status === 'archive' ? 'border-amber-500' : 'border-slate-600'}`}>
                    {status === 'archive' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${status === 'archive' ? 'text-amber-500' : 'text-slate-300'}`}>Arxiv (Archive)</div>
                    <div className="text-[10px] text-slate-500">Satışdan çıxarılıb</div>
                  </div>
                </div>
              </label>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
                <Calendar className="w-4 h-4" /> Nəşri Planla (Schedule)
              </button>
            </div>
            
            {!isNew && (
              <div className="pt-3 mt-3 border-t border-slate-800">
                <button 
                  onClick={() => setShowProductDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Məhsulu Sil
                </button>
              </div>
            )}
          </div>

          {/* Visibility & Organization */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-soft-md space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">Təşkilatlandırma</h3>
            
            <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div>
                <div className="text-sm font-bold text-white">Önə Çıxarılan</div>
                <div className="text-[10px] text-slate-500">Ana səhifədə göstər</div>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isFeatured ? 'bg-amber-500' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isFeatured ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </label>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Kateqoriya</label>
              <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                <option>3x3 Kublar</option>
                <option>Ağıllı Kublar</option>
                <option>Aksesuarlar</option>
                <option>Lubrikantlar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Brend</label>
              <select className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                <option>GAN</option>
                <option>MoYu</option>
                <option>QiYi</option>
                <option>X-Man</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* VARIANT DELETE CONFIRMATION MODAL */}
      {variantToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Variantı silmək</h3>
              <p className="text-sm text-slate-400 mb-6">Bu elementi silmək istədiyinizə əminsiniz?</p>
              
              <div className="flex justify-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setVariantToDelete(null)} 
                  disabled={isDeletingVariant}
                  className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Ləğv Et
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmDeleteVariant} 
                  disabled={isDeletingVariant}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeletingVariant ? (
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

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      {showProductDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Məhsulu silmək</h3>
              <p className="text-sm text-slate-400 mb-6">Bu elementi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.</p>
              
              <div className="flex justify-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowProductDeleteConfirm(false)} 
                  disabled={isDeletingProduct}
                  className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Ləğv Et
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmDeleteProduct} 
                  disabled={isDeletingProduct}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeletingProduct ? (
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
