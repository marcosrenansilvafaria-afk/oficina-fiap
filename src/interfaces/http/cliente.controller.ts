import {
  Controller, 
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { CriarCliente } from '../../application/use-cases/criar-cliente';
import { BuscarCliente } from '../../application/use-cases/buscar-cliente';
import { clienteRepo } from '../../infraestructure/singletons';

@Controller('clientes')
export class ClienteController {
  private criarCliente = new CriarCliente(clienteRepo);
  private buscarCliente = new BuscarCliente();
  private repo = clienteRepo;

  @Post()
  criar(@Body() body: any) {
    if (!body || !body.nome || !body.documento) {
      throw new BadRequestException('nome e documento são obrigatórios');
    }

    try {
      const cliente = this.criarCliente.execute({
        nome: body.nome,
        documento: body.documento
      });
      return cliente;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const cliente = this.repo.getById(id);
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    return this.buscarCliente.execute(cliente);
  }

  @Get()
  listar() {
    return this.repo.all();
  }
}
