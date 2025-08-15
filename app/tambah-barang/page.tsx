'use client';

import { useState, useEffect } from 'react';

interface Kategori {
  nama: string;
}

interface Barang {
  _id: string;
  nama: string;
  harga: number;
  jumlah: number;
  kategori: string;
}

export default function TambahBarangPage() {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriList, setKategoriList] = useState<string[]>([]);
  const [kategoriBaru, setKategoriBaru] = useState('');
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch kategori saat mount
  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      const res = await fetch('/api/kategori');
      const data: Kategori[] = await res.json();
      setKategoriList(data.map(k => k.nama.trim()));
    } catch (error) {
      console.error(error);
      showToast('Gagal fetch kategori', 'error');
    }
  };

  // Reset kategori jika sudah tidak ada di list
  useEffect(() => {
    if (
      kategori &&
      !kategoriList.some(k => k.trim().toLowerCase() === kategori.trim().toLowerCase())
    ) {
      setKategori('');
    }
  }, [kategoriList, kategori]);

  const formatHarga = (value: string) => {
    const angka = value.replace(/\D/g, '');
    return angka ? parseInt(angka, 10).toLocaleString('id-ID') : '';
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Normalisasi kategori: huruf pertama kapital
  const normalizeKategori = (nama: string) => {
    nama = nama.trim().toLowerCase();
    return nama.charAt(0).toUpperCase() + nama.slice(1);
  };

  // Kapitalisasi tiap kata (untuk Nama Barang dan kategoriBaru)
  const capitalizeWords = (text: string) => {
    return text
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Tambah kategori baru
  const addKategoriBaruToList = async (): Promise<string | null> => {
    if (!kategoriBaru.trim()) return null;

    const normalized = normalizeKategori(kategoriBaru);

    const exists = kategoriList.some(
      k => k.trim().toLowerCase() === normalized.toLowerCase()
    );
    if (exists) {
      showToast('Kategori sudah ada!', 'error');
      return null;
    }

    try {
      const res = await fetch('/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: normalized }),
      });
      const data = await res.json();
      if (res.status !== 200) {
        showToast(data.message || 'Gagal tambah kategori', 'error');
        return null;
      }

      await fetchKategori(); // refresh dropdown
      return normalized;
    } catch (error) {
      console.error(error);
      showToast('Gagal tambah kategori', 'error');
      return null;
    }
  };

  // Hapus kategori & semua barang terkait
  const handleHapusKategori = async (kategoriToDelete: string) => {
    if (!kategoriToDelete) return;
    if (!confirm(`Hapus kategori "${kategoriToDelete}" beserta semua barangnya?`)) return;

    try {
      const res = await fetch(
        `/api/kategori?nama=${encodeURIComponent(kategoriToDelete)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        await fetchKategori(); // refresh dropdown

        setBarangList(
          barangList.filter(
            b => b.kategori.trim().toLowerCase() !== kategoriToDelete.trim().toLowerCase()
          )
        );
        setKategori('');
      } else {
        showToast(data.message || 'Gagal hapus kategori', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal hapus kategori', 'error');
    }
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
    let kategoriFinal = kategori.trim() || kategoriBaru.trim();
    kategoriFinal = normalizeKategori(kategoriFinal);

    // Tambah kategori baru jika diisi
    if (kategoriBaru.trim() !== '') {
      const hasilTambah = await addKategoriBaruToList();
      if (!hasilTambah) {
        setLoading(false);
        return;
      }
      kategoriFinal = hasilTambah;
      setKategoriBaru('');
    }

    try {
      const res = await fetch('/api/barang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: capitalizeWords(nama.trim()), // otomatis kapital tiap kata
          harga: Number(harga.replace(/\./g, '')),
          jumlah: Number(jumlah),
          kategori: kategoriFinal,
        }),
      });

      const result = await res.json();
      showToast(result.message || 'Barang berhasil ditambahkan', 'success');

      setBarangList([...barangList, {
        _id: Date.now().toString(),
        nama: capitalizeWords(nama.trim()),
        harga: Number(harga.replace(/\./g, '')),
        jumlah: Number(jumlah),
        kategori: kategoriFinal
      }]);

      setNama('');
      setHarga('');
      setJumlah('');
      setKategori('');
    } catch (error) {
      console.error(error);
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
              onChange={(e) => setNama(capitalizeWords(e.target.value))}
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
            <div className="flex gap-2 items-center">
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                disabled={kategoriBaru.trim() !== ''}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                  kategoriBaru.trim() !== '' ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">-- Pilih Kategori --</option>
                {kategoriList.map((k, i) => (
                  <option key={i} value={k.trim()}>{k.trim()}</option>
                ))}
              </select>

              {kategori && (
                <button
                  type="button"
                  onClick={() => handleHapusKategori(kategori)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Kategori baru */}
          <div className="mb-6">
            <label htmlFor="kategoriBaru" className="block mb-1 font-medium text-gray-700">Kategori Baru (Jika tidak ada di daftar)</label>
            <input
              id="kategoriBaru"
              type="text"
              value={kategoriBaru}
              onChange={(e) => setKategoriBaru(capitalizeWords(e.target.value))}
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
            className={`w-full py-3 rounded-md text-white font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Menyimpan...' : 'Tambah Barang'}
          </button>
        </form>

        {/* Daftar barang */}
        {barangList.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold mb-2 text-black">Daftar Barang</h3>
            <ul className="list-disc ml-5 text-black">
              {barangList.map(b => (
                <li key={b._id}>
                  {b.nama} - {b.kategori} - Rp {b.harga.toLocaleString('id-ID')} ({b.jumlah} pcs)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
      `}</style>
    </>
  );
}
