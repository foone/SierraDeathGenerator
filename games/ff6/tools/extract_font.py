import os
from PIL import Image

offset=0

with open('Final Fantasy III (U) (V1.1) [!].smc','rb') as f:
	f.seek(0x048FC0+offset)
	widths=[ord(x) for x in f.read(256)]
	f.seek(0x0490C0+offset)
	data=f.read(22*96)


out = Image.new('RGBA',(13*96,12))
white = Image.new('RGBA',(12,11))
white.paste((255,255,255,255),(0,0,12,11))
black = Image.new('RGBA',(12,11))
black.paste((0,0,0,255),(0,0,12,11))

for i in range(96):
	mine=data[i*22:i*22+22]
	mine = ''.join(mine[i + 1-2*(i&1)] for i in range(len(mine)))
	im=Image.frombytes('1',(16,11),mine)
	im=im.crop((4,0,16,11))
	out.paste(black, (i*13+1,0+1), im)
	out.paste(white, (i*13,0), im)

out.save('out.png')

print repr(widths[0x20:])