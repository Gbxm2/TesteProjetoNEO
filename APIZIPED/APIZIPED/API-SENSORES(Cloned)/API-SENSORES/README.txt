API-SENSORES - ESP32

1. Abra o terminal dentro desta pasta.

2. Instale as dependencias:
   npm install

3. Inicie a API:
   npm start

4. A API sera iniciada na porta 3000.

Rotas:
   GET  /                 -> verifica se a API esta funcionando
   POST /api/dados        -> recebe os dados do ESP32
   GET  /api/dados        -> entrega os ultimos dados recebidos
   GET  /api/status       -> mostra o estado da API e se ja recebeu dados

IMPORTANTE - ESP32:
No codigo do ESP32, altere:

const char* apiURL = "http://192.168.1.100:3000/api/dados";

para o IPv4 do computador onde a API esta rodando.

Exemplo:
const char* apiURL = "http://192.168.1.50:3000/api/dados";

O computador e o ESP32 precisam estar na mesma rede Wi-Fi quando a API estiver rodando localmente.

O JSON enviado pelo ESP32 nao e alterado pela API. Os campos permanecem:
wifi
ip
detectar
aceleracao
aceleracaoG
picoAceleracaoG
picoG
pontuacao
pontosMPU
pontosVibracao
pontosSom
avaliando
impacto
vibracao
som
gpsValido
latitude
longitude
altitude
satelites
hdop
mapsUrl
log

Observacao:
Esta versao guarda apenas o ultimo JSON recebido em memoria. Se o servidor for reiniciado, os dados anteriores serao perdidos.
