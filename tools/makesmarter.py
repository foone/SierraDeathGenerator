# encoding=utf-8

import string
CHARS=(u' !"#$%&\'[]*+,-./0123456789;:←=→?©'+string.ascii_uppercase+
u'\0_▯↑↓')

w,h=8,16
xspacing=0

for i,c in enumerate(CHARS):
	if c != '\0':
		print """"{}": {{
	  "x": {}
	}},""".format(ord(c),(w+xspacing)*i,w,h)