import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kasir');
    const kategori = await db.collection('kategori').find({}).toArray();
    return NextResponse.json(kategori);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal fetch kategori' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nama } = await req.json();
    const client = await clientPromise;
    const db = client.db('kasir');

    const existing = await db.collection('kategori').findOne({ nama });
    if (!existing) {
      await db.collection('kategori').insertOne({ nama });
    }

    return NextResponse.json({ message: 'Kategori disimpan' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal tambah kategori' }, { status: 500 });
  }
}
