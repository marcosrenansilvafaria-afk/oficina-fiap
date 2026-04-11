import { OrdemServico } from '../../domain/entities/ordem-servico';

export class AprovarOrcamento {
  execute(os: OrdemServico) {
    os.aprovarOrcamento();
    return os;
  }
}
