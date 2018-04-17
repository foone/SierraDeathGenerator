# coding=utf-8
from PIL import Image
import json,string,sys
widths=[]

LETTERS=string.ascii_uppercase+string.ascii_lowercase

im=Image.open(sys.argv[1])
w,h=im.size
lastblank=-1
cletter=0
for x in range(w):
	blankline=True
	for y in range(h):
		p=im.getpixel((x,y))
		if p[3]!=0:
			blankline=False
			break
	if blankline:
		letterw=1+x-lastblank
		print >>sys.stderr,'blankline at {},last {}, w {}'.format(x,lastblank,letterw)
		print """"{}": {{
		  "x": {},
		  "w": {},
		  "h": {}
		}},""".format(ord(LETTERS[cletter]),lastblank+1,letterw-2,h)
		lastblank=x
		cletter+=1
