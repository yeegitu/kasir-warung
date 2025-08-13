'use client';

import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      {/* Header */}
      <header className="mb-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Halaman Dashboard
        </h1>
      </header>

      {/* Statistik ringkas */}
      <section className="w-full max-w-md mb-12">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-gray-600 font-semibold mb-4">Web Pembuatan Nota Kasir</h2>
          <p className="text-3xl font-bold text-purple-600">Toko XYZ</p>
        </div>
      </section>

      {/* Tombol Login */}
      <button
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
        onClick={() => {
          // Kalau mau langsung ke halaman login, bisa ganti location.href
          // Tapi kalau logout, biasanya hapus token/session dulu, di sini aku buat tombol Login saja
          window.location.href = '/login';
        }}
      >
        Login
      </button>
    </div>
  );
}
