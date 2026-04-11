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
import { clienteRepo, veiculoRepo, ordemRepo } from '../../infraestructure/singletons';
import { InMemoryClienteRepository } from '../../infraestructure/in-memory-cliente-repository';
import { InMemoryVeiculoRepository } from '../../infraestructure/in-memory-veiculo-repository';

@Controller('os')
export class OrdemServicoController {
  private criarOS = new CriarOrdemServico(ordemRepo, clienteRepo, veiculoRepo);
  private adicionarItem = new AdicionarItemOrdemServico(ordemRepo);
  private gerarOrcamento = new GerarOrcamento(ordemRepo);
  private aprovarOrcamento = new AprovarOrcamento(ordemRepo);
  private iniciarExecucao = new IniciarExecucao(ordemRepo);
  private iniciarDiagnostico = new IniciarDiagnostico(ordemRepo);
  private finalizarOrdem = new FinalizarOrdemServico(ordemRepo);
  private entregarVeiculo = new EntregarVeiculo(ordemRepo);

  // using shared singleton repo
  private repo = ordemRepo;

  @Post()
  criar(@Body() body: any) {
    // accept optional clienteId and veiculoId in body
    return this.criarWithBody(body);
  }

  // extracted to allow body validation
  private criarWithBody(body: any) {
    const clienteId = body?.clienteId;
    const veiculoId = body?.veiculoId;

    if (clienteId && !clienteRepo.getById(clienteId)) {
      throw new BadRequestException('clienteId inválido');
    }

    if (veiculoId && !veiculoRepo.getById(veiculoId)) {
      throw new BadRequestException('veiculoId inválido');
    }

    const os = this.criarOS.execute({ clienteId, veiculoId });
    return os;
  }

  @Post(':id/item')
  adicionar(@Param('id') id: string, @Body() body: any) {
    const os = this.repo.getById(id);

    if (!os) {
      throw new NotFoundException('OS não encontrada');
    }

    try {
      const result = this.adicionarItem.execute(id, body);
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/orcamento')
  gerar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.gerarOrcamento.execute(id);
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/diagnostico')
  diagnostico(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.iniciarDiagnostico.execute(id);
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/aprovar')
  aprovar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.aprovarOrcamento.execute(id);
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/executar')
  executar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.iniciarExecucao.execute(id);
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/finalizar')
  finalizar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.finalizarOrdem.execute(id);
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post(':id/entregar')
  entregar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.entregarVeiculo.execute(id);
      return result;
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

  @Get()
  listar() {
    return this.repo.all();
  }
}
