import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CriarPeca } from '../../application/use-cases/criar-peca';
import { BuscarPeca } from '../../application/use-cases/buscar-peca';
import { ListarPeca } from '../../application/use-cases/listar-peca';
import { AjustarEstoquePeca } from '../../application/use-cases/ajustar-estoque-peca';
import { pecaRepo } from '../../infraestructure/singletons';
import { AjustarEstoquePecaDto, CriarPecaDto } from './dto/peca.dto';

@Controller('pecas')
@ApiTags('pecas')
export class PecaController {
  private criarPeca = new CriarPeca(pecaRepo);
  private buscarPeca = new BuscarPeca();
  private listarPeca = new ListarPeca(pecaRepo);
  private ajustarEstoque = new AjustarEstoquePeca(pecaRepo);

  @ApiOperation({ summary: 'Criar peca' })
  @ApiBody({ type: CriarPecaDto })
  @ApiOkResponse({ description: 'Peça criada com sucesso' })
  @Post()
  criar(@Body() body: CriarPecaDto) {
    try {
      const p = this.criarPeca.execute({
        nome: body.nome,
        preco: body.preco,
        estoque: body.estoque,
      });
      return p;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @ApiOperation({ summary: 'Buscar peca por id' })
  @ApiParam({ name: 'id', description: 'Id da peca' })
  @ApiOkResponse({ description: 'Peça encontrada' })
  @ApiNotFoundResponse({ description: 'Peça não encontrada' })
  @Get(':id')
  buscar(@Param('id') id: string) {
    const p = pecaRepo.getById(id);
    if (!p) throw new NotFoundException('Peça não encontrada');
    return this.buscarPeca.execute(p);
  }

  @ApiOperation({ summary: 'Listar pecas' })
  @ApiOkResponse({ description: 'Lista de pecas retornada com sucesso' })
  @Get()
  listar() {
    return this.listarPeca.execute();
  }

  @ApiOperation({ summary: 'Ajustar estoque da peca' })
  @ApiParam({ name: 'id', description: 'Id da peca' })
  @ApiBody({ type: AjustarEstoquePecaDto })
  @ApiOkResponse({ description: 'Estoque ajustado com sucesso' })
  @Patch(':id/estoque')
  ajustar(@Param('id') id: string, @Body() body: AjustarEstoquePecaDto) {
    const delta = Number(body?.delta);
    if (isNaN(delta))
      throw new BadRequestException('delta numérico obrigatório');
    try {
      return this.ajustarEstoque.execute(id, delta);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}
