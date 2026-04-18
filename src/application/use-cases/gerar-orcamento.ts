import { OrdemServico } from '../../domain/entities/ordem-servico';
import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';

export class GerarOrcamento {
  constructor(private repo: InMemoryOrdemRepository) {}

  execute(id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new Error('OS não encontrada');

    os.gerarOrcamento();
    this.repo.save(os);
    return os;
  }
}
