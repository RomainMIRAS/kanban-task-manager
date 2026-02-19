"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useTransition } from "react";
import { moveTask } from "@/app/actions";
import { Task, Status, COLUMNS } from "@/lib/types";
import { toast } from "sonner";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

interface Props {
  initialTasks: Task[];
}

export default function KanbanBoard({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // overId peut être un column ID ou un task ID
    const newStatus = (
      COLUMNS.map((c) => c.id).includes(overId as Status)
        ? overId
        : tasks.find((t) => t.id === overId)?.status
    ) as Status | undefined;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || !newStatus || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    startTransition(async () => {
      const result = await moveTask(taskId, newStatus);
      if (!result?.success) {
        toast.error("Erreur lors du déplacement");
        setTasks(initialTasks);
      }
    });
  }

  const tasksByStatus = (status: Status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
              <p className="text-sm text-gray-500">
                {tasks.length} tâche{tasks.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              + Nouvelle tâche
            </button>
          </div>
        </header>

        {/* Board */}
        <main className="mx-auto max-w-7xl p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={tasksByStatus(col.id)}
                  onTasksChange={setTasks}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="rotate-2 opacity-90">
                  <TaskCard task={activeTask} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>

      {/* Modal création */}
      {showCreate && (
        <TaskModal
          onClose={() => {
            setShowCreate(false);
            // Refresh via server revalidation, tasks will update on next navigation
            // For instant update we rely on revalidatePath
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
