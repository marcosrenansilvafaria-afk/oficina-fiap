import { InMemoryPecaRepository } from '../../infraestructure/in-memory-peca-repository';

export class ListarPeca {
  constructor(private repo: InMemoryPecaRepository) {}

  execute() {
    return this.repo.all();
  }
}
