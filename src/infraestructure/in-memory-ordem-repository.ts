import { OrdemServico } from '../domain/entities/ordem-servico';

export class InMemoryOrdemRepository {
  private store = new Map<string, OrdemServico>();

  save(ordem: OrdemServico) {
    this.store.set(ordem.id, ordem);
  }

  getById(id: string): OrdemServico | undefined {
    return this.store.get(id);
  }

  exists(id: string): boolean {
    return this.store.has(id);
  }

  all(): OrdemServico[] {
    return Array.from(this.store.values());
  }
}
