import { Controller, Post, Body, Get, Param, Patch, BadRequestException, NotFoundException } from '@nestjs/common';
import { CriarPeca } from '../../application/use-cases/criar-peca';
import { BuscarPeca } from '../../application/use-cases/buscar-peca';
import { ListarPeca } from '../../application/use-cases/listar-peca';
import { AjustarEstoquePeca } from '../../application/use-cases/ajustar-estoque-peca';
import { pecaRepo } from '../../infraestructure/singletons';

@Controller('pecas')
export class PecaController {
  private criarPeca = new CriarPeca(pecaRepo);
  private buscarPeca = new BuscarPeca();
  private listarPeca = new ListarPeca(pecaRepo);
  private ajustarEstoque = new AjustarEstoquePeca(pecaRepo);

  @Post()
  criar(@Body() body: any) {
    try {
      const p = this.criarPeca.execute({ nome: body.nome, preco: body.preco, estoque: body.estoque });
      return p;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const p = pecaRepo.getById(id);
    if (!p) throw new NotFoundException('Peça não encontrada');
    return this.buscarPeca.execute(p);
  }

  @Get()
  listar() {
    return this.listarPeca.execute();
  }

  @Patch(':id/estoque')
  ajustar(@Param('id') id: string, @Body() body: any) {
    const delta = Number(body?.delta);
    if (isNaN(delta)) throw new BadRequestException('delta numérico obrigatório');
    try {
      return this.ajustarEstoque.execute(id, delta);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}
