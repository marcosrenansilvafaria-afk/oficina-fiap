import { Controller, Post, Body, Param } from '@nestjs/common';
import { CriarOrdemServico } from '../../application/use-cases/criar-ordem-servico';
import { AdicionarItemOrdemServico } from '../../application/use-cases/adicionar-item-ordem-servico';
import { OrdemServico } from '../../domain/entities/ordem-servico';

const ordens: Record<string, OrdemServico> = {};

@Controller('os')
export class OrdemServicoController {
  private criarOS = new CriarOrdemServico();
  private adicionarItem = new AdicionarItemOrdemServico();

  @Post()
  criar() {
    const os = this.criarOS.execute();
    ordens[os.id] = os;
    return os;
  }

  @Post(':id/item')
  adicionar(@Param('id') id: string, @Body() body: any) {
    const os = ordens[id];

    if (!os) {
      throw new Error('OS não encontrada');
    }

    this.adicionarItem.execute(os, body);

    return os;
  }
}
