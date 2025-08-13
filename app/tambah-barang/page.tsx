'use client';

import { useState, useEffect } from 'react';

export default function TambahBarangPage() {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [kategori, setKategori] = useState('');
  const [kategoriList, setKategoriList] = useState<string[]>([]);
  const [kategoriBaru, setKategoriBaru] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/kategori')
      .then(res => res.json())
      .then(data => {
        setKategoriList(data.map((k: any) => k.nama));
      })
      .catch(err => console.error('Gagal fetch kategori:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim() || !harga || !jumlah) {
      alert('Mohon isi semua field dengan benar.');
      return;
    }

    if (kategori.trim() === '' && kategoriBaru.trim() === '') {
      alert('Pilih kategori atau masukkan kategori baru.');
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
          harga: Number(harga),
          jumlah: Number(jumlah),
          kategori: kategoriFinal,
        }),
      });

      const result = await res.json();
      alert(result.message || 'Barang berhasil ditambahkan');

      // Reset form
      setNama('');
      setHarga('');
      setJumlah('');
      setKategori('');
      setKategoriBaru('');
    } catch (error) {
      console.error('Error menambahkan barang:', error);
      alert('Terjadi kesalahan saat menambahkan barang.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="tambah-barang-title font-bold text-2xl">Tambah Barang</h1>
      <form onSubmit={handleSubmit}>

        {[
          {
            id: 'nama',
            label: 'Nama Barang',
            type: 'text',
            value: nama,
            onChange: setNama,
            placeholder: 'Masukkan nama barang',
          },
          {
            id: 'harga',
            label: 'Harga',
            type: 'number',
            value: harga,
            onChange: setHarga,
            placeholder: 'Masukkan harga barang',
          },
          {
            id: 'jumlah',
            label: 'Jumlah',
            type: 'number',
            value: jumlah,
            onChange: setJumlah,
            placeholder: 'Masukkan jumlah barang',
          },
        ].map(({ id, label, type, value, onChange, placeholder }) => (
          <div key={id} className="mb-4">
            <label htmlFor={id} className="block mb-1 font-medium text-gray-700">
              {label}
            </label>
            <input
              id={id}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
        ))}

        <div className="mb-4">
          <label htmlFor="kategori" className="block mb-1 font-medium text-gray-700">
            Kategori (Pilih dari daftar)
          </label>
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
              <option key={i} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="kategoriBaru" className="block mb-1 font-medium text-gray-700">
            Kategori Baru (Jika tidak ada di daftar)
          </label>
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
  );
}
