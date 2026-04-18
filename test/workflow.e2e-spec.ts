import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { resetInMemoryRepositories } from './../src/infraestructure/singletons';

function okStatus(res: request.Response) {
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(
      `Unexpected status ${res.status}: ${JSON.stringify(res.body)}`,
    );
  }
}

describe('Workflow e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    resetInMemoryRepositories();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should run full OS workflow with real servico/peca data', async () => {
    // create part
    const pecaRes = await request(app.getHttpServer())
      .post('/pecas')
      .send({ nome: 'Filtro', preco: 50, estoque: 10 });
    okStatus(pecaRes);
    const pecaId = pecaRes.body.id;
    expect(pecaId).toBeDefined();

    // create service
    const servRes = await request(app.getHttpServer())
      .post('/servicos')
      .send({ nome: 'Troca óleo', preco: 120 });
    okStatus(servRes);
    const servId = servRes.body.id;
    expect(servId).toBeDefined();

    // create order
    const osRes = await request(app.getHttpServer()).post('/os').send({});
    okStatus(osRes);
    const osId = osRes.body.id;
    expect(osId).toBeDefined();

    // iniciar diagnostico (obrigatório para adicionar itens)
    const diagRes = await request(app.getHttpServer())
      .post(`/os/${osId}/diagnostico`)
      .send();
    okStatus(diagRes);

    // add part item
    const addPecaRes = await request(app.getHttpServer())
      .post(`/os/${osId}/item`)
      .send({ tipo: 'PECA', pecaId, quantidade: 2 });
    okStatus(addPecaRes);

    // add service item
    const addServRes = await request(app.getHttpServer())
      .post(`/os/${osId}/item`)
      .send({ tipo: 'SERVICO', servicoId: servId, quantidade: 1 });
    okStatus(addServRes);

    // gerar orcamento
    const gerarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/orcamento`)
      .send();
    okStatus(gerarRes);

    // aprovar
    const aprovarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/aprovar`)
      .send();
    okStatus(aprovarRes);

    // iniciar execucao
    const executarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/executar`)
      .send();
    okStatus(executarRes);

    // finalizar
    const finalizarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/finalizar`)
      .send();
    okStatus(finalizarRes);

    // entregar
    const entregarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/entregar`)
      .send();
    okStatus(entregarRes);

    // fetch and verify OS exists
    const fetchRes = await request(app.getHttpServer())
      .get(`/os/${osId}`)
      .send();
    okStatus(fetchRes);
    expect(fetchRes.body.id).toBe(osId);
  }, 20000);
});
