#!/usr/bin/python
import struct, sys,json
FONT_TYPE = 0x87
from PIL import Image

allimages={}

with open(sys.argv[1], 'rb') as f:
	firstword = struct.unpack('<H', f.read(2))[0]
	if firstword == FONT_TYPE:
		print 'Is patch file'
		offset = 2
		f.read(2) # skip two unknown bytes
	else:
		print 'Not patch file (0x%02X) ' % firstword
		offset = 0

	numchar, height = struct.unpack('<2H', f.read(4))
	print numchar, height
	offsets=struct.unpack('<{}H'.format(numchar), f.read(numchar*2))
	print offsets

	widths=[]

	for c,c_off in enumerate(offsets):
		char=c
		f.seek(c_off + offset)
		w,h = struct.unpack('2B', f.read(2))
		print c,w,h
		widths.append(w)
		linew = (w+7)//8 # round width up
		length = h * linew
		data=f.read(length)
		im=Image.new('RGBA',(linew*8,h))
		for i in range(h):
			line = data[i*linew:(i+1)*linew]
			parts=[]
			for c in line:
				line=bin(ord(c))[2:].rjust(8,'0').replace('0',' ').replace('1','X')
				parts.append(line)
			line = ''.join(parts)
			print line
			for ci,c in enumerate(line):
				xy=(ci,i)
				im.putpixel(xy,(0,0,0,255) if c=='X' else (0,0,0,0))
		allimages[char]=(im,w,h)



numi=len(allimages)
out=Image.new('RGBA',(16*numi,16))
info={}
for i,(key,(im,w,h)) in enumerate(sorted(allimages.items())):
	x=i*16
	out.paste(im,(x,0))
	info[key]={
		'x':x,
		'w':w,
		'h':h
	}


out.save('font.png')
with open('font.json','wb') as f:
	json.dump(info,f)