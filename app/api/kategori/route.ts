import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface Kategori {
  nama: string;
}

// GET semua kategori
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kasir');

    const result = await db.collection('kategori').find({}).toArray();

    // Mapping agar sesuai interface Kategori
    const kategori: Kategori[] = result.map(item => ({
      nama: item.nama as string,
    }));

    return NextResponse.json(kategori);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Gagal fetch kategori', error: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
}

// POST tambah kategori baru
export async function POST(req: NextRequest) {
  try {
    const { nama }: Kategori = await req.json();

    if (!nama || nama.trim() === '') {
      return NextResponse.json(
        { message: 'Nama kategori tidak boleh kosong' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kasir');

    // Cek apakah kategori sudah ada
    const existing = await db.collection('kategori').findOne({ nama });

    if (!existing) {
      await db.collection('kategori').insertOne({ nama });
    }

    return NextResponse.json({ message: 'Kategori disimpan' });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Gagal tambah kategori', error: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
}
