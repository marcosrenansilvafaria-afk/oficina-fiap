import { InMemoryPecaRepository } from '../../infraestructure/in-memory-peca-repository';

export class AjustarEstoquePeca {
  constructor(private repo: InMemoryPecaRepository) {}

  execute(id: string, delta: number) {
    const peca = this.repo.getById(id);
    if (!peca) throw new Error('Peça não encontrada');
    peca.ajustarEstoque(delta);
    this.repo.save(peca);
    return peca;
  }
}
