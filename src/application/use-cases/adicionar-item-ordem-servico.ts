import { OrdemServico } from '../../domain/entities/ordem-servico';
import { ItemOrdemServico } from '../../domain/entities/item-ordem-servico';
import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';

type Input = {
  tipo: 'PECA' | 'SERVICO';
  descricao: string;
  preco: number;
  quantidade: number;
};

export class AdicionarItemOrdemServico {
  constructor(private repo: InMemoryOrdemRepository) {}

  execute(id: string, input: Input) {
    const os = this.repo.getById(id);
    if (!os) throw new Error('OS não encontrada');

    const item = new ItemOrdemServico(input.tipo, input.descricao, input.preco, input.quantidade);
    os.adicionarItem(item);
    this.repo.save(os);
    return os;
  }
}
