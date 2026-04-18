import { ItemOrdemServico } from '../../domain/entities/item-ordem-servico';
import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';
import { InMemoryPecaRepository } from '../../infraestructure/in-memory-peca-repository';
import { InMemoryServicoRepository } from '../../infraestructure/in-memory-servico-repository';

type Input = {
  tipo: 'PECA' | 'SERVICO';
  descricao?: string;
  preco?: number;
  quantidade: number;
  pecaId?: string;
  servicoId?: string;
};

export class AdicionarItemOrdemServico {
  constructor(
    private repo: InMemoryOrdemRepository,
    private pecaRepo?: InMemoryPecaRepository,
    private servicoRepo?: InMemoryServicoRepository,
  ) {}

  execute(id: string, input: Input) {
    const os = this.repo.getById(id);
    if (!os) throw new Error('OS não encontrada');

    let descricao = input.descricao;
    let preco = input.preco;

    if (input.pecaId) {
      if (!this.pecaRepo)
        throw new Error('Repositório de peças não configurado');
      const p = this.pecaRepo.getById(input.pecaId);
      if (!p) throw new Error('Peça não encontrada');
      descricao = p.nome;
      preco = p.preco;
    } else if (input.servicoId) {
      if (!this.servicoRepo)
        throw new Error('Repositório de serviços não configurado');
      const s = this.servicoRepo.getById(input.servicoId);
      if (!s) throw new Error('Serviço não encontrado');
      descricao = s.nome;
      preco = s.preco;
    }

    if (!descricao) throw new Error('descricao é obrigatória');
    if (!preco) preco = 0;

    const item = new ItemOrdemServico(
      input.tipo,
      descricao,
      preco,
      input.quantidade,
    );
    os.adicionarItem(item);
    this.repo.save(os);
    return os;
  }
}
