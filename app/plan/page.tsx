import { ClearDayPlanPage } from "@/components/clear-day-app";

export default async function PlanPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  return <ClearDayPlanPage initialPlanId={params.id} />;
}
