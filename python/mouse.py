import pydirectinput
import sys

direction = sys.argv[1]
amount = int(sys.argv[2])

match direction:
	case "up":
		pydirectinput.moveRel(0, -(amount), relative=True)
	case "down":
		pydirectinput.moveRel(0, amount, relative=True)
	case "left":
		pydirectinput.moveRel(-(amount), 0, relative=True)
	case "right":
		pydirectinput.moveRel(amount, 0, relative=True)
