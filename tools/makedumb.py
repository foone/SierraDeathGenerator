w=9
for i in range(ord(' '),ord('z')):
	print """"{}": {{
  "x": {},
  "w": {},
  "h": 16
}},""".format(i,i*w,w)