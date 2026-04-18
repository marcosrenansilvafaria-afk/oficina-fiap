import { Servico } from '../../domain/entities/servico';
import { generateId } from '../../utils/id';
import { InMemoryServicoRepository } from '../../infraestructure/in-memory-servico-repository';

type Input = {
  nome: string;
  preco: number;
};

export class CriarServico {
  constructor(private repo: InMemoryServicoRepository) {}

  execute(input: Input) {
    if (!input || !input.nome) throw new Error('nome é obrigatório');
    const id = generateId();
    const servico = new Servico(id, input.nome, input.preco || 0);
    this.repo.save(servico);
    return servico;
  }
}
