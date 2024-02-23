let fns = {}

fns.add = function() { 
	let { table, options } = this

	// Allow the user to override style for headers
	this._prepareHeader()

	// calc header height
	if (this.headerHeight === 0) {
		this.headerHeight = this._compute.rowHeight(table.headers, true)
		this._helpers.logg(this.headerHeight, 'headers')
	}

	// calc first table line when init table
	if (this._firstLineHeight === 0) {
		if (table.datas.length > 0) {
			this._firstLineHeight = this._compute.rowHeight(table.datas[0], true)
			this._helpers.logg(firstLineHeight, 'datas')
		}
		if (table.rows.length > 0) {
			this._firstLineHeight = this._compute.rowHeight(table.rows[0], true)
			this._helpers.logg(firstLineHeight, 'rows')
		}
	}

	// 24.1 is height calc title + subtitle
	this._titleHeight = !lockAddTitles ? 24.1 : 0; 
	// calc if header + first line fit on last page
	const calc = startY + this._titleHeight + this._firstLineHeight + this.headerHeight + this._safelyMarginBottom// * 1.3;

	// content is big text (crazy!)
	if (this._firstLineHeight > maxY) {
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
	if (this._lockAddTitles === false) {
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

	this._lockAddTitles = true;

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

}

module.exports = fns
