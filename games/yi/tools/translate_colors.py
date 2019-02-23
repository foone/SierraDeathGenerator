# encoding=utf-8

from PIL import Image,ImageOps
import json, re, sys, shutil,string
from itertools import izip

GAME='ct'
widths={}
letters={}
sides={}

LETTERS=(
	string.ascii_uppercase+string.ascii_lowercase+
	u'0123456789!?/“”:&()\'.,=-+%♪\0♡…\0# '
)

def remap_colors(im):
	out=im.copy()
	w,h = im.size
	for y in range(h):
		for x in range(w):
			pos = (x,y)
			r,g,b,a=im.getpixel(pos)
			color=(r,g,b)
			if color in REMAP:
				r,g,b=REMAP[color]
				out.putpixel(pos,(r,g,b,255))
	return out


to_translate=Image.open('sprite.png').convert('RGBA')
translator=Image.open('translator.png').convert('RGBA')
overlay=Image.open('overlay.png').convert('RGBA')
W,H=26,30
base=translator.crop((0,0,W,H))
images=[to_translate]
for i in range(1,8):
	im=translator.crop((33*i,0,33*(i+1),H))
	REMAP={}
	for y in range(H):
		for x in range(W):
			pos=(x,y)
			r,g,b,a = base.getpixel(pos)
			from_color = (r,g,b)
			if a==0 or  from_color in REMAP:
				continue
			to_color = tuple(im.getpixel(pos)[:3])
			REMAP[from_color]=to_color
	print REMAP
	images.append(remap_colors(to_translate))

widths=sum((img.size[0] for img in images))
outimg = Image.new('RGBA',(widths,images[0].size[1]))
outx=0
for img in images:
	outimg.paste(img,(outx,0))
	outimg.paste(overlay,(0,0),overlay)
	outx+=img.size[0]

outimg.save('remap.png')
