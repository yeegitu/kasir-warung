import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getNotaCollection } from "@/models/nota";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const col = await getNotaCollection();
    const nota = await col.findOne({ _id: new ObjectId(params.id) });

    if (!nota) {
      return NextResponse.json({ error: "Nota tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(nota);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil nota" }, { status: 500 });
  }
}
