'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';

interface Barang {
  _id: string;
  nama: string;
  harga: number;
  jumlah: number;
  kategori: string;
}

interface KategoriGroup {
  nama: string;
  barang: Barang[];
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function KategoriPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [kategoriData, setKategoriData] = useState<KategoriGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKategori, setSearchKategori] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [hapusAnim, setHapusAnim] = useState<string[]>([]); // array nama kategori yang dihapus

  // cek login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  // fetch data barang
  const fetchData = async () => {
    try {
      const res = await fetch('/api/barang');
      const data: Barang[] = await res.json();
      const grouped = data.reduce<Record<string, Barang[]>>((acc, curr) => {
        if (!acc[curr.kategori]) acc[curr.kategori] = [];
        acc[curr.kategori].push(curr);
        return acc;
      }, {});

      const result: KategoriGroup[] = Object.keys(grouped).map(key => ({
        nama: key,
        barang: grouped[key],
      }));

      setKategoriData(result);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data barang. Coba refresh halaman.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) fetchData();
  }, [checkingAuth]);

  // filter kategori sesuai input
  const filteredKategori = useMemo(() => {
    return kategoriData.filter(kat =>
      kat.nama.toLowerCase().includes(searchKategori.toLowerCase())
    );
  }, [kategoriData, searchKategori]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
    setTimeout(() => setToast(null), 3000);
  };

  // Hapus kategori
  const handleHapusKategori = async (namaKategori: string) => {
    if (!confirm(`Hapus kategori "${namaKategori}" beserta semua barangnya?`)) return;

    try {
      // trigger animasi fade-out
      setHapusAnim(prev => [...prev, namaKategori]);

      const res = await fetch(`/api/kategori?nama=${encodeURIComponent(namaKategori)}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');

        // hapus dari state setelah animasi 500ms
        setTimeout(() => {
          setKategoriData(prev => prev.filter(k => k.nama !== namaKategori));
          setHapusAnim(prev => prev.filter(k => k !== namaKategori));
        }, 500);
      } else {
        showToast(data.message || 'Gagal hapus kategori', 'error');
        // batalkan animasi jika gagal
        setHapusAnim(prev => prev.filter(k => k !== namaKategori));
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal hapus kategori', 'error');
      setHapusAnim(prev => prev.filter(k => k !== namaKategori));
    }
  };

  if (checkingAuth || loading) {
    return <div className="text-center mt-10 text-gray-600">Memuat data...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  if (kategoriData.length === 0) {
    return <div className="text-center mt-10 text-gray-600">Tidak ada kategori yang ditemukan.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white 
            transform transition-all duration-500 ease-in-out
            ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            ${toastVisible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Daftar Kategori Barang</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchKategori}
          onChange={e => setSearchKategori(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition"
          aria-label="Cari kategori barang"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredKategori.map(kategori => (
          <div
            key={kategori.nama}
            className={`bg-white border border-gray-200 shadow-sm hover:shadow-lg rounded-xl p-5 transition-all duration-500 ease-in-out
              ${hapusAnim.includes(kategori.nama) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900">{kategori.nama}</h2>
              <button
                className="p-1 text-red-500 hover:text-red-700"
                onClick={() => handleHapusKategori(kategori.nama)}
                aria-label={`Hapus kategori ${kategori.nama}`}
              >
                <Trash2 size={20} />
              </button>
            </div>

            <ul className="space-y-2">
              {kategori.barang.map(barang => (
                <li
                  key={barang._id}
                  className="flex justify-between items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span className="font-medium">{barang.nama}</span>
                  <span className="text-sm text-gray-600">Rp {barang.harga.toLocaleString('id-ID')}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
