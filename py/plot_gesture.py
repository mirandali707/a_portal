import matplotlib.pyplot as plt
import numpy as np

# GESTURE_FILEPATH = "gestures/star_20251201_234311.csv"
GESTURE_FILEPATH = "gestures/spiral_20251128_125823.csv"
ENCODER_DIST = 148 # approximate distance between the encoders in their measurement units

# the data is in the format:
# time, encoder_1, encoder_2
# we assume each encoder value represents the radius of a circle
# we calculate the x, y position of each datapoint by taking the intersection of the two circles

def calc_xy(r1, r2):
    x = (r1**2 - r2**2) / (2 * ENCODER_DIST)
    y = np.sqrt(r1**2 - x**2)
    return x, y


x_array = []
y_array = []

with open(GESTURE_FILEPATH, "r") as f:
    # skip the first line
    next(f)
    for line in f:
        elems = line.strip().split(",")
        time = float(elems[0])
        r1 = float(elems[1])
        r2 = float(elems[2])
        x, y = calc_xy(r1, r2)
        x_array.append(x)
        y_array.append(y)

plt.plot(x_array, y_array)
plt.axis('equal')
plt.gca().invert_yaxis()
plt.show()