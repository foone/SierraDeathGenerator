# encoding=utf-8

import string
CHARS=string.ascii_uppercase+"0123456789,.':!_ "

w,h=8,8

for i,c in enumerate(CHARS):
	if c != '\0':
		print """"{}": {{
	  "x": {},
	  "w": {},
	  "h": {}
	}},""".format(ord(c),w*i,w,h)