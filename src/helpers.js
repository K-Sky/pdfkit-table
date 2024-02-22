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

fns.calcTopTextToAlignVertically = function(text, width, cellPadding, align, valign, rowDistance, columnSpacing, rectCell) {
	let topTextToAlignVertically = 0
	if (valign && valign !== 'top') {
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
	}
	return topTextToAlignVertically
}

module.exports = fns
