#!/usr/bin/env python
# -*- coding: utf-8 -*-
# iQ SDK script

import os, sys

### MAIN routune #############################################################
def main(args):
	if len(args)==1:
		help()
	
	command = args[1]
	a = list(args)
	a.pop(0) # program
	a.pop(0) # command
	try:
		c = eval("%s" % command)	
	except NameError,e:
		help([command])
		
	if command == 'help':
		c(a)
	else:
		# convert args to a hash
		config = slurp_args(a)
		
		# some config can be checked before hand
		if not config.has_key('dir') or config['dir']==None:
			config['dir']=os.getcwd()
		else:	
			# expand the path
			config['dir']=os.path.expanduser(config['dir'])
		
		# invoke the command
		c(config)
	sys.exit(0)


### Utilitary ################################################################

def slurp_args(args):
	config = {}
	for arg in args:
		if arg[0:2]=='--':
			arg = arg[2:]
			idx = arg.find('=')
			k = arg
			v = None
			if idx>0:
				k=arg[0:idx]
				v=arg[idx+1:]
			if v!=None and v.find(',')!=-1:
				v = v.split(',')
			config[k]=v
	return config


### HELP ######################################################################

def help(args=[],suppress_banner=False):
	if not suppress_banner:
		print "Appcelerator Titanium"
		print "Copyright (c) 2010 by Appcelerator, Inc."
		print
	
	if len(args)==0:
		print "commands:"
		print
		print "  create      - create a project"
		print "  help        - get help"
	else:
		cmd = args[0]
		if cmd == 'create':
			print "Usage: %s create [--dir=d] [--name=n]" % os.path.basename(sys.argv[0])
			print 
			print "  --dir=d             	directory to create the new project"
			print "  --name=n            	project name"
		else:
			print "Unknown command: %s" % cmd
	print
	sys.exit(-1)

if __name__ == "__main__":
	main(sys.argv)
