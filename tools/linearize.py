import sys,os
from PIL import Image
import argparse
def getCoords(columns, rows, rowcolumn=True):
	if rowcolumn:
		for y in range(rows):
			for x in range(columns):
				yield (x,y)
	else:
		for x in range(columns):
			for y in range(rows):
				yield (x,y)

parser = argparse.ArgumentParser(description='Linearize an image file')
parser.add_argument('filename', metavar='FILE', 
                    help='image file to linearize')
parser.add_argument('width', default=8, type=int,nargs='?',
                    help='Width of each tile (default: %(default)s)')
parser.add_argument('height', default=8, type=int,nargs='?',
                    help='Height of each tile (default: %(default)s)')
parser.add_argument('--column-row','-cr', dest='columnrow',action='store_true',
                    help='Tiles go top to bottom then left to right')
parser.add_argument('--spacing', '-s',default=0, type=int,
                    help='Spacing in between tiles (in output)')
parser.add_argument('--transparent', '-t', action='store_true',
                    help='Keep transparent tiles')

args = parser.parse_args()
im=Image.open(args.filename)
w,h=args.width,args.height
imgw,imgh=im.size
for dimension,imgsize,size in (('width',imgw,w),('height',imgh,h)):
	if imgsize%size != 0:
		print 'Image {} is {}, not an even multiple of {}!'.format(dimension,imgsize,size)
		sys.exit()
chunks = []
for (x,y) in getCoords(imgw//w,imgh//h,not args.columnrow):
	src=(x*w,y*h,(x+1)*w,(y+1)*h)
	tile = im.crop(src)
	if im.mode == 'RGBA' and not args.transparent:
		R,G,B,A = tile.getextrema()
		if A[1]==0:
			print 'Skipping empty tile at',src[:2]
			continue # the whole tile is transparent, skip it.
	chunks.append(tile)

outw,outh=len(chunks),1
outim=Image.new('RGBA', (outw*outh*(w+args.spacing),h))
outim.paste((0,0,0,0),(0,0,outim.size[0],outim.size[1]))

for i, chunk_src in enumerate(chunks):
	outim.paste(chunk_src, (i*(w+args.spacing), 0))

outfile=os.path.splitext(args.filename)[0]+'-linear.png'
outim.save(outfile)
