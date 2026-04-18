import { Controller, Post, Body, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CriarVeiculo } from '../../application/use-cases/criar-veiculo';
import { BuscarVeiculo } from '../../application/use-cases/buscar-veiculo';
import { veiculoRepo } from '../../infraestructure/singletons';
import { CriarVeiculoDto } from './dto/veiculo.dto';

@Controller('veiculos')
@ApiTags('veiculos')
export class VeiculoController {
  private criarVeiculo = new CriarVeiculo(veiculoRepo);
  private buscarVeiculo = new BuscarVeiculo();
  private repo = veiculoRepo;

  @ApiOperation({ summary: 'Criar veiculo' })
  @ApiBody({ type: CriarVeiculoDto })
  @ApiOkResponse({ description: 'Veiculo criado com sucesso' })
  @Post()
  criar(@Body() body: CriarVeiculoDto) {
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

  @ApiOperation({ summary: 'Buscar veiculo por id' })
  @ApiParam({ name: 'id', description: 'Id do veiculo' })
  @ApiOkResponse({ description: 'Veiculo encontrado' })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  @Get(':id')
  buscar(@Param('id') id: string) {
    const veiculo = this.repo.getById(id);
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return this.buscarVeiculo.execute(veiculo);
  }

  @ApiOperation({ summary: 'Listar veiculos' })
  @ApiOkResponse({ description: 'Lista de veiculos retornada com sucesso' })
  @Get()
  listar() {
    return this.repo.all();
  }
}
