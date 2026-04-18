import { InMemoryServicoRepository } from '../../infraestructure/in-memory-servico-repository';

export class ListarServico {
  constructor(private repo: InMemoryServicoRepository) {}

  execute() {
    return this.repo.all();
  }
}
