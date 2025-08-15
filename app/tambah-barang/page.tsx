'use client';

import { useState, useEffect } from 'react';

interface Kategori {
  nama: string;
}

export default function TambahBarangPage() {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriList, setKategoriList] = useState<string[]>([]);
  const [kategoriBaru, setKategoriBaru] = useState('');
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/kategori')
      .then(res => res.json())
      .then((data: Kategori[]) => {
        setKategoriList(data.map((k) => k.nama));
      })
      .catch(err => console.error('Gagal fetch kategori:', err));
  }, []);

  const formatHarga = (value: string) => {
    const angka = value.replace(/\D/g, '');
    return angka ? parseInt(angka, 10).toLocaleString('id-ID') : '';
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // hilang setelah 3 detik
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nama.trim() || !harga || !jumlah) {
      showToast('Mohon isi semua field dengan benar.', 'error');
      return;
    }

    if (kategori.trim() === '' && kategoriBaru.trim() === '') {
      showToast('Pilih kategori atau masukkan kategori baru.', 'error');
      return;
    }

    setLoading(true);
    const kategoriFinal = kategoriBaru.trim() !== '' ? kategoriBaru.trim() : kategori;

    try {
      const res = await fetch('/api/barang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          harga: Number(harga.replace(/\./g, '')),
          jumlah: Number(jumlah),
          kategori: kategoriFinal,
        }),
      });

      const result = await res.json();
      showToast(result.message || 'Barang berhasil ditambahkan', 'success');

      setNama('');
      setHarga('');
      setJumlah('');
      setKategori('');
      setKategoriBaru('');
    } catch (error) {
      console.error('Error menambahkan barang:', error);
      showToast('Terjadi kesalahan saat menambahkan barang.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white 
            transform transition-all duration-500 ease-in-out
            ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            animate-slideInRight
          `}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Tambah Barang</h1>
        <form onSubmit={handleSubmit}>
          {/* Nama */}
          <div className="mb-4">
            <label htmlFor="nama" className="block mb-1 font-medium text-gray-700">Nama Barang</label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama barang"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Harga */}
          <div className="mb-4">
            <label htmlFor="harga" className="block mb-1 font-medium text-gray-700">Harga</label>
            <input
              id="harga"
              type="text"
              value={harga}
              onChange={(e) => setHarga(formatHarga(e.target.value))}
              placeholder="Masukkan harga barang"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Jumlah */}
          <div className="mb-4">
            <label htmlFor="jumlah" className="block mb-1 font-medium text-gray-700">Jumlah</label>
            <input
              id="jumlah"
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah barang"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Pilih kategori */}
          <div className="mb-4">
            <label htmlFor="kategori" className="block mb-1 font-medium text-gray-700">Kategori (Pilih dari daftar)</label>
            <select
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              disabled={kategoriBaru.trim() !== ''}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                kategoriBaru.trim() !== '' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map((k, i) => (
                <option key={i} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Kategori baru */}
          <div className="mb-6">
            <label htmlFor="kategoriBaru" className="block mb-1 font-medium text-gray-700">Kategori Baru (Jika tidak ada di daftar)</label>
            <input
              id="kategoriBaru"
              type="text"
              value={kategoriBaru}
              onChange={(e) => setKategoriBaru(e.target.value)}
              disabled={kategori !== ''}
              placeholder="Masukkan kategori baru"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                kategori !== '' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Menyimpan...' : 'Tambah Barang'}
          </button>
        </form>
      </div>

      {/* Animasi masuk dari kanan */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
