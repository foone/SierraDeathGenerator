CHARS=u"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!,.\u00A9():?' "

for i,c in enumerate(CHARS):
	cs=c
	if c.lower()!=c:
		cs=c+c.lower()
	for cx in cs:
		print """"{}": {{
	  "x": {},
	  "w": 8,
	  "h": 8
	}},""".format(ord(cx),8*i)