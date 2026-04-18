import { ItemOrdemServico } from './item-ordem-servico';

export type StatusOrdemServico =
  | 'RECEBIDA'
  | 'EM_DIAGNOSTICO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'EM_EXECUCAO'
  | 'FINALIZADA'
  | 'ENTREGUE';

export class OrdemServico {
  private status: StatusOrdemServico;
  private itens: ItemOrdemServico[] = [];
  private valorTotal: number = 0;

  constructor(
    public readonly id: string,
    public readonly clienteId?: string,
    public readonly veiculoId?: string,
  ) {
    this.status = 'RECEBIDA';
  }

  // 🔹 Adicionar item
  adicionarItem(item: ItemOrdemServico) {
    if (this.status !== 'EM_DIAGNOSTICO') {
      throw new Error('Não é possível adicionar itens neste status — só em EM_DIAGNOSTICO');
    }

    this.itens.push(item);
  }

  // 🔹 Gerar orçamento
  gerarOrcamento() {
    if (this.itens.length === 0) {
      throw new Error('Não é possível gerar orçamento sem itens');
    }

    this.valorTotal = this.itens.reduce(
      (acc, item) => acc + item.total(),
      0,
    );

    this.status = 'AGUARDANDO_APROVACAO';
  }

  // 🔹 Iniciar diagnóstico
  iniciarDiagnostico() {
    if (this.status !== 'RECEBIDA' && this.status !== 'AGUARDANDO_APROVACAO') {
      throw new Error('Só é possível iniciar diagnóstico quando a OS está RECEBIDA');
    }

    this.status = 'EM_DIAGNOSTICO';
  }

  // 🔹 Aprovar orçamento
  aprovarOrcamento() {
    if (this.status !== 'AGUARDANDO_APROVACAO') {
      throw new Error('Orçamento não está disponível para aprovação');
    }

    this.status = 'APROVADA';
  }

  // 🔹 Iniciar execução
  iniciarExecucao() {
    if (this.status !== 'APROVADA') {
      throw new Error('Não pode iniciar execução sem aprovação');
    }

    this.status = 'EM_EXECUCAO';
  }

  // 🔹 Finalizar OS
  finalizar() {
    if (this.status !== 'EM_EXECUCAO') {
      throw new Error('Só pode finalizar se estiver em execução');
    }

    this.status = 'FINALIZADA';
  }

  // 🔹 Entregar veículo
  entregar() {
    if (this.status !== 'FINALIZADA') {
      throw new Error('Só pode entregar após finalização');
    }

    this.status = 'ENTREGUE';
  }

  // 🔹 getters (boa prática)
  getStatus() {
    return this.status;
  }

  getItens() {
    return this.itens;
  }

  getValorTotal() {
    return this.valorTotal;
  }
}