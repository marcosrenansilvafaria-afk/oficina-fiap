import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { resetInMemoryRepositories } from '../src/infraestructure/singletons';

describe('Controllers integration (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
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

  afterEach(async () => {
    await app.close();
  });

  it('POST /clientes should return 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/clientes')
      .send({ nome: 'Joao', documento: '12345678901' });

    expect(res.status).toBe(401);
  });

  it('POST /clientes should validate required fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/clientes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Joao' });

    expect(res.status).toBe(400);
    expect(String(res.body.message)).toContain(
      'nome e documento são obrigatórios',
    );
  });

  it('POST /clientes then GET /clientes/:id should return created resource', async () => {
    const create = await request(app.getHttpServer())
      .post('/clientes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Joao', documento: '123.456.789-01' });

    expect(create.status).toBe(201);
    expect(create.body.id).toBeDefined();
    expect(create.body.documento).toBe('12345678901');

    const get = await request(app.getHttpServer())
      .get(`/clientes/${create.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(get.status).toBe(200);
    expect(get.body.id).toBe(create.body.id);
  });

  it('GET /clientes/:id should return 404 for missing id', async () => {
    const res = await request(app.getHttpServer())
      .get('/clientes/inexistente')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(String(res.body.message)).toContain('Cliente não encontrado');
  });

  it('POST /veiculos should validate required fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/veiculos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ placa: 'ABC1D23' });

    expect(res.status).toBe(400);
    expect(String(res.body.message)).toContain(
      'placa, modelo, marca e ano são obrigatórios',
    );
  });

  it('POST /pecas then PATCH /pecas/:id/estoque should validate numeric delta', async () => {
    const create = await request(app.getHttpServer())
      .post('/pecas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Filtro', preco: 30, estoque: 10 });

    expect(create.status).toBe(201);

    const patch = await request(app.getHttpServer())
      .patch(`/pecas/${create.body.id}/estoque`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ delta: 'abc' });

    expect(patch.status).toBe(400);
    expect(String(patch.body.message)).toContain('delta numérico obrigatório');
  });

  it('POST /os should reject invalid clienteId and veiculoId', async () => {
    const invalidCliente = await request(app.getHttpServer())
      .post('/os')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ clienteId: 'c-x' });
    expect(invalidCliente.status).toBe(400);
    expect(String(invalidCliente.body.message)).toContain('clienteId inválido');

    const invalidVeiculo = await request(app.getHttpServer())
      .post('/os')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ veiculoId: 'v-x' });
    expect(invalidVeiculo.status).toBe(400);
    expect(String(invalidVeiculo.body.message)).toContain('veiculoId inválido');
  });

  it('POST /os/:id/orcamento should return 404 for missing OS', async () => {
    const res = await request(app.getHttpServer())
      .post('/os/inexistente/orcamento')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(res.status).toBe(404);
    expect(String(res.body.message)).toContain('OS não encontrada');
  });
});
