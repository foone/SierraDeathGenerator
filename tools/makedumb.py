w=8
h=12
start=ord(' ')
for i in range(start,128):
	print """"{}": {{
  "x": {},
  "w": {},
  "h": {}
}},""".format(i,(i-start)*w,w,h)