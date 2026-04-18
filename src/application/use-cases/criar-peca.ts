import { Peca } from '../../domain/entities/peca';
import { generateId } from '../../utils/id';
import { InMemoryPecaRepository } from '../../infraestructure/in-memory-peca-repository';

type Input = {
  nome: string;
  preco: number;
  estoque?: number;
};

export class CriarPeca {
  constructor(private repo: InMemoryPecaRepository) {}

  execute(input: Input) {
    if (!input || !input.nome) throw new Error('nome é obrigatório');
    const id = generateId();
    const peca = new Peca(id, input.nome, input.preco || 0, input.estoque || 0);
    this.repo.save(peca);
    return peca;
  }
}
