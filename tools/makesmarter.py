# encoding=utf-8

import string
CHARS=(u'ABCDEFGHIJKLMNOPQRSTUVWXYZ.©&™-,/\'')

w,h=8,8
xspacing=0

for i,c in enumerate(CHARS):
	if c != '\0':
		print (""""{}": {{
	  "x": {}
	}},""".format(ord(c),(w+xspacing)*i,w,h))