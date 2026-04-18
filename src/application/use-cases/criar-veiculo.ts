import { Veiculo } from '../../domain/entities/veiculo';
import { generateId } from '../../utils/id';
import { InMemoryVeiculoRepository } from '../../infraestructure/in-memory-veiculo-repository';

type Input = { placa: string; modelo: string; marca: string; ano: number };

export class CriarVeiculo {
  constructor(private repo: InMemoryVeiculoRepository) {}

  execute(input?: Input) {
    const id = generateId();
    const veiculo = new Veiculo(
      id,
      input?.placa || '',
      input?.modelo || '',
      input?.marca || '',
      input?.ano || 0,
    );
    this.repo.save(veiculo);
    return veiculo;
  }
}
