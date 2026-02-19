export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export const COLUMNS: { id: Status; label: string }[] = [
  { id: "TODO", label: "À faire" },
  { id: "IN_PROGRESS", label: "En cours" },
  { id: "DONE", label: "Terminé" },
];

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string }
> = {
  LOW: { label: "Faible", color: "bg-slate-100 text-slate-600" },
  MEDIUM: { label: "Moyen", color: "bg-amber-100 text-amber-700" },
  HIGH: { label: "Élevé", color: "bg-red-100 text-red-700" },
};
