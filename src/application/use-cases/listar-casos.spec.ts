import { Peca } from '../../domain/entities/peca';
import { Servico } from '../../domain/entities/servico';
import { InMemoryPecaRepository } from '../../infraestructure/in-memory-peca-repository';
import { InMemoryServicoRepository } from '../../infraestructure/in-memory-servico-repository';
import { ListarPeca } from './listar-peca';
import { ListarServico } from './listar-servico';

describe('Use-cases de listagem', () => {
  it('deve listar pecas cadastradas', () => {
    const repo = new InMemoryPecaRepository();
    repo.save(new Peca('p1', 'Filtro', 30, 5));
    repo.save(new Peca('p2', 'Velas', 45, 8));

    const useCase = new ListarPeca(repo);
    const resultado = useCase.execute();

    expect(resultado).toHaveLength(2);
    expect(resultado[0].id).toBe('p1');
  });

  it('deve listar servicos cadastrados', () => {
    const repo = new InMemoryServicoRepository();
    repo.save(new Servico('s1', 'Troca de oleo', 120));
    repo.save(new Servico('s2', 'Alinhamento', 150));

    const useCase = new ListarServico(repo);
    const resultado = useCase.execute();

    expect(resultado).toHaveLength(2);
    expect(resultado[1].id).toBe('s2');
  });
});
