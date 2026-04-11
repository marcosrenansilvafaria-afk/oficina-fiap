import { Module } from '@nestjs/common';
import { OrdemServicoController } from './interfaces/http/ordem-servico.controller';
import { ClienteController } from './interfaces/http/cliente.controller';
import { VeiculoController } from './interfaces/http/veiculo.controller';

@Module({
  imports: [],
  controllers: [OrdemServicoController, ClienteController, VeiculoController],
})
export class AppModule {}
