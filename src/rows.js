let fns = {}

fns.add = function() {
	this.table.rows.forEach(fns.single.bind(this))
}

fns.single = function(row, i) {
	let { table, options } = this

	this.rowsIndex = i
	const rowHeight = this._compute.rowHeight(row, false)
	this._helpers.logg(rowHeight)

	// Switch to next page if we cannot go any further because the space is over.
	// For safety, consider 3 rows margin instead of just one
	// if (startY + 3 * rowHeight < this._maxY) startY = this._rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows
	// else this.emitter.emit('addPage'); //this.addPage(); 
	if (options.useSafelyMarginBottom && this.y + this._safelyMarginBottom + rowHeight >= this._maxY && !this._lockAddPage) {
		this._helpers.onFirePageAdded() // this.emitter.emit('addPage'); //this.addPage();
		this._originalStartY = this._startY
	}

	// calc position
	this._startY = this._rowBottomY + this._columnSpacing + this._rowDistance // 0.5 is spacing rows

	// unlock add page function
	this._lockAddPage = false

	const rectRow = {
		x: this._columnPositions[0],
		// x: this._startX,
		y: this._startY - this._columnSpacing - (this._rowDistance * 2),
		width: this._tableWidth - this._startX,
		height: rowHeight + this._columnSpacing,
	}

	// add background
	// this._helpers.addBackground(rectRow);

	this._lastPositionX = this._startX

	row.forEach((cell, index) => {

		let align = 'left'
		let valign = undefined

		const rectCell = {
			// x: this._columnPositions[index],
			x: this._lastPositionX,
			y: this._startY - this._columnSpacing - (this._rowDistance * 2),
			width: this._columnSizes[index],
			height: rowHeight + this._columnSpacing,
		}

		this._helpers.prepareRowBackground(table.headers[index], rectCell)

		// Allow the user to override style for rows
		this._prepareRow(row, index, i, rectRow, rectCell)

		if(typeof table.headers[index] === 'object') {
			// renderer column
			table.headers[index].renderer && (cell = table.headers[index].renderer(cell, index, i, row, rectRow, rectCell, this)) // text-cell, index-column, index-line, row, doc[this]
			// align
			table.headers[index].align && (align = table.headers[index].align)
			table.headers[index].valign && (valign = table.headers[index].valign)
		}

		// cell padding
		this._cellPadding = this._helpers.prepareCellPadding(table.headers[index].padding || options.padding || 0)

		// align vertically
		let topTextToAlignVertically = this._compute.topTextToAlignVertically.bind(this)(cell, this._columnSizes[index], align, valign, rectCell)

		// write
		this.text(cell,
			this._lastPositionX + (this._cellPadding.left),
			this._startY + topTextToAlignVertically, {
				width: this._columnSizes[index] - (this._cellPadding.left + this._cellPadding.right),
				align: align,
			}
		)

		this._lastPositionX += this._columnSizes[index]
	})

	// Refresh the y coordinate of the bottom of this row
	this._rowBottomY = Math.max(this._startY + rowHeight, this._rowBottomY)

	// console.log(this.page.height, rowBottomY, this.y);
	// text is so big as page (crazy!)
	if (this._rowBottomY > this.page.height) {
		this._rowBottomY = this.y + this._columnSpacing + (this._rowDistance * 2)
	}

	// Separation line between rows
	this._dividers.row(options, 'horizontal', this._startX, this._rowBottomY)     
}

module.exports = fns
