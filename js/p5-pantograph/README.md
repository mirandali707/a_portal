# MIRANDA!!
1. use `pnpm i` then `pnpm run dev` to start local dev server, then nav to http://localhost:3000
2. plug in the pantograph, run `rotary-pantograph.ino` to start reading data
2.5. (optional) run `python3 rpc.py` to verify encoder values work
3. go into /py/ and run `python3 rpc_server.py` which opens a websocket connection and writes serial port sensor readings to the websocket
