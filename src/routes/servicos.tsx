import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select } from "@/components/ui-kit";
import { Gender, Service, formatBRL, store, useStore } from "@/lib/store";

export const Route = createFileRoute("/servicos")({ component: ServicosPage });

const parseNumber = (value: string, fallback = 0) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
};

function ServicosPage() {
  const list = useStore((s) => s.services);
  const [filter, setFilter] = useState<string>("");
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = [...(filter ? list.filter((s) => s.gender === filter) : list)].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <div>
      <PageHeader
        title="Serviços"
        subtitle="Catálogo de serviços do salão"
        action={<Button variant="gold" onClick={() => { setEditing(null); setOpen(true); }}>+ Novo serviço</Button>}
      />
      <Card className="p-4 mb-4">
        <Field label="Filtrar por público">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="unissex">Unissex</option>
          </Select>
        </Field>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Serviço</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Público</th>
                <th className="p-3">Duração</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Comissão</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t hover:bg-accent/20">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-muted-foreground">{s.category}</td>
                  <td className="p-3"><Badge tone="muted">{s.gender}</Badge></td>
                  <td className="p-3">{s.duration} min</td>
                  <td className="p-3">{formatBRL(s.price)}</td>
                  <td className="p-3">{s.commission}%</td>
                  <td className="p-3"><Badge tone={s.active ? "success" : "muted"}>{s.active ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}>Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {open && <ServiceForm svc={editing} onClose={() => { setOpen(false); setEditing(null); }} />}
    </div>
  );
}

function ServiceForm({ svc, onClose }: { svc: Service | null; onClose: () => void }) {
  const [name, setName] = useState(svc?.name ?? "");
  const [category, setCategory] = useState(svc?.category ?? "Cabelo");
  const [gender, setGender] = useState<Gender>(svc?.gender ?? "unissex");
  const [duration, setDuration] = useState(svc?.duration != null ? String(svc.duration) : "30");
  const [price, setPrice] = useState(svc?.price != null ? String(svc.price) : "50");
  const [commission, setCommission] = useState(svc?.commission != null ? String(svc.commission) : "40");
  const [active, setActive] = useState(svc?.active ?? true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<Service, "id"> = {
      name: name.trim(),
      category: category.trim(),
      gender,
      duration: Math.max(5, parseNumber(duration, 30)),
      price: Math.max(0, parseNumber(price, 0)),
      commission: Math.max(0, parseNumber(commission, 0)),
      active,
    };

    if (svc) store.updateService(svc.id, data);
    else store.addService(data);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={svc ? "Editar serviço" : "Novo serviço"}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria"><Input value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
          <Field label="Público">
            <Select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="unissex">Unissex</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Duração (min)">
            <Input type="text" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </Field>
          <Field label="Valor (R$)">
            <Input type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Comissão (%)">
            <Input type="text" inputMode="decimal" value={commission} placeholder="Ex: 40" onChange={(e) => setCommission(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Serviço ativo
        </label>
        <div className="flex justify-between pt-2">
          {svc ? <Button type="button" variant="danger" onClick={() => { if (confirm("Excluir este serviço?")) { store.removeService(svc.id); onClose(); } }}>Excluir</Button> : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="gold">Salvar</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
