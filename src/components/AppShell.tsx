import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, Users, Scissors, UserCog,
  Wallet, Package, BarChart3, Settings, Sparkles, Menu, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { initSupabaseSync, useStore, useSupabaseSyncStatus } from "@/lib/store";

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

export function AppShell() {
  const router = useRouterState();
  const path = router.location.pathname;
  const [open, setOpen] = useState(false);
  const salonName = useStore((s) => s.settings.name);
  const sync = useSupabaseSyncStatus();

  useEffect(() => {
    void initSupabaseSync();
  }, []);

  const syncLabel =
    sync.status === "conectado"
      ? "Supabase conectado"
      : sync.status === "salvando"
        ? "Salvando..."
        : sync.status === "erro"
          ? "Erro no Supabase"
          : sync.status === "conectando"
            ? "Conectando..."
            : "Modo local";

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
              <div className="text-xs text-sidebar-foreground/60 mt-1">Gestão do salão</div>
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
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
          Sistema Novo Stilo
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/95 backdrop-blur px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-accent"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <div className="font-display text-xl leading-none">{salonName}</div>
            <div className="text-xs text-muted-foreground hidden sm:block mt-1">Painel administrativo</div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="text-sm text-muted-foreground capitalize">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </div>
            <div
              className={`text-[11px] rounded-full px-2 py-0.5 border ${
                sync.status === "conectado" || sync.status === "salvando"
                  ? "border-emerald-500/30 text-emerald-700 bg-emerald-50"
                  : sync.status === "erro"
                    ? "border-destructive/30 text-destructive bg-destructive/10"
                    : "border-border text-muted-foreground bg-muted"
              }`}
              title={sync.message}
            >
              {syncLabel}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
