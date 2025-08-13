'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

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

export default function KategoriPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [kategoriData, setKategoriData] = useState<KategoriGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKategori, setSearchKategori] = useState("");

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
  useEffect(() => {
    if (checkingAuth) return;

    fetch('/api/barang')
      .then(res => res.json())
      .then((data: Barang[]) => {
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
      })
      .catch(error => {
        console.error('Gagal mengambil data:', error);
        setError('Gagal memuat data barang. Coba refresh halaman.');
        setLoading(false);
      });
  }, [checkingAuth]);

  // filter kategori sesuai input
  const filteredKategori = useMemo(() => {
    return kategoriData.filter(kat =>
      kat.nama.toLowerCase().includes(searchKategori.toLowerCase())
    );
  }, [kategoriData, searchKategori]);

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
            className="bg-white border border-gray-200 shadow-sm hover:shadow-lg rounded-xl p-5 transition-all duration-300 ease-in-out"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">{kategori.nama}</h2>
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
