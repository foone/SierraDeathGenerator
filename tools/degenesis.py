import sys,os
from PIL import Image
from collections import defaultdict
if len(sys.argv)!=2:
	print 'Usage: {} <filename>'
	sys.exit()
im=Image.open(sys.argv[1])
LETTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZ.!-,5? '
sizes=defaultdict(lambda:(2,2))
sizes['I']=sizes['!']=(1,2)
sizes['W']=sizes['M']=(3,2)
sizes['.']=sizes[',']=(1,1)
sizes['-']=(2,1)
spacing=2
w,h=8,8
imgw,imgh=im.size
x=0
out=[]
for char in LETTERS:
	lw,lh=sizes[char]
	blocks=lw*lh
	pieces=[im.crop((x+i*w,0,x+(i+1)*w,h)) for i in range(blocks)]
	ci=0
	smallout=Image.new('RGBA',(lw*w,lh*h))
	for px in range(lw):
		for py in range(lh):
			smallout.paste(pieces[ci],(px*w,py*h))
			ci+=1
	out.append((char,smallout))
	x+=w*blocks


outw=sum(img.size[0]+spacing for _,img in out)
outh=max(img.size[1] for _,img in out)
outim=Image.new('RGBA', (outw,outh))
outim.paste((0,0,0,0),(0,0,outim.size[0],outim.size[1]))
outx=0
for char,img in out:
	outim.paste(img,(outx,0))
	print """"{}": {{
  "x": {},
  "w": {},
  "h": {}
}},""".format(ord(char),outx,img.size[0],img.size[1])
	outx+=img.size[0]+spacing

outfile=os.path.splitext(sys.argv[1])[0]+'-degenesis.png'
outim.save(outfile)
