import { InMemoryClienteRepository } from '../../infraestructure/in-memory-cliente-repository';
import { InMemoryPecaRepository } from '../../infraestructure/in-memory-peca-repository';
import { InMemoryServicoRepository } from '../../infraestructure/in-memory-servico-repository';
import { InMemoryVeiculoRepository } from '../../infraestructure/in-memory-veiculo-repository';
import { CriarCliente } from './criar-cliente';
import { CriarPeca } from './criar-peca';
import { CriarServico } from './criar-servico';
import { CriarVeiculo } from './criar-veiculo';

describe('Use-cases de cadastro', () => {
  it('deve criar cliente normalizando documento e impedindo duplicidade', () => {
    const repo = new InMemoryClienteRepository();
    const useCase = new CriarCliente(repo);

    const cliente = useCase.execute({
      nome: 'Ana',
      documento: '123.456.789-01',
    });

    expect(cliente.documento).toBe('12345678901');
    expect(repo.getById(cliente.id)).toBeDefined();

    expect(() =>
      useCase.execute({ nome: 'Ana 2', documento: '12345678901' }),
    ).toThrow('Cliente com este documento já cadastrado');
  });

  it('deve falhar ao criar cliente com documento invalido', () => {
    const repo = new InMemoryClienteRepository();
    const useCase = new CriarCliente(repo);

    expect(() => useCase.execute({ nome: 'Ana', documento: '123' })).toThrow(
      'documento inválido (esperado CPF/CNPJ)',
    );
  });

  it('deve criar veiculo com input informado e com defaults quando ausente', () => {
    const repo = new InMemoryVeiculoRepository();
    const useCase = new CriarVeiculo(repo);

    const comInput = useCase.execute({
      placa: 'ABC1D23',
      modelo: 'Onix',
      marca: 'Chevrolet',
      ano: 2022,
    });
    const semInput = useCase.execute();

    expect(comInput.placa).toBe('ABC1D23');
    expect(semInput.placa).toBe('');
    expect(semInput.ano).toBe(0);
  });

  it('deve criar servico e validar nome obrigatorio', () => {
    const repo = new InMemoryServicoRepository();
    const useCase = new CriarServico(repo);

    const servico = useCase.execute({ nome: 'Balanceamento', preco: 80 });
    expect(servico.nome).toBe('Balanceamento');

    expect(() => useCase.execute({ nome: '', preco: 10 })).toThrow(
      'nome é obrigatório',
    );
  });

  it('deve criar peca com estoque default e validar nome obrigatorio', () => {
    const repo = new InMemoryPecaRepository();
    const useCase = new CriarPeca(repo);

    const peca = useCase.execute({ nome: 'Pastilha', preco: 120 });
    expect(peca.estoque).toBe(0);

    expect(() => useCase.execute({ nome: '', preco: 10 })).toThrow(
      'nome é obrigatório',
    );
  });
});
