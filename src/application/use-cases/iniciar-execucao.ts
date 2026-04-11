import { OrdemServico } from '../../domain/entities/ordem-servico';

export class IniciarExecucao {
  execute(os: OrdemServico) {
    os.iniciarExecucao();
    return os;
  }
}
