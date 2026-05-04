import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VeiculoController } from './veiculo.controller';
import { resetInMemoryRepositories } from '../../infraestructure/singletons';
import { CriarVeiculoDto } from './dto/veiculo.dto';

describe('VeiculoController', () => {
  beforeEach(() => {
    resetInMemoryRepositories();
  });

  it('deve validar campos obrigatorios', () => {
    const controller = new VeiculoController();

    expect(() =>
      controller.criar({ placa: 'ABC1D23' } as CriarVeiculoDto),
    ).toThrow(BadRequestException);
  });

  it('deve rejeitar placa invalida', () => {
    const controller = new VeiculoController();

    expect(() =>
      controller.criar({
        placa: 'AAAA',
        modelo: 'Onix',
        marca: 'GM',
        ano: 2023,
      } as CriarVeiculoDto),
    ).toThrow(BadRequestException);
  });

  it('deve criar com placa normalizada e listar', () => {
    const controller = new VeiculoController();

    const created = controller.criar({
      placa: 'abc-1234',
      modelo: 'Onix',
      marca: 'GM',
      ano: 2023,
    } as CriarVeiculoDto);

    expect(created.placa).toBe('ABC-1234');
    expect(controller.listar()).toHaveLength(1);
  });

  it('deve buscar veiculo existente e falhar para id ausente', () => {
    const controller = new VeiculoController();
    const created = controller.criar({
      placa: 'ABC1D23',
      modelo: 'Onix',
      marca: 'GM',
      ano: 2023,
    } as CriarVeiculoDto);

    expect(controller.buscar(created.id).id).toBe(created.id);
    expect(() => controller.buscar('inexistente')).toThrow(NotFoundException);
  });
});
