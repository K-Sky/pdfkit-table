let fns = {}

fns.rowsToDatas = function() {
	let { table } = this
	let headers = [...table.headers]
	let { datas, rows } = table
	if ((rows && rows.length) && (!datas || !datas.length)) {
		headers.forEach((header, index) => { header.property = header.property || `label_${index}` })
		datas = rows.map(row => {
			let obj = {}
			headers.forEach((header, index) => { obj[header.property] = row[index] })
			return obj
		})
	}
	return { headers, datas }
}

module.exports = fns
