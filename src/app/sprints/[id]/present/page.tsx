import { serverApi } from "@/lib/server-api";
import { notFound, redirect } from "next/navigation";
import { SprintPresentClient } from "./client";
import { requireAuth } from "@/lib/auth";

export default async function MinorSprintPresentPage({ params }: { params: Promise<{ id: string }> }) {
  const isAuthed = await requireAuth();
  const { id } = await params;
  const sprintId = Number(id);
  if (isNaN(sprintId)) notFound();

  if (!isAuthed) {
    redirect(`/sprints/${sprintId}`);
  }

  const [sprint, storyTypes] = await Promise.all([
    serverApi.minor.sprints.get(sprintId).catch(() => null),
    serverApi.minor.storyTypes.list().catch(() => []),
  ]);
  if (!sprint) notFound();

  return <SprintPresentClient initialSprint={sprint} initialStoryTypes={storyTypes} />;
}
