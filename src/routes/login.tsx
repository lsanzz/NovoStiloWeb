import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setErro("");

    if (!supabase) {
      setErro("Supabase não configurado. Verifique o arquivo .env.local.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErro("Informe e-mail e senha.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gold flex items-center justify-center shadow-soft mb-4">
            <Sparkles className="h-7 w-7 text-gold-foreground" />
          </div>

          <h1 className="font-display text-3xl text-sidebar-foreground">
            Novo Stilo
          </h1>

          <p className="text-sm text-sidebar-foreground/60 mt-2">
            Acesse o painel administrativo do salão
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-card rounded-2xl shadow-soft border p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <LockKeyhole className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-xl">Entrar no sistema</h2>
          </div>

          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-gold/40"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuário"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Senha</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-gold/40"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="senha"
              autoComplete="current-password"
            />
          </div>

          {erro && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-sidebar-foreground/40 mt-6">
          Sistema Novo Stilo
        </p>
      </div>
    </div>
  );
}