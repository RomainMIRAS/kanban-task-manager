"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, Status } from "@/lib/types";
import TaskCard from "./TaskCard";

const COLUMN_STYLES: Record<Status, { header: string; dot: string }> = {
  TODO: { header: "border-slate-300", dot: "bg-slate-400" },
  IN_PROGRESS: { header: "border-blue-400", dot: "bg-blue-500" },
  DONE: { header: "border-green-400", dot: "bg-green-500" },
};

interface Props {
  column: { id: Status; label: string };
  tasks: Task[];
  onTasksChange: (updater: (prev: Task[]) => Task[]) => void;
}

export default function KanbanColumn({ column, tasks, onTasksChange }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const style = COLUMN_STYLES[column.id];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-2 bg-white transition-colors ${
        isOver ? "border-indigo-400 bg-indigo-50/40" : "border-gray-200"
      }`}
    >
      {/* Column header */}
      <div className={`flex items-center gap-2 border-b-2 px-4 py-3 ${style.header}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
        <span className="font-semibold text-gray-700">{column.label}</span>
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-col gap-3 p-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTasksChange={onTasksChange} />
          ))}
          {tasks.length === 0 && (
            <p className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Glissez une tâche ici
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
