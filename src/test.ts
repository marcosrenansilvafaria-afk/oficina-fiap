import { CriarOrdemServico } from './application/use-cases/criar-ordem-servico';
import { AdicionarItemOrdemServico } from './application/use-cases/adicionar-item-ordem-servico';
import { GerarOrcamento } from './application/use-cases/gerar-orcamento';
import { AprovarOrcamento } from './application/use-cases/aprovar-orcamento';

const criar = new CriarOrdemServico();
const add = new AdicionarItemOrdemServico();
const gerar = new GerarOrcamento();
const aprovar = new AprovarOrcamento();

const os = criar.execute();

add.execute(os, {
  tipo: 'SERVICO',
  descricao: 'Troca óleo',
  preco: 100,
  quantidade: 1,
});

gerar.execute(os);
aprovar.execute(os);

console.log(os.getStatus());
