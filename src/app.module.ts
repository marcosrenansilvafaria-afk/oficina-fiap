import { Module } from '@nestjs/common';
import { OrdemServicoController } from './interfaces/http/ordem-servico.controller';

@Module({
  controllers: [OrdemServicoController],
})
@Module({
  imports: [],
})
export class AppModule {}
