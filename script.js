/* Shivving (IE8 is not supported, but at least it won't look as awful)
/* ========================================================================== */

(function (document) {
	var
	head = document.head = document.getElementsByTagName('head')[0] || document.documentElement,
	elements = 'article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output picture progress section summary time video x'.split(' '),
	elementsLength = elements.length,
	elementsIndex = 0,
	element;

	while (elementsIndex < elementsLength) {
		element = document.createElement(elements[++elementsIndex]);
	}

	element.innerHTML = 'x<style>' +
		'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
		'audio[controls],canvas,video{display:inline-block}' +
		'[hidden],audio{display:none}' +
		'mark{background:#FF0;color:#000}' +
	'</style>';

	return head.insertBefore(element.lastChild, head.firstChild);
})(document);

/* ============================================================
   DETECTAR MODO APPSHEET (URL corta ?id=)
============================================================ */
function esModoAppSheet() {
	return new URLSearchParams(window.location.search).has("id");
}

/* Prototyping
/* ========================================================================== */

(function (window, ElementPrototype, ArrayPrototype, polyfill) {
	function NodeList() { [polyfill] }
	NodeList.prototype.length = ArrayPrototype.length;

	ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
	ElementPrototype.mozMatchesSelector ||
	ElementPrototype.msMatchesSelector ||
	ElementPrototype.oMatchesSelector ||
	ElementPrototype.webkitMatchesSelector ||
	function matchesSelector(selector) {
		return ArrayPrototype.indexOf.call(this.parentNode.querySelectorAll(selector), this) > -1;
	};

	ElementPrototype.ancestorQuerySelectorAll = ElementPrototype.ancestorQuerySelectorAll ||
	ElementPrototype.mozAncestorQuerySelectorAll ||
	ElementPrototype.msAncestorQuerySelectorAll ||
	ElementPrototype.oAncestorQuerySelectorAll ||
	ElementPrototype.webkitAncestorQuerySelectorAll ||
	function ancestorQuerySelectorAll(selector) {
		for (var cite = this, newNodeList = new NodeList; cite = cite.parentElement;) {
			if (cite.matchesSelector(selector)) ArrayPrototype.push.call(newNodeList, cite);
		}
		return newNodeList;
	};

	ElementPrototype.ancestorQuerySelector = ElementPrototype.ancestorQuerySelector ||
	ElementPrototype.mozAncestorQuerySelector ||
	ElementPrototype.msAncestorQuerySelector ||
	ElementPrototype.oAncestorQuerySelector ||
	ElementPrototype.webkitAncestorQuerySelector ||
	function ancestorQuerySelector(selector) {
		return this.ancestorQuerySelectorAll(selector)[0] || null;
	};
})(this, Element.prototype, Array.prototype);

/* Helper Functions
/* ========================================================================== */

function generateTableRow() {
	if (esModoAppSheet()) return null;

	var emptyColumn = document.createElement('tr');

	emptyColumn.innerHTML =
		'<td><a class="cut">-</a><span contenteditable></span></td>' +
		'<td><span contenteditable></span></td>' +
		'<td><span data-prefix>$</span><span contenteditable>0.00</span></td>' +
		'<td><span contenteditable>0</span></td>' +
		'<td><span data-prefix>$</span><span>0.00</span></td>';

	return emptyColumn;
}

function parseFloatHTML(element) {
	return parseFloat(element.innerHTML.replace(/[^\d\.\-]+/g, '')) || 0;
}

function parsePrice(number) {
	return number.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
}

/* Update Number
/* ========================================================================== */

function updateNumber(e) {
	if (esModoAppSheet()) return;

	var
	activeElement = document.activeElement,
	value = parseFloat(activeElement.innerHTML),
	wasPrice = activeElement.innerHTML == parsePrice(parseFloatHTML(activeElement));

	if (!isNaN(value) && (e.keyCode == 38 || e.keyCode == 40 || e.wheelDeltaY)) {
		e.preventDefault();

		value += e.keyCode == 38 ? 1 : e.keyCode == 40 ? -1 : Math.round(e.wheelDelta * 0.025);
		value = Math.max(value, 0);

		activeElement.innerHTML = wasPrice ? parsePrice(value) : value;
	}

	updateInvoice();
}

/* Update Invoice
/* ========================================================================== */

function updateInvoice() {
	if (esModoAppSheet()) return;

	var total = 0;
	var cells, price, a, i;

	for (a = document.querySelectorAll('table.inventory tbody tr'), i = 0; a[i]; ++i) {
		cells = a[i].querySelectorAll('span:last-child');
		price = parseFloatHTML(cells[2]) * parseFloatHTML(cells[3]);
		total += price;
		cells[4].innerHTML = parsePrice(price);
	}

	cells = document.querySelectorAll('table.balance td:last-child span:last-child');
	if (cells.length > 0) cells[0].innerHTML = parsePrice(total);
}

/* On Content Load
/* ========================================================================== */

function onContentLoad() {

	/* 🔒 MODO APPSHEET: SOLO LECTURA */
	if (esModoAppSheet()) {

		// quitar edición
		document.querySelectorAll('[contenteditable]').forEach(el => {
			el.removeAttribute('contenteditable');
		});

		// ocultar botones
		document.querySelectorAll('.cut,.add').forEach(el => {
			el.style.display = 'none';
		});

		return; // ⛔ no activar eventos
	}

	/* ✏️ MODO PLANTILLA EDITABLE */
	updateInvoice();

	var input = document.querySelector('input'),
		image = document.querySelector('img');

	if (window.addEventListener) {
		document.addEventListener('click', function (e) {
			var element = e.target.querySelector('[contenteditable]'), row;

			element && e.target != document.documentElement && e.target != document.body && element.focus();

			if (e.target.matchesSelector('.add')) {
				var newRow = generateTableRow();
				if (newRow) document.querySelector('table.inventory tbody').appendChild(newRow);
			}
			else if (e.target.className == 'cut') {
				row = e.target.ancestorQuerySelector('tr');
				row && row.parentNode.removeChild(row);
			}

			updateInvoice();
		});

		document.addEventListener('mousewheel', updateNumber);
		document.addEventListener('keydown', updateNumber);
		document.addEventListener('keydown', updateInvoice);
		document.addEventListener('keyup', updateInvoice);
	}
}

window.addEventListener && document.addEventListener('DOMContentLoaded', onContentLoad);
