import { InMemoryClienteRepository } from './in-memory-cliente-repository';
import { InMemoryVeiculoRepository } from './in-memory-veiculo-repository';
import { InMemoryOrdemRepository } from './in-memory-ordem-repository';

export const clienteRepo = new InMemoryClienteRepository();
export const veiculoRepo = new InMemoryVeiculoRepository();
export const ordemRepo = new InMemoryOrdemRepository();
