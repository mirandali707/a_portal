import asyncio
import websockets
import json
from rpc import rpc, attribute_trace   
import time

myrpc = rpc("/dev/cu.usbmodem178477201")

async def stream_data(websocket):
    while True:
        encoder_1 = myrpc.encoder_1.read()
        encoder_2 = myrpc.encoder_2.read()
        print(f"Encoder 1: {encoder_1}, Encoder 2: {encoder_2}")
        data = {
            "encoder_1": myrpc.encoder_1.read(),
            "encoder_2": myrpc.encoder_2.read()
        }
        await websocket.send(json.dumps(data))
        await asyncio.sleep(0.1)  # 20 Hz update

async def main():
    # test stream_data
    async with websockets.serve(stream_data, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())
