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

    // Cek case-insensitive
    const existing = await db.collection('kategori').findOne({ nama: { $regex: `^${nama}$`, $options: 'i' } });

    if (!existing) {
      await db.collection('kategori').insertOne({ nama });
    } else {
      return NextResponse.json({ message: 'Kategori sudah ada!' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Kategori disimpan' });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Gagal tambah kategori', error: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
}

// DELETE hapus kategori beserta semua barangnya
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nama = searchParams.get('nama');

    if (!nama) {
      return NextResponse.json(
        { message: 'Nama kategori wajib diberikan' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kasir');

    // Hapus semua barang dengan kategori itu (case-insensitive)
    await db.collection('barang').deleteMany({
      kategori: { $regex: `^${nama}$`, $options: 'i' },
    });

    // Hapus kategori
    const delResult = await db.collection('kategori').deleteOne({
      nama: { $regex: `^${nama}$`, $options: 'i' },
    });

    if (delResult.deletedCount === 0) {
      return NextResponse.json({ message: `Kategori "${nama}" tidak ditemukan.` }, { status: 404 });
    }

    return NextResponse.json({ message: `Kategori "${nama}" dan semua barangnya berhasil dihapus.` });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Gagal hapus kategori', error: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
}
