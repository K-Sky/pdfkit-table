const fns = {}

fns.parse = function(table, options) {
	typeof table === 'string' && (table = JSON.parse(table));

	table || (table = {})
	options || (options = {})

	this.parser.defaultTable(table, options)
	this.parser.defaultOptions(options)

	if (!table.headers.length) throw new Error('Headers not defined. Use options: hideHeader to hide.')

	if (options.useSafelyMarginBottom === undefined) options.useSafelyMarginBottom = true

	let title            = table.title    ? table.title    : ( options.title    || '' ) 
	let subtitle         = table.subtitle ? table.subtitle : ( options.subtitle || '' ) 

	this.helpers.logg('layout', this.page.layout)
	this.helpers.logg('size', this.page.size)
	this.helpers.logg('margins', this.page.margins)
	this.helpers.logg('options', this.options)

	return { table, options, title, subtitle }
}

fns.defaultTable = function(table, options) {
	table.headers || (table.headers = []);
	table.datas || (table.datas = []);
	table.rows || (table.rows = []);
	table.options && (options = {...options, ...table.options});
}

fns.defaultOptions = function(options) {
	options.hideHeader || (options.hideHeader = false)
	options.padding || (options.padding = 0)
	options.columnsSize || (options.columnsSize = [])
	options.addPage || (options.addPage = false)
	options.absolutePosition || (options.absolutePosition = false)
	options.minRowHeight || (options.minRowHeight = 0)
	// TODO options.hyperlink || (options.hyperlink = { urlToLink: false, description: null })

	// divider lines
	options.divider || (options.divider = {})
	options.divider.top         || (options.divider.top         = { disabled: true, width: undefined, opacity: undefined })
	options.divider.header      || (options.divider.header      = { disabled: false, width: undefined, opacity: undefined })
	options.divider.horizontal  || (options.divider.horizontal  = { disabled: false, width: undefined, opacity: undefined })
	options.divider.vertical    || (options.divider.vertical    = { disabled: true, width: undefined, opacity: undefined })
}

module.exports = fns