'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';

interface BarangTerpilih {
  _id: string;
  nama: string;
  harga: number;
  jumlah: number;
  kategori?: string;
}

export default function NotaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get('items');
  const [barangTerpilih, setBarangTerpilih] = useState<BarangTerpilih[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    if (!itemsParam) {
      setBarangTerpilih([]);
      return;
    }
    setLoading(true);
    const parsedItems = itemsParam.split(',').map(item => {
      const [id, jumlah] = item.split(':');
      return { id: id.trim(), jumlah: Number(jumlah) };
    });

    fetch('/api/barang')
      .then(res => res.json())
      .then((data: BarangTerpilih[]) => {
        const filtered = data.filter(b =>
          parsedItems.some(item => item.id === String(b._id))
        );

        const finalData = filtered.map(b => {
          const sel = parsedItems.find(item => item.id === String(b._id));
          return { ...b, jumlah: sel?.jumlah ?? 1 };
        });

        setBarangTerpilih(finalData);
      })
      .catch(err => {
        console.error('Gagal fetch data barang:', err);
        setBarangTerpilih([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [itemsParam]);

  if (checkingAuth) return null;

  const totalHarga = barangTerpilih.reduce(
    (total, b) => total + b.harga * b.jumlah,
    0
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

  const printNota = () => {
    window.print();
  };

  const tambahJumlah = (id: string) => {
    setBarangTerpilih(prev =>
      prev.map(item =>
        item._id === id ? { ...item, jumlah: item.jumlah + 1 } : item
      )
    );
  };

  const kurangiJumlah = (id: string) => {
    setBarangTerpilih(prev =>
      prev.map(item =>
        item._id === id && item.jumlah > 1
          ? { ...item, jumlah: item.jumlah - 1 }
          : item
      )
    );
  };

  const hapusBarang = (id: string) => {
    setBarangTerpilih(prev => prev.filter(item => item._id !== id));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
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
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2">{b.jumlah}</span>
                        <button
                          onClick={() => tambahJumlah(b._id)}
                          className="bg-gray-300 text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                          aria-label="Tambah jumlah"
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
                        aria-label="Hapus barang"
                        title="Hapus barang"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Total */}
                <tr className="font-bold bg-gray-50">
                  <td colSpan={3} className="text-right p-2">Total Keseluruhan</td>
                  <td className="text-right p-2">Rp {totalHarga.toLocaleString('id-ID')}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tombol aksi */}
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

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          table, table * {
            visibility: visible;
          }
          table {
            position: fixed;
            top: 10mm;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 80mm;
            font-family: monospace !important;
            font-size: clamp(8pt, 1.5vw, 12pt) !important;
            border-collapse: collapse !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
