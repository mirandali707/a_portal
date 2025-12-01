import asyncio
import websockets
import json

async def stream(websocket):
    i = 0
    while True:
        await websocket.send(json.dumps({"counter": i}))
        i += 1
        await asyncio.sleep(0.1)

async def main():
    print("WebSocket server READY on ws://localhost:8765")
    async with websockets.serve(stream, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())
