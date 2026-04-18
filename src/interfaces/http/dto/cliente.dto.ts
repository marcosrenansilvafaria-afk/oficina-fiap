import { ApiProperty } from '@nestjs/swagger';

export class CriarClienteDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'Joao da Silva',
  })
  nome!: string;

  @ApiProperty({
    description:
      'Documento do cliente (CPF/CNPJ; regra atual valida 11 digitos)',
    example: '12345678901',
  })
  documento!: string;
}
