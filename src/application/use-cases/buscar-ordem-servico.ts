import { OrdemServico } from '../../domain/entities/ordem-servico';

export class BuscarOrdemServico {
  execute(os?: OrdemServico) {
    if (!os) {
      throw new Error('OS não encontrada');
    }

    return os;
  }
}
