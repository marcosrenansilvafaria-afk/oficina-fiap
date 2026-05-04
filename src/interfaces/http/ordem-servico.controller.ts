import {
  UseGuards,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CriarOrdemServico } from '../../application/use-cases/criar-ordem-servico';
import { AdicionarItemOrdemServico } from '../../application/use-cases/adicionar-item-ordem-servico';
import { GerarOrcamento } from '../../application/use-cases/gerar-orcamento';
import { AprovarOrcamento } from '../../application/use-cases/aprovar-orcamento';
import { IniciarExecucao } from '../../application/use-cases/iniciar-execucao';
import { IniciarDiagnostico } from '../../application/use-cases/iniciar-diagnostico';
import { FinalizarOrdemServico } from '../../application/use-cases/finalizar-ordem-servico';
import { EntregarVeiculo } from '../../application/use-cases/entregar-veiculo';
import {
  clienteRepo,
  veiculoRepo,
  ordemRepo,
  pecaRepo,
  servicoRepo,
} from '../../infraestructure/singletons';
import {
  AdicionarItemOrdemServicoDto,
  CriarOrdemServicoDto,
} from './dto/ordem-servico.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/roles.enum';
import { getErrorMessage } from './error-message';

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
  private envioOrcamento = new Map<
    string,
    { status: 'NAO_ENVIADO' | 'ENVIADO'; enviadoEm?: string }
  >();
  private execucaoIniciadaEm = new Map<string, number>();
  private execucaoConcluidaMs = new Map<string, number>();

  @ApiOperation({ summary: 'Criar ordem de servico' })
  @ApiBody({ type: CriarOrdemServicoDto })
  @ApiOkResponse({ description: 'OS criada com sucesso' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ATENDENTE)
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
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ATENDENTE)
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
    } catch (err: unknown) {
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({ summary: 'Gerar orcamento da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Orcamento gerado com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ATENDENTE)
  @Post(':id/orcamento')
  gerar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.gerarOrcamento.execute(id);
      if (!this.envioOrcamento.has(id)) {
        this.envioOrcamento.set(id, { status: 'NAO_ENVIADO' });
      }
      return result;
    } catch (err: unknown) {
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({ summary: 'Simular envio de orcamento ao cliente' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Orcamento marcado como enviado' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ATENDENTE)
  @Post(':id/enviar-orcamento')
  enviarOrcamento(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    if (os.getStatus() !== 'AGUARDANDO_APROVACAO') {
      throw new BadRequestException(
        'Só é possível enviar orçamento quando a OS está em AGUARDANDO_APROVACAO',
      );
    }

    const envio = {
      status: 'ENVIADO' as const,
      enviadoEm: new Date().toISOString(),
    };
    this.envioOrcamento.set(id, envio);

    return {
      ordemServicoId: id,
      ...envio,
    };
  }

  @ApiOperation({ summary: 'Iniciar diagnostico da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Diagnostico iniciado com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MECANICO)
  @Post(':id/diagnostico')
  diagnostico(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.iniciarDiagnostico.execute(id);
      return result;
    } catch (err: unknown) {
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({ summary: 'Aprovar orcamento da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Orcamento aprovado com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ATENDENTE)
  @Post(':id/aprovar')
  aprovar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.aprovarOrcamento.execute(id);
      return result;
    } catch (err: unknown) {
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({ summary: 'Iniciar execucao da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Execucao iniciada com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MECANICO)
  @Post(':id/executar')
  executar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.iniciarExecucao.execute(id);
      this.execucaoIniciadaEm.set(id, Date.now());
      return result;
    } catch (err: unknown) {
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({ summary: 'Finalizar ordem de servico' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'OS finalizada com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MECANICO)
  @Post(':id/finalizar')
  finalizar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.finalizarOrdem.execute(id);
      const inicioExecucao = this.execucaoIniciadaEm.get(id);
      let tempoExecucaoMs: number | null = null;

      if (inicioExecucao) {
        tempoExecucaoMs = Date.now() - inicioExecucao;
        this.execucaoConcluidaMs.set(id, tempoExecucaoMs);
        this.execucaoIniciadaEm.delete(id);
      }

      return {
        id: result.id,
        status: result.getStatus(),
        tempoExecucaoMs,
      };
    } catch (err: unknown) {
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({
    summary: 'Consultar SLA medio de atendimento (criacao -> finalizacao)',
  })
  @ApiOkResponse({
    description:
      'Métrica de SLA de atendimento (intervalo entre criação e finalização). Considera apenas OS em status FINALIZADA.',
  })
  @Get('sla-atendimento')
  slaAtendimento() {
    const ordensConcluidas = this.repo
      .all()
      .filter((os) => os.getStatus() === 'FINALIZADA');

    const totalOrdensConcluidas = ordensConcluidas.length;
    const totalSlaMs = ordensConcluidas.reduce((acc, os) => {
      const criadaEm = os.getCriadaEm();
      const finalizadaEm = os.getFinalizadaEm();
      if (!finalizadaEm) {
        return acc;
      }
      return acc + (finalizadaEm.getTime() - criadaEm.getTime());
    }, 0);

    const slaMedioAtendimentoMs =
      totalOrdensConcluidas === 0
        ? 0
        : Math.round(totalSlaMs / totalOrdensConcluidas);

    return {
      totalOrdensConcluidas,
      slaMedioAtendimentoMs,
    };
  }

  @ApiOperation({ summary: 'Entregar veiculo da OS' })
  @ApiParam({ name: 'id', description: 'Id da ordem de servico' })
  @ApiOkResponse({ description: 'Veiculo entregue com sucesso' })
  @ApiNotFoundResponse({ description: 'OS não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ATENDENTE)
  @Post(':id/entregar')
  entregar(@Param('id') id: string) {
    const os = this.repo.getById(id);
    if (!os) throw new NotFoundException('OS não encontrada');

    try {
      const result = this.entregarVeiculo.execute(id);
      return result;
    } catch (err: unknown) {
      throw new BadRequestException(getErrorMessage(err));
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
    return {
      ...os,
      envioOrcamento: this.envioOrcamento.get(id) || { status: 'NAO_ENVIADO' },
      tempoExecucaoMs: this.execucaoConcluidaMs.get(id) ?? null,
    };
  }

  @ApiOperation({ summary: 'Listar ordens de servico' })
  @ApiOkResponse({ description: 'Lista de OS retornada com sucesso' })
  @Get()
  listar() {
    return this.repo.all().map((os) => ({
      ...os,
      envioOrcamento: this.envioOrcamento.get(os.id) || {
        status: 'NAO_ENVIADO',
      },
      tempoExecucaoMs: this.execucaoConcluidaMs.get(os.id) ?? null,
    }));
  }
}
