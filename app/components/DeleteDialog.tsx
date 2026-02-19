"use client";

import { useTransition } from "react";
import { deleteTask } from "@/app/actions";
import { Task } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  task: Task;
  onClose: () => void;
}

export default function DeleteDialog({ task, onClose }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id);
      toast.success("Tâche supprimée");
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold">Supprimer la tâche</h2>
        <p className="mb-6 text-sm text-gray-600">
          Voulez-vous supprimer{" "}
          <span className="font-medium text-gray-800">«{task.title}»</span> ?
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
