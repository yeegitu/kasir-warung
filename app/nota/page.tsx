'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, Search } from 'lucide-react';

interface Barang {
  _id: string;
  nama: string;
  harga: number;
  kategori: string;
}

interface BarangTerpilih extends Barang {
  jumlah: number;
}

function NotaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get('items');

  const [barangTerpilih, setBarangTerpilih] = useState<BarangTerpilih[]>([]);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [showTambahBarang, setShowTambahBarang] = useState(false);
  const [searchBarang, setSearchBarang] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/barang');
      const data: Barang[] = await res.json();
      setBarangList(data);

      if (itemsParam) {
        const parsedItems = itemsParam.split(',').map(item => {
          const [id, jumlah] = item.split(':');
          return { id: id.trim(), jumlah: Number(jumlah) };
        });

        const finalData = data
          .filter(b => parsedItems.some(item => item.id === String(b._id)))
          .map(b => {
            const sel = parsedItems.find(item => item.id === String(b._id));
            return { ...b, jumlah: sel?.jumlah ?? 1 };
          });

        setBarangTerpilih(finalData);
      }
    } catch (err) {
      console.error('Gagal fetch barang:', err);
      setBarangTerpilih([]);
    } finally {
      setLoading(false);
    }
  }, [itemsParam]);

  // Cek auth & fetch data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setCheckingAuth(false);
      fetchData();
    }
  }, [router, fetchData]);

  if (checkingAuth) return null;

  const totalHarga = barangTerpilih.reduce((total, b) => total + b.harga * b.jumlah, 0);

  const tambahJumlah = (id: string) => {
    setBarangTerpilih(prev =>
      prev.map(item => (item._id === id ? { ...item, jumlah: item.jumlah + 1 } : item))
    );
  };

  const kurangiJumlah = (id: string) => {
    setBarangTerpilih(prev =>
      prev.map(item => (item._id === id && item.jumlah > 1 ? { ...item, jumlah: item.jumlah - 1 } : item))
    );
  };

  const hapusBarang = (id: string) => {
    setBarangTerpilih(prev => prev.filter(item => item._id !== id));
  };

  const handleTambahBarang = (b: Barang) => {
    setBarangTerpilih(prev => {
      const exist = prev.find(item => item._id === b._id);
      if (exist) {
        return prev.map(item => (item._id === b._id ? { ...item, jumlah: item.jumlah + 1 } : item));
      } else {
        return [...prev, { ...b, jumlah: 1 }];
      }
    });
    setShowTambahBarang(false);
    setSearchBarang('');
  };

  const filteredBarang = barangList.filter(b =>
    b.nama.toLowerCase().includes(searchBarang.toLowerCase())
  );

  const generateTextNota = () => {
    if (barangTerpilih.length === 0) return encodeURIComponent('Tidak ada barang yang dibeli.');
    let text = `🧾 *Nota Pembelian*\n\n`;
    barangTerpilih.forEach((b, i) => {
      text += `${i + 1}. ${b.nama}\n`;
      text += `   Harga: Rp ${b.harga.toLocaleString('id-ID')}\n`;
      text += `   Jumlah: ${b.jumlah}\n`;
      text += `   Total: Rp ${(b.harga * b.jumlah).toLocaleString('id-ID')}\n\n`;
    });
    text += `*Total Keseluruhan:* Rp ${totalHarga.toLocaleString('id-ID')}\n\nTerima kasih sudah berbelanja 🙏`;
    return encodeURIComponent(text);
  };

  const shareWhatsApp = () => {
    const text = generateTextNota();
    const waUrl = `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
  };

  const printNota = () => window.print();

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      {/* Tombol Tambah Barang */}
      <div className="flex justify-center mb-4 no-print">
        <button
          onClick={() => setShowTambahBarang(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
          aria-label="Tambah barang"
          title="Tambah barang"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Modal Tambah Barang */}
      {showTambahBarang && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md relative">
            <h2 className="text-lg  text-black font-bold mb-2">Cari Barang</h2>

            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
              onClick={() => setShowTambahBarang(false)}
              aria-label="Tutup modal tambah barang"
              title="Tutup"
            >
              ×
            </button>

            {/* Search */}
            <div className="flex items-center mb-2 border rounded p-1">
              <Search size={18} className="mr-2 text-gray-500" />
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={searchBarang}
                onChange={e => setSearchBarang(e.target.value)}
                className="w-full outline-none text-black"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredBarang.map(b => {
                const alreadyAdded = barangTerpilih.some(item => item._id === b._id);
                return (
                  <div
                    key={b._id}
                    className={`flex justify-between items-center p-1 border-b ${alreadyAdded ? 'bg-gray-200' : ''}`}
                  >
                    <span className="text-black">{b.nama} (Rp {b.harga.toLocaleString('id-ID')})</span>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full disabled:opacity-50"
                      onClick={() => handleTambahBarang(b)}
                      aria-label={`Tambah ${b.nama}`}
                      title="Tambah"
                      disabled={alreadyAdded}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabel Nota */}
      {loading ? (
        <p className="text-center">Memuat data...</p>
      ) : barangTerpilih.length === 0 ? (
        <p className="text-center">Tidak ada barang yang dipilih.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm text-gray-800 border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left border-b border-gray-300">Nama</th>
                  <th className="p-2 text-right border-b border-gray-300">Harga</th>
                  <th className="p-2 text-center border-b border-gray-300">Jumlah</th>
                  <th className="p-2 text-right border-b border-gray-300">Total</th>
                  <th className="p-2 text-center border-b border-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {barangTerpilih.map(b => (
                  <tr key={b._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2">{b.nama}</td>
                    <td className="p-2 text-right">Rp {b.harga.toLocaleString('id-ID')}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => kurangiJumlah(b._id)}
                          className="bg-gray-300 text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                          aria-label="Kurangi jumlah"
                          title="Kurangi"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2">{b.jumlah}</span>
                        <button
                          onClick={() => tambahJumlah(b._id)}
                          className="bg-gray-300 text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                          aria-label="Tambah jumlah"
                          title="Tambah"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-2 text-right">Rp {(b.harga * b.jumlah).toLocaleString('id-ID')}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => hapusBarang(b._id)}
                        className="p-2 bg-red-400 text-white rounded hover:bg-red-700 transition-colors"
                        aria-label={`Hapus ${b.nama}`}
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td colSpan={3} className="text-right p-2">Total Keseluruhan</td>
                  <td className="text-right p-2">Rp {totalHarga.toLocaleString('id-ID')}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4 no-print">
            <button
              onClick={shareWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Bagikan ke WhatsApp
            </button>
            <button
              onClick={printNota}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cetak Nota
            </button>
            <button
              onClick={() => router.push('/barang')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Kembali
            </button>
          </div>
        </>
      )}

      <style jsx global>{`
        @media print {
          @page { size: auto; margin: 10mm; }
          body * { visibility: hidden; }
          table, table * { visibility: visible; }
          table {
            position: fixed; top: 10mm; left: 50%;
            transform: translateX(-50%);
            width: 100%; max-width: 80mm;
            font-family: monospace !important;
            font-size: clamp(8pt, 1.5vw, 12pt) !important;
            border-collapse: collapse !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function NotaPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Memuat...</div>}>
      <NotaContent />
    </Suspense>
  );
}
