import { NextResponse } from "next/server";
import { getNotaCollection } from "@/models/nota";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validasi minimal
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Data barang kosong" }, { status: 400 });
    }

    // Pastikan semua harga & jumlah adalah number
    const items = body.items.map((item: any) => ({
      nama: String(item.nama || "").trim(),
      harga: Number(item.harga) || 0,
      jumlah: Number(item.jumlah) || 0
    }));

    const col = await getNotaCollection();
    const result = await col.insertOne({
      items,
      tanggal: new Date()
    });

    return NextResponse.json(
      { _id: result.insertedId, items, tanggal: new Date() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error membuat nota:", error);
    return NextResponse.json({ error: "Gagal membuat nota" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const col = await getNotaCollection();
    // Urutkan dari nota terbaru
    const notaList = await col.find().sort({ tanggal: -1 }).toArray();
    return NextResponse.json(notaList);
  } catch (error) {
    console.error("Error ambil nota:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
