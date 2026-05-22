/* eslint-disable */

// @ts-nocheck

// Rotas do sistema Novo Stilo.
// Mantido manualmente nesta versão Vite SPA para evitar dependências de SSR.

import { Route as rootRouteImport } from './routes/__root'
import { Route as AgendaRouteImport } from './routes/agenda'
import { Route as CaixaRouteImport } from './routes/caixa'
import { Route as ClientesRouteImport } from './routes/clientes'
import { Route as ConfiguracoesRouteImport } from './routes/configuracoes'
import { Route as EstoqueRouteImport } from './routes/estoque'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ProfissionaisRouteImport } from './routes/profissionais'
import { Route as RelatoriosRouteImport } from './routes/relatorios'
import { Route as ServicosRouteImport } from './routes/servicos'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

const AgendaRoute = AgendaRouteImport.update({
  id: '/agenda',
  path: '/agenda',
  getParentRoute: () => rootRouteImport,
} as any)

const CaixaRoute = CaixaRouteImport.update({
  id: '/caixa',
  path: '/caixa',
  getParentRoute: () => rootRouteImport,
} as any)

const ClientesRoute = ClientesRouteImport.update({
  id: '/clientes',
  path: '/clientes',
  getParentRoute: () => rootRouteImport,
} as any)

const ConfiguracoesRoute = ConfiguracoesRouteImport.update({
  id: '/configuracoes',
  path: '/configuracoes',
  getParentRoute: () => rootRouteImport,
} as any)

const EstoqueRoute = EstoqueRouteImport.update({
  id: '/estoque',
  path: '/estoque',
  getParentRoute: () => rootRouteImport,
} as any)

const ProfissionaisRoute = ProfissionaisRouteImport.update({
  id: '/profissionais',
  path: '/profissionais',
  getParentRoute: () => rootRouteImport,
} as any)

const RelatoriosRoute = RelatoriosRouteImport.update({
  id: '/relatorios',
  path: '/relatorios',
  getParentRoute: () => rootRouteImport,
} as any)

const ServicosRoute = ServicosRouteImport.update({
  id: '/servicos',
  path: '/servicos',
  getParentRoute: () => rootRouteImport,
} as any)

const rootRouteChildren = {
  IndexRoute,
  AgendaRoute,
  CaixaRoute,
  ClientesRoute,
  ConfiguracoesRoute,
  EstoqueRoute,
  ProfissionaisRoute,
  RelatoriosRoute,
  ServicosRoute,
}

export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)
