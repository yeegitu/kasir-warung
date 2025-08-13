import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('kasir');

    const result = await db.collection('barang').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Barang berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal menghapus barang', error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
    }

    const { nama, harga, jumlah, kategori } = await req.json();

    if (!nama || !harga || !jumlah || !kategori) {
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
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal update barang', error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID tidak valid' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('kasir');

    const barang = await db.collection('barang').findOne({ _id: new ObjectId(id) });

    if (!barang) {
      return NextResponse.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(barang);
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal fetch barang', error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

