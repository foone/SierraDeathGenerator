import os,glob, subprocess, sys
OUTPUT_DIR='output'
if not os.path.exists(OUTPUT_DIR):
	os.mkdir(OUTPUT_DIR)
generators = glob.glob(os.path.join('..', 'games', '*', 'tests'))
names = [os.path.split(os.path.split(path)[0])[1] for path in generators]
for name in names:
	outpath = os.path.join(OUTPUT_DIR, name+'.html')
	result = subprocess.check_output([sys.executable, 'testgenerator.py', name, outpath])
	print name, result