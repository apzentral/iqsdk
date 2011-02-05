#!/usr/bin/env python

# Copyright (c) 2010-2011 Dev-iQue LLC. All Rights Reserved.
# Licensed under the Apache Public License (version 2)
try: import json
except: import simplejson as json

import os, sys, re, optparse
from os.path import join, splitext, split, exists

def create_project(options):
	outdir = options.dest
	if not os.path.exists(outdir)
		os.makedirs(outdir)
	
	outdir = os.path.join(options.dest, 'res')
	if not os.path.exists(outdir)
		os.makedirs(outdir)
	

def main():
	parser = optparse.OptionParser()
	parser.add_option('-c', '--command', dest='command', help='Subject to generate: project, view, model, controller, theme, i18n', default='project')
	parser.add_option('-d', '--dest', dest='dest', help='SDestination directory (defaults to current)', default=None)
	(options, args) = parser.parse_args()

	if options.dest == None:
		options.dest = '.'

	if options.command == 'project':
		create_project(options)

if __name__ == "__main__":
	main()
