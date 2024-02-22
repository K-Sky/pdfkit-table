const fns = {}

fns.parse = function(table, options) {
	typeof table === 'string' && (table = JSON.parse(table));

	table || (table = {})
	options || (options = {})

	this._defaults.table(table, options)
	this._defaults.options(options)

	if (!table.headers.length) throw new Error('Headers not defined. Use options: hideHeader to hide.')

	if (options.useSafelyMarginBottom === undefined) options.useSafelyMarginBottom = true

	let title            = table.title    ? table.title    : ( options.title    || '' ) 
	let subtitle         = table.subtitle ? table.subtitle : ( options.subtitle || '' ) 

	this._helpers.logg('layout', this.page.layout)
	this._helpers.logg('size', this.page.size)
	this._helpers.logg('margins', this.page.margins)
	this._helpers.logg('options', this.options)

	return { table, options, title, subtitle }
}

fns.values = function(options) {
	// const columnIsDefined  = options.columnsSize.length ? true : false;
	const columnSpacing    = options.columnSpacing || 3 // 15
	let columnSizes      = []
	let columnPositions  = [] // 0, 10, 20, 30, 100
	let columnWidth      = 0

	this._rowDistance      = 0.5;
	let cellPadding      = { top: 0, right: 0, bottom: 0, left: 0 } // universal

	const prepareHeader    = options.prepareHeader || (() => this.fillColor('black').font("Helvetica-Bold").fontSize(8).fill())
	const prepareRow       = options.prepareRow || ((row, indexColumn, indexRow, rectRow, rectCell) => this.fillColor('black').font("Helvetica").fontSize(8).fill())
	//const prepareCell      = options.prepareCell || ((cell, indexColumn, indexRow, indexCell, rectCell) => this.fillColor('black').font("Helvetica").fontSize(8).fill())

	this._tableWidth       = 0
	const maxY             = this.page.height - (this.page.margins.bottom) // this.page.margins.top + 

	let startX           = options.x || this.x || this.page.margins.left
	let startY           = options.y || this.y || this.page.margins.top

	let lastPositionX    = 0
	let rowBottomY       = 0

	//------------ experimental fast variables
	let titleHeight     = 0
	this.headerHeight    = 0
	let firstLineHeight = 0
	this.datasIndex     = 0
	this.rowsIndex     = 0
	let lockAddTitles   = false // add title only once
	let lockAddPage     = false
	let lockAddHeader   = false
	let safelyMarginBottom = this.page.margins.top / 2

	// reset position to margins.left
	if (options.x === null || options.x === -1 ){
		startX = this.page.margins.left;
	}
	return {
		columnSpacing, columnSizes, columnPositions, columnWidth,
		cellPadding, prepareHeader, prepareRow, maxY, startX, startY,
		lastPositionX, rowBottomY, titleHeight, firstLineHeight, lockAddTitles,
		lockAddPage, lockAddHeader, safelyMarginBottom
	}
}

fns.table = function(table, options) {
	table.headers || (table.headers = []);
	table.datas || (table.datas = []);
	table.rows || (table.rows = []);
	table.options && (options = {...options, ...table.options});
}

fns.options = function(options) {
	options.hideHeader || (options.hideHeader = false)
	options.padding || (options.padding = 0)
	options.columnsSize || (options.columnsSize = [])
	options.addPage || (options.addPage = false)
	options.absolutePosition || (options.absolutePosition = false)
	options.minRowHeight || (options.minRowHeight = 0)
	// TODO options.hyperlink || (options.hyperlink = { urlToLink: false, description: null })

	this._dividers.parseOptions(options)
}

module.exports = fns