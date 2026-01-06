import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SeatEditor from "./seat-editor";
import { Toaster } from "sonner";

// FIX: Type definition and async usage for Next.js 15+
type Props = {
  params: Promise<{ id: string }>;
};

export default async function HallEditorPage({ params }: Props) {
  // FIX: Await the params
  const { id } = await params;

  if (!id) redirect("/admin/halls");

  const hall = await prisma.hall.findUnique({
    where: { id },
    include: { seats: true },
  });

  if (!hall) redirect("/admin/halls");

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "#0a0a0a",
            border: "1px solid #1f1f1f",
            color: "#fff",
          },
        }}
      />

      <div className="animate-in fade-in duration-700">
        <div className="flex justify-between items-center pb-6 mb-8 border-b border-[#1a1a1a]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
              {hall.name} <span className="text-emerald-500">Editor</span>
            </h1>
            <p className="text-sm text-gray-500">
              Configure seat layout and types
            </p>
          </div>
        </div>

        <SeatEditor
          hallId={hall.id}
          initialRows={hall.totalRows}
          initialCols={hall.totalCols}
          existingSeats={hall.seats}
        />
      </div>
    </>
  );
}
