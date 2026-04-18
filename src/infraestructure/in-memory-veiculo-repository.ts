import { Veiculo } from '../domain/entities/veiculo';

export class InMemoryVeiculoRepository {
  private store = new Map<string, Veiculo>();

  save(veiculo: Veiculo) {
    this.store.set(veiculo.id, veiculo);
  }

  getById(id: string): Veiculo | undefined {
    return this.store.get(id);
  }

  all(): Veiculo[] {
    return Array.from(this.store.values());
  }
}
