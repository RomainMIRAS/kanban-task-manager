"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, PRIORITY_CONFIG } from "@/lib/types";
import TaskModal from "./TaskModal";
import DeleteDialog from "./DeleteDialog";

interface Props {
  task: Task;
  isDragging?: boolean;
  onTasksChange?: (updater: (prev: Task[]) => Task[]) => void;
}

export default function TaskCard({ task, isDragging, onTasksChange }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];

  function handleClose() {
    setShowEdit(false);
    setShowDelete(false);
    window.location.reload();
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition ${
          isDragging || isSortableDragging
            ? "opacity-40 shadow-lg ring-2 ring-indigo-400"
            : "hover:shadow-md"
        }`}
      >
        {/* Drag handle + actions */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          >
            ⠿
          </div>
          <h3 className="flex-1 text-sm font-medium text-gray-800 leading-snug">
            {task.title}
          </h3>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setShowEdit(true)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Modifier"
            >
              ✏️
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>

        {task.description && (
          <p className="mb-2 ml-5 text-xs text-gray-500 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="ml-5">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priority.color}`}
          >
            {priority.label}
          </span>
        </div>
      </div>

      {showEdit && <TaskModal task={task} onClose={handleClose} />}
      {showDelete && <DeleteDialog task={task} onClose={handleClose} />}
    </>
  );
}
