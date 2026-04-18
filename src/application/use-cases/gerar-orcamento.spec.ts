import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';
import { AdicionarItemOrdemServico } from './adicionar-item-ordem-servico';
import { CriarOrdemServico } from './criar-ordem-servico';
import { GerarOrcamento } from './gerar-orcamento';
import { IniciarDiagnostico } from './iniciar-diagnostico';

describe('GerarOrcamento', () => {
  it('deve gerar orcamento e salvar OS atualizada', () => {
    const ordemRepo = new InMemoryOrdemRepository();
    const criar = new CriarOrdemServico(ordemRepo);
    const iniciarDiag = new IniciarDiagnostico(ordemRepo);
    const addItem = new AdicionarItemOrdemServico(ordemRepo);
    const gerar = new GerarOrcamento(ordemRepo);

    const os = criar.execute();
    iniciarDiag.execute(os.id);
    addItem.execute(os.id, {
      tipo: 'SERVICO',
      descricao: 'Troca',
      preco: 200,
      quantidade: 1,
    });

    const atualizada = gerar.execute(os.id);

    expect(atualizada.getStatus()).toBe('AGUARDANDO_APROVACAO');
    expect(atualizada.getValorTotal()).toBe(200);
    expect(ordemRepo.getById(os.id)?.getStatus()).toBe('AGUARDANDO_APROVACAO');
  });

  it('deve falhar quando OS nao existe', () => {
    const ordemRepo = new InMemoryOrdemRepository();
    const gerar = new GerarOrcamento(ordemRepo);

    expect(() => gerar.execute('inexistente')).toThrow('OS não encontrada');
  });
});
