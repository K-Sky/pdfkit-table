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

				this._header.add();

				// Datas
				table.datas.forEach((row, i) => {

					this.datasIndex = i;
					const rowHeight = this._compute.rowHeight(row, false);
					this._helpers.logg(rowHeight);

					// Switch to next page if we cannot go any further because the space is over.
					// For safety, consider 3 rows margin instead of just one
					// if (this._startY + 2 * rowHeight < this._maxY) this._startY = this._rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows
					// else this.emitter.emit('addPage'); //this.addPage();
					if (options.useSafelyMarginBottom && this.y + this._safelyMarginBottom + rowHeight >= this._maxY && !this._lockAddPage) {
						this._helpers.onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();    
						this._originalStartY = this._startY;
					}

					// calc position
					this._startY = this._rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows

					// unlock add page function
					this._lockAddPage = false;

					const rectRow = {
						x: this._startX, 
						y: this._startY - this._columnSpacing - (this._rowDistance * 2), 
						width: this._tableWidth - this._startX, 
						height: rowHeight + this._columnSpacing,
					};

					// add background row
					this._helpers.prepareRowBackground(row, rectRow);

					this._lastPositionX = this._startX; 

					// Print all cells of the current row
					table.headers.forEach(( dataHeader, index) => {

						let {property, width, renderer, align, valign, padding} = dataHeader;

						// check defination
						width = width || this._columnWidth;
						align = align || 'left';

						// cell padding
						this._cellPadding = this._helpers.prepareCellPadding(padding || options.padding || 0);

						const rectCell = {
							x: this._lastPositionX,
							y: this._startY - this._columnSpacing - (this._rowDistance * 2),
							width: width,
							height: rowHeight + this._columnSpacing,
						}

						// allow the user to override style for rows
						this._helpers.prepareRowOptions(row);
						this._prepareRow(row, index, i, rectRow, rectCell,);

						let text = row[property];

						// cell object
						if(typeof text === 'object' ){

							text = String(text.label); // get label
							// row[property].hasOwnProperty('options') && this._helpers.prepareRowOptions(row[property]); // set style

							// options if text cell is object
							if( row[property].hasOwnProperty('options') ){

								// set font style
								this._helpers.prepareRowOptions(row[property]);
								this._helpers.prepareRowBackground(row[property], rectCell);

							}

						} else {

							// style column by header
							this._helpers.prepareRowBackground(table.headers[index], rectCell);

						}

						// bold
						if( String(text).indexOf('bold:') === 0 ){
							this.font('Helvetica-Bold');
							text = text.replace('bold:','');
						}

						// size
						if( String(text).indexOf('size') === 0 ){
							let size = String(text).substr(4,2).replace(':','').replace('+','') >> 0;
							this.fontSize( size < 7 ? 7 : size );
							text = text.replace(`size${size}:`,'');
						}

						// renderer column
						// renderer && (text = renderer(text, index, i, row, rectRow, rectCell)) // value, index-column, index-row, row  nbhmn
						if(typeof renderer === 'function'){
							text = renderer(text, index, i, row, rectRow, rectCell); // value, index-column, index-row, row, doc[this]
						}

						// align vertically
						let topTextToAlignVertically = this._compute.topTextToAlignVertically.bind(this)(text, this._cellPadding, width, align, valign, this._rowDistance, this._columnSpacing, rectCell);

						// write
						this.text(text, 
							this._lastPositionX + (this._cellPadding.left), 
							this._startY + topTextToAlignVertically, {
								width: width - (this._cellPadding.left + this._cellPadding.right),
								align: align,
							});  

						dataHeader.startX = rectCell.x;
						this._lastPositionX += width; 

						// set style
						// Maybe REMOVE ???
						this._helpers.prepareRowOptions(row);
						this._prepareRow(row, index, i, rectRow, rectCell);

					});

					// Refresh the y coordinate of the bottom of this row
					this._rowBottomY = Math.max(this._startY + rowHeight, this._rowBottomY);

					// console.log(this.page.height, rowBottomY, this.y);
					// text is so big as page (crazy!)
					if (this._rowBottomY > this.page.height) {
						this._rowBottomY = this.y + this._columnSpacing + (this._rowDistance * 2);
					}

					// Separation line between rows
					this._dividers.row(options, 'horizontal', this._startX, this._rowBottomY);

					// review this code
					if( row.hasOwnProperty('options') ){
						if( row.options.hasOwnProperty('separation') ){
							// Separation line between rows
							this._dividers.row(options, 'horizontal', this._startX, this._rowBottomY, 1, 1);
						}
					}

				});
				// End datas

				// Rows
				table.rows.forEach((row, i) => {

					this.rowsIndex = i;
					const rowHeight = this._compute.rowHeight(row, false);
					this._helpers.logg(rowHeight);

					// Switch to next page if we cannot go any further because the space is over.
					// For safety, consider 3 rows margin instead of just one
					// if (startY + 3 * rowHeight < this._maxY) startY = this._rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows
					// else this.emitter.emit('addPage'); //this.addPage(); 
					if (options.useSafelyMarginBottom && this.y + this._safelyMarginBottom + rowHeight >= this._maxY && !this._lockAddPage) {
						this._helpers.onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();
						this._originalStartY = this._startY;
					}

					// calc position
					this._startY = this._rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows

					// unlock add page function
					this._lockAddPage = false;

					const rectRow = {
						x: this._columnPositions[0], 
						// x: this._startX, 
						y: this._startY - this._columnSpacing - (this._rowDistance * 2), 
						width: this._tableWidth - this._startX, 
						height: rowHeight + this._columnSpacing,
					}

					// add background
					// this._helpers.addBackground(rectRow);

					this._lastPositionX = this._startX; 

					row.forEach((cell, index) => {

						let align = 'left';
						let valign = undefined;

						const rectCell = {
							// x: this._columnPositions[index],
							x: this._lastPositionX,
							y: this._startY - this._columnSpacing - (this._rowDistance * 2),
							width: this._columnSizes[index],
							height: rowHeight + this._columnSpacing,
						}

						this._helpers.prepareRowBackground(table.headers[index], rectCell);

						// Allow the user to override style for rows
						this._prepareRow(row, index, i, rectRow, rectCell);

						if(typeof table.headers[index] === 'object') {
							// renderer column
							table.headers[index].renderer && (cell = table.headers[index].renderer(cell, index, i, row, rectRow, rectCell, this)); // text-cell, index-column, index-line, row, doc[this]
							// align
							table.headers[index].align && (align = table.headers[index].align);
							table.headers[index].valign && (valign = table.headers[index].valign);
						}

						// cell padding
						this._cellPadding = this._helpers.prepareCellPadding(table.headers[index].padding || options.padding || 0);

						// align vertically
						let topTextToAlignVertically = this._compute.topTextToAlignVertically.bind(this)(cell, this._cellPadding, this._columnSizes[index], align, valign, this._rowDistance, this._columnSpacing, rectCell);

						// write
						this.text(cell, 
							this._lastPositionX + (this._cellPadding.left),
							this._startY + topTextToAlignVertically, {
								width: this._columnSizes[index] - (this._cellPadding.left + this._cellPadding.right),
								align: align,
							});

						this._lastPositionX += this._columnSizes[index];

					});

					// Refresh the y coordinate of the bottom of this row
					this._rowBottomY = Math.max(this._startY + rowHeight, this._rowBottomY);

					// console.log(this.page.height, rowBottomY, this.y);
					// text is so big as page (crazy!)
					if (this._rowBottomY > this.page.height) {
						this._rowBottomY = this.y + this._columnSpacing + (this._rowDistance * 2);
					}

					// Separation line between rows
					this._dividers.row(options, 'horizontal', this._startX, this._rowBottomY);          
				});
				// End rows

				// update position
				this.x = this._startX;
				this.y = this._rowBottomY; // position y final;
				table.headers.forEach((dataHeader) => {
					this._dividers.column(options, dataHeader.startX, this._originalStartY, this.y - this._originalStartY);
				})
				this._dividers.column(options, this._tableWidth, this._originalStartY, this.y - this._originalStartY);
				this.moveDown(); // break

				// add fire
				this.off("pageAdded", this._helpers.onFirePageAdded);

				// callback
				typeof callback === 'function' && callback(this);

				// nice :)
				resolve();

			} catch (error) {

				// error
				reject(error);

			}

		});
	}

	/**
	 * tables
	 * @param {Object} tables 
	 * @returns 
	 */
	async tables(tables, callback) {
		return new Promise(async (resolve, reject) => {
			try {

				if(Array.isArray(tables) === false)
				{
					resolve();
					return;
				}

				const len = tables.length;
				for(let i; i < len; i++)
				{
					await this.table(tables[i], tables[i].options || {});
				}

				// if tables is Array
				// Array.isArray(tables) ?
				// // for each on Array
				// tables.forEach( async table => await this.table( table, table.options || {} ) ) :
				// // else is tables is a unique table object
				// ( typeof tables === 'object' ? this.table( tables, tables.options || {} ) : null ) ;
				// // callback
				typeof callback === 'function' && callback(this);
				// // donw!
				resolve();
			} 
			catch(error)
			{
				reject(error);
			}

		});
	}
}

module.exports = PDFDocumentWithTables
module.exports.default = PDFDocumentWithTables
