import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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
import {
  clienteRepo,
  veiculoRepo,
  ordemRepo,
  pecaRepo,
  servicoRepo,
} from '../../infraestructure/singletons';
import { InMemoryClienteRepository } from '../../infraestructure/in-memory-cliente-repository';
import { InMemoryVeiculoRepository } from '../../infraestructure/in-memory-veiculo-repository';
import {
  AdicionarItemOrdemServicoDto,
  CriarOrdemServicoDto,
} from './dto/ordem-servico.dto';

@Controller('os')
@ApiTags('ordens-servico')
export class OrdemServicoController {
  private criarOS = new CriarOrdemServico(ordemRepo, clienteRepo, veiculoRepo);
  private adicionarItem = new AdicionarItemOrdemServico(
    ordemRepo,
    pecaRepo,
    servicoRepo,
  );
  private gerarOrcamento = new GerarOrcamento(ordemRepo);
  private aprovarOrcamento = new AprovarOrcamento(ordemRepo);
  private iniciarExecucao = new IniciarExecucao(ordemRepo);
  private iniciarDiagnostico = new IniciarDiagnostico(ordemRepo);
  private finalizarOrdem = new FinalizarOrdemServico(ordemRepo);
  private entregarVeiculo = new EntregarVeiculo(ordemRepo);

  // using shared singleton repo
  private repo = ordemRepo;
  private pecaRepo = pecaRepo;
  private servicoRepo = servicoRepo;

  @ApiOperation({ summary: 'Criar ordem de servico' })
  @ApiBody({ type: CriarOrdemServicoDto })
  @ApiOkResponse({ description: 'OS criada com sucesso' })
  @Post()
  criar(@Body() body: CriarOrdemServicoDto) {
    // accept optional clienteId and veiculoId in body
    return this.criarWithBody(body);
  }

  // extracted to allow body validation
  private criarWithBody(body: CriarOrdemServicoDto) {
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

  @ApiOperation({ summary: 'Adicionar item na ordem de servico' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiBody({ type: AdicionarItemOrdemServicoDto })
  @ApiOkResponse({ description: 'Item adicionado com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @Post(':id/item')
  adicionar(
    @Param('id') id: string,
    @Body() body: AdicionarItemOrdemServicoDto,
  ) {
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

  @ApiOperation({ summary: 'Gerar orcamento da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Orcamento gerado com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
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

  @ApiOperation({ summary: 'Iniciar diagnostico da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Diagnostico iniciado com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
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

  @ApiOperation({ summary: 'Aprovar orcamento da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Orcamento aprovado com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
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

  @ApiOperation({ summary: 'Iniciar execucao da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Execucao iniciada com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
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

  @ApiOperation({ summary: 'Finalizar ordem de servico' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'OS finalizada com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
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

  @ApiOperation({ summary: 'Entregar veiculo da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Veiculo entregue com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
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

  @ApiOperation({ summary: 'Buscar OS por id' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'OS encontrada' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @Get(':id')
  buscar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');
    return os;
  }

  @ApiOperation({ summary: 'Listar ordens de servico' })
  @ApiOkResponse({ description: 'Lista de OS retornada com sucesso' })
  @Get()
  listar() {
    return this.repo.all();
  }
}
