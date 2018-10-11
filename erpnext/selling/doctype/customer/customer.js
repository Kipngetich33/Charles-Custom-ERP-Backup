// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Customer", {
	setup: function(frm) {
		frm.add_fetch('lead_name', 'company_name', 'customer_name');
		frm.add_fetch('default_sales_partner','commission_rate','default_commission_rate');
		frm.set_query('customer_group', {'is_group': 0});
		frm.set_query('default_price_list', { 'selling': 1});
		frm.set_query('account', 'accounts', function(doc, cdt, cdn) {
			var d  = locals[cdt][cdn];
			var filters = {
				'account_type': 'Receivable',
				'company': d.company,
				"is_group": 0
			};

			if(doc.party_account_currency) {
				$.extend(filters, {"account_currency": doc.party_account_currency});
			}
			return {
				filters: filters
			}
		});

		if (frm.doc.__islocal == 1) {
			frm.set_value("represents_company", "");
		}

		frm.set_query('customer_primary_contact', function(doc) {
			return {
				query: "erpnext.selling.doctype.customer.customer.get_customer_primary_contact",
				filters: {
					'customer': doc.name
				}
			}
		})
		frm.set_query('customer_primary_address', function(doc) {
			return {
				query: "erpnext.selling.doctype.customer.customer.get_customer_primary_address",
				filters: {
					'customer': doc.name
				}
			}
		})
	},
	customer_primary_address: function(frm){
		if(frm.doc.customer_primary_address){
			frappe.call({
				method: 'frappe.contacts.doctype.address.address.get_address_display',
				args: {
					"address_dict": frm.doc.customer_primary_address
				},
				callback: function(r) {
					frm.set_value("primary_address", r.message);
				}
			});
		}
		if(!frm.doc.customer_primary_address){
			frm.set_value("primary_address", "");
		}
	},

	is_internal_customer: function(frm) {
		if (frm.doc.is_internal_customer == 1) {
			frm.toggle_reqd("represents_company", true);
		}
		else {
			frm.toggle_reqd("represents_company", false);
		}
	},

	customer_primary_contact: function(frm){
		if(!frm.doc.customer_primary_contact){
			frm.set_value("mobile_no", "");
			frm.set_value("email_id", "");
		}
	},

	loyalty_program: function(frm) {
		if(frm.doc.loyalty_program) {
			frm.set_value('loyalty_program_tier', null);
		}
	},

	refresh: function(frm) {
		if(frappe.defaults.get_default("cust_master_name")!="Naming Series") {
			frm.toggle_display("naming_series", false);
		} else {
			erpnext.toggle_naming_series();
		}

		frappe.dynamic_link = {doc: frm.doc, fieldname: 'name', doctype: 'Customer'}
		frm.toggle_display(['address_html','contact_html','primary_address_and_contact_detail'], !frm.doc.__islocal);

		if(!frm.doc.__islocal) {
			frappe.contacts.render_address_and_contact(frm);

			// custom buttons
			frm.add_custom_button(__('Accounting Ledger'), function() {
				frappe.set_route('query-report', 'General Ledger',
					{party_type:'Customer', party:frm.doc.name});
			});

			frm.add_custom_button(__('Accounts Receivable'), function() {
				frappe.set_route('query-report', 'Accounts Receivable', {customer:frm.doc.name});
			});

			frm.add_custom_button(__('Pricing Rule'), function () {
				erpnext.utils.make_pricing_rule(frm.doc.doctype, frm.doc.name);
			}, __("Make"));

			// indicator
			erpnext.utils.set_party_dashboard_indicators(frm);

			//
			if (frm.doc.__onload.dashboard_info.loyalty_point) {
				frm.dashboard.add_indicator(__('Loyalty Point: {0}', [frm.doc.__onload.dashboard_info.loyalty_point]), 'blue');
			}

		} else {
			frappe.contacts.clear_address_and_contact(frm);
		}

		var grid = cur_frm.get_field("sales_team").grid;
		grid.set_column_disp("allocated_amount", false);
		grid.set_column_disp("incentives", false);
	},
	validate: function(frm) {
		if(frm.doc.lead_name) frappe.model.clear_doc("Lead", frm.doc.lead_name);
	},
});

// this is some js test

// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// custom scripts below

var var_customername
frappe.ui.form.on("Customer", {
    onload: function(frm) {
var_customername=frm.doc.customer_name;
//frappe.call({

           // "method": "frappe.client.get",
            //args: {
                //doctype: "Stock Entry Detail",
               //filters: {t_warehouse: frm.doc.new_account_no}   
            //},
            //callback: function (r) {
   //frm.set_value("meter_serial_no", r.message.item_code);

frappe.call({
            "method": "frappe.client.get_value",
            args: {
                doctype: "Item",
               filters: {"item_code":r.message.item_code}   
            },
            callback: function (datas) {
  frm.set_value("meter_serial_no", r.message.item_code);
  frm.set_value("meter_size", datas.message.item_group);
  frm.set_value("initial_reading", datas.message.initial_reading);
//}
//})


}
});


frappe.call({
            "method": "frappe.client.get_value",
            args: {
                doctype: "Item",
 			fieldname: 'item_group',
                filters: { item_code: frm.doc.meter_serial_no },

            },
            callback: function (r) {

   frm.set_value("meter_size", r.message.item_group);
}
});


frappe.call({
            "method": "frappe.client.get_value",
            args: {
                doctype: "Item",
 fieldname: 'initial_reading',
                filters: { item_code: frm.doc.meter_serial_no },
            },
            callback: function (r) {
   frm.set_value("initial_reading", r.message.initial_reading);
}
});

}
});


frappe.ui.form.on("Customer", "new_project", function(frm) {
	/* this code fetches the customer name and the project name and 
	creates a new project using those details*/
	frappe.route_options = {"customer": var_customername,"project_name":var_customername +' '+'Connection'}
	frappe.set_route("Form", "Project","New Project 1")
});


frappe.ui.form.on("Customer", "create_customer_meter_warehouse", function(frm) {
frappe.route_options = {"customer_name": var_customername}
frappe.set_route("Form", "Warehouse", "New Warehouse 1")
}
);

frappe.ui.form.on("Customer", "make_deposit_invoice", function(frm) {
frappe.route_options = {"customer": var_customername,"type_of_invoice":"Deposit"}
frappe.set_route("Form", "Sales Invoice","New Sales Invoice 1")

}
);

frappe.ui.form.on("Customer", "make_new_connection_fees_invoice", function(frm) {
frappe.route_options = {"customer": var_customername,"type_of_invoice":"New Connection Fee"}
frappe.set_route("Form", "Sales Invoice","New Sales Invoice 1")
}
);

frappe.ui.form.on("Customer", "new_account_no", function(frm){ 
cur_frm.clear_table("accounts"); 
cur_frm.grids[0].grid.add_new_row(null,null,false);
    var newrow = cur_frm.grids[0].grid.grid_rows[cur_frm.grids[0].grid.grid_rows.length - 1].doc;
newrow.account=cur_frm.doc.new_account_no;
cur_frm.refresh_field("accounts") 
});

frappe.ui.form.on("Customer", {
    onload: function (frm) {
cur_frm.clear_table("accounts"); 
cur_frm.grids[0].grid.add_new_row(null,null,false);
    var newrow = cur_frm.grids[0].grid.grid_rows[cur_frm.grids[0].grid.grid_rows.length - 1].doc;
newrow.account=cur_frm.doc.new_account_no;
cur_frm.refresh_field("accounts")
    },
});


frappe.ui.form.on('Customer', {
    refresh: function(frm) {
 frm.add_custom_button(__('Activate'), function(){
frappe.set_route("Form", "Customer", frm.doc.customer_name);
frm.set_value("status", "Active")
cur_frm.save();
 },__("Activate/Inactivate")); 
   frm.add_custom_button(__('Inactivate'), function(){
frappe.set_route("Form", "Customer", frm.doc.customer_name);
frm.set_value("status", "Inactive")
cur_frm.save();
 }, __("Activate/Inactivate"));
frm.add_custom_button(__('Disconnect'), function(){
frappe.set_route('query-report', 'Accounts Receivable', {customer:frm.doc.name});
			});
 //frappe.set_route("Form", "Customer", frm.doc.customer_name);
//frm.set_value("status", "Disconnected")
//cur_frm.save();       
   // },);
frm.add_custom_button(__('Reconnect'), function(){
frappe.set_route("Form", "Customer", frm.doc.customer_name);
frm.set_value("status", "Reconnected")
cur_frm.save();       
    },);
      frm.add_custom_button(__('Terminate'), function(){
       frappe.set_route("Form", "Customer", frm.doc.customer_name);
frm.set_value("status", "Terminated")
frm.set_df_property("status", "read_only", frm.doc.__islocal ? 0 : 1);
frm.set_df_property("customer_name", "read_only", frm.doc.__islocal ? 0 : 1);
cur_frm.save();
    },); 
 frm.add_custom_button(__('Supercede'), function(){
frm.copy_doc();
    },);
frm.add_custom_button(__('Account Balance'), function(){
frappe.set_route("Form","Customer","frm.doc.customer_name", frm.doc.outsatanding_balances);
  },);
  }
});
cur_frm.add_fetch('deposit','standard_rate','deposit_amount')
cur_frm.add_fetch('meter_serial_no','item_group','meter_size')

frappe.ui.form.on('Customer', {
	territory: function(frm) {
		frm.add_fetch("parent_land_unit", "latitude", "latitude");
		frm.add_fetch("parent_land_unit", "longitude", "longitude");
		frm.set_query("parent_land_unit", function() {
			return {
				"filters": {
					"is_group": 1
				}
			};
		});
	},

	onload_post_render(frm){
		if(!frm.doc.location && frm.doc.latitude && frm.doc.longitude)	{
			frm.fields_dict.location.map.setView([frm.doc.latitude, frm.doc.longitude],13);
		}
		else {
			frm.doc.latitude = frm.fields_dict.location.map.getCenter()['lat'];
			frm.doc.longitude = frm.fields_dict.location.map.getCenter()['lng'];
		}
	},
});


/*Functionality that sets the value of form query 'route' 
to show only routes*/
frappe.ui.form.on("Customer", "refresh", function(frm) {

	// sets the value of the country/territory query field
	cur_frm.set_query("territory", function() {
		return {
			"filters": {
				"type": "Country"
			}
		}
	});

	cur_frm.set_query("area", function() {
		return {
			"filters": {
				"type": "Area"
			}
		}
	});

	cur_frm.set_query("zone", function() {
		return {
			"filters": {
				"type": "Zone"
			}
		}
	});

    cur_frm.set_query("route", function() {
        return {
            "filters": {
				"type": "Route"
            }
		};
    });
});