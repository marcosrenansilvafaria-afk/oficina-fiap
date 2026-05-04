import { InMemoryClienteRepository } from './in-memory-cliente-repository';
import { InMemoryVeiculoRepository } from './in-memory-veiculo-repository';
import { InMemoryOrdemRepository } from './in-memory-ordem-repository';
import { InMemoryServicoRepository } from './in-memory-servico-repository';
import { InMemoryPecaRepository } from './in-memory-peca-repository';
import { Cliente } from '../domain/entities/cliente';
import { Veiculo } from '../domain/entities/veiculo';
import { Servico } from '../domain/entities/servico';
import { Peca } from '../domain/entities/peca';

export const clienteRepo = new InMemoryClienteRepository();
export const veiculoRepo = new InMemoryVeiculoRepository();
export const ordemRepo = new InMemoryOrdemRepository();
export const servicoRepo = new InMemoryServicoRepository();
export const pecaRepo = new InMemoryPecaRepository();

export function seedInMemoryRepositories() {
  if (!clienteRepo.getById('cli-001')) {
    clienteRepo.save(new Cliente('cli-001', 'Cliente Demo', '12345678901'));
  }

  if (!veiculoRepo.getById('vei-001')) {
    veiculoRepo.save(new Veiculo('vei-001', 'ABC1D23', 'Civic', 'Honda', 2022));
  }

  if (!servicoRepo.getById('srv-001')) {
    servicoRepo.save(new Servico('srv-001', 'Troca de óleo', 100));
  }

  if (!pecaRepo.getById('pec-001')) {
    pecaRepo.save(new Peca('pec-001', 'Filtro de óleo', 35.9, 10));
  }
}

export function resetInMemoryRepositories() {
  clienteRepo.clear();
  veiculoRepo.clear();
  ordemRepo.clear();
  servicoRepo.clear();
  pecaRepo.clear();
}
