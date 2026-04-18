import { Controller, Post, Body, Get, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { CriarServico } from '../../application/use-cases/criar-servico';
import { BuscarServico } from '../../application/use-cases/buscar-servico';
import { ListarServico } from '../../application/use-cases/listar-servico';
import { servicoRepo } from '../../infraestructure/singletons';

@Controller('servicos')
export class ServicoController {
  private criarServico = new CriarServico(servicoRepo);
  private buscarServico = new BuscarServico();
  private listarServico = new ListarServico(servicoRepo);

  @Post()
  criar(@Body() body: any) {
    try {
      const s = this.criarServico.execute({ nome: body.nome, preco: body.preco });
      return s;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const s = servicoRepo.getById(id);
    if (!s) throw new NotFoundException('Serviço não encontrado');
    return this.buscarServico.execute(s);
  }

  @Get()
  listar() {
    return this.listarServico.execute();
  }
}
