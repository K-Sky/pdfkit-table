// jshint esversion: 6
// "use strict";
// https://jshint.com/

const PDFDocument = require("pdfkit")
const helpers = require("./helpers.js")
const defaults = require("./defaults.js")
const dividers = require("./dividers.js")
const calc = require("./compute.js")
const title = require("./title.js")
const header = require("./header.js")
const datas = require("./datas.js")
const rows = require("./rows.js")

class PDFDocumentWithTables extends PDFDocument {
	constructor(option) {
		super(option)
		this.opt = option
		this._helpers = helpers.registerFns.bind(this)(helpers)
		this._defaults = helpers.registerFns.bind(this)(defaults)
		this._dividers = helpers.registerFns.bind(this)(dividers)
		this._compute = helpers.registerFns.bind(this)(calc)
		this._title = helpers.registerFns.bind(this)(title)
		this._header = helpers.registerFns.bind(this)(header)
		this._datas = helpers.registerFns.bind(this)(datas)
		this._rows = helpers.registerFns.bind(this)(rows)
	}

	/**
	 * table
	 * @param {Object} table 
	 * @param {Object} options 
	 * @param {Function} callback 
	 */
	table(table, options, callback) {
		return new Promise((resolve, reject) => {
			try {
				({ table, options } = this._defaults.parse(table, options))
				this._defaults.values(options)

				// add a new page before crate table
				options.addPage === true && this._helpers.onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();

				// add fire
				// this.emitter.removeAllListeners();
				// this.emitter.on('addTitle', addTitle);
				// this.emitter.on('addSubtitle', addSubTitle);
				// this.emitter.on('addPage', this._helpers.onFirePageAdded);
				// this.emitter.emit('addPage');
				// this.on('pageAdded', this._helpers.onFirePageAdded);

				this._compute.columnSizes()

				this._originalStartY = this._startY

				this._header.add()
				this._datas.add()
				this._rows.add()

				// update position
				this.x = this._startX
				this.y = this._rowBottomY; // position y final
				table.headers.forEach((dataHeader) => {
					this._dividers.column(options, dataHeader.startX, this._originalStartY, this.y - this._originalStartY)
				})
				this._dividers.column(options, this._tableWidth, this._originalStartY, this.y - this._originalStartY)
				this.moveDown() // break

				// add fire
				this.off("pageAdded", this._helpers.onFirePageAdded)

				// callback
				typeof callback === 'function' && callback(this)

				// nice :)
				resolve();
			} catch (error) {
				// error
				reject(error);
			}
		})
	}

	/**
	 * tables
	 * @param {Object} tables 
	 * @returns 
	 */
	async tables(tables, callback) {
		return new Promise(async (resolve, reject) => {
			try {
				if (Array.isArray(tables) === false) return resolve()
				const len = tables.length
				for(let i; i < len; i++) {
					await this.table(tables[i], tables[i].options || {})
				}

				// if tables is Array
				// Array.isArray(tables) ?
				// // for each on Array
				// tables.forEach( async table => await this.table( table, table.options || {} ) ) :
				// // else is tables is a unique table object
				// ( typeof tables === 'object' ? this.table( tables, tables.options || {} ) : null ) ;
				// // callback
				typeof callback === 'function' && callback(this)
				// // done!
				resolve()
			} catch(error) {
				reject(error)
			}
		})
	}
}

module.exports = PDFDocumentWithTables
module.exports.default = PDFDocumentWithTables
