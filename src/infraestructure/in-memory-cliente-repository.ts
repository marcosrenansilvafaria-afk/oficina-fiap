import { Cliente } from '../domain/entities/cliente';

export class InMemoryClienteRepository {
  private store = new Map<string, Cliente>();

  save(cliente: Cliente) {
    this.store.set(cliente.id, cliente);
  }

  getById(id: string): Cliente | undefined {
    return this.store.get(id);
  }

  all(): Cliente[] {
    return Array.from(this.store.values());
  }

  clear() {
    this.store.clear();
  }
}
