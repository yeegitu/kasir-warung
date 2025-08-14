import { ObjectId } from "mongodb";
import { getNotaCollection } from "@/models/nota";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> } // ⬅️ ubah ke Promise
) {
  try {
    const { id } = await context.params; // ⬅️ harus di-await
    const notaCollection = await getNotaCollection();
    const nota = await notaCollection.findOne({ _id: new ObjectId(id) });

    if (!nota) {
      return new Response(JSON.stringify({ error: "Nota tidak ditemukan" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(nota), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Gagal mengambil nota" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> } // ⬅️ ubah ke Promise
) {
  try {
    const { id } = await context.params; // ⬅️ harus di-await
    const notaCollection = await getNotaCollection();
    const deleteResult = await notaCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Nota tidak ditemukan" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Nota berhasil dihapus" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Gagal menghapus nota" }), {
      status: 500,
    });
  }
}
