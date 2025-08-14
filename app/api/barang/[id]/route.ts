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

// GET single barang by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('kasir');
    const barang = await db.collection('barang').findOne({ _id: new ObjectId(id) });

    if (!barang) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(barang);
  } catch (err) {
    return NextResponse.json(
      { message: 'Gagal mengambil barang', error: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}

// PUT update barang by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id || !ObjectId.isValid(id)) {
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
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id || !ObjectId.isValid(id)) {
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
