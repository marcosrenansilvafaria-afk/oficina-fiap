import { OrdemServico } from '../../domain/entities/ordem-servico';
import { generateId } from '../../utils/id';
import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';
import { InMemoryClienteRepository } from '../../infraestructure/in-memory-cliente-repository';
import { InMemoryVeiculoRepository } from '../../infraestructure/in-memory-veiculo-repository';

type Input = {
  clienteId?: string;
  veiculoId?: string;
};

export class CriarOrdemServico {
  constructor(
    private repo: InMemoryOrdemRepository,
    private clienteRepo?: InMemoryClienteRepository,
    private veiculoRepo?: InMemoryVeiculoRepository,
  ) {}

  execute(input?: Input) {
    const clienteId = input?.clienteId;
    const veiculoId = input?.veiculoId;

    if (clienteId && this.clienteRepo && !this.clienteRepo.getById(clienteId)) {
      throw new Error('clienteId inválido');
    }

    if (veiculoId && this.veiculoRepo && !this.veiculoRepo.getById(veiculoId)) {
      throw new Error('veiculoId inválido');
    }

    const id = generateId();
    const os = new OrdemServico(id, clienteId, veiculoId);
    this.repo.save(os);
    return os;
  }
}
