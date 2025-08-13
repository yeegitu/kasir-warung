'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react'; // npm install lucide-react

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Halaman yang diizinkan untuk menampilkan sidebar
  const allowedPaths = ['/barang', '/kategori', '/tambah-barang'];
  const showSidebar = allowedPaths.some(path => pathname.startsWith(path));

  if (!showSidebar) return null;

  const handleLogout = () => {
    router.replace('/');
  };

  const menuItems = [
    { label: 'Barang', href: '/barang' },
    { label: 'Kategori', href: '/kategori' },
    { label: 'Tambah Barang', href: '/tambah-barang' },
  ];

  return (
    <>
      {/* Tombol hamburger (mobile) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
        aria-label="Buka menu navigasi"
        title="Buka menu navigasi"
      >
        <Menu size={20} />
      </button>

      {/* Overlay gelap (mobile) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 bg-gray-800 text-white w-64 min-h-screen p-6 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:block
        `}
      >
        {/* Header mobile */}
        <div className="flex justify-between items-center mb-8 md:hidden">
          <h2 className="text-xl font-bold">Kasir Admin</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 bg-gray-700 rounded-md"
            aria-label="Tutup menu navigasi"
            title="Tutup menu navigasi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Header desktop */}
        <h2 className="text-xl font-bold mb-8 hidden md:block">Kasir Admin</h2>

        {/* Menu navigasi */}
        <ul className="flex flex-col gap-4">
          {menuItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-2 py-1 rounded hover:text-gray-300 ${
                  pathname === item.href ? 'bg-gray-700 font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="hover:text-gray-300 text-left w-full"
              aria-label="Logout dari aplikasi"
              title="Logout dari aplikasi"
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
}
