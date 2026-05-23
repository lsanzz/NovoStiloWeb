-- Sistema Novo Stilo - estrutura inicial para sincronização com Supabase
-- Execute este arquivo no SQL Editor do Supabase antes de usar o sistema.

create table if not exists public.novo_stilo_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.novo_stilo_state enable row level security;

-- Permite que o app Vite leia e salve o estado usando a chave pública do projeto.
-- Esta política é indicada apenas para a primeira entrega sem login.
-- Na próxima etapa, troque por políticas usando auth.uid() e usuários autenticados.
drop policy if exists "Sistema Novo Stilo pode ler estado" on public.novo_stilo_state;
drop policy if exists "Sistema Novo Stilo pode inserir estado" on public.novo_stilo_state;
drop policy if exists "Sistema Novo Stilo pode atualizar estado" on public.novo_stilo_state;

create policy "Sistema Novo Stilo pode ler estado"
on public.novo_stilo_state
for select
to anon, authenticated
using (id = 'salao-novo-stilo');

create policy "Sistema Novo Stilo pode inserir estado"
on public.novo_stilo_state
for insert
to anon, authenticated
with check (id = 'salao-novo-stilo');

create policy "Sistema Novo Stilo pode atualizar estado"
on public.novo_stilo_state
for update
to anon, authenticated
using (id = 'salao-novo-stilo')
with check (id = 'salao-novo-stilo');

grant select, insert, update on public.novo_stilo_state to anon, authenticated;
