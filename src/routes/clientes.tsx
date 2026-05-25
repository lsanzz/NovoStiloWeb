import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui-kit";
import { Client, Gender, formatDateTime, store, useStore } from "@/lib/store";

export const Route = createFileRoute("/clientes")({ component: ClientesPage });

function ClientesPage() {
  const clients = useStore((s) => s.clients);
  const appointments = useStore((s) => s.appointments);
  const services = useStore((s) => s.services);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [formClient, setFormClient] = useState<Client | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const normalizedQuery = q.trim().toLowerCase();

  const filtered = clients
    .filter(
      (client) =>
        client.name.toLowerCase().includes(normalizedQuery) ||
        client.phone.toLowerCase().includes(normalizedQuery),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const openNewClient = () => {
    setSelected(null);
    setFormClient(null);
    setOpenForm(true);
  };

  const openEditClient = (client: Client) => {
    setSelected(null);
    setFormClient(client);
    setOpenForm(true);
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clients.length} cadastrado${clients.length === 1 ? "" : "s"}`}
        action={
          <Button variant="gold" onClick={openNewClient}>
            + Novo cliente
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          hint="Cadastre um novo cliente para começar."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="p-3 font-medium">Nome</th>
                  <th className="p-3 font-medium">Telefone</th>
                  <th className="p-3 font-medium">Atendimentos</th>
                  <th className="p-3 font-medium">Perfil</th>
                  <th className="p-3"></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((client) => {
                  const count = appointments.filter(
                    (appointment) => appointment.clientId === client.id,
                  ).length;

                  return (
                    <tr key={client.id} className="border-t hover:bg-accent/20">
                      <td className="p-3 font-medium">{client.name}</td>
                      <td className="p-3 text-muted-foreground">{client.phone}</td>
                      <td className="p-3">{count}</td>
                      <td className="p-3">
                        <Badge tone="muted">{client.gender ?? "—"}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(client)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && (
        <Modal open onClose={() => setSelected(null)} title="Histórico do cliente">
          <ClientDetail client={selected} onEdit={() => openEditClient(selected)} />
        </Modal>
      )}

      {openForm && (
        <ClientForm
          client={formClient}
          onClose={() => {
            setOpenForm(false);
            setFormClient(null);
          }}
        />
      )}
    </div>
  );

  function ClientDetail({
    client,
    onEdit,
  }: {
    client: Client;
    onEdit: () => void;
  }) {
    const history = appointments
      .filter((appointment) => appointment.clientId === client.id)
      .sort((a, b) => +new Date(b.start) - +new Date(a.start));

    return (
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Telefone</div>
            {client.phone}
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Perfil</div>
            {client.gender ?? "—"}
          </div>
        </div>

        {client.notes && (
          <div>
            <div className="text-xs text-muted-foreground">Observações</div>
            {client.notes}
          </div>
        )}

        <div>
          <div className="font-medium mb-2">Atendimentos ({history.length})</div>

          {history.length === 0 ? (
            <p className="text-muted-foreground">Sem histórico.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {history.slice(0, 8).map((appointment) => (
                <li
                  key={appointment.id}
                  className="flex justify-between gap-3 p-2 text-xs"
                >
                  <span>{formatDateTime(appointment.start)}</span>
                  <span className="font-medium text-right">
                    {services.find((service) => service.id === appointment.serviceId)
                      ?.name ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onEdit}>
            Editar dados
          </Button>
        </div>
      </div>
    );
  }
}

function ClientForm({
  client,
  onClose,
}: {
  client: Client | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(client?.name ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [gender, setGender] = useState<Gender | "">(client?.gender ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) return;

    const data = {
      name: name.trim(),
      phone: phone.trim(),
      gender: gender || undefined,
      notes: notes.trim() || undefined,
    };

    if (client) {
      store.updateClient(client.id, data);
    } else {
      store.addClient(data);
    }

    onClose();
  };

  return (
    <Modal open onClose={onClose} title={client ? "Editar cliente" : "Novo cliente"}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>

        <Field label="Telefone">
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </Field>

        <Field label="Perfil">
          <Select
            value={gender}
            onChange={(event) => setGender(event.target.value as Gender)}
          >
            <option value="">—</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="unissex">Outro</option>
          </Select>
        </Field>

        <Field label="Observações">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <div className="flex justify-between gap-2 pt-2">
          {client ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (confirm("Excluir este cliente?")) {
                  store.removeClient(client.id);
                  onClose();
                }
              }}
            >
              Excluir
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold">
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}