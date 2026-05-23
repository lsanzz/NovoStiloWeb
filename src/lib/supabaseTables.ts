import { supabase } from "./supabase";
import type {
  Appointment,
  Client,
  Product,
  Professional,
  Sale,
  SaleItem,
  SalonSettings,
  Service,
  State,
} from "./store";

const SETTINGS_ID = "salao-novo-stilo";

const clean = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;

const listOrFallback = <T>(data: T[] | null, fallback: T[]) => {
  if (!data || data.length === 0) return fallback;
  return data;
};

const mapSettingsFromDb = (row: any, fallback: SalonSettings): SalonSettings => ({
  name: row?.name ?? fallback.name,
  phone: row?.phone ?? fallback.phone,
  whatsapp: row?.whatsapp ?? fallback.whatsapp,
  email: row?.email ?? fallback.email,
  address: row?.address ?? fallback.address,
  openHour: Number(row?.open_hour ?? fallback.openHour),
  closeHour: Number(row?.close_hour ?? fallback.closeHour),
  workDays: Array.isArray(row?.work_days) ? row.work_days : fallback.workDays,
});

const mapClientFromDb = (row: any): Client => ({
  id: row.id,
  name: row.name,
  phone: row.phone ?? "",
  email: row.email ?? undefined,
  gender: row.gender ?? undefined,
  birthday: row.birthday ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at ?? new Date().toISOString(),
});

const mapProfessionalFromDb = (row: any): Professional => ({
  id: row.id,
  name: row.name,
  phone: row.phone ?? undefined,
  specialty: row.specialty ?? "",
  attendance: row.attendance ?? "unissex",
  commission: Number(row.commission ?? 0),
  color: row.color ?? "#b8860b",
  active: Boolean(row.active ?? true),
});

const mapServiceFromDb = (row: any): Service => ({
  id: row.id,
  name: row.name,
  category: row.category ?? "",
  gender: row.gender ?? "unissex",
  duration: Number(row.duration ?? 30),
  price: Number(row.price ?? 0),
  commission: Number(row.commission ?? 0),
  active: Boolean(row.active ?? true),
});

const mapProductFromDb = (row: any): Product => ({
  id: row.id,
  name: row.name,
  brand: row.brand ?? undefined,
  category: row.category ?? "",
  stock: Number(row.stock ?? 0),
  cost: Number(row.cost ?? 0),
  price: Number(row.price ?? 0),
  minStock: Number(row.min_stock ?? 0),
  active: Boolean(row.active ?? true),
});

const mapAppointmentFromDb = (row: any): Appointment => ({
  id: row.id,
  clientId: row.client_id ?? "",
  professionalId: row.professional_id ?? "",
  serviceId: row.service_id ?? "",
  start: row.start_at,
  status: row.status ?? "agendado",
  notes: row.notes ?? undefined,
});

const mapSaleFromDb = (row: any, items: SaleItem[]): Sale => ({
  id: row.id,
  clientId: row.client_id ?? undefined,
  items,
  discount: Number(row.discount ?? 0),
  total: Number(row.total ?? 0),
  paymentMethod: row.payment_method ?? "pix",
  createdAt: row.created_at ?? new Date().toISOString(),
});

const mapSaleItemFromDb = (row: any): SaleItem => ({
  kind: row.kind,
  refId: row.ref_id ?? "",
  name: row.name,
  price: Number(row.price ?? 0),
  quantity: Number(row.quantity ?? 1),
  professionalId: row.professional_id ?? undefined,
  commissionPct: Number(row.commission_pct ?? 0),
});

const assertNoError = (label: string, error: any) => {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
};

export async function loadStateFromSupabaseTables(fallback: State): Promise<State> {
  if (!supabase) return fallback;

  const [
    settingsRes,
    clientsRes,
    professionalsRes,
    servicesRes,
    productsRes,
    appointmentsRes,
    salesRes,
    saleItemsRes,
  ] = await Promise.all([
    supabase.from("settings").select("*").eq("id", SETTINGS_ID).maybeSingle(),
    supabase.from("clients").select("*").order("created_at", { ascending: true }),
    supabase.from("professionals").select("*").order("name", { ascending: true }),
    supabase.from("services").select("*").order("name", { ascending: true }),
    supabase.from("products").select("*").order("name", { ascending: true }),
    supabase.from("appointments").select("*").order("start_at", { ascending: true }),
    supabase.from("sales").select("*").order("created_at", { ascending: true }),
    supabase.from("sale_items").select("*").order("id", { ascending: true }),
  ]);

  assertNoError("Erro ao carregar configurações", settingsRes.error);
  assertNoError("Erro ao carregar clientes", clientsRes.error);
  assertNoError("Erro ao carregar profissionais", professionalsRes.error);
  assertNoError("Erro ao carregar serviços", servicesRes.error);
  assertNoError("Erro ao carregar produtos", productsRes.error);
  assertNoError("Erro ao carregar agenda", appointmentsRes.error);
  assertNoError("Erro ao carregar vendas", salesRes.error);
  assertNoError("Erro ao carregar itens de venda", saleItemsRes.error);

  const saleItemsBySale = new Map<string, SaleItem[]>();

  for (const item of saleItemsRes.data ?? []) {
    const saleId = item.sale_id;
    if (!saleItemsBySale.has(saleId)) saleItemsBySale.set(saleId, []);
    saleItemsBySale.get(saleId)!.push(mapSaleItemFromDb(item));
  }

  const clients = listOrFallback(clientsRes.data?.map(mapClientFromDb) ?? [], fallback.clients);
  const professionals = listOrFallback(
    professionalsRes.data?.map(mapProfessionalFromDb) ?? [],
    fallback.professionals,
  );
  const services = listOrFallback(servicesRes.data?.map(mapServiceFromDb) ?? [], fallback.services);
  const products = listOrFallback(productsRes.data?.map(mapProductFromDb) ?? [], fallback.products);

  return {
    settings: mapSettingsFromDb(settingsRes.data, fallback.settings),
    clients,
    professionals,
    services,
    products,
    appointments: appointmentsRes.data?.map(mapAppointmentFromDb) ?? [],
    sales:
      salesRes.data?.map((sale) =>
        mapSaleFromDb(sale, saleItemsBySale.get(sale.id) ?? []),
      ) ?? [],
  };
}

const quoteIds = (ids: string[]) => `(${ids.map((id) => `"${id}"`).join(",")})`;

const deleteMissingById = async (table: string, ids: string[]) => {
  if (!supabase) return;

  if (ids.length === 0) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    assertNoError(`Erro ao limpar ${table}`, error);
    return;
  }

  const { error } = await supabase.from(table).delete().not("id", "in", quoteIds(ids));
  assertNoError(`Erro ao remover registros antigos de ${table}`, error);
};

export async function saveStateToSupabaseTables(state: State): Promise<void> {
  if (!supabase) return;

  const { error: settingsError } = await supabase.from("settings").upsert({
    id: SETTINGS_ID,
    name: state.settings.name,
    phone: state.settings.phone,
    whatsapp: state.settings.whatsapp,
    email: state.settings.email,
    address: state.settings.address,
    open_hour: state.settings.openHour,
    close_hour: state.settings.closeHour,
    work_days: state.settings.workDays,
    updated_at: new Date().toISOString(),
  });

  assertNoError("Erro ao salvar configurações", settingsError);

  const clients = state.clients.map((c) =>
    clean({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      gender: c.gender,
      birthday: c.birthday || null,
      notes: c.notes,
      created_at: c.createdAt,
      updated_at: new Date().toISOString(),
    }),
  );

  const professionals = state.professionals.map((p) =>
    clean({
      id: p.id,
      name: p.name,
      phone: p.phone,
      specialty: p.specialty,
      attendance: p.attendance,
      commission: p.commission,
      color: p.color,
      active: p.active,
      updated_at: new Date().toISOString(),
    }),
  );

  const services = state.services.map((s) =>
    clean({
      id: s.id,
      name: s.name,
      category: s.category,
      gender: s.gender,
      duration: s.duration,
      price: s.price,
      commission: s.commission,
      active: s.active,
      updated_at: new Date().toISOString(),
    }),
  );

  const products = state.products.map((p) =>
    clean({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      cost: p.cost,
      price: p.price,
      stock: p.stock,
      min_stock: p.minStock,
      active: p.active,
      updated_at: new Date().toISOString(),
    }),
  );

  if (clients.length) {
    const { error } = await supabase.from("clients").upsert(clients);
    assertNoError("Erro ao salvar clientes", error);
  }

  if (professionals.length) {
    const { error } = await supabase.from("professionals").upsert(professionals);
    assertNoError("Erro ao salvar profissionais", error);
  }

  if (services.length) {
    const { error } = await supabase.from("services").upsert(services);
    assertNoError("Erro ao salvar serviços", error);
  }

  if (products.length) {
    const { error } = await supabase.from("products").upsert(products);
    assertNoError("Erro ao salvar produtos", error);
  }

  const appointments = state.appointments.map((a) =>
    clean({
      id: a.id,
      client_id: state.clients.some((c) => c.id === a.clientId) ? a.clientId : null,
      professional_id: state.professionals.some((p) => p.id === a.professionalId)
        ? a.professionalId
        : null,
      service_id: state.services.some((s) => s.id === a.serviceId) ? a.serviceId : null,
      start_at: a.start,
      status: a.status,
      notes: a.notes,
      updated_at: new Date().toISOString(),
    }),
  );

  const sales = state.sales.map((s) =>
    clean({
      id: s.id,
      client_id: s.clientId && state.clients.some((c) => c.id === s.clientId) ? s.clientId : null,
      total: s.total,
      discount: s.discount,
      payment_method: s.paymentMethod,
      created_at: s.createdAt,
    }),
  );

  if (appointments.length) {
    const { error } = await supabase.from("appointments").upsert(appointments);
    assertNoError("Erro ao salvar agenda", error);
  }

  if (sales.length) {
    const { error } = await supabase.from("sales").upsert(sales);
    assertNoError("Erro ao salvar vendas", error);
  }

  const { error: clearItemsError } = await supabase
    .from("sale_items")
    .delete()
    .not("id", "is", null);

  assertNoError("Erro ao limpar itens de venda", clearItemsError);

  const saleItems = state.sales.flatMap((sale) =>
    sale.items.map((item) =>
      clean({
        sale_id: sale.id,
        kind: item.kind,
        ref_id: item.refId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        commission_pct: item.commissionPct,
        professional_id:
          item.professionalId && state.professionals.some((p) => p.id === item.professionalId)
            ? item.professionalId
            : null,
      }),
    ),
  );

  if (saleItems.length) {
    const { error } = await supabase.from("sale_items").insert(saleItems);
    assertNoError("Erro ao salvar itens de venda", error);
  }

  await deleteMissingById("appointments", state.appointments.map((a) => a.id));
  await deleteMissingById("sales", state.sales.map((s) => s.id));
  await deleteMissingById("products", state.products.map((p) => p.id));
  await deleteMissingById("services", state.services.map((s) => s.id));
  await deleteMissingById("professionals", state.professionals.map((p) => p.id));
  await deleteMissingById("clients", state.clients.map((c) => c.id));
}