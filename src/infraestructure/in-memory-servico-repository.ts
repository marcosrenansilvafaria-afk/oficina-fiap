import { Servico } from '../domain/entities/servico';
import { IServicoRepository } from '../domain/repositories/servico-repository.interface';

export class InMemoryServicoRepository implements IServicoRepository {
  private store = new Map<string, Servico>();

  async save(servico: Servico): Promise<void> {
    this.store.set(servico.id, servico);
  }

  async getById(id: string): Promise<Servico | null> {
    return this.store.get(id) ?? null;
  }

  async all(): Promise<Servico[]> {
    return Array.from(this.store.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
