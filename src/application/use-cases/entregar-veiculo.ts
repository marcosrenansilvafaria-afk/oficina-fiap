import { OrdemServico } from '../../domain/entities/ordem-servico';

export class EntregarVeiculo {
  execute(os: OrdemServico) {
    os.entregar();
    return os;
  }
}
