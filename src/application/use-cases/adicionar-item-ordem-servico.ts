import { OrdemServico } from '../../domain/entities/ordem-servico';
import { ItemOrdemServico } from '../../domain/entities/item-ordem-servico';

type Input = {
  tipo: 'PECA' | 'SERVICO';
  descricao: string;
  preco: number;
  quantidade: number;
};

export class AdicionarItemOrdemServico {
  execute(os: OrdemServico, input: Input) {
    const item = new ItemOrdemServico(
      input.tipo,
      input.descricao,
      input.preco,
      input.quantidade,
    );

    os.adicionarItem(item);
    return os;
  }
}
