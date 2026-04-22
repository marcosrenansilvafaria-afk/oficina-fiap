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
  let accessToken: string;

  beforeAll(async () => {
    resetInMemoryRepositories();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@oficina.com', senha: '123456' });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should run full OS workflow with real servico/peca data', async () => {
    // create part
    const pecaRes = await request(app.getHttpServer())
      .post('/pecas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Filtro', preco: 50, estoque: 10 });
    okStatus(pecaRes);
    const pecaId = pecaRes.body.id;
    expect(pecaId).toBeDefined();

    // create service
    const servRes = await request(app.getHttpServer())
      .post('/servicos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Troca óleo', preco: 120 });
    okStatus(servRes);
    const servId = servRes.body.id;
    expect(servId).toBeDefined();

    // create order
    const osRes = await request(app.getHttpServer())
      .post('/os')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    okStatus(osRes);
    const osId = osRes.body.id;
    expect(osId).toBeDefined();

    // iniciar diagnostico (obrigatório para adicionar itens)
    const diagRes = await request(app.getHttpServer())
      .post(`/os/${osId}/diagnostico`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    okStatus(diagRes);

    // add part item
    const addPecaRes = await request(app.getHttpServer())
      .post(`/os/${osId}/item`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ tipo: 'PECA', pecaId, quantidade: 2 });
    okStatus(addPecaRes);

    // add service item
    const addServRes = await request(app.getHttpServer())
      .post(`/os/${osId}/item`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ tipo: 'SERVICO', servicoId: servId, quantidade: 1 });
    okStatus(addServRes);

    // gerar orcamento
    const gerarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/orcamento`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    okStatus(gerarRes);

    // simular envio ao cliente
    const enviarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/enviar-orcamento`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    okStatus(enviarRes);
    expect(enviarRes.body.status).toBe('ENVIADO');

    // aprovar
    const aprovarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/aprovar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    okStatus(aprovarRes);

    // iniciar execucao
    const executarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/executar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    okStatus(executarRes);

    // finalizar
    const finalizarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/finalizar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    okStatus(finalizarRes);
    expect(finalizarRes.body.tempoExecucaoMs).not.toBeNull();

    // entregar
    const entregarRes = await request(app.getHttpServer())
      .post(`/os/${osId}/entregar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    okStatus(entregarRes);

    // fetch and verify OS exists
    const fetchRes = await request(app.getHttpServer())
      .get(`/os/${osId}`)
      .send();
    okStatus(fetchRes);
    expect(fetchRes.body.id).toBe(osId);
    expect(fetchRes.body.envioOrcamento.status).toBe('ENVIADO');

    const tempoRes = await request(app.getHttpServer())
      .get('/os/tempo-medio')
      .send();
    okStatus(tempoRes);
    expect(tempoRes.body.totalExecucoesConcluidas).toBeGreaterThanOrEqual(1);
  }, 20000);
});
