#!/usr/bin/env python

import xlrd, json, re

INFILE = 'dewey-data.xlsx'
OUTFILE = '../site/js/booklist.js'

wb = xlrd.open_workbook(INFILE)
ws = wb.sheet_by_index(0)

dd_re = re.compile('^(\d+\.\d+)')

books = []

for row in range(0, ws.nrows):
    dd_raw = ws.cell(row, 1).value
    m = dd_re.search(dd_raw)
    if m:
        dd = m.group(1)
        title = ws.cell(row, 2).value
        books.append({ 'dd': float(dd), 'title': title })

with open(OUTFILE, 'w') as of:
    of.write("BOOKS = " + json.dumps(books, sort_keys=True, indent=4, separators=(',', ': ')))

print("Wrote json to {}".format(OUTFILE))
