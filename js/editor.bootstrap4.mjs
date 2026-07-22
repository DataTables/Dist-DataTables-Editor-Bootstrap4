/*! Editor Bootstrap 4 styling 3.0.0 for DataTables
 * Copyright (c) SpryMedia Ltd - https://datatables.net/license/plus
 */

import DataTable from 'datatables.net-bs4';
import Editor from 'datatables.net-editor';


//
// Note that this file does use jQuery as Bootstrap 4's JS depends on jQuery for
// its modal, so we know that it must be present.
//

// Set the default display controller to be our bootstrap control 
DataTable.Editor.defaults.display = "bootstrap";

// Change the default classes from Editor to be classes for Bootstrap
DataTable.util.object.assignDeep(DataTable.Editor.classes, {
	"header": {
		"wrapper": "DTE_Header modal-header",
		title: {
			tag: 'h5',
			class: 'modal-title'
		}
	},
	"body": {
		"wrapper": "DTE_Body modal-body"
	},
	"footer": {
		"wrapper": "DTE_Footer modal-footer"
	},
	"form": {
		"tag": "form-horizontal",
		"button": "btn",
		"buttonInternal": "btn btn-outline-secondary",
		"buttonSubmit": 'btn btn-primary'
	},
	"field": {
		"wrapper": "DTE_Field form-group row",
		"label":   "col-lg-4 col-form-label",
		"input":   "col-lg-8 DTE_Field_Input",
		"inputError": 'is-invalid',
		"error":   "error is-invalid",
		"msg-labelInfo": "form-text text-secondary small",
		"msg-info":      "form-text text-secondary small",
		"msg-message":   "form-text text-secondary small",
		"msg-error":     "form-text text-danger small",
		"multiValue":    "card multi-value",
		"multiInfo":     "small",
		"multiRestore":  "multi-restore"
	}
} );

DataTable.util.object.assignDeep(DataTable.ext.buttons, {
	create: {
		formButtons: {
			className: 'btn-primary'
		}
	},
	edit: {
		formButtons: {
			className: 'btn-primary'
		}
	},
	remove: {
		formButtons: {
			className: 'btn-danger'
		}
	}
} );

DataTable.Editor.fieldTypes.datatable.tableClass = 'table';

/*
 * Bootstrap display controller - this is effectively a proxy to the Bootstrap
 * modal control.
 */

let shown = false;
let fullyShown = false;

const dom = {
	content: null,
	close: null
};

DataTable.Editor.display.bootstrap = DataTable.util.object.assignDeep({}, DataTable.Editor.models.displayController, {
	init: function ( dte ) {
		var $ = DataTable.use('jq');

		if (!dom.content) {
			// Note that `modal-dialog-scrollable` is BS4.3+ only. It has no effect on 4.0-4.2
			dom.content = $(
				'<div class="modal fade DTED">'+
					'<div class="modal-dialog modal-lg modal-dialog-scrollable"></div>'+
				'</div>'
			);

			dom.close = $('<button class="close">&times;</div>');
		}

		// Add `form-control` to required elements
		dte.on( 'displayOrder.dtebs open.dtebs', function () {
			$.each( dte.s.fields, function ( key, field ) {
				$('input:not([type=checkbox]):not([type=radio]), select, textarea', field.node() )
					.addClass( 'form-control' );
			} );
		} );

		return DataTable.Editor.display.bootstrap;
	},

	open: function ( dte, append, callback ) {
		var $ = DataTable.use('jq');

		$(append).addClass('modal-content');

		// Special class for DataTable buttons in the form
		$(append).find('div.DTE_Field_Type_datatable div.dt-buttons')
			.removeClass('btn-group')
			.addClass('btn-group-vertical');

		// Setup events on each show
		dom.close
			.attr('title', dte.i18n.close)
			.off('click.dte-bs4')
			.on('click.dte-bs4', function () {
				dte.close('icon');
			})
			.appendTo($('div.modal-header', append));

		// This is a bit horrible, but if you mousedown and then drag out of the modal container, we don't
		// want to trigger a background action.
		let allowBackgroundClick = false;
		$(document)
			.off('mousedown.dte-bs4')
			.on('mousedown.dte-bs4', 'div.modal', function (e) {
				allowBackgroundClick = $(e.target).hasClass('modal') && shown
					? true
					: false;
			} );

		$(document)
			.off('click.dte-bs4')
			.on('click.dte-bs4', 'div.modal', function (e) {
				if ( $(e.target).hasClass('modal') && allowBackgroundClick ) {
					dte.background();
				}
			} );

		var content = dom.content.find('div.modal-dialog');
		content.children().detach();
		content.append( append );

		if ( shown ) {
			if ( callback ) {
				callback();
			}
			return;
		}

		shown = true;
		fullyShown = false;

		$(dom.content)
			.one('shown.bs.modal', function () {
				// Can only give elements focus when shown
				if ( dte.s.setFocus ) {
					dte.s.setFocus.focus();
				}

				fullyShown = true;

				dom.content.find('table.dataTable').DataTable().columns.adjust();

				if ( callback ) {
					callback();
				}
			})
			.one('hidden', function () {
				shown = false;
			})
			.appendTo( 'body' )
			.modal( {
				backdrop: "static",
				keyboard: false
			} );
	},

	close: function ( dte, callback ) {
		var $ = DataTable.use('jq');

		if ( ! shown ) {
			if ( callback ) {
				callback();
			}
			return;
		}

		// Check if actually displayed or not before hiding. BS4 doesn't like `hide`
		// before it has been fully displayed
		if ( ! fullyShown ) {
			$(dom.content)
				.one('shown.bs.modal', function () {
					DataTable.Editor.display.bootstrap.close( dte, callback );
				} );

			return;
		}

		$(dom.content)
			.one( 'hidden.bs.modal', function () {
				$(this).detach();
			} )
			.modal('hide');

		shown = false;
		fullyShown = false;

		if ( callback ) {
			callback();
		}
	},

	node: function () {
		return dom.content[0];
	}
} );


export default DataTable.Editor;

