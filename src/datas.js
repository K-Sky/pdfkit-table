let fns = {}

fns.add = function(headers, datas) {
	datas.forEach((row, i) => {
		fns.single.bind(this)(headers, row, i)
	})
}

fns.single = function(headers, row, i) {
	let { options } = this

	this.datasIndex = i
	const rowHeight = this._compute.rowHeight(row, false)
	this._helpers.logg(rowHeight)

	// Switch to next page if we cannot go any further because the space is over.
	// For safety, consider 3 rows margin instead of just one
	// if (this._startY + 2 * rowHeight < this._maxY) this._startY = this._rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows
	// else this.emitter.emit('addPage'); //this.addPage();
	if (options.useSafelyMarginBottom && this.y + this._safelyMarginBottom + rowHeight >= this._maxY && !this._lockAddPage) {
		this._helpers.onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();    
		this._originalStartY = this._startY - this._columnSpacing - (this._rowDistance * 2)
	}

	// calc position
	this._startY = this._rowBottomY + this._columnSpacing + this._rowDistance // 0.5 is spacing rows

	// unlock add page function
	this._lockAddPage = false

	const rectRow = {
		x: this._startX,
		y: this._startY - this._columnSpacing - (this._rowDistance * 2),
		width: this._tableWidth - this._startX,
		height: rowHeight + this._columnSpacing,
	}

	// add background row
	this._helpers.prepareRowBackground(row, rectRow)

	this._lastPositionX = this._startX;

	// Print all cells of the current row
	headers.forEach(( dataHeader, index) => {

		let { property, width, renderer, align, valign, padding } = dataHeader

		// check defination
		width = width || this._columnWidth
		align = align || 'left'

		// cell padding
		this._cellPadding = this._helpers.prepareCellPadding(padding || options.padding || 0)

		const rectCell = {
			x: this._lastPositionX,
			y: this._startY - this._columnSpacing - (this._rowDistance * 2),
			width: width,
			height: rowHeight + this._columnSpacing,
		}

		// allow the user to override style for rows
		this._helpers.prepareRowOptions(row)
		this._prepareRow(row, index, i, rectRow, rectCell)

		let text = row[property]

		// cell object
		if (typeof text === 'object' ) {
			text = String(text.label) // get label
			// row[property].hasOwnProperty('options') && this._helpers.prepareRowOptions(row[property]); // set style

			// options if text cell is object
			if (row[property].hasOwnProperty('options')) {
				// set font style
				this._helpers.prepareRowOptions(row[property])
				this._helpers.prepareRowBackground(row[property], rectCell)
			}

		} else {
			// style column by header
			this._helpers.prepareRowBackground(headers[index], rectCell)
		}

		// bold
		if (String(text).indexOf('bold:') === 0) {
			this.font('Helvetica-Bold')
			text = text.replace('bold:', '')
		}

		// size
		if (String(text).indexOf('size') === 0) {
			let size = String(text).substr(4,2).replace(':','').replace('+','') >> 0
			this.fontSize( size < 7 ? 7 : size )
			text = text.replace(`size${size}:`,'')
		}

		// renderer column
		// renderer && (text = renderer(text, index, i, row, rectRow, rectCell)) // value, index-column, index-row, row  nbhmn
		if (typeof renderer === 'function') {
			text = renderer(text, index, i, row, rectRow, rectCell) // value, index-column, index-row, row, doc[this]
		}

		// align vertically
		let topTextToAlignVertically = this._compute.topTextToAlignVertically.bind(this)(text, width, align, valign, rectCell)

		// write
		this.text(text, 
			this._lastPositionX + (this._cellPadding.left), 
			this._startY + topTextToAlignVertically, {
				width: width - (this._cellPadding.left + this._cellPadding.right),
				align: align,
			}
		)

		dataHeader.startX = rectCell.x
		this._lastPositionX += width

		// set style
		// Maybe REMOVE ???
		this._helpers.prepareRowOptions(row)
		this._prepareRow(row, index, i, rectRow, rectCell)
	})

	// Refresh the y coordinate of the bottom of this row
	this._rowBottomY = Math.max(this._startY + rowHeight, this._rowBottomY)

	// console.log(this.page.height, rowBottomY, this.y);
	// text is so big as page (crazy!)
	if (this._rowBottomY > this.page.height) {
		this._rowBottomY = this.y + this._columnSpacing + (this._rowDistance * 2)
	}

	// Separation line between rows
	this._dividers.row(options, 'horizontal', this._startX, this._rowBottomY);

	// review this code
	if (row.hasOwnProperty('options')) {
		if (row.options.hasOwnProperty('separation')) {
			// Separation line between rows
			this._dividers.row(options, 'horizontal', this._startX, this._rowBottomY, 1, 1)
		}
	}
}

module.exports = fns
