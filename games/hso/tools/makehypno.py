# encoding=utf-8

import string,sys, re

CHARS=(
	string.ascii_uppercase+
	string.ascii_lowercase+
	u'0123456789.,;:?!-_~#'+
	u'~\'&()[]|`\\/@°+=*'+
	u'€$\0<> '
	
)
w,h=7,7
xspacing=0
WDICT={
	1:u'.,li',
	2:u"|;:!'` [('",
	3:u")]<>°ITZjcnrtxt1",
	4:u"?HbdefghkopqsuvyzXABCDEFGJKLNOPQRSUn234567890",
	5:u'-_~"WYMVvamw/\\',
	6:u"#*$@&"
}
WIDTHS={}
for c in CHARS:
	WIDTHS[c]=7
for width,chars in WDICT.items():
	for c in chars:
		WIDTHS[c]=width
for i,c in enumerate(CHARS):
	if c != '\0':
		print (""""{}": {{
	  "x": {},
	  "w": {},
	}},""".format(ord(c),(w+xspacing)*i,1+WIDTHS[c]))

730