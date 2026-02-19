import { getTasks } from "@/app/actions";
import KanbanBoard from "@/app/components/KanbanBoard";
import { Task } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tasks = await getTasks();
  return <KanbanBoard initialTasks={tasks as Task[]} />;
}
