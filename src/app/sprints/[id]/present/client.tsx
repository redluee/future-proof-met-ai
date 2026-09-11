"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MinorSprintFull, MinorStoryType, MinorStory } from "@/lib/api";
import { SprintPresentation } from "@/components/minor-presentation/sprint-presentation";
import { useAuth } from "@/components/auth-context";

interface SprintPresentClientProps {
  initialSprint: MinorSprintFull;
  initialStoryTypes: MinorStoryType[];
}

export function SprintPresentClient({ initialSprint, initialStoryTypes }: SprintPresentClientProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [sprint, setSprint] = useState<MinorSprintFull>(initialSprint);
  const [storyTypes] = useState<MinorStoryType[]>(initialStoryTypes || []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/sprints/${initialSprint.id}`);
    }
  }, [isLoading, isAuthenticated, router, initialSprint.id]);

  function handleStoryUpdated(updatedStory: MinorStory) {
    setSprint((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => (s.id === updatedStory.id ? updatedStory : s)),
    }));
  }

  function handleClose() {
    router.push(`/sprints/${sprint.id}`);
  }

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <SprintPresentation
      sprint={sprint}
      storyTypes={storyTypes}
      onClose={handleClose}
      onStoryUpdated={handleStoryUpdated}
    />
  );
}
