"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error("Identifiants incorrects.");
      return;
    }
    toast.success("Connexion réussie.");
    router.push(searchParams.get("redirect") || "/admin");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto card p-8 flex flex-col gap-4 mt-12">
      <div className="flex flex-col items-center gap-2">
        <Lock className="text-tally" size={28} />
        <h1 className="text-xl font-bold">Espace administrateur</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        />
        <input
          type="password"
          required
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-background"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-tally text-white rounded-lg py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
