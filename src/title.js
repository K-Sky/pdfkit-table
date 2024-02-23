const fns = {}

fns.add = function(data, fontSize, opacity, columnSpacing, startX, startY) {
	if (!data) return startY
	typeof data === 'string' && (data = { label: data, fontSize, opacity })
	data.fontFamily && this.font(data.fontFamily)
	data.label && this.fillColor(data.color || 'black')
		.fontSize(data.fontSize || fontSize).opacity(data.opacity || opacity).fill()
		.text(data.label, startX, startY, {
			width: this._tableWidth - this._startX,
			align: data.align || 'left'
		})
	startY = this.y + columnSpacing + 2
	return startY
}

module.exports = fns
