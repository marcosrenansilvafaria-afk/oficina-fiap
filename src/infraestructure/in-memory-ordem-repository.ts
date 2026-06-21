import { OrdemServico } from '../domain/entities/ordem-servico';
import { IOrdemRepository } from '../domain/repositories/ordem-repository.interface';

export class InMemoryOrdemRepository implements IOrdemRepository {
  private store = new Map<string, OrdemServico>();

  async save(ordem: OrdemServico): Promise<void> {
    this.store.set(ordem.id, ordem);
  }

  async getById(id: string): Promise<OrdemServico | null> {
    return this.store.get(id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }

  async all(): Promise<OrdemServico[]> {
    return Array.from(this.store.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
