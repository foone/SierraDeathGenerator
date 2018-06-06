import sys,struct,re,json,shlex
from PIL import Image
from collections import OrderedDict

NAMES=('','info','common','page','chars')
def decodeToNames(layout, dstring):
	results=re.findall('^([A-Za-z]):(.+)\n',layout,re.MULTILINE)

	parts=struct.unpack('<'+''.join(x[0] for x in results),dstring)
	out={}
	for k, part in zip([x[1] for x in results],parts):
		out[k] = part
	return out

def decodeLine(parts):
	return OrderedDict([kv.split('=',) for kv in parts])


def parseLine(combined_info, line):
	info = OrderedDict()
	typename = info['typename'] = line[0]
	info.update(decodeLine(line[1:]))
	for key, value in info.items():
		try:
			info[key] = int(value)
		except ValueError:
			pass
	if typename in ('info','common','page'):
		combined_info[typename] = info
	elif typename == 'char':
		if 'chars' not in combined_info:
			combined_info['chars']=OrderedDict()
		combined_info['chars'][info['id']]=info
	return info


im=Image.open(sys.argv[2])
combined_info={}
with open(sys.argv[1], 'r') as f:
	for line in f:
		parts = shlex.split(line)
		parseLine(combined_info, parts)


chars=combined_info['chars']
w=sum(char['xadvance'] for char in chars.values()) 
h=max(char['height'] for char in chars.values())
outim=Image.new('RGBA',(w,h))
outim.paste((0,0,0,0),(0,0,w,h))
json_out={}
outx=0
for k,char in chars.items():
	x,y=char['x'],char['y']
	tile=im.crop((x,y,x+char['width'],y+char['height']))
	outim.paste(tile,(outx+char['xoffset'],char['yoffset']))
	json_out[k]={
		'x':outx,
		'w':char['xadvance'],
		'h':h
	}
	outx+=char['xadvance']

outim.save(sys.argv[3])
with open(sys.argv[4],'wb') as f:
	json.dump(json_out,f)