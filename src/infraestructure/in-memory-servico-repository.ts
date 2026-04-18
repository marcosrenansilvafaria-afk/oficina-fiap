import { Servico } from '../domain/entities/servico';

export class InMemoryServicoRepository {
  private store = new Map<string, Servico>();

  save(servico: Servico) {
    this.store.set(servico.id, servico);
  }

  getById(id: string): Servico | undefined {
    return this.store.get(id);
  }

  all(): Servico[] {
    return Array.from(this.store.values());
  }
}
