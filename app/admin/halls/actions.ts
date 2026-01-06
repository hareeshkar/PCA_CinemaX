"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// NEW: Save the visual layout changes
export async function saveHallLayout(hallId: string, seats: any[]) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Clear existing seats
      await tx.seat.deleteMany({ where: { hallId } });

      // 2. Insert new configuration
      if (seats.length > 0) {
        await tx.seat.createMany({
          data: seats.map((s) => ({
            hallId,
            rowLabel: s.rowLabel,
            number: s.number,
            gridRow: s.gridRow,
            gridCol: s.gridCol,
            type: s.type,
            status: s.status || "Available",
          })),
        });
      }
    });

    revalidatePath(`/admin/halls/${hallId}`);
    return { success: true, message: "Layout saved successfully" };
  } catch (e: any) {
    console.error("Save Layout Error:", e);
    return { success: false, error: "Failed to save layout" };
  }
}

export async function createHall(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const rows = parseInt(formData.get("rows") as string);
  const cols = parseInt(formData.get("cols") as string);

  if (!name || rows < 1 || cols < 1) {
    return { success: false, error: "Invalid hall configuration" };
  }

  try {
    // ENTERPRISE PATTERN: Database Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create Hall
      const hall = await tx.hall.create({
        data: {
          name,
          type,
          totalRows: rows,
          totalCols: cols,
        },
      });

      // 2. Generate Seats Matrix
      const seatsData = [];

      // Loop Rows (Visual Y)
      for (let r = 0; r < rows; r++) {
        // Generate Label: Row 0 = "A", Row 1 = "B"
        // Note: In cinemas, usually A is at the BOTTOM (screen), but for editing logic A=Top is easier.
        // We can let the visual editor handle the display logic.
        const rowLabel = String.fromCharCode(65 + r);

        // Loop Cols (Visual X)
        for (let c = 0; c < cols; c++) {
          seatsData.push({
            hallId: hall.id,
            rowLabel: rowLabel, // Schema updated from 'row' to 'rowLabel'
            number: c + 1, // Seat Number 1, 2, 3...
            gridRow: r, // NEW: Required by Phase 5 Schema
            gridCol: c, // NEW: Required by Phase 5 Schema
            type: "Standard",
          });
        }
      }

      // 3. Bulk Insert
      await tx.seat.createMany({
        data: seatsData,
      });
    });

    revalidatePath("/admin/halls");
    return { success: true, message: `Hall "${name}" created successfully.` };
  } catch (error: any) {
    console.error("Hall Creation Error:", error);
    return { success: false, error: `Failed: ${error.message}` };
  }
}

export async function deleteHall(id: string) {
  try {
    await prisma.hall.delete({ where: { id } });
    revalidatePath("/admin/halls");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Cannot delete hall. It may have active shows.",
    };
  }
}
