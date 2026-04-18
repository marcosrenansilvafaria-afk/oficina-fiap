import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';
import { AdicionarItemOrdemServico } from './adicionar-item-ordem-servico';
import { AprovarOrcamento } from './aprovar-orcamento';
import { CriarOrdemServico } from './criar-ordem-servico';
import { EntregarVeiculo } from './entregar-veiculo';
import { FinalizarOrdemServico } from './finalizar-ordem-servico';
import { GerarOrcamento } from './gerar-orcamento';
import { IniciarDiagnostico } from './iniciar-diagnostico';
import { IniciarExecucao } from './iniciar-execucao';

describe('Fluxo de status da OS (use-cases)', () => {
  function prepararFluxo() {
    const repo = new InMemoryOrdemRepository();
    const criar = new CriarOrdemServico(repo);
    const iniciarDiag = new IniciarDiagnostico(repo);
    const addItem = new AdicionarItemOrdemServico(repo);
    const gerar = new GerarOrcamento(repo);
    const aprovar = new AprovarOrcamento(repo);
    const iniciarExec = new IniciarExecucao(repo);
    const finalizar = new FinalizarOrdemServico(repo);
    const entregar = new EntregarVeiculo(repo);

    return {
      repo,
      criar,
      iniciarDiag,
      addItem,
      gerar,
      aprovar,
      iniciarExec,
      finalizar,
      entregar,
    };
  }

  it('deve executar o fluxo completo de status ate ENTREGUE', () => {
    const {
      criar,
      iniciarDiag,
      addItem,
      gerar,
      aprovar,
      iniciarExec,
      finalizar,
      entregar,
    } = prepararFluxo();
    const os = criar.execute();

    iniciarDiag.execute(os.id);
    addItem.execute(os.id, {
      tipo: 'SERVICO',
      descricao: 'Servico',
      preco: 90,
      quantidade: 1,
    });
    gerar.execute(os.id);
    aprovar.execute(os.id);
    iniciarExec.execute(os.id);
    finalizar.execute(os.id);
    const entregue = entregar.execute(os.id);

    expect(entregue.getStatus()).toBe('ENTREGUE');
  });

  it('deve falhar para iniciar execucao sem aprovacao', () => {
    const { criar, iniciarExec } = prepararFluxo();
    const os = criar.execute();

    expect(() => iniciarExec.execute(os.id)).toThrow(
      'Não pode iniciar execução sem aprovação',
    );
  });

  it('deve falhar para finalizar fora de EM_EXECUCAO', () => {
    const { criar, finalizar } = prepararFluxo();
    const os = criar.execute();

    expect(() => finalizar.execute(os.id)).toThrow(
      'Só pode finalizar se estiver em execução',
    );
  });

  it('deve falhar para entregar fora de FINALIZADA', () => {
    const { criar, entregar } = prepararFluxo();
    const os = criar.execute();

    expect(() => entregar.execute(os.id)).toThrow(
      'Só pode entregar após finalização',
    );
  });

  it('deve retornar erro OS não encontrada para use-cases de status', () => {
    const { iniciarDiag, iniciarExec, finalizar, entregar } = prepararFluxo();

    expect(() => iniciarDiag.execute('x')).toThrow('OS não encontrada');
    expect(() => iniciarExec.execute('x')).toThrow('OS não encontrada');
    expect(() => finalizar.execute('x')).toThrow('OS não encontrada');
    expect(() => entregar.execute('x')).toThrow('OS não encontrada');
  });
});
