import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';

export class FinalizarOrdemServico {
  constructor(private repo: InMemoryOrdemRepository) {}

  execute(id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new Error('OS não encontrada');

    os.finalizar();
    this.repo.save(os);
    return os;
  }
}
