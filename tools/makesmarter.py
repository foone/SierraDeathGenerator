# encoding=utf-8

import string
CHARS='0123456789-'' '+string.ascii_uppercase+":./\'"+string.ascii_lowercase+u'àâäáéèëêìîïíòǒöóùûüúÄÖÜçßñ+*▶⏩⏪■―\0\0\0\0ÅåÉ\0Ñ📡╦?♡▁▃▄▅▇█=𝄞→←↑↓🔑⏰'

w,h=12,18
xspacing=2

for i,c in enumerate(CHARS):
	if c != '\0':
		print """"{}": {{
	  "x": {},
	  "w": {},
	  "h": {}
	}},""".format(ord(c),(w+xspacing)*i,w,h)