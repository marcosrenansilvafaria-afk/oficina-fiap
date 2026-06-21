import { Cliente } from '../domain/entities/cliente';
import { IClienteRepository } from '../domain/repositories/cliente-repository.interface';

export class InMemoryClienteRepository implements IClienteRepository {
  private store = new Map<string, Cliente>();

  async save(cliente: Cliente): Promise<void> {
    this.store.set(cliente.id, cliente);
  }

  async getById(id: string): Promise<Cliente | null> {
    return this.store.get(id) ?? null;
  }

  async all(): Promise<Cliente[]> {
    return Array.from(this.store.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
