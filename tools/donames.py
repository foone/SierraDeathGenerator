x=0
for name in open('names.txt','r'):
	name=name.strip()

	for side in ('right','left'):
		print """
			"{}-{}":{{
			  "x":{},
			  "y":8,
			  "w":46,
			  "h":80
			}},""".format(name,side,x)
		x+=46