import { OrdemServico } from '../../domain/entities/ordem-servico';

export class CriarOrdemServico {
  execute() {
    const os = new OrdemServico(Date.now().toString());
    return os;
  }
}
