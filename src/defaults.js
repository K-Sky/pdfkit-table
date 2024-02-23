const fns = {}

fns.parse = function(table, options) {
	typeof table === 'string' && (table = JSON.parse(table));

	table || (table = {})
	options || (options = {})

	this._defaults.table(table, options)
	this._defaults.options(options)

	if (!table.headers.length) throw new Error('Headers not defined. Use options: hideHeader to hide.')

	if (options.useSafelyMarginBottom === undefined) options.useSafelyMarginBottom = true

	this._tableTitle    = table.title    ? table.title    : ( options.title    || '' ) 
	this._tableSubtitle = table.subtitle ? table.subtitle : ( options.subtitle || '' ) 

	this._helpers.logg('layout', this.page.layout)
	this._helpers.logg('size', this.page.size)
	this._helpers.logg('margins', this.page.margins)
	this._helpers.logg('options', this.options)

	this.table = table
	this.options = options

	return { table, options }
}

fns.values = function(options) {
	// const columnIsDefined  = options.columnsSize.length ? true : false;
	this._columnSpacing     = options.columnSpacing || 3 // 15
	this._columnSizes       = []
	this._columnPositions   = [] // 0, 10, 20, 30, 100
	this._columnWidth       = 0

	this._rowDistance       = 0.5;
	this._cellPadding       = { top: 0, right: 0, bottom: 0, left: 0 } // universal

	this._prepareHeader     = options.prepareHeader || (() => this.fillColor('black').font("Helvetica-Bold").fontSize(8).fill())
	this._prepareRow        = options.prepareRow || ((row, indexColumn, indexRow, rectRow, rectCell) => this.fillColor('black').font("Helvetica").fontSize(8).fill())
	//const prepareCell       = options.prepareCell || ((cell, indexColumn, indexRow, indexCell, rectCell) => this.fillColor('black').font("Helvetica").fontSize(8).fill())

	this._tableWidth        = 0
	this._maxY              = this.page.height - (this.page.margins.bottom) // this.page.margins.top + 

	this._startX            = options.x || this.x || this.page.margins.left
	this._startY            = options.y || this.y || this.page.margins.top

	this._lastPositionX     = 0
	this._rowBottomY        = 0

	//------------ experimental fast variables
	this._titleHeight       = 0
	this.headerHeight       = 0
	this._firstLineHeight   = 0
	this.datasIndex         = 0
	this.rowsIndex          = 0
	this._lockAddTitles     = false // add title only once
	this._lockAddPage       = false
	this._lockAddHeader     = false
	this._safelyMarginBottom = this.page.margins.top / 2

	// reset position to margins.left
	if (options.x === null || options.x === -1 ){
		this.startX = this.page.margins.left;
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