import { serverApi } from "@/lib/server-api";
import { MinorExportClient } from "./client";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MinorExportPage() {
  const isAuthed = await requireAuth();
  if (!isAuthed) {
    redirect("/");
  }

  const initialSprints = await serverApi.minor.sprints.list().catch(() => []);

  return <MinorExportClient initialSprints={initialSprints} />;
}
