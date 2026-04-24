import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServicoController } from './servico.controller';
import { resetInMemoryRepositories } from '../../infraestructure/singletons';
import { CriarServicoDto } from './dto/servico.dto';

describe('ServicoController', () => {
  beforeEach(() => {
    resetInMemoryRepositories();
  });

  it('deve validar nome obrigatorio no criar', () => {
    const controller = new ServicoController();

    expect(() => controller.criar({ preco: 120 } as CriarServicoDto)).toThrow(
      BadRequestException,
    );
  });

  it('deve criar, listar e buscar servico existente', () => {
    const controller = new ServicoController();

    const created = controller.criar({
      nome: 'Troca de oleo',
      preco: 150,
    } as CriarServicoDto);

    expect(controller.listar()).toHaveLength(1);
    expect(controller.buscar(created.id).id).toBe(created.id);
  });

  it('deve retornar not found ao buscar servico inexistente', () => {
    const controller = new ServicoController();

    expect(() => controller.buscar('inexistente')).toThrow(NotFoundException);
  });
});
