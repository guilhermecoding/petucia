# PETUCIA

Interface web da **Petucia**: lê a umidade do solo via Arduino (USB), mostra a porcentagem na tela e exibe frases conforme o nível de “sede” da planta.

## O que você precisa

| Item | Versão sugerida |
|------|------------------|
| [Node.js](https://nodejs.org/) | 20 ou superior |
| [pnpm](https://pnpm.io/installation) | 9+ |
| Arduino (Uno, Nano, etc.) | com cabo USB |
| Sensor de umidade do solo | sinal analógico no pino **A0** |
| Windows / macOS / Linux | porta serial (ex.: `COM6` no Windows) |

## Visão geral

```
Arduino (A0) ──USB──► ponte serial (Node) ──► .data/sensor-state.json
                                              │
Next.js (site) ◄── API /api/sensors ◄────────┘
```

O site **não** abre a porta USB sozinho no deploy em nuvem. No seu PC, `pnpm dev` e `pnpm start` sobem **site + leitura serial** juntos.

---

## 1. Preparar o Arduino

### Biblioteca

No **Arduino IDE**:

1. **Sketch → Incluir Biblioteca → Gerenciar Bibliotecas…**
2. Instale **ArduinoJson** (autor: Benoit Blanchon).

### Firmware

1. Abra `firmware/firmware.ino` nesta pasta (ou copie a pasta `firmware` para o IDE).
2. Conecte o sensor de umidade do solo ao pino **A0**.
3. Selecione a placa e a porta corretas.
4. **Upload**.

O Arduino envia JSON pela serial a cada **3 segundos** (9600 baud), por exemplo:

```json
{"soil_moisture":512}
```

Mais detalhes em [`firmware/README.md`](firmware/README.md).

### Descobrir a porta COM (Windows)

1. **Gerenciador de Dispositivos → Portas (COM e LPT)**
2. Anote algo como `COM6` (muda se você desconectar ou usar outra USB).

---

## 2. Preparar o projeto (Node)

### Clonar e instalar

```bash
git clone <url-do-repositorio> petucia
cd petucia
pnpm install
```

### Variáveis de ambiente

Copie o exemplo e ajuste a porta do Arduino:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
ARDUINO_PORT=COM6
```

(use a COM do seu PC)

### Build nativo do `serialport` (importante no Windows)

Na primeira instalação, o pnpm pode **ignorar** scripts nativos. Se a serial não conectar, rode:

```bash
pnpm approve-builds
```

Marque `@serialport/bindings-cpp` (e `esbuild` se aparecer), confirme, depois:

```bash
pnpm install
```

---

## 3. Desenvolvimento (recomendado)

**Feche o Monitor Serial do Arduino IDE** — só um programa pode usar a porta ao mesmo tempo.

```bash
pnpm dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- No terminal, procure linhas `[serial]`:
  - `Arduino conectado em COM6`
  - `Leitura recebida: {"soil_moisture":...}`

A página atualiza sozinha a cada poucos segundos.

### Scripts úteis

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Site + Arduino (padrão) |
| `pnpm dev:web` | Só o site, sem serial |
| `pnpm serial` | Só a leitura USB (se o site já estiver rodando) |
| `pnpm lint` | ESLint |
| `pnpm build` | Build de produção |
| `pnpm start` | Produção: site + serial |
| `pnpm start:web` | Produção: só o site |

---

## 4. Build e produção (rodar o programa) (local) 🪴

```bash
pnpm build
pnpm start
```

Abra [http://localhost:3000](http://localhost:3000). O `pnpm start` já inclui a ponte serial, igual ao `pnpm dev`.

---

## 5. Umidade na tela

### Porcentagem exibida

Escala da leitura bruta (`soil_moisture`):

| Leitura | % na tela |
|---------|-----------|
| ≤ 600 | **100%** |
| 600 – 1000 | desce linearmente (600 → 100%, 1000 → 0%) |
| ≥ 1000 | **0%** |

### Frases da Petucia

| Leitura bruta | Mensagem |
|---------------|----------|
| &lt; 600 | Estou bem tranquila 😌 |
| 600 – 900 | Estou bem, mas estou ficando com sede 😕 |
| &gt; 900 | Estou com sede 🥵 |

Limiares em `src/lib/sensors/messages.ts`.

---

## 6. Problemas comuns

### `Access denied` na COM

- Feche o **Monitor Serial** do Arduino IDE.
- Pare `pnpm dev` / `pnpm start` e inicie de novo.
- Desconecte e reconecte o cabo USB.

### Site mostra % fixa (ex.: 19%) ou não atualiza

1. Confirme `[serial] Leitura recebida` no terminal.
2. Use `pnpm dev` ou `pnpm start` (não só `pnpm start:web`).
3. Apague cache local e reinicie:

   ```bash
   rmdir /s /q .data    # Windows (PowerShell: Remove-Item -Recurse -Force .data)
   pnpm dev
   ```

### “Sem leituras recentes do Arduino…”

A última leitura no disco tem mais de ~25 s. Serial parou ou a porta está errada — confira `ARDUINO_PORT` e se `pnpm serial` está rodando.

### `pnpm serial` não acha a porta

- `.env.local` na raiz do projeto com `ARDUINO_PORT=COMx` correto.
- Reinicie o terminal após criar o `.env.local`.

### Build do Next falha

```bash
pnpm lint
pnpm build
```

Se aparecer erro de módulo nativo, repita `pnpm approve-builds` e `pnpm install`.

---

## 7. Estrutura do repositório

```
petucia/
├── firmware/           # Sketch Arduino
├── scripts/
│   └── serial-bridge.ts   # Lê USB e grava .data/sensor-state.json
├── src/
│   ├── app/            # Página e API /api/sensors
│   └── lib/sensors/    # Regras de %, frases e persistência
├── .env.local          # ARDUINO_PORT (não commitar)
└── .data/              # Estado das leituras (gerado, no .gitignore)
```

---

## 8. Deploy na internet

Hospedagem tipo **Vercel** só serve o site estático/API; **não** acessa o Arduino na sua mesa. Para produção real com sensor:

- Rode `pnpm build` + `pnpm start` no **mesmo computador** ligado ao Arduino, ou
- Use um Raspberry Pi / PC sempre ligado com este projeto.

---

## Licença

Projeto privado (`"private": true` no `package.json`).
