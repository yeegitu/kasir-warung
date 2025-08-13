import EditBarangForm from './EditBarangForm';

interface EditBarangPageProps {
  params: Promise<{ id: string | string[] }>;
}

export default async function EditBarangPage({ params }: EditBarangPageProps) {
  const resolvedParams = await params; // unwrap promise
  const id = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;

  if (!id) {
    return <p className="text-center text-red-600 mt-10">ID barang tidak ditemukan.</p>;
  }

  return <EditBarangForm id={id} />;
}
