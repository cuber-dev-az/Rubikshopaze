"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, Sparkles, AlertCircle } from 'lucide-react';

interface CMSPage {
  id: string;
  slug: string;
  title_az: string;
  title_en: string;
  title_ru: string;
  content_az: string;
  content_en: string;
  content_ru: string;
  meta_title_az?: string;
  meta_title_en?: string;
  meta_title_ru?: string;
  meta_description_az?: string;
  meta_description_en?: string;
  meta_description_ru?: string;
}

export default function DynamicCMSPage({ params }: { params: { locale: string; slug: string } }) {
  const resolvedParams = params && typeof (params as any).then === 'function' ? React.use(params as any) as any : params;
  const locale = resolvedParams?.locale || 'az';
  const slug = resolvedParams?.slug || '';

  const [pageData, setPageData] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (!error && data) {
        setPageData(data as CMSPage);
      }
      setLoading(false);
    }
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-bold">
        Yüklənir...
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black uppercase text-white tracking-wider">Səhifə Tapılmadı</h1>
        <p className="text-slate-400 mt-2 max-w-sm text-sm">
          Axtardığınız səhifə silinib və ya mövcud deyil.
        </p>
      </div>
    );
  }

  const title = pageData[`title_${locale}` as keyof CMSPage] || pageData.title_az;
  const content = pageData[`content_${locale}` as keyof CMSPage] || pageData.content_az;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-black text-amber-500 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> RubikShop Məlumat
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
            {String(title)}
          </h1>
        </div>

        <div 
          className="prose prose-invert prose-amber max-w-none text-slate-300 leading-relaxed text-base whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: String(content) }}
        />

      </article>
    </div>
  );
}
