import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PecaController } from './peca.controller';
import { resetInMemoryRepositories } from '../../infraestructure/singletons';
import { AjustarEstoquePecaDto, CriarPecaDto } from './dto/peca.dto';

describe('PecaController', () => {
  beforeEach(() => {
    resetInMemoryRepositories();
  });

  it('deve validar nome obrigatorio no criar', () => {
    const controller = new PecaController();

    expect(() =>
      controller.criar({ preco: 10, estoque: 1 } as CriarPecaDto),
    ).toThrow(BadRequestException);
  });

  it('deve criar, listar e buscar peca existente', () => {
    const controller = new PecaController();

    const created = controller.criar({
      nome: 'Filtro de oleo',
      preco: 45.9,
      estoque: 3,
    } as CriarPecaDto);

    expect(controller.listar()).toHaveLength(1);
    expect(controller.buscar(created.id).id).toBe(created.id);
  });

  it('deve retornar not found ao buscar peca inexistente', () => {
    const controller = new PecaController();

    expect(() => controller.buscar('inexistente')).toThrow(NotFoundException);
  });

  it('deve ajustar estoque com sucesso', () => {
    const controller = new PecaController();
    const created = controller.criar({
      nome: 'Pastilha de freio',
      preco: 120,
      estoque: 5,
    } as CriarPecaDto);

    const ajustada = controller.ajustar(created.id, {
      delta: -2,
    } as AjustarEstoquePecaDto);

    expect(ajustada.estoque).toBe(3);
  });

  it('deve rejeitar delta invalido no ajuste', () => {
    const controller = new PecaController();
    const created = controller.criar({
      nome: 'Correia',
      preco: 90,
      estoque: 2,
    } as CriarPecaDto);

    expect(() =>
      controller.ajustar(created.id, {
        delta: Number.NaN,
      } as AjustarEstoquePecaDto),
    ).toThrow(BadRequestException);
  });

  it('deve converter erro de regra em bad request no ajuste', () => {
    const controller = new PecaController();
    const created = controller.criar({
      nome: 'Bateria',
      preco: 380,
      estoque: 1,
    } as CriarPecaDto);

    expect(() =>
      controller.ajustar(created.id, {
        delta: -3,
      } as AjustarEstoquePecaDto),
    ).toThrow(BadRequestException);
  });
});
