import sys,struct,re,json
from PIL import Image
InfoBlock="""
h:fontSize
B:bits
B:charSet
H:stretchH
B:aa
B:paddingUp
B:paddingRight
B:paddingDown
B:paddingLeft
B:spacingH
B:spacingV
B:outline
"""
CommonBlock="""
H:lineHeight
H:base
H:scaleW
H:scaleH
H:pages
B:bitField
B:alphaChnl
B:redChnl
B:greenChnl
B:blueChnl
"""
CharBlock="""
L:id
H:x
H:y
H:width
H:height
h:xoffset
h:yoffset
H:xadvance
B:page
B:chnl
"""
NAMES=('','info','common','page','chars')
def decodeToNames(layout, dstring):
	results=re.findall('^([A-Za-z]):(.+)\n',layout,re.MULTILINE)

	parts=struct.unpack('<'+''.join(x[0] for x in results),dstring)
	out={}
	for k, part in zip([x[1] for x in results],parts):
		out[k] = part
	return out

def readChunk(f):
	cbuffer = f.read(5)
	if len(cbuffer)!=5:
		return None
	chunktype,chunklength=struct.unpack('<BL',cbuffer)
	data=f.read(chunklength)
	info={
		'type':chunktype,
		'typename':NAMES[chunktype],
		'length':chunklength, 
		'data':data
	}
	if chunktype==1:
		info.update(decodeToNames(InfoBlock, data[:14]))
	elif chunktype==2:
		info.update(decodeToNames(CommonBlock, data))
	elif chunktype==4:
		chars=info['chars']={}
		for i in range(chunklength/20):
			d=decodeToNames(CharBlock,data[i*20:(i+1)*20])
			chars[d['id']]=d
	return info


im=Image.open(sys.argv[2])
combined_info={}
with open(sys.argv[1], 'rb') as f:
	header=f.read(4)
	if header != 'BMF\x03':
		raise ValueError('Not a BMF3 file!')
	while True:
		chunk=readChunk(f)
		if chunk:
			combined_info[chunk['typename']]=chunk
			print chunk
		else:
			break


chars=combined_info['chars']['chars']
w=sum(char['xadvance'] for char in chars.values()) 
h=max(char['height'] for char in chars.values())
outim=Image.new('RGBA',(w,h))
outim.paste((0,0,0,0),(0,0,w,h))
json_out={}
outx=0
for k,char in chars.items():
	x,y=char['x'],char['y']
	tile=im.crop((x,y,x+char['width'],y+char['height']))
	outim.paste(tile,(outx,char['yoffset']))
	json_out[k]={
		'x':outx,
		'w':char['xadvance'],
		'h':h
	}
	outx+=char['xadvance']

outim.save(sys.argv[3])
with open(sys.argv[4],'wb') as f:
	json.dump(json_out,f)