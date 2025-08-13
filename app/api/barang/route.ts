import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kasir');
    const barang = await db.collection('barang').find({}).toArray();
    return NextResponse.json(barang);
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal fetch barang', error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nama, harga, jumlah, kategori } = await req.json();

    if (!nama || !harga || !jumlah || !kategori) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('kasir');

    const barangCollection = db.collection('barang');
    const kategoriCollection = db.collection('kategori');

    // Cari barang berdasarkan nama
    const existing = await barangCollection.findOne({ nama });

    if (existing) {
      // Jika barang sudah ada → update jumlah & data lainnya
      await barangCollection.updateOne(
        { _id: new ObjectId(existing._id) },
        {
          $set: { harga, kategori },
          $inc: { jumlah }
        }
      );
    } else {
      // Tambah barang baru
      await barangCollection.insertOne({ nama, harga, jumlah, kategori });
    }

    // Simpan kategori kalau belum ada
    const kategoriExists = await kategoriCollection.findOne({ nama: kategori });
    if (!kategoriExists) {
      await kategoriCollection.insertOne({ nama: kategori });
    }

    return NextResponse.json({ message: 'Barang berhasil disimpan' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal tambah barang', error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
