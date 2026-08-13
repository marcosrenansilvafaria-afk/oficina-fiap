import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrdemServicoController } from './interfaces/http/ordem-servico.controller';
import { ClienteController } from './interfaces/http/cliente.controller';
import { VeiculoController } from './interfaces/http/veiculo.controller';
import { ServicoController } from './interfaces/http/servico.controller';
import { PecaController } from './interfaces/http/peca.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [
    OrdemServicoController,
    ClienteController,
    VeiculoController,
    ServicoController,
    PecaController,
  ],
})
export class AppModule {}
