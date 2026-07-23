import ProductFormClient from '@/components/admin/products/ProductFormClient';

export default async function AdminProductFormPage(props: { params: Promise<{ id: string }> | { id: string } }) {
  const params = await Promise.resolve(props?.params);
  const id = params?.id || 'new';
  const isNew = id === 'new';

  return <ProductFormClient isNew={isNew} productId={isNew ? undefined : id} />;
}

