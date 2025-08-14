import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Barang {
  _id: string;
  nama: string;
  harga: number;
  jumlah: number;
  kategori: string;
}

// Helper: validasi ID MongoDB
const validateId = (id: string) => id && ObjectId.isValid(id);

// GET single barang by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ⬅️ diubah jadi Promise
) {
  const { id } = await context.params; // ⬅️ harus di-await

  if (!validateId(id)) {
    return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('kasir');
    const barang = await db.collection('barang').findOne({ _id: new ObjectId(id) });

    if (!barang) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...barang,
      _id: barang._id.toString(), // konversi ObjectId ke string
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Gagal mengambil barang', error: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}

// PUT update barang by ID
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ⬅️ diubah jadi Promise
) {
  const { id } = await context.params; // ⬅️ harus di-await

  if (!validateId(id)) {
    return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
  }

  try {
    const { nama, harga, jumlah, kategori }: Barang = await req.json();

    if (!nama || harga == null || jumlah == null || !kategori) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('kasir');
    const result = await db.collection('barang').updateOne(
      { _id: new ObjectId(id) },
      { $set: { nama, harga, jumlah, kategori } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Barang berhasil diupdate' });
  } catch (err) {
    return NextResponse.json(
      { message: 'Gagal update barang', error: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}

// DELETE barang by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ⬅️ ubah jadi Promise
) {
  const { id } = await context.params; // ⬅️ harus di-await

  if (!validateId(id)) {
    return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('kasir');
    const result = await db.collection('barang').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Barang berhasil dihapus' });
  } catch (err) {
    return NextResponse.json(
      { message: 'Gagal menghapus barang', error: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}
