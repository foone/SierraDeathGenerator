import sys,os,time,json,subprocess,pdb,glob,base64,tempfile
import StringIO

import argparse

parser = argparse.ArgumentParser(description='Runs a generator through the test cases')
parser.add_argument('generator', metavar='NAME', help='Generator to test')
parser.add_argument('output', metavar='RESULTS.HTML',nargs='?',default='results.html', help='HTML filename to output to')

args = parser.parse_args()



base = os.path.join('..','games', args.generator)
tests_dir = os.path.join(base, 'tests')
test_cases = glob.glob(os.path.join(tests_dir,'*.json'))
tests={'generator':args.generator,'tests':{}}
for path in test_cases:
	name = os.path.basename(path)
	with open(path, 'rb') as f:
		tests['tests'][name] = json.load(f)


proc = subprocess.Popen(['node','evaluate_test_cases.js'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
data,_ = proc.communicate(json.dumps(tests))
results = json.loads(data)

def cmd_for_imagemagick(command,*args):
	prefix=[]
	if sys.platform == 'win32':
		prefix=['magick']
		#FIXME: This assumes we're already running on ImageMagick 7.x+
		#How can we support ImageMagick 6.x on Windows? 
		# We may have to manually spelunk the PATH and find ImageMagick, 
		# or make the user pass an argument telling us where it is?
	return prefix + [command] + list(args)

def base64_for_binary(data):
	return 'data:image/png;base64,' + base64.b64encode(data)

def path_for_file(filename):
	return os.path.join(tests_dir,os.path.splitext(filename)[0]+'.png')

def data_for_file(filename):
	with open(path_for_file(filename),'rb') as pngf:
		return base64_for_binary(pngf.read())

def compare_files(correct_filename, resulting):
		temp_file = tempfile.NamedTemporaryFile(suffix='.png',delete=False)
		temp_file.write(base64.b64decode(resulting.split(',',1)[1]))
		temp_file.close()
		try:

			proc = subprocess.Popen(
				cmd_for_imagemagick('compare', '-compose','src','-fuzz','2%',
				path_for_file(correct_filename),
				temp_file.name,
				'png:-'
			), stdout=subprocess.PIPE)
			difference_image = proc.communicate()[0]

			proc = subprocess.Popen(
				cmd_for_imagemagick('compare','-metric','AE','-fuzz','2%',
				path_for_file(correct_filename),
				temp_file.name,
				'null:-'
			), stdout=subprocess.PIPE,stderr=subprocess.PIPE)
			diff_pixels = proc.communicate()[1]

			goodcolor = 'PaleGreen'
			badcolor = 'pink'
			if int(diff_pixels.strip())<2:
				badcolor = goodcolor
			proc = subprocess.Popen(
				cmd_for_imagemagick('convert','-dispose','Background','-delay','50',
				'(',path_for_file(correct_filename),'-background',goodcolor,'label:Correct','-gravity', 'Center','-append',')',
				'(',temp_file.name,'-background',badcolor,'label:Resulting','-gravity', 'Center', '-append',')',
				'+repage',
				'-loop', '0',
				'gif:-'
			), stdout=subprocess.PIPE)
			flicker_compare = proc.communicate()[0]

			return diff_pixels, difference_image, flicker_compare
		finally:
			os.unlink(temp_file.name)

keys = sorted(results.keys())
answers={
	True:'<span style="font-size: 60px; color: green">&#10003;</span>',
	False:'<span style="font-size: 60px; color: red">&#10008;</span>'}

cumdiff=0
with open(args.output,'wb') as f:
	print >>f,("""
<style>
	td.img-compare{
		vertical-align: top;
	}
</style>
""")
	print >>f, '<table border="1">'
	print >>f, '<tr><th>Filename</th><th>Expected</th><th>Resulting</th><th>Different pixels</th><th>GIF compare</th><th>OK?</th></tr>'
	for key in keys:
		diff_pixels, difference_image, flicker_compare = compare_files(key, results[key])
		cumdiff+=int(diff_pixels)



		print >>f, """
			<tr>
				<td>{}</td>
				<td class="img-compare"><img src="{}"></td>
				<td class="img-compare"><img src="{}"></td>
				<td class="img-compare"><img src="{}"></td>
				<td class="img-compare"><img src="{}"></td>
				<td>{}</td>
			</tr>""".format(
				os.path.splitext(key)[0],
				data_for_file(key),results[key], 
				base64_for_binary(difference_image),
				base64_for_binary(flicker_compare),
				answers[int(diff_pixels)<5]

		)
	print >>f, '</table>'

print 'Total difference:',cumdiff