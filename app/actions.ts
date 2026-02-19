"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Status } from "@/lib/types";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

function sanitizePriority(raw: FormDataEntryValue | null): string {
  return VALID_PRIORITIES.includes(raw as (typeof VALID_PRIORITIES)[number])
    ? (raw as string)
    : "LOW";
}

export async function getTasks() {
  return prisma.task.findMany({ orderBy: [{ status: "asc" }, { order: "asc" }] });
}

export async function createTask(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priority = sanitizePriority(formData.get("priority"));

  if (!title) return { error: "Le titre est requis" };

  try {
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
  } catch (e) {
    console.error("[createTask]", e);
    return { error: "Impossible de créer la tâche" };
  }
}

export async function updateTask(id: string, formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priority = sanitizePriority(formData.get("priority"));

  if (!title) return { error: "Le titre est requis" };

  try {
    await prisma.task.update({
      where: { id },
      data: { title, description, priority },
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("[updateTask]", e);
    return { error: "Impossible de mettre à jour la tâche" };
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("[deleteTask]", e);
    return { error: "Impossible de supprimer la tâche" };
  }
}

export async function moveTask(id: string, newStatus: Status) {
  try {
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
  } catch (e) {
    console.error("[moveTask]", e);
    return { error: "Impossible de déplacer la tâche" };
  }
}
