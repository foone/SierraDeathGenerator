# encoding=utf-8

import string,sys

CHARS=(
	u' !"\u25A1\u269A👴🏺\'()\x01+,-./0123456789:;⭠=⭢?⏱'+
	string.ascii_uppercase+
	'\0\0🠊⯀_⛨'+
	string.ascii_lowercase+
	u'📜💰👨―©'
)
w,h=8,8
xspacing=0

for i,c in enumerate(CHARS):
	if c != '\0':
		oc=ord(c)
		if oc==1:
			oc=128737
		print (""""{}": {{
	  "x": {},
	  "w": {},
	  "h": {}
	}},""".format(oc,(w+xspacing)*i,w,h))

