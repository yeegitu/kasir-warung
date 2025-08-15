'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface EditBarangFormProps {
  id: string;
}

interface BarangType {
  nama: string;
  harga: number;
  jumlah: number;
  kategori: string;
}

export default function EditBarangForm({ id }: EditBarangFormProps) {
  const router = useRouter();

  const [barang, setBarang] = useState<BarangType | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoadingFetch(true);
    fetch(`/api/barang/${id}`)
      .then(res => res.json())
      .then(data => {
        setBarang({
          nama: data.nama,
          harga: data.harga,
          jumlah: data.jumlah,
          kategori: data.kategori,
        });
      })
      .catch(() => alert('Gagal mengambil data barang'))
      .finally(() => setLoadingFetch(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barang) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/barang/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: barang.nama,
          harga: Number(barang.harga),
          jumlah: Number(barang.jumlah),
          kategori: barang.kategori,
        }),
      });

     const data = await res.json();

  if (res.ok) {
    // Toast sukses setelah update
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Barang berhasil diupdate',
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
    });

    router.push('/barang');
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: data.message || 'Gagal update barang',
    });
  }
} catch (error) {
  Swal.fire({
    icon: 'error',
    title: 'Error!',
    text: 'Terjadi kesalahan saat update barang',
  });
  console.error(error);
} finally {
  setLoading(false);
}
  };

  const formatRupiah = (value: string | number) => {
    const num = Number(String(value).replace(/\D/g, '')) || 0;
    return num.toLocaleString('id-ID');
  };

  if (loadingFetch || !barang) {
    return (
      <div className="max-w-lg mx-auto p-6 mt-10 text-center">
        <p className="text-gray-700">Memuat data barang...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col min-h-[80vh] sm:min-h-[60vh]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Edit Barang</h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-black flex-grow">
        {/* Nama */}
        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
          <input
            type="text"
            id="nama"
            placeholder="Masukkan nama barang"
            value={barang.nama}
            onChange={(e) => setBarang({ ...barang, nama: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Harga */}
        <div>
          <label htmlFor="harga" className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
          <input
            type="text"
            id="harga"
            placeholder="Masukkan harga barang"
            value={formatRupiah(barang.harga)}
            onChange={(e) => {
              const num = e.target.value.replace(/\D/g, '');
              setBarang({ ...barang, harga: Number(num) });
            }}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Jumlah */}
        <div>
          <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
          <input
            type="number"
            id="jumlah"
            placeholder="Masukkan jumlah stok"
            value={barang.jumlah}
            onChange={(e) => setBarang({ ...barang, jumlah: Number(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            min={0}
            required
          />
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <input
            type="text"
            id="kategori"
            placeholder="Masukkan kategori barang"
            value={barang.kategori}
            onChange={(e) => setBarang({ ...barang, kategori: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg shadow-md text-sm sm:text-base font-medium text-white transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>

      {/* Tombol Back */}
      <div className="mt-4 sm:mt-6 flex justify-start">
        <button
          type="button"
          onClick={() => router.push('/barang')}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition text-sm sm:text-base"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
