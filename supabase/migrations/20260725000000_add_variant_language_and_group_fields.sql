-- Migration: Add missing group_slug, variant_name localization columns, tags and keywords to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS group_slug VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant_name VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant_name_az VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant_name_en VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant_name_ru VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';

-- Index for optimized family / sibling query performance
CREATE INDEX IF NOT EXISTS idx_products_group_slug ON public.products(group_slug);

-- Auto-backfill group_slug for MoYu RS3 M 3x3 V5 family products
UPDATE public.products 
SET group_slug = 'moyu-rs3m-v5' 
WHERE (group_slug IS NULL OR group_slug = '') 
  AND (title_az ILIKE '%MoYu RS3 M 3x3 V5%' OR name_az ILIKE '%MoYu RS3 M 3x3 V5%' OR title ILIKE '%MoYu RS3 M 3x3 V5%' OR slug ILIKE 'moyu-rs3m-v5%');

