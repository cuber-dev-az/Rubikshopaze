import ProductFormClient from '@/components/admin/products/ProductFormClient';

export default async function AdminProductFormPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const isNew = !id || id === 'new';

  return <ProductFormClient isNew={isNew} productId={isNew ? undefined : id} />;
}

