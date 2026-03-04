# Explorator - Live ToF Streaming Bringup Plan

## Context
Replace dummy data in explorator with live ToF sensor data streamed from the Teensy via the Jetson gateway websocket. This is the minimum implementation to prove the full end-to-end pipeline works. The UI already exists — Telemetry.vue has ToF display with charts and TypeScript types. We just need to wire it to real data.

## Architecture

```
Jetson gateway (ws://jetson-ip:5560) --websocket--> Explorator
```

- Single websocket connection, opened on app start
- Messages arrive tagged with topic (e.g. `sensor.tof`)
- Websocket service routes messages to the appropriate Pinia store
- Vue components read from stores reactively — no manual refresh

## Existing Infrastructure (no changes needed)
- **Unovis charts** — already configured with gradients and styling
- **TypeScript types** — `ToFSensorData`, `ToFTimelinePoint` already defined
- **Pinia** — already initialized in main.ts
- **Telemetry.vue** — ToF display already built, just uses dummy data
- **shadcn-vue UI components** — ready to use for status indicators

## New/Modified Files

### NEW: `src/renderer/constants/connection.ts`
- Gateway websocket URL (default `ws://jetson-ip:5560`)
- Reconnect interval (e.g. 3 seconds)
- Max reconnect attempts

### NEW: `src/renderer/services/websocketService.ts`
- Opens websocket to gateway on `connect()`
- Parses incoming messages (JSON with topic field)
- Routes to appropriate store based on topic
- Auto-reconnects on disconnect
- Exposes connection state (connected/disconnected/reconnecting)
- Plain JavaScript class, no Vue dependency

### NEW: `src/renderer/stores/telemetryStore.ts`
- Pinia store holding live ToF data
- `updateToF(front, rear)` action called by websocket service
- Holds current distances + rolling history for charts
- Replaces the dummy data generator in Telemetry.vue

### MODIFY: `src/renderer/views/Telemetry.vue`
- Remove dummy data generation (`generateBatteryData()` etc.)
- Import and read from telemetryStore instead
- Chart data binds to store's rolling history
- Current distance values bind to store's latest reading

### MODIFY: `src/renderer/components/Layout.vue`
- Add small connection status indicator (connected/disconnected)
- Reads connection state from websocket service

### MODIFY: `src/renderer/main.ts`
- Initialize websocket service on app start
- Connect to gateway

## File Tree (changes only)

```
src/renderer/
├── main.ts                        # MODIFY — init websocket
├── components/
│   └── Layout.vue                 # MODIFY — connection indicator
├── stores/
│   └── telemetryStore.ts          # NEW
├── services/
│   └── websocketService.ts        # NEW
├── constants/
│   └── connection.ts              # NEW
└── views/
    └── Telemetry.vue              # MODIFY — use store instead of dummy data
```

## Message Format Expected
From the gateway, each websocket message is JSON with a topic:

```json
{"topic": "sensor.tof", "data": {"front": 250, "rear": 180}}
```

## Future Additions (not now)
- IMU store + IMU charts (Phase 2)
- FFT service + spectrum display (Phase 3)
- I2C health store + diagnostics panel (Phase 4)
- Command sending back through websocket (Phase 5)
- Video stream via separate MJPEG endpoint (Phase 6)

Each phase adds a store, a service (if needed), and wires up an existing view. Same pattern every time.

## Verification
1. Start Jetson gateway with mock data publishing to `sensor.tof` topic
2. Launch explorator in dev mode (`npm run dev`)
3. Confirm connection indicator shows connected
4. Confirm Telemetry view shows live distances updating
5. Confirm chart plots rolling history
6. Kill gateway — confirm indicator shows disconnected
7. Restart gateway — confirm auto-reconnect and data resumes
