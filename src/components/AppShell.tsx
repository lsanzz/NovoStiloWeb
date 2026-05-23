import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Package,
  Scissors,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { initSupabaseSync, useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/profissionais", label: "Profissionais", icon: UserCog },
  { to: "/servicos", label: "Serviços", icon: Scissors },
  { to: "/caixa", label: "Caixa / PDV", icon: Wallet },
  { to: "/estoque", label: "Estoque", icon: Package },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function LoginScreen() {
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
    }
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

export function AppShell() {
  const router = useRouterState();
  const navigate = useNavigate();
  const path = router.location.pathname;
  const [open, setOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const salonName = useStore((s) => s.settings.name);

  useEffect(() => {
    if (!supabase) {
      setCheckingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingAuth(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      void initSupabaseSync();
    }
  }, [session]);

  const logout = async () => {
    await supabase?.auth.signOut();
    navigate({ to: "/" });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando sistema...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gold flex items-center justify-center shadow-soft">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>

            <div>
              <div className="font-display text-lg leading-none">Novo Stilo</div>
              <div className="text-xs text-sidebar-foreground/60 mt-1">
                Gestão do salão
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
          <div className="px-2 text-xs text-sidebar-foreground/60">
            Sistema Novo Stilo
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/95 backdrop-blur px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-accent"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div>
            <div className="font-display text-xl leading-none">{salonName}</div>
            <div className="text-xs text-muted-foreground hidden sm:block mt-1">
              Painel administrativo
            </div>
          </div>

          <div className="hidden sm:block text-sm text-muted-foreground capitalize">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}