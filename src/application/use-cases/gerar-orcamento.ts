import { OrdemServico } from '../../domain/entities/ordem-servico';

export class GerarOrcamento {
  execute(os: OrdemServico) {
    os.gerarOrcamento();
    return os;
  }
}
