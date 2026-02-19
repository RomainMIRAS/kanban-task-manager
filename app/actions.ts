"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";

export async function getTasks() {
  return prisma.task.findMany({ orderBy: [{ status: "asc" }, { order: "asc" }] });
}

export async function createTask(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priority = (formData.get("priority") as string) || "LOW";

  if (!title) return { error: "Le titre est requis" };

  const lastTask = await prisma.task.findFirst({
    where: { status: "TODO" },
    orderBy: { order: "desc" },
  });

  await prisma.task.create({
    data: {
      title,
      description,
      priority,
      status: "TODO",
      order: (lastTask?.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateTask(id: string, formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priority = (formData.get("priority") as string) || "LOW";

  if (!title) return { error: "Le titre est requis" };

  await prisma.task.update({
    where: { id },
    data: { title, description, priority },
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

export async function moveTask(id: string, newStatus: Status) {
  const lastTask = await prisma.task.findFirst({
    where: { status: newStatus },
    orderBy: { order: "desc" },
  });

  await prisma.task.update({
    where: { id },
    data: { status: newStatus, order: (lastTask?.order ?? -1) + 1 },
  });

  revalidatePath("/");
  return { success: true };
}
