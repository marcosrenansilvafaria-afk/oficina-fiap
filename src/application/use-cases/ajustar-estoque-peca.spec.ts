import { Peca } from '../../domain/entities/peca';
import { InMemoryPecaRepository } from '../../infraestructure/in-memory-peca-repository';
import { AjustarEstoquePeca } from './ajustar-estoque-peca';

describe('AjustarEstoquePeca', () => {
  it('deve ajustar estoque quando peca existir', () => {
    const repo = new InMemoryPecaRepository();
    const peca = new Peca('p1', 'Filtro', 20, 5);
    repo.save(peca);

    const useCase = new AjustarEstoquePeca(repo);
    const atualizada = useCase.execute('p1', -2);

    expect(atualizada.estoque).toBe(3);
  });

  it('deve falhar quando peca nao existe', () => {
    const repo = new InMemoryPecaRepository();
    const useCase = new AjustarEstoquePeca(repo);

    expect(() => useCase.execute('nao-existe', 1)).toThrow(
      'Peça não encontrada',
    );
  });

  it('deve falhar quando ajuste gerar estoque negativo', () => {
    const repo = new InMemoryPecaRepository();
    repo.save(new Peca('p1', 'Filtro', 20, 1));

    const useCase = new AjustarEstoquePeca(repo);
    expect(() => useCase.execute('p1', -2)).toThrow('Estoque insuficiente');
  });
});
