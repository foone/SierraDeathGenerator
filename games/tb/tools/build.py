def parsecolor(x):
	r=int(x[0:2],16)
	g=int(x[2:4],16)
	b=int(x[4:6],16)
	return (r,g,b,255)
COLORS=[
	(parsecolor('155FDA'),parsecolor('FEFEFE')),
	(parsecolor('48CEDF'),parsecolor('FEFEFE')),
	(parsecolor('FEFEFE'),parsecolor('FE8270')),
	(parsecolor('FE8270'),parsecolor('64B0FE')),
	(parsecolor('F36AFE'),parsecolor('FEFEFE')),
	(parsecolor('000000'),parsecolor('B8B8B8')),
	(parsecolor('FEFEFE'),parsecolor('B53220')),
	(parsecolor('B81E7C'),parsecolor('F7D9A6')),
	(parsecolor('FEFEFE'),parsecolor('D4D3FE')),
	(parsecolor('FEFEFE'),parsecolor('155FDA')),
	(parsecolor('FEFEFE'),parsecolor('000000')),
	(parsecolor('FEFEFE'),parsecolor('A11BCD'))
]
from PIL import Image,ImageOps
import json, re, sys, shutil, time, os, string,glob
from itertools import izip
PRIMARY_COLOR=(0,0,255,255)
SECONDARY_COLOR=(255,0,0,255)
template=Image.open('high-five.png').convert('RGBA')
W,H=template.size
SIZE=(W,H*len(COLORS))
out=Image.new('RGBA',SIZE)
out.paste((255,0,255,255),(0,0,SIZE[0],SIZE[1]))
for i,(primary,secondary) in enumerate(COLORS):
	current=template.copy()
	for y in range(H):
		for x in range(W):
			k=(x,y)
			px=current.getpixel(k)
			if px==PRIMARY_COLOR:
				current.putpixel(k,primary)
			if px==SECONDARY_COLOR:
				current.putpixel(k,secondary)
	out.paste(current,(0,i*H))


out.save('out.png')