import { Module } from '@nestjs/common';
import { OrdemServicoController } from './interfaces/http/ordem-servico.controller';
import { ClienteController } from './interfaces/http/cliente.controller';
import { VeiculoController } from './interfaces/http/veiculo.controller';
import { ServicoController } from './interfaces/http/servico.controller';
import { PecaController } from './interfaces/http/peca.controller';

@Module({
  imports: [],
  controllers: [
    OrdemServicoController,
    ClienteController,
    VeiculoController,
    ServicoController,
    PecaController,
  ],
})
export class AppModule {}
