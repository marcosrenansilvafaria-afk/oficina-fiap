import { IOrdemRepository } from '../../domain/repositories/ordem-repository.interface';

export class EntregarVeiculo {
  constructor(private repo: IOrdemRepository) {}

  async execute(id: string) {
    const os = await this.repo.getById(id);
    if (!os) throw new Error('OS não encontrada');
    os.entregar();
    await this.repo.save(os);
    return os;
  }
}
