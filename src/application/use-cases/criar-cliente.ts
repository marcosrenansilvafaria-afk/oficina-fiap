import { Cliente } from '../../domain/entities/cliente';
import { generateId } from '../../utils/id';
import { InMemoryClienteRepository } from '../../infraestructure/in-memory-cliente-repository';

type Input = { nome: string; documento: string };

export class CriarCliente {
  constructor(private repo: InMemoryClienteRepository) {}

  execute(input: Input) {
    // normalize documento: digits only
    const documento = String(input.documento).replace(/\D/g, '');

    if (documento.length !== 11 && documento.length !== 14) {
      throw new Error('documento inválido (esperado CPF/CNPJ)');
    }

    // business rule: no duplicate documento
    const exists = this.repo
      .all()
      .some((c) => String(c.documento).replace(/\D/g, '') === documento);
    if (exists) {
      throw new Error('Cliente com este documento já cadastrado');
    }

    const id = generateId();
    const cliente = new Cliente(id, input.nome, documento);
    this.repo.save(cliente);
    return cliente;
  }
}
