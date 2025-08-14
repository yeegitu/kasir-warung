'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Edit2, Trash2, Minus, Plus } from 'lucide-react';

// Interface barang sesuai API
export interface Barang {
  _id: string;
  nama: string;
  harga: number;
  jumlah: number;
  kategori: string;
}

interface SelectedBarang {
  id: string;
  nama: string;
  harga: number;
  jumlah: number;
}

export default function BarangPage() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [filteredBarang, setFilteredBarang] = useState<Barang[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedBarang[]>([]);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [searchNama, setSearchNama] = useState('');
  const [searchKategori, setSearchKategori] = useState('');
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    fetchBarang();
  }, [checkingAuth]);

  const fetchBarang = () => {
    setLoading(true);
    fetch('/api/barang')
      .then(res => res.json())
      .then((data: Barang[]) => {
        setBarang(data);
        setFilteredBarang(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const filtered = barang.filter(
      b =>
        b.nama.toLowerCase().includes(searchNama.toLowerCase()) &&
        b.kategori.toLowerCase().includes(searchKategori.toLowerCase())
    );
    setFilteredBarang(filtered);
  }, [searchNama, searchKategori, barang]);

  if (checkingAuth || loading) {
    return <div className="text-center mt-10">Memuat data barang...</div>;
  }

  const toggleSelect = (item: Barang) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item._id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item._id);
      } else {
        return [...prev, { id: item._id, nama: item.nama, harga: item.harga, jumlah: 1 }];
      }
    });
  };

  const updateJumlah = (id: string, newJumlah: number) => {
    if (newJumlah < 1) return;
    setSelectedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, jumlah: newJumlah } : item))
    );
  };

  const buatNota = () => {
    if (selectedItems.length === 0) {
      alert('Pilih minimal 1 barang dulu ya!');
      return;
    }
    const notaItems = selectedItems.map(item => `${item.id}:${item.jumlah}`).join(',');
    router.push(`/nota?items=${encodeURIComponent(notaItems)}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/barang/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus barang ini?')) return;
    setLoadingDelete(id);
    try {
      const res = await fetch(`/api/barang/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Barang berhasil dihapus');
        fetchBarang();
        setSelectedItems([]);
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal menghapus barang');
      }
    } catch (error) {
      alert('Error menghapus barang');
      console.error(error);
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative px-2 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-left">Daftar Barang</h1>

      {/* Pencarian */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Cari nama barang..."
          value={searchNama}
          onChange={e => setSearchNama(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchKategori}
          onChange={e => setSearchKategori(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500"
        />
      </div>

      {/* Table Desktop */}
      <div className="hidden sm:block bg-white shadow rounded-lg p-4 sm:p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="min-w-full border border-gray-300 text-gray-800 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left border-b border-gray-300">
              <th className="p-2 border-r border-gray-300 w-10">
                <span className="sr-only">Pilih</span>
              </th>
              <th className="p-2 border-r border-gray-300">Nama</th>
              <th className="p-2 border-r border-gray-300">Harga</th>
              <th className="p-2 border-r border-gray-300 text-center">Jumlah</th>
              <th className="p-2 border-r border-gray-300">Kategori</th>
              <th className="p-2 border-l border-gray-300 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredBarang.map(b => {
              const selectedItem = selectedItems.find(item => item.id === b._id);
              const isChecked = !!selectedItem;

              return (
                <tr key={b._id} className="border-t border-gray-300 hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-300 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(b)}
                      aria-label={`Pilih ${b.nama}`}
                    />
                  </td>
                  <td className="p-2 border-r border-gray-300">{b.nama}</td>
                  <td className="p-2 border-r border-gray-300 whitespace-nowrap">
                    Rp {b.harga.toLocaleString('id-ID')}
                  </td>
                  <td className="p-2 border-r border-gray-300 text-center">
                    {isChecked ? (
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => updateJumlah(b._id, selectedItem.jumlah - 1)}
                          className="bg-gray-200 p-1 rounded-full"
                          aria-label="Kurangi jumlah item"
                          title="Kurangi jumlah item"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-1 font-medium text-black">{selectedItem.jumlah}</span>
                        <button
                          type="button"
                          onClick={() => updateJumlah(b._id, selectedItem.jumlah + 1)}
                          className="bg-gray-200 p-1 rounded-full"
                          aria-label="Tambah jumlah item"
                          title="Tambah jumlah item"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <span>{b.jumlah}</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-gray-300">{b.kategori}</td>
                  <td className="p-2 border-l border-gray-300 text-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(b._id)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded"
                      aria-label="Edit item"
                      title="Edit item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b._id)}
                      disabled={loadingDelete === b._id}
                      className={`p-1 rounded text-white ${
                        loadingDelete === b._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {loadingDelete === b._id ? <span className="text-xs">...</span> : <Trash2 size={16} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card */}
      <div className="sm:hidden space-y-4">
        {filteredBarang.map(b => {
          const selectedItem = selectedItems.find(item => item.id === b._id);
          const isChecked = !!selectedItem;

          return (
            <div key={b._id} className="border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-800">{b.nama}</h2>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(b)}
                  aria-label={`Pilih ${b.nama}`}
                  title={`Pilih ${b.nama}`}
                />
              </div>
              <p className="text-sm text-gray-600 mb-1">Harga: Rp {b.harga.toLocaleString('id-ID')}</p>
              <p className="text-sm text-gray-600 mb-1">Kategori: {b.kategori}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => updateJumlah(b._id, selectedItem ? selectedItem.jumlah - 1 : 1)}
                    disabled={!isChecked}
                    className="bg-gray-300 p-2 rounded-full"
                    aria-label="Kurangi jumlah item"
                    title="Kurangi jumlah item"
                  >
                    <Minus size={16} className="text-white" />
                  </button>
                  <span className="px-2 font-medium text-black">{isChecked ? selectedItem.jumlah : 0}</span>
                  <button
                    type="button"
                    onClick={() => updateJumlah(b._id, selectedItem ? selectedItem.jumlah + 1 : 1)}
                    disabled={!isChecked}
                    className="bg-gray-300 p-2 rounded-full"
                    aria-label="Tambah jumlah item"
                    title="Tambah jumlah item"
                  >
                    <Plus size={16} className="text-white" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(b._id)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded"
                    aria-label="Edit item"
                    title="Edit item"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b._id)}
                    disabled={loadingDelete === b._id}
                    className={`p-1 rounded text-white ${
                      loadingDelete === b._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {loadingDelete === b._id ? <span className="text-xs">...</span> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tombol Buat Nota Mengambang */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={buatNota}
          disabled={selectedItems.length === 0}
          className={`px-5 py-3 rounded shadow text-white font-semibold transition-colors duration-200 ${
            selectedItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Buat Nota
        </button>
      </div>
    </div>
  );
}
