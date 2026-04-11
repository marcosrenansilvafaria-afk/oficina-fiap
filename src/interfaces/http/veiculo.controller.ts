import { Controller, Post, Body, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { CriarVeiculo } from '../../application/use-cases/criar-veiculo';
import { BuscarVeiculo } from '../../application/use-cases/buscar-veiculo';
import { veiculoRepo } from '../../infraestructure/singletons';

@Controller('veiculos')
export class VeiculoController {
  private criarVeiculo = new CriarVeiculo(veiculoRepo);
  private buscarVeiculo = new BuscarVeiculo();

  @Post()
  criar(@Body() body: any) {
    if (!body || !body.placa || !body.modelo || !body.marca || !body.ano) {
      throw new BadRequestException('placa, modelo, marca e ano são obrigatórios');
    }

    try {
      const veiculo = this.criarVeiculo.execute({
        placa: body.placa,
        modelo: body.modelo,
        marca: body.marca,
        ano: Number(body.ano),
      });
      return veiculo;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    const veiculo = this.repo.getById(id);
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return this.buscarVeiculo.execute(veiculo);
  }

  @Get()
  listar() {
    return this.repo.all();
  }
}
