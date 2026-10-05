export function calculateCourseProgress(totalLessons: number, completedLessons: number): number {
  if (!totalLessons || totalLessons <= 0) return 0;
  const percentage = Math.round((completedLessons / totalLessons) * 100);
  return Math.min(100, Math.max(0, percentage));
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 min";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}m ${secs}s`;
}
