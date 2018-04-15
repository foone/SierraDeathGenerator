w=9
for i in range(ord(' '),128):
	print """"{}": {{
  "x": {},
  "w": {},
  "h": 16
}},""".format(i,i*w,w)