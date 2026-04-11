import { CriarOrdemServico } from './application/use-cases/criar-ordem-servico';
import { AdicionarItemOrdemServico } from './application/use-cases/adicionar-item-ordem-servico';
import { GerarOrcamento } from './application/use-cases/gerar-orcamento';
import { AprovarOrcamento } from './application/use-cases/aprovar-orcamento';
import { clienteRepo, veiculoRepo, ordemRepo } from './infraestructure/singletons';

const criar = new CriarOrdemServico(ordemRepo, clienteRepo, veiculoRepo);
const add = new AdicionarItemOrdemServico(ordemRepo);
const gerar = new GerarOrcamento(ordemRepo);
const aprovar = new AprovarOrcamento(ordemRepo);

const os = criar.execute();

add.execute(os.id, {
  tipo: 'SERVICO',
  descricao: 'Troca óleo',
  preco: 100,
  quantidade: 1,
});

gerar.execute(os.id);
aprovar.execute(os.id);

console.log(os.getStatus());
