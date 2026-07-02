import { createClient } from "@/lib/supabase/server";
import { ComposerForm } from "@/components/composer-form";

export default async function Escrever() {
  const supabase = await createClient();
  const { data: topics } = await supabase
    .from("topics")
    .select("id, slug, name")
    .order("id");

  return (
    <main>
      <h1 className="font-serif text-2xl">Escrever</h1>
      <ComposerForm topics={topics ?? []} />
    </main>
  );
}
