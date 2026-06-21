import { Veiculo } from '../domain/entities/veiculo';
import { IVeiculoRepository } from '../domain/repositories/veiculo-repository.interface';

export class InMemoryVeiculoRepository implements IVeiculoRepository {
  private store = new Map<string, Veiculo>();

  async save(veiculo: Veiculo): Promise<void> {
    this.store.set(veiculo.id, veiculo);
  }

  async getById(id: string): Promise<Veiculo | null> {
    return this.store.get(id) ?? null;
  }

  async all(): Promise<Veiculo[]> {
    return Array.from(this.store.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
