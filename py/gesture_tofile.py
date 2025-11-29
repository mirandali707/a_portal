from rpc import rpc, attribute_trace
import time
import os

OUTDIR = "gestures"
OUTFILE = f"{OUTDIR}/gesture_{time.strftime('%Y%m%d_%H%M%S')}.csv"
DELAY = 0.1

# Use the classes
myrpc = rpc("/dev/cu.usbmodem178477201")

os.makedirs(OUTDIR, exist_ok=True)

with open(OUTFILE, "w") as f:
    f.write("time,encoder_1,encoder_2\n")
    while True:
        time.sleep(DELAY)
        f.write(f"{time.time()},{myrpc.encoder_1.read()},{myrpc.encoder_2.read()}\n")