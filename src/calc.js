const fns = {}

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
