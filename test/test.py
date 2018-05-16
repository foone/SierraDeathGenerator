import json
from PIL import Image
from cStringIO import StringIO
from subprocess import check_output
data = json.loads(check_output(['node','generate.js']))

for generator,results in data.items():
	imgdata = results['image'].split(',',1)[1].decode('base64')
	sio = StringIO(imgdata)
	im = Image.open(sio)
	im.save('imgs/{}.png'.format(generator))