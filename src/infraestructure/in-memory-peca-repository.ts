import { Peca } from '../domain/entities/peca';

export class InMemoryPecaRepository {
  private store = new Map<string, Peca>();

  save(peca: Peca) {
    this.store.set(peca.id, peca);
  }

  getById(id: string): Peca | undefined {
    return this.store.get(id);
  }

  all(): Peca[] {
    return Array.from(this.store.values());
  }
}
