const express = require('express');
const cors = require('cors');

const app = express();

// Porta da API. Pode ser alterada pela variável de ambiente PORT.
const PORT = process.env.PORT || 3000;

// Permite que o site do AI Studio/Vercel consulte a API.
app.use(cors());

// Recebe JSON enviado pelo ESP32.
app.use(express.json({ limit: '1mb' }));

// ============================================================
// ESTADO ATUAL DO ESP32
// ============================================================
// A API mantém exatamente o JSON recebido, sem renomear,
// converter ou remover campos.
let dadosESP32 = null;
let ultimaAtualizacao = null;

// ============================================================
// ROTA RAIZ
// ============================================================
app.get('/', (req, res) => {
  res.json({
    status: 'API ESP32 funcionando',
    endpointRecebimento: 'POST /api/dados',
    endpointConsulta: 'GET /api/dados',
    endpointStatus: 'GET /api/status',
    ultimaAtualizacao
  });
});

// ============================================================
// RECEBER DADOS DO ESP32
// ============================================================
app.post('/api/dados', (req, res) => {
  dadosESP32 = req.body;
  ultimaAtualizacao = new Date().toISOString();

  console.log('\n========================================');
  console.log('DADOS RECEBIDOS DO ESP32');
  console.log('========================================');
  console.log(JSON.stringify(dadosESP32, null, 2));
  console.log('========================================\n');

  res.status(200).json({
    sucesso: true,
    mensagem: 'Dados recebidos com sucesso.'
  });
});

// ============================================================
// CONSULTAR DADOS DO ESP32
// ============================================================
app.get('/api/dados', (req, res) => {
  if (dadosESP32 === null) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Ainda não existem dados do ESP32.'
    });
  }

  // Retorna exatamente o JSON enviado pelo ESP32.
  res.json(dadosESP32);
});

// ============================================================
// STATUS DA API
// ============================================================
app.get('/api/status', (req, res) => {
  res.json({
    api: 'online',
    esp32Conectado: dadosESP32 !== null,
    ultimaAtualizacao
  });
});

// ============================================================
// TRATAMENTO DE JSON INVÁLIDO
// ============================================================
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'JSON inválido.'
    });
  }

  next(err);
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('API DE SENSORES INICIADA');
  console.log('========================================');
  console.log(`Porta: ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Dados: http://localhost:${PORT}/api/dados`);
  console.log(`Status: http://localhost:${PORT}/api/status`);
  console.log('========================================');
});
