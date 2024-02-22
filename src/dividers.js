let fns = {}

fns.parseOptions = function(options) {
	options.divider || (options.divider = {})
	options.divider.top         || (options.divider.top         = { disabled: true, width: undefined, opacity: undefined })
	options.divider.header      || (options.divider.header      = { disabled: false, width: undefined, opacity: undefined })
	options.divider.horizontal  || (options.divider.horizontal  = { disabled: false, width: undefined, opacity: undefined })
	options.divider.vertical    || (options.divider.vertical    = { disabled: true, width: undefined, opacity: undefined })
}

fns.column = function(options, x, y, height, lineWidth, opacity, color) {
	let dividerOptions = this._dividers._parseDividerOptions(options.divider.vertical, opacity, lineWidth, color)
	if (!dividerOptions) return;
	({ opacity, lineWidth, color } = dividerOptions)
	this.save()
	this
		.moveTo(x, y)
		.lineTo(x, y + height)
		.lineWidth(lineWidth)
		.strokeColor(color)
		.opacity(opacity)
		.stroke()
	this.restore()
}

fns.row = function(options, type, x, y, lineWidth, opacity, color) {
	type || (type = 'horizontal'); // top | header | horizontal 
	const distance = this._rowDistance * 1.5
	const margin = options.x || this.page.margins.left || 30
	let dividerOptions = this._dividers._parseDividerOptions(options.divider[type], opacity, lineWidth, color)
	if (!dividerOptions) return;
	({ opacity, lineWidth, color } = dividerOptions)
	this.save()
	this
		.moveTo(x, y - distance)
		.lineTo(x + this._tableWidth - margin, y - distance)
		.lineWidth(lineWidth)
		.strokeColor(color)
		.opacity(opacity)
		.stroke()
	this.restore()
}

fns._parseDividerOptions = function(options, opacity, lineWidth, color) {
	if (options.disabled) return;
	opacity     = opacity || options.opacity || 0.5
	lineWidth   = lineWidth || options.width || 0.5
	color       = color || options.color || 'black'
	return { opacity, lineWidth, color }
}

module.exports = fns
