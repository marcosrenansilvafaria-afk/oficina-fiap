import { OrdemServico } from '../../domain/entities/ordem-servico';

export class IniciarDiagnostico {
  execute(os: OrdemServico) {
    os.iniciarDiagnostico();
    return os;
  }
}
