import glob,os
from PIL import Image
for orig in glob.glob('orig/*.png'):
	name=os.path.splitext(os.path.basename(orig))[0]
	shortername=name.split('_')[0]
	name_path='names/sv-{}.png'.format(shortername)

	out=Image.new('RGBA',(256,340))
	head=Image.open(orig)

	out.paste(head,(0,0))
	name_im = Image.open(name_path).crop((75,0,75+256,47))
	out.paste(name_im,(0,247+42))

	out.save('{}.png'.format(name))