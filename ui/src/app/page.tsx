import { getAllPrompts } from "@/lib/prompts";
import Dashboard from "@/components/dashboard";

export default function Home() {
  const prompts = getAllPrompts();

  return (
    <main>
      <Dashboard prompts={prompts} />
    </main>
  );
}
