import { Peca } from '../domain/entities/peca';
import { IPecaRepository } from '../domain/repositories/peca-repository.interface';

export class InMemoryPecaRepository implements IPecaRepository {
  private store = new Map<string, Peca>();

  async save(peca: Peca): Promise<void> {
    this.store.set(peca.id, peca);
  }

  async getById(id: string): Promise<Peca | null> {
    return this.store.get(id) ?? null;
  }

  async all(): Promise<Peca[]> {
    return Array.from(this.store.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
