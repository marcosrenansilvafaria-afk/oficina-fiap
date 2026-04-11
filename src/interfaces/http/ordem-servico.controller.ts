import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CriarOrdemServico } from '../../application/use-cases/criar-ordem-servico';
import { AdicionarItemOrdemServico } from '../../application/use-cases/adicionar-item-ordem-servico';
import { GerarOrcamento } from '../../application/use-cases/gerar-orcamento';
import { AprovarOrcamento } from '../../application/use-cases/aprovar-orcamento';
import { IniciarExecucao } from '../../application/use-cases/iniciar-execucao';
import { IniciarDiagnostico } from '../../application/use-cases/iniciar-diagnostico';
import { FinalizarOrdemServico } from '../../application/use-cases/finalizar-ordem-servico';
import { EntregarVeiculo } from '../../application/use-cases/entregar-veiculo';
import { OrdemServico } from '../../domain/entities/ordem-servico';
import { InMemoryOrdemRepository } from '../../infraestructure/in-memory-ordem-repository';

@Controller('os')
export class OrdemServicoController {
  private criarOS = new CriarOrdemServico();
  private adicionarItem = new AdicionarItemOrdemServico();
  private gerarOrcamento = new GerarOrcamento();
  private aprovarOrcamento = new AprovarOrcamento();
  private iniciarExecucao = new IniciarExecucao();
  private iniciarDiagnostico = new IniciarDiagnostico();
  private finalizarOrdem = new FinalizarOrdemServico();
  private entregarVeiculo = new EntregarVeiculo();

  // usando repositório in-memory diretamente (simplicidade)
  private repo = new InMemoryOrdemRepository();

  @Post()
  criar() {
    const os = this.criarOS.execute();
    this.repo.save(os);
    return os;
  }

  @Post(':id/item')
  adicionar(@Param('id') id: string, @Body() body: any) {
    const os = this.repo.getById(id);

    if (!os) {
      throw new NotFoundException('OS não encontrada');
    }

    try {
      this.adicionarItem.execute(os, body);
      this.repo.save(os);
      return os;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/orcamento')
  gerar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      this.gerarOrcamento.execute(os);
      this.repo.save(os);
      return os;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/diagnostico')
  diagnostico(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      this.iniciarDiagnostico.execute(os);
      this.repo.save(os);
      return os;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/aprovar')
  aprovar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      this.aprovarOrcamento.execute(os);
      this.repo.save(os);
      return os;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/executar')
  executar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      this.iniciarExecucao.execute(os);
      this.repo.save(os);
      return os;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/finalizar')
  finalizar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      this.finalizarOrdem.execute(os);
      this.repo.save(os);
      return os;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/entregar')
  entregar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      this.entregarVeiculo.execute(os);
      this.repo.save(os);
      return os;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');
    return os;
  }
}
