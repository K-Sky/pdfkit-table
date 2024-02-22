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

	const {fontFamily, fontSize, color} = row.options

	fontFamily && this.font(fontFamily)
	fontSize && this.fontSize(fontSize)
	color && this.fillColor(color)

	// row.options.hasOwnProperty('fontFamily') && this.font(row.options.fontFamily)
	// row.options.hasOwnProperty('fontSize') && this.fontSize(row.options.fontSize)
	// row.options.hasOwnProperty('color') && this.fillColor(row.options.color)
}

fns.calcTopTextToAlignVertically = function(text, width, cellPadding, align, valign, rowDistance, columnSpacing, rectCell) {
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
