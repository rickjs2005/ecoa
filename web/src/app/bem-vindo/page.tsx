import { Onboarding } from "@/components/onboarding";

export default async function BemVindo({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  return <Onboarding erro={erro} />;
}
