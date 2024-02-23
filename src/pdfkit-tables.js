// jshint esversion: 6
// "use strict";
// https://jshint.com/

const PDFDocument = require("pdfkit")
const helpers = require("./helpers.js")
const defaults = require("./defaults.js")
const title = require("./title.js")
const dividers = require("./dividers.js")
const calc = require("./compute.js")

class PDFDocumentWithTables extends PDFDocument {
	constructor(option) {
		super(option)
		this.opt = option
		this._helpers = helpers.registerFns.bind(this)(helpers)
		this._defaults = helpers.registerFns.bind(this)(defaults)
		this._title = helpers.registerFns.bind(this)(title)
		this._dividers = helpers.registerFns.bind(this)(dividers)
		this._compute = helpers.registerFns.bind(this)(calc)
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
				let title, subtitle
				({ table, options, title, subtitle } = this._defaults.parse(table, options))
				let {
					cellPadding, prepareHeader, prepareRow,
					maxY, startX, startY,
					lastPositionX, rowBottomY, titleHeight, firstLineHeight, lockAddTitles,
					lockAddPage, lockAddHeader, safelyMarginBottom
				} = this._defaults.values(options)

				// add a new page before crate table
				options.addPage === true && onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();

				// event emitter
				const onFirePageAdded = () => {
					table.headers.forEach((dataHeader) => {
						this._dividers.column(options, dataHeader.startX, originalStartY, this.y - originalStartY);
					})
					this._dividers.column(options, this._tableWidth, originalStartY, this.y - originalStartY);
					//startX = this.page.margins.left;
					startY = this.page.margins.top;
					rowBottomY = 0;
					lockAddPage || this.addPage({
						layout: this.page.layout,
						size: this.page.size,
						margins: this.page.margins,
					});
					lockAddHeader || addHeader();
				};

				// add fire
				// this.emitter.removeAllListeners();
				// this.emitter.on('addTitle', addTitle);
				// this.emitter.on('addSubtitle', addSubTitle);
				// this.emitter.on('addPage', onFirePageAdded);
				// this.emitter.emit('addPage');
				// this.on('pageAdded', onFirePageAdded);

				// warning - eval can be harmful
				const fEval = (str) => {
					let f = null; eval('f = ' + str); return f;
				}

				this._compute.columnSizes()

				let originalStartY = startY;

				// Header

				const addHeader = () => { 
					// Allow the user to override style for headers
					prepareHeader();

					// calc header height
					if(this.headerHeight === 0){
						this.headerHeight = this._compute.rowHeight(table.headers, true);
						this._helpers.logg(this.headerHeight, 'headers');
					}

					// calc first table line when init table
					if(firstLineHeight === 0){
						if(table.datas.length > 0){
							firstLineHeight = this._compute.rowHeight(table.datas[0], true);
							this._helpers.logg(firstLineHeight, 'datas');
						}
						if(table.rows.length > 0){
							firstLineHeight = this._compute.rowHeight(table.rows[0], true);
							this._helpers.logg(firstLineHeight, 'rows');
						}
					}

					// 24.1 is height calc title + subtitle
					titleHeight = !lockAddTitles ? 24.1 : 0; 
					// calc if header + first line fit on last page
					const calc = startY + titleHeight + firstLineHeight + this.headerHeight + safelyMarginBottom// * 1.3;

					// content is big text (crazy!)
					if(firstLineHeight > maxY) {
						// lockAddHeader = true;
						lockAddPage = true;
						this._helpers.logg('CRAZY! This a big text on cell');
					} else if(calc > maxY) { // && !lockAddPage
						// lockAddHeader = false;
						lockAddPage = true;
						onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();
						return;
					} 

					// if has title
					if (lockAddTitles === false) {
						// create title and subtitle
						startY = this._title.create(title, 12, 1, this._columnSpacing, startX, startY)
						startY = this._title.create(subtitle, 9, 0.7, this._columnSpacing, startX, startY)
						// add space after title
						if (title || subtitle){
							startY += 3
						}
					}

					// Allow the user to override style for headers
					prepareHeader();

					lockAddTitles = true;

					// this options is trial
					if(options.absolutePosition === true){
						lastPositionX = options.x || startX || this.x; // x position head
						startY = options.y || startY || this.y; // x position head  
					} else {
						lastPositionX = startX; // x position head  
					}

					// Check to have enough room for header and first rows. default 3
					// if (startY + 2 * this.headerHeight >= maxY) this.emitter.emit('addPage'); //this.addPage();

					if(!options.hideHeader && table.headers.length > 0) {

						// simple header
						if(typeof table.headers[0] === 'string') {
							table.headers = table.headers.map(header => ({
								name: header
							}));
						}

						// Print all headers
						table.headers.forEach( (dataHeader, i) => {
							let {label, width, renderer, align, valign, headerColor, headerOpacity, headerAlign, headerValign, padding} = dataHeader;
							// check defination
							width = width || this._columnSizes[i];
							align = headerAlign || align || 'left';
							valign = headerValign || valign || 'top';
							// force number
							width = width >> 0;

							// register renderer function
							if(renderer && typeof renderer === 'string') {
								table.headers[i].renderer = fEval(renderer);
							}

							// # Rotation
							// var doTransform = function (x, y, angle) {
							//   var rads = angle / 180 * Math.PI;
							//   var newX = x * Math.cos(rads) + y * Math.sin(rads);
							//   var newY = y * Math.cos(rads) - x * Math.sin(rads);

							//   return {
							//       x: newX,
							//       y: newY,
							//       rads: rads,
							//       angle: angle
							//       };
							//   };
							// }
							// this.save(); // rotation
							// this.rotate(90, {origin: [lastPositionX, startY]});
							// width = 50;

							// background header
							const rectCell = {
								x: lastPositionX, 
								y: startY - this._columnSpacing - (this._rowDistance * 2), 
								width: width, 
								height: this.headerHeight + this._columnSpacing,
							};
							dataHeader.startX = rectCell.x;

							// add background
							this._helpers.addBackground(rectCell, headerColor, headerOpacity);

							// cell padding
							cellPadding = this._helpers.prepareCellPadding(padding || options.padding || 0);

							// align vertically
							let topTextToAlignVertically = this._compute.topTextToAlignVertically.bind(this)(label, width, cellPadding, align, valign, this._rowDistance, this._columnSpacing, rectCell);

							// write
							this.text(label, 
								lastPositionX + (cellPadding.left), 
								startY + topTextToAlignVertically, {
									width: width - (cellPadding.left + cellPadding.right),
									align: align,
								})

							lastPositionX += width;
							// this.restore(); // rotation

						});

					}

					// set style
					this._helpers.prepareRowOptions(table.headers);

					if(!options.hideHeader) {
						// Refresh the y coordinate of the bottom of the headers row
						rowBottomY = Math.max(startY + this._compute.rowHeight(table.headers, true), rowBottomY);
						// Separation line on top of headers
						this._dividers.row(options, 'top', startX, startY - this._columnSpacing - (this._rowDistance * 2))
						// Separation line between headers and rows
						this._dividers.row(options, 'header', startX, rowBottomY);
						originalStartY = startY - this._columnSpacing - (this._rowDistance * 2);
					} else {
						rowBottomY = startY;
					}

				};

				// End header
				addHeader();

				// Datas
				table.datas.forEach((row, i) => {

					this.datasIndex = i;
					const rowHeight = this._compute.rowHeight(row, false);
					this._helpers.logg(rowHeight);

					// Switch to next page if we cannot go any further because the space is over.
					// For safety, consider 3 rows margin instead of just one
					// if (startY + 2 * rowHeight < maxY) startY = rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows
					// else this.emitter.emit('addPage'); //this.addPage();
					if(options.useSafelyMarginBottom && this.y + safelyMarginBottom + rowHeight >= maxY && !lockAddPage) {
						onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();    
						originalStartY = startY;
					}

					// calc position
					startY = rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows

					// unlock add page function
					lockAddPage = false;

					const rectRow = {
						x: startX, 
						y: startY - this._columnSpacing - (this._rowDistance * 2), 
						width: this._tableWidth - startX, 
						height: rowHeight + this._columnSpacing,
					};

					// add background row
					this._helpers.prepareRowBackground(row, rectRow);

					lastPositionX = startX; 

					// Print all cells of the current row
					table.headers.forEach(( dataHeader, index) => {

						let {property, width, renderer, align, valign, padding} = dataHeader;

						// check defination
						width = width || this._columnWidth;
						align = align || 'left';

						// cell padding
						cellPadding = this._helpers.prepareCellPadding(padding || options.padding || 0);

						const rectCell = {
							x: lastPositionX,
							y: startY - this._columnSpacing - (this._rowDistance * 2),
							width: width,
							height: rowHeight + this._columnSpacing,
						}

						// allow the user to override style for rows
						this._helpers.prepareRowOptions(row);
						prepareRow(row, index, i, rectRow, rectCell,);

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
						let topTextToAlignVertically = this._compute.topTextToAlignVertically.bind(this)(text, cellPadding, width, align, valign, this._rowDistance, this._columnSpacing, rectCell);

						// write
						this.text(text, 
							lastPositionX + (cellPadding.left), 
							startY + topTextToAlignVertically, {
								width: width - (cellPadding.left + cellPadding.right),
								align: align,
							});  

						dataHeader.startX = rectCell.x;
						lastPositionX += width; 

						// set style
						// Maybe REMOVE ???
						this._helpers.prepareRowOptions(row);
						prepareRow(row, index, i, rectRow, rectCell);

					});

					// Refresh the y coordinate of the bottom of this row
					rowBottomY = Math.max(startY + rowHeight, rowBottomY);

					// console.log(this.page.height, rowBottomY, this.y);
					// text is so big as page (crazy!)
					if(rowBottomY > this.page.height) {
						rowBottomY = this.y + this._columnSpacing + (this._rowDistance * 2);
					}

					// Separation line between rows
					this._dividers.row(options, 'horizontal', startX, rowBottomY);

					// review this code
					if( row.hasOwnProperty('options') ){
						if( row.options.hasOwnProperty('separation') ){
							// Separation line between rows
							this._dividers.row(options, 'horizontal', startX, rowBottomY, 1, 1);
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
					// if (startY + 3 * rowHeight < maxY) startY = rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows
					// else this.emitter.emit('addPage'); //this.addPage(); 
					if(options.useSafelyMarginBottom && this.y + safelyMarginBottom + rowHeight >= maxY && !lockAddPage) {
						onFirePageAdded(); // this.emitter.emit('addPage'); //this.addPage();
						originalStartY = startY;
					}

					// calc position
					startY = rowBottomY + this._columnSpacing + this._rowDistance; // 0.5 is spacing rows

					// unlock add page function
					lockAddPage = false;

					const rectRow = {
						x: this._columnPositions[0], 
						// x: startX, 
						y: startY - this._columnSpacing - (this._rowDistance * 2), 
						width: this._tableWidth - startX, 
						height: rowHeight + this._columnSpacing,
					}

					// add background
					// this._helpers.addBackground(rectRow);

					lastPositionX = startX; 

					row.forEach((cell, index) => {

						let align = 'left';
						let valign = undefined;

						const rectCell = {
							// x: this._columnPositions[index],
							x: lastPositionX,
							y: startY - this._columnSpacing - (this._rowDistance * 2),
							width: this._columnSizes[index],
							height: rowHeight + this._columnSpacing,
						}

						this._helpers.prepareRowBackground(table.headers[index], rectCell);

						// Allow the user to override style for rows
						prepareRow(row, index, i, rectRow, rectCell);

						if(typeof table.headers[index] === 'object') {
							// renderer column
							table.headers[index].renderer && (cell = table.headers[index].renderer(cell, index, i, row, rectRow, rectCell, this)); // text-cell, index-column, index-line, row, doc[this]
							// align
							table.headers[index].align && (align = table.headers[index].align);
							table.headers[index].valign && (valign = table.headers[index].valign);
						}

						// cell padding
						cellPadding = this._helpers.prepareCellPadding(table.headers[index].padding || options.padding || 0);

						// align vertically
						let topTextToAlignVertically = this._compute.topTextToAlignVertically.bind(this)(cell, cellPadding, this._columnSizes[index], align, valign, this._rowDistance, this._columnSpacing, rectCell);

						// write
						this.text(cell, 
							lastPositionX + (cellPadding.left),
							startY + topTextToAlignVertically, {
								width: this._columnSizes[index] - (cellPadding.left + cellPadding.right),
								align: align,
							});

						lastPositionX += this._columnSizes[index];

					});

					// Refresh the y coordinate of the bottom of this row
					rowBottomY = Math.max(startY + rowHeight, rowBottomY);

					// console.log(this.page.height, rowBottomY, this.y);
					// text is so big as page (crazy!)
					if(rowBottomY > this.page.height) {
						rowBottomY = this.y + this._columnSpacing + (this._rowDistance * 2);
					}

					// Separation line between rows
					this._dividers.row(options, 'horizontal', startX, rowBottomY);          
				});
				// End rows

				// update position
				this.x = startX;
				this.y = rowBottomY; // position y final;
				table.headers.forEach((dataHeader) => {
					this._dividers.column(options, dataHeader.startX, originalStartY, this.y - originalStartY);
				})
				this._dividers.column(options, this._tableWidth, originalStartY, this.y - originalStartY);
				this.moveDown(); // break

				// add fire
				this.off("pageAdded", onFirePageAdded);

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
