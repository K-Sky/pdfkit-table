const fns = {}

fns.rowHeight = function(row, isHeader) {
	let { table, options, _columnSpacing, _columnSizes } = this

	let result = isHeader ? 0 : (options.minRowHeight || 0)
	let cellp

	// if row is object, content with property and options
	if (!Array.isArray(row) && typeof row === 'object' && !row.hasOwnProperty('property')) {
		const cells = []; 
		// get all properties names on header
		table.headers.forEach(({property}) => cells.push(row[property]))
		// define row with properties header
		row = cells
	}

	row.forEach((cell,i) => {
		let text = cell;

		// object
		// read cell and get label of object
		if (typeof cell === 'object') {
			// define label
			text = String(cell.label)
			// apply font size on calc about height row 
			cell.hasOwnProperty('options') && this._helpers.prepareRowOptions(cell)
		}

		text = String(text).replace('bold:','').replace('size','')

		// cell padding
		cellp = this._helpers.prepareCellPadding(table.headers[i].padding || options.padding || 0)

		// calc height size of string
		const cellHeight = this.heightOfString(text, {
			width: _columnSizes[i] - (cellp.left + cellp.right),
			align: 'left',
		})

		result = Math.max(result, cellHeight)
	})

	// isHeader && (result = Math.max(result, options.minRowHeight))

	// if (result + columnSpacing === 0) {
	//   computeRowHeight(row)
	// }

	return result + (_columnSpacing)
}

fns.columnSizes = function() {
	let { table, options } = this
	let { _columnSizes, _columnPositions, _columnWidth } = this

	let h = [] // header width
	let p = [] // position
	let w = 0  // table width

	// (table width) 1o - Max size table
	w = this.page.width - this.page.margins.right - ( options.x || this.page.margins.left )
	// (table width) 2o - Size defined
	options.width && (w = parseInt(options.width) || String(options.width).replace(/[^0-9]/g,'') >> 0)

	// (table width) if table is percent of page 
	// ...

	// (size columns) 1o
	table.headers.forEach( el => {
		el.width && h.push(el.width) // - columnSpacing
	});
	// (size columns) 2o
	if (h.length === 0) {
		h = options.columnsSize
	} 
	// (size columns) 3o
	if (h.length === 0) {
		_columnWidth = ( w / table.headers.length ) // - columnSpacing // define column width
		table.headers.forEach( () => h.push(_columnWidth) )
	}

	// Set columnPositions
	h.reduce((prev, curr, indx) => {
		p.push(prev >> 0)
		return prev + curr
	}, (options.x || this.page.margins.left))

	// !Set columnSizes
	h.length && (_columnSizes = h)
	p.length && (_columnPositions = p)

	// (table width) 3o - Sum last position + lest header width
	w = p[p.length-1] + h[h.length-1]

	// !Set this._tableWidth
	w && ( this._tableWidth = w )

	// Ajust spacing
	// this._tableWidth = this._tableWidth - (h.length * columnSpacing); 

	this._helpers.logg('columnSizes', h)
	this._helpers.logg('columnPositions', p)

	this._columnSizes = _columnSizes
	this._columnPositions = _columnPositions
	this._columnWidth = _columnWidth
}

fns.topTextToAlignVertically = function(text, width, cellPadding, align, valign, rowDistance, columnSpacing, rectCell) {
	if (!valign || valign === 'top') return 0
	let topTextToAlignVertically = 0
	const heightText = this.heightOfString(text, {
		width: width - (cellPadding.left + cellPadding.right),
		align: align,
	})
	switch (valign) {
		case 'center':
		case 'middle':
			topTextToAlignVertically = rowDistance - columnSpacing + (rectCell.height - heightText) / 2
			break
		case 'bottom':
			topTextToAlignVertically = rowDistance - columnSpacing + rectCell.height - heightText
			break
	}
	return topTextToAlignVertically
}

module.exports = fns
