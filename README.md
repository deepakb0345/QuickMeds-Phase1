# QuickMeds Backend – Quickstart

## 1) Install deps

```bash
cd backend
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and set:

- `PORT` (e.g., 4000)
- `MONGO_URI` (e.g., mongodb://localhost:27017/quickmeds)
- `BASE_URL` (http://localhost:4000) – used to build image URLs
- `USE_OPENAI` (true/false). Keep **false** for now to use mocked OCR.
- `OPENAI_API_KEY` – only needed if `USE_OPENAI=true`.

## 3) Run

```bash
npm run dev
```

You should see: _QuickMeds backend running ..._ and _MongoDB connected_.

## 4) Test endpoints (happy path)

- **Health**: `GET /api/health`
- **Upload prescription**: `POST /api/prescriptions/upload` (form-data: image=<file>, machineId=MACHINE-001)
- **Process**: `POST /api/prescriptions/:id/process`
- **Get prescription**: `GET /api/prescriptions/:id`
- **List machine medicines**: `GET /api/medicines?machineId=MACHINE-001`
- **Create transaction**: `POST /api/transactions` with body `{ machineId, items:[{ medicine: <id>, quantity: 1 }], prescriptionId? }`
- **Mark paid**: `PUT /api/transactions/:id/pay`

> Seed some `Medicine` documents and create a `VendingMachine` with `machineId` plus stock mapping before testing full flow.

## 5) Notes

- OCR is mocked by default. Flip `USE_OPENAI=true` to try OpenAI Vision.
- For motor control: hook into `markPaidAndDispense` to call a local GPIO service or publish an MQTT message.
