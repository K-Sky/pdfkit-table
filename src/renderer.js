let fns = {}

fns.verticalDividers = function() {
	let { options, table } = this
	table.headers.forEach((dataHeader) => {
		this._dividers.column(options, dataHeader.startX, this._originalStartY, this.y - this._originalStartY)
	})
	this._dividers.column(options, this._tableWidth, this._originalStartY, this.y - this._originalStartY)
}

module.exports = fns
