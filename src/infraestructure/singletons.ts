import { InMemoryClienteRepository } from './in-memory-cliente-repository';
import { InMemoryVeiculoRepository } from './in-memory-veiculo-repository';
import { InMemoryOrdemRepository } from './in-memory-ordem-repository';
import { InMemoryServicoRepository } from './in-memory-servico-repository';
import { InMemoryPecaRepository } from './in-memory-peca-repository';

export const clienteRepo = new InMemoryClienteRepository();
export const veiculoRepo = new InMemoryVeiculoRepository();
export const ordemRepo = new InMemoryOrdemRepository();
export const servicoRepo = new InMemoryServicoRepository();
export const pecaRepo = new InMemoryPecaRepository();
