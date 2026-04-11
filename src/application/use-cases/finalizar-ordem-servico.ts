import { OrdemServico } from '../../domain/entities/ordem-servico';

export class FinalizarOrdemServico {
  execute(os: OrdemServico) {
    os.finalizar();
    return os;
  }
}
