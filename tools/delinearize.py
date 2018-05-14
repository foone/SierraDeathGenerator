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

parser = argparse.ArgumentParser(description='Delinearize an image file')
parser.add_argument('filename', metavar='FILE',
                    help='image file to delinearize')
parser.add_argument('width', default=8, type=int,nargs='?',
                    help='Width of each tile (default: %(default)s)')
parser.add_argument('height', default=8, type=int,nargs='?',
                    help='Height of each tile (default: %(default)s)')
parser.add_argument('--column-row','-cr', dest='columnrow',action='store_true',
                    help='Tiles go top to bottom then left to right')
parser.add_argument('--spacing', '-s',default=0, type=int,
                    help='Spacing in between tiles (in input)')
parser.add_argument('--outspacing', '-o',default=0, type=int,
                    help='Spacing in between tiles (in output)')
parser.add_argument('--across', '-a',default=8, type=int,
                    help='Number of tiles across in output')

args = parser.parse_args()
im=Image.open(args.filename)
w,h=args.width,args.height
numtiles = im.size[0]//(w+args.spacing)
outw=args.across
outh=(numtiles + (outw-1)) // outw

outim=Image.new('RGBA', (outw*(w+args.outspacing),outh*(h+args.outspacing)))
outim.paste((0,0,0,0),(0,0,outim.size[0],outim.size[1]))
inx=0
for (x,y) in getCoords(outw,outh,not args.columnrow):
	dest=(x*(w+args.outspacing),y*(h+args.outspacing))
	src = (inx,0,inx+args.width,args.height)
	outim.paste(im.crop(src),dest)
	inx += w+args.spacing

outfile=os.path.splitext(args.filename)[0]+'-rect.png'
outim.save(outfile)
