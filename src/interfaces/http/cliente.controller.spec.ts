import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { resetInMemoryRepositories } from '../../infraestructure/singletons';
import { CriarClienteDto } from './dto/cliente.dto';

describe('ClienteController', () => {
  beforeEach(() => {
    resetInMemoryRepositories();
  });

  it('deve validar campos obrigatorios no criar', () => {
    const controller = new ClienteController();

    expect(() => controller.criar({ nome: 'Ana' } as CriarClienteDto)).toThrow(
      BadRequestException,
    );
  });

  it('deve rejeitar documento invalido', () => {
    const controller = new ClienteController();

    expect(() =>
      controller.criar({ nome: 'Ana', documento: '123' } as CriarClienteDto),
    ).toThrow(BadRequestException);
  });

  it('deve criar cliente com documento normalizado e listar', () => {
    const controller = new ClienteController();

    const created = controller.criar({
      nome: 'Ana',
      documento: '123.456.789-01',
    } as CriarClienteDto);

    expect(created.documento).toBe('12345678901');
    expect(controller.listar()).toHaveLength(1);
  });

  it('deve rejeitar duplicidade de documento', () => {
    const controller = new ClienteController();

    controller.criar({
      nome: 'Ana',
      documento: '12345678901',
    } as CriarClienteDto);
    expect(() =>
      controller.criar({
        nome: 'Ana 2',
        documento: '123.456.789-01',
      } as CriarClienteDto),
    ).toThrow(BadRequestException);
  });

  it('deve buscar cliente existente e falhar para id ausente', () => {
    const controller = new ClienteController();
    const created = controller.criar({
      nome: 'Ana',
      documento: '12345678901',
    } as CriarClienteDto);

    expect(controller.buscar(created.id).id).toBe(created.id);
    expect(() => controller.buscar('inexistente')).toThrow(NotFoundException);
  });
});
