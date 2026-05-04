import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdemServicoController } from './ordem-servico.controller';
import { resetInMemoryRepositories } from '../../infraestructure/singletons';
import {
  AdicionarItemOrdemServicoDto,
  CriarOrdemServicoDto,
} from './dto/ordem-servico.dto';

describe('OrdemServicoController', () => {
  beforeEach(() => {
    resetInMemoryRepositories();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function criarController() {
    return new OrdemServicoController();
  }

  function itemServicoPadrao(): AdicionarItemOrdemServicoDto {
    return {
      tipo: 'SERVICO',
      descricao: 'Troca de oleo',
      preco: 120,
      quantidade: 1,
    };
  }

  it('deve criar os e retornar dados padrao no buscar e listar', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    const buscada = controller.buscar(created.id) as {
      id: string;
      envioOrcamento: { status: 'NAO_ENVIADO' | 'ENVIADO' };
      tempoExecucaoMs: number | null;
    };

    expect(buscada.id).toBe(created.id);
    expect(buscada.envioOrcamento.status).toBe('NAO_ENVIADO');
    expect(buscada.tempoExecucaoMs).toBeNull();

    const listagem = controller.listar() as Array<{ id: string }>;
    expect(listagem).toHaveLength(1);
    expect(listagem[0].id).toBe(created.id);
  });

  it('deve validar clienteId e veiculoId no criar', () => {
    const controller = criarController();

    expect(() =>
      controller.criar({ clienteId: 'x' } as CriarOrdemServicoDto),
    ).toThrow(BadRequestException);

    expect(() =>
      controller.criar({ veiculoId: 'y' } as CriarOrdemServicoDto),
    ).toThrow(BadRequestException);
  });

  it('deve retornar not found no buscar para id inexistente', () => {
    const controller = criarController();

    expect(() => controller.buscar('nao-existe')).toThrow(NotFoundException);
  });

  it('deve retornar not found no adicionar para os inexistente', () => {
    const controller = criarController();

    expect(() =>
      controller.adicionar('nao-existe', itemServicoPadrao()),
    ).toThrow(NotFoundException);
  });

  it('deve converter erro de regra no adicionar para bad request', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    expect(() => controller.adicionar(created.id, itemServicoPadrao())).toThrow(
      BadRequestException,
    );
  });

  it('deve diagnosticar e adicionar item com sucesso', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    const diagnosticada = controller.diagnostico(created.id);
    expect(diagnosticada.getStatus()).toBe('EM_DIAGNOSTICO');

    const atualizada = controller.adicionar(created.id, itemServicoPadrao());
    expect(atualizada.getItens()).toHaveLength(1);
  });

  it('deve gerar e enviar orcamento quando os estiver pronta', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    controller.diagnostico(created.id);
    controller.adicionar(created.id, itemServicoPadrao());

    const orcada = controller.gerar(created.id);
    expect(orcada.getStatus()).toBe('AGUARDANDO_APROVACAO');

    const envio = controller.enviarOrcamento(created.id) as {
      ordemServicoId: string;
      status: 'NAO_ENVIADO' | 'ENVIADO';
      enviadoEm?: string;
    };
    expect(envio.ordemServicoId).toBe(created.id);
    expect(envio.status).toBe('ENVIADO');
    expect(envio.enviadoEm).toBeDefined();
  });

  it('deve bloquear envio de orcamento em status invalido', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    expect(() => controller.enviarOrcamento(created.id)).toThrow(
      BadRequestException,
    );
  });

  it('deve converter erro no aprovar para bad request', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    expect(() => controller.aprovar(created.id)).toThrow(BadRequestException);
  });

  it('deve executar, finalizar, entregar e calcular tempo medio', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    controller.diagnostico(created.id);
    controller.adicionar(created.id, itemServicoPadrao());
    controller.gerar(created.id);
    controller.aprovar(created.id);

    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(4000);

    const emExecucao = controller.executar(created.id);
    expect(emExecucao.getStatus()).toBe('EM_EXECUCAO');

    const finalizada = controller.finalizar(created.id) as {
      status: string;
      tempoExecucaoMs: number | null;
    };
    expect(finalizada.status).toBe('FINALIZADA');
    expect(finalizada.tempoExecucaoMs).toBe(3000);

    const metricas = controller.tempoMedio() as {
      totalExecucoesConcluidas: number;
      tempoMedioExecucaoMs: number;
    };
    expect(metricas.totalExecucoesConcluidas).toBe(1);
    expect(metricas.tempoMedioExecucaoMs).toBe(3000);

    const entregue = controller.entregar(created.id);
    expect(entregue.getStatus()).toBe('ENTREGUE');
  });

  it('deve converter erro no executar para bad request', () => {
    const controller = criarController();
    const created = controller.criar({} as CriarOrdemServicoDto);

    expect(() => controller.executar(created.id)).toThrow(BadRequestException);
  });

  it('deve retornar not found em operacoes quando os nao existe', () => {
    const controller = criarController();

    expect(() => controller.gerar('nao-existe')).toThrow(NotFoundException);
    expect(() => controller.aprovar('nao-existe')).toThrow(NotFoundException);
    expect(() => controller.diagnostico('nao-existe')).toThrow(
      NotFoundException,
    );
    expect(() => controller.executar('nao-existe')).toThrow(NotFoundException);
    expect(() => controller.finalizar('nao-existe')).toThrow(NotFoundException);
    expect(() => controller.entregar('nao-existe')).toThrow(NotFoundException);
    expect(() => controller.enviarOrcamento('nao-existe')).toThrow(
      NotFoundException,
    );
  });
});
