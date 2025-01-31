const debug = false

const fns = {}

fns.registerFns = function(obj) {
	let newObj = {}
	Object.keys(obj).forEach(key => {
		newObj[key] = obj[key].bind(this)
	})
	return newObj
}

fns.logg = (() =>
	debug ?
	function(...args) {
		console.log(args)
	}
	: function() {}
)()

fns.prepareRowBackground = function(row, rect) {
	// validate
	if(typeof row !== 'object') return

	// options
	row.options && (row = row.options)

	let { fill, opac } = {}

	// add backgroundColor
	if (row.hasOwnProperty('columnColor')) { // ^0.1.70

		const { columnColor, columnOpacity } = row
		fill = columnColor
		opac = columnOpacity

	} else if (row.hasOwnProperty('backgroundColor')) { // ~0.1.65 old

		const { backgroundColor, backgroundOpacity } = row
		fill = backgroundColor
		opac = backgroundOpacity

	} else if (row.hasOwnProperty('background')) { // dont remove
		if (typeof row.background === 'object') {
			let { color, opacity } = row.background
			fill = color
			opac = opacity
		}
	}

	fill && this.addBackground(rect, fill, opac)
}

// padding: [10, 10, 10, 10]
// padding: [10, 10]
// padding: {top: 10, right: 10, bottom: 10, left: 10}
// padding: 10,
fns.prepareCellPadding = function(p) {
	// array
	if (Array.isArray(p)) {
		switch(p.length){
			case 3: p = [...p, 0]; break
			case 2: p = [...p, ...p]; break
			case 1: p = Array(4).fill(p[0]); break
		}
	}
	// number
	else if(typeof p === 'number') {
		p = Array(4).fill(p)
	}
	// object
	else if(typeof p === 'object') {
		const {top, right, bottom, left} = p
		p = [top, right, bottom, left]
	} 
	// null
	else {
		p = Array(4).fill(0)
	}
	return {
		top:    p[0] >> 0, // int
		right:  p[1] >> 0,
		bottom: p[2] >> 0,
		left:   p[3] >> 0,
	}
}

fns.prepareRowOptions = function(row) {
	// validate
	if (typeof row !== 'object' || !row.hasOwnProperty('options')) return

	const { fontFamily, fontSize, color } = row.options

	fontFamily && this.font(fontFamily)
	fontSize && this.fontSize(fontSize)
	color && this.fillColor(color)

	// row.options.hasOwnProperty('fontFamily') && this.font(row.options.fontFamily)
	// row.options.hasOwnProperty('fontSize') && this.fontSize(row.options.fontSize)
	// row.options.hasOwnProperty('color') && this.fillColor(row.options.color)
}

fns.onFirePageAdded = function() {
	this._renderer.verticalDividers()
	//startX = this.page.margins.left;
	this._startY = this.page.margins.top
	this._rowBottomY = 0
	this._lockAddPage || this.addPage({
		layout: this.page.layout,
		size: this.page.size,
		margins: this.page.margins,
	})
	this._lockAddHeader || this._header.add()
}

module.exports = fns
