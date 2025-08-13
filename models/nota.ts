import clientPromise from "@/lib/mongodb";

export async function getNotaCollection() {
  const client = await clientPromise;
  return client.db("kasir-warung").collection("nota");
}
