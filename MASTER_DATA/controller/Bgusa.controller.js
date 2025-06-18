var controllerBgusa;
sap.ui.define([
        'sap/ui/core/mvc/Controller',
        'sap/m/MessageToast',
        'sap/m/MessageBox',
		'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.Bgusa", {
        bgusaModel: new sap.ui.model.json.JSONModel(),
		popup: undefined,
		
        onInit: function () {
            controllerBgusa = this; 
			controller.enableElement(controllerBgusa.bgusaModel);
			controllerBgusa.bgusaModel.setSizeLimit(50000);
			controllerBgusa.getView().setModel(controllerBgusa.bgusaModel);
        },
		
		/*Kmat*/
		
		getKmat: function () {
			var input = {
				"SITE_ID": controller.SiteId
			};
            controllerBgusa.getDataSync("GET_KMAT", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.getKmatSuccess, controllerBgusa.transactionError);
        },
		
        getKmatSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                controllerBgusa.bgusaModel.setProperty("/tabKmat", jsonArr);
				
				//Buttons
				controllerBgusa.byId("btnCloseKmat").setEnabled(false);
				controllerBgusa.byId("btnSaveKmat").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },		
		
        newKmat: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabKmat");
            var row = {
				"KAMT_ID": "0",
                "KMAT": "",
				"DELTA": "7",
				"WAREHOUSE_ID": "0",
				"WAREHOUSE": "",
				"DASHBOARD_USA": "0",
				"STATUS": "1",
				"SITE_ID": controller.SiteId,
                "DEL": "false",
                "EDIT": "true",
				"LIMITED_EDITING": "false"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerBgusa.bgusaModel.setProperty("/tabKmat", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabKmat", newArr);
                } else {
                    var addArr = controllerBgusa.bgusaModel.getProperty("/tabKmat");
                    addArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabKmat", addArr);
                }
            }
			
			//Buttons
			controllerBgusa.byId("btnCloseKmat").setEnabled(true);
            controllerBgusa.byId("btnSaveKmat").setEnabled(true);
			
			//Scroll to last table Element
			controllerBgusa.byId("tabKmat").setFirstVisibleRow(addRowModel.length);
        },
		
		onChangeDelta: function(oEvent){
			if(oEvent.getSource().getValue() < oEvent.getSource().getMin())
				oEvent.getSource().setValue(oEvent.getSource().getMin());
		},
		       
        saveNewKmat: function () {
            var input = {};
            var model = controllerBgusa.bgusaModel.getProperty("/tabKmat");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if (model[i].KMAT === "" && model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticStateFields"));
                    } else {
						obj = model[i];
						modInput.push(obj);
						obj = new Object;
                    }
                }
            }
            if (modInput.length !== 0){                
                input = {
                    "DATA": JSON.stringify(modInput)
                };
                controllerBgusa.getDataSync("SAVE_KMAT", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveNewKmatSuccess, controllerBgusa.transactionError);                
            }
        },
		
        saveNewKmatSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                if (jsonArr[0].RC == "0"){
                    controllerBgusa.getKmat();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		editKmat: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("KMAT_IS_USED","BGUSA/TRANSACTION", {"KMAT_ID": lineSel["KMAT_ID"]});
			if(aResult[0]["RC"] === "4"){
				lineSel.EDIT = "true";
				lineSel.LIMITED_EDITING = "true";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUseLimitedEditing"));
			}else{
				lineSel.EDIT = "true";
				lineSel.LIMITED_EDITING = "false";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();	
			}
							
			//Buttons
			controllerBgusa.byId("btnCloseKmat").setEnabled(true);
			controllerBgusa.byId("btnSaveKmat").setEnabled(true);
					
        },
		
        deleteKmat: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("KMAT_IS_USED","BGUSA/TRANSACTION", {"KMAT_ID": lineSel["KMAT_ID"]});
			if(aResult[0]["RC"] === "4"){
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUse"));
			}else{
				lineSel.DEL = "true";
				controllerBgusa.bgusaModel.refresh();	

				//Buttons
				controllerBgusa.byId("btnCloseKmat").setEnabled(true);
				controllerBgusa.byId("btnSaveKmat").setEnabled(true);	
			}
        },
		
		openPopupBgusaWarehouse: function(oEvent){
			var sPath = oEvent.oSource.getBindingContext().sPath;	

            Fragment.load({
				name: "master_data.view.popup.listBgusaWarehouse",
				controller: controllerBgusa
			}).then(function (oValueHelpDialogTmp) {
				//Estraggo tutte le descizioni
				sap.ui.getCore().getElementById("sRowPath").setText(sPath);
				controllerBgusa.bgusaModel.setProperty("/tabBgusaWarehouseList", controller.sendData("GET_WAREHOUSE_LIST", "BGUSA/TRANSACTION", {"SITE_ID": controller.SiteId}))
				controllerBgusa.popup = oValueHelpDialogTmp;
				controllerBgusa.getView().addDependent(controllerBgusa.popup);				
				controllerBgusa.popup.open();
			});
		},
		
		searchAllBgusaWarehouse: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
				orFilter = [];
			orFilter.push(new Filter("WAREHOUSE", FilterOperator.Contains, sValue));
			orFilter.push(new Filter("SAP_DEPOSIT", FilterOperator.Contains, sValue));
			var	oFilter = new Filter(orFilter, false);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
		
		onConfirmBgusaWarehouse: function(oEvent){
			var oSelectedRowModel = controllerBgusa.bgusaModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()),
				oModelRowSelected = controllerBgusa.bgusaModel.getProperty(sap.ui.getCore().getElementById("sRowPath").getText());
            try {
				oModelRowSelected["WAREHOUSE_ID"] = oSelectedRowModel["WAREHOUSE_ID"];
				oModelRowSelected["WAREHOUSE"] = oSelectedRowModel["WAREHOUSE"];
				controllerBgusa.bgusaModel.refresh();
				
            } catch (err) {
				oModelRowSelected["WAREHOUSE_ID"] = "";
				oModelRowSelected["WAREHOUSE"] = "";
				controllerBgusa.bgusaModel.refresh();
			}
			
			controllerBgusa.onClosePopup(oEvent);			
		},	

		onDashboardUsaValue: function (oEvent) {
            controllerBgusa.bgusaModel.getProperty(oEvent.getSource().getBindingContext().sPath)["DASHBOARD_USA"] = oEvent.getSource().getState();
        },

		onStatusValue: function (oEvent) {
            controllerBgusa.bgusaModel.getProperty(oEvent.getSource().getBindingContext().sPath)["STATUS"] = oEvent.getSource().getState();
        },
		
		/*---*/		
		
		/*Carrier*/
		
		getCarrier: function () {
            controllerBgusa.getDataSync("GET_CARRIER", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", {}, controllerBgusa.getCarrierSuccess, controllerBgusa.transactionError);
        },
		
        getCarrierSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                controllerBgusa.bgusaModel.setProperty("/tabCarrier", jsonArr);
				
				//Buttons
				controllerBgusa.byId("btnCloseCarrier").setEnabled(false);
				controllerBgusa.byId("btnSaveCarrier").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },		
		
        newCarrier: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabCarrier");
            var row = {
				"CARRIER_ID": "0",
                "CARRIER": "",
                "DEL": "false",
                "EDIT": "true"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerBgusa.bgusaModel.setProperty("/tabCarrier", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabCarrier", newArr);
                } else {
                    var addArr = controllerBgusa.bgusaModel.getProperty("/tabCarrier");
                    addArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabCarrier", addArr);
                }
            }
			
			//Buttons
			controllerBgusa.byId("btnCloseCarrier").setEnabled(true);
            controllerBgusa.byId("btnSaveCarrier").setEnabled(true);
			
			//Scroll to last table Element
			controllerBgusa.byId("tabCarrier").setFirstVisibleRow(addRowModel.length);
        },
		       
        saveCarrier: function () {
            var input = {};
            var model = controllerBgusa.bgusaModel.getProperty("/tabCarrier");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if (model[i].CARRIER === "" && model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticStateFields"));
                    } else {
						obj = model[i];
						modInput.push(obj);
						obj = new Object;
                    }
                }
            }
            if (modInput.length !== 0){                
                input = {
                    "DATA": JSON.stringify(modInput)
                };
                controllerBgusa.getDataSync("SAVE_CARRIER", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveCarrierSuccess, controllerBgusa.transactionError);                
            }
        },
		
        saveCarrierSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                if (jsonArr[0].RC == "0"){
                    controllerBgusa.getCarrier();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		editCarrier: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("CARRIER_IS_USED","BGUSA/TRANSACTION", {"CARRIER_ID": lineSel["CARRIER_ID"]});
			if(aResult[0]["RC"] === "4"){
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUse"));
			}else{
				lineSel.EDIT = "true";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
				
				//Buttons
				controllerBgusa.byId("btnCloseCarrier").setEnabled(true);
				controllerBgusa.byId("btnSaveCarrier").setEnabled(true);	
			}
					
        },
		
        deleteCarrier: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("CARRIER_IS_USED","BGUSA/TRANSACTION", {"CARRIER_ID": lineSel["CARRIER_ID"]});
			if(aResult[0]["RC"] === "4"){
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUse"));
			}else{
				lineSel.DEL = "true";
				controllerBgusa.bgusaModel.refresh();	

				//Buttons
				controllerBgusa.byId("btnCloseCarrier").setEnabled(true);
				controllerBgusa.byId("btnSaveCarrier").setEnabled(true);	
			}
        },
		
		/*---*/	
		
		/*Port*/
		
		getPort: function () {
            controllerBgusa.getDataSync("GET_PORT", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", {}, controllerBgusa.getPortSuccess, controllerBgusa.transactionError);
        },
		
        getPortSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                controllerBgusa.bgusaModel.setProperty("/tabPort", jsonArr);
				
				//Buttons
				controllerBgusa.byId("btnClosePort").setEnabled(false);
				controllerBgusa.byId("btnSavePort").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },		
		
        newPort: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabPort");
            var row = {
				"PORT_ID": "0",
                "PORT": "",
				"PROVINCE_ID": "0",
				"PROVINCE": "",
				"PROVINCE_DESCRIPTION": "",
                "DEL": "false",
                "EDIT": "true"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerBgusa.bgusaModel.setProperty("/tabPort", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabPort", newArr);
                } else {
                    var addArr = controllerBgusa.bgusaModel.getProperty("/tabPort");
                    addArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabPort", addArr);
                }
            }
			
			//Buttons
			controllerBgusa.byId("btnClosePort").setEnabled(true);
            controllerBgusa.byId("btnSavePort").setEnabled(true);
			
			//Scroll to last table Element
			controllerBgusa.byId("tabPort").setFirstVisibleRow(addRowModel.length);
        },
		       
        saveNewPort: function () {
            var input = {};
            var model = controllerBgusa.bgusaModel.getProperty("/tabPort");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if (model[i].PORT === "" && model[i].PROVINCE === "" && model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticStateFields"));
                    } else {
						obj = model[i];
						modInput.push(obj);
						obj = new Object;
                    }
                }
            }
            if (modInput.length !== 0){                
                input = {
                    "DATA": JSON.stringify(modInput)
                };
                controllerBgusa.getDataSync("SAVE_PORT", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveNewPortSuccess, controllerBgusa.transactionError);                
            }
        },
		
        saveNewPortSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                if (jsonArr[0].RC == "0"){
                    controllerBgusa.getPort();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		editPort: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("PORT_IS_USED","BGUSA/TRANSACTION", {"PORT_ID": lineSel["PORT_ID"]});
			if(aResult[0]["RC"] === "4"){
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUse"));
			}else{
				lineSel.EDIT = "true";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
				
				//Buttons
				controllerBgusa.byId("btnClosePort").setEnabled(true);
				controllerBgusa.byId("btnSavePort").setEnabled(true);	
			}
					
        },
		
        deletePort: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("PORT_IS_USED","BGUSA/TRANSACTION", {"PORT_ID": lineSel["PORT_ID"]});
			if(aResult[0]["RC"] === "4"){
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUse"));
			}else{
				lineSel.DEL = "true";
				controllerBgusa.bgusaModel.refresh();	

				//Buttons
				controllerBgusa.byId("btnClosePort").setEnabled(true);
				controllerBgusa.byId("btnSavePort").setEnabled(true);	
			}
        },
		
		openPopupProvince: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext().sPath;
			Fragment.load({
				name: "master_data.view.popup.listAllProvince",
				controller: controllerBgusa
			}).then(function (oValueHelpDialogTmp) {
				controllerBgusa.getDataSync("GET_ALL_PROVINCE", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", {}, controllerBgusa.getAllProvinceSuccess, controllerBgusa.transactionError);
				controllerBgusa.popup = oValueHelpDialogTmp;
				controllerBgusa.getView().addDependent(controllerBgusa.popup);				
				controllerBgusa.popup.open();
				sap.ui.getCore().getElementById("sRowPath").setText(sPath);
			});           
		},
		
		getAllProvinceSuccess: function (data, response) {
            try {
                controllerBgusa.bgusaModel.setProperty("/listAllProvince" ,JSON.parse(jQuery(data).find("Row").text()));                
            } catch (e) {
                console.log(e);
            }
        },
		
		searchAllProvince: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
				orFilter = [];
			orFilter.push(new Filter("PROVINCE", FilterOperator.Contains, sValue));
			orFilter.push(new Filter("PROVINCE_DESCRIPTION", FilterOperator.Contains, sValue));
			orFilter.push(new Filter("STATE", FilterOperator.Contains, sValue));
			orFilter.push(new Filter("STATE_DESCRIPTION", FilterOperator.Contains, sValue));
			orFilter.push(new Filter("COUNTRY_ID", FilterOperator.Contains, sValue));
			var	oFilter = new Filter(orFilter, false);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
		
		onConfirmProvince: function(oEvent){
			var oSelectedRowModel = controllerBgusa.bgusaModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()),
				oModelRowSelected = controllerBgusa.bgusaModel.getProperty(sap.ui.getCore().getElementById("sRowPath").getText());
            try {
				oModelRowSelected["PROVINCE_ID"] = oSelectedRowModel["PROVINCE_ID"];
				oModelRowSelected["PROVINCE"] = oSelectedRowModel["PROVINCE"];
				oModelRowSelected["PROVINCE_DESCRIPTION"] = oSelectedRowModel["PROVINCE_DESCRIPTION"];
				controllerBgusa.bgusaModel.refresh();
				
            } catch (err) {
				oModelRowSelected["PROVINCE_ID"] = "";
				oModelRowSelected["PROVINCE"] = "";
				oModelRowSelected["PROVINCE_DESCRIPTION"] = "";
				controllerBgusa.bgusaModel.refresh();
			}
			
			controllerBgusa.onClosePopup(oEvent);
			
		},	
		
		onClosePopup: function(oEvent){
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			
			controllerBgusa.popup.destroy();
			controllerBgusa.popup = undefined;			
		},
		
		
		/*---*/	
		
		/*Crates*/
		
		getCrates: function () {
			//Filtro Warehouse
            var selBgusaWarehouseKey = controllerBgusa.byId("filterBgusaWarehouse").getSelectedKeys(),
				BgusaWarehouseFilter = "",
				input = {};
				
            if (selBgusaWarehouseKey.length !== 0) {
                BgusaWarehouseFilter = "(";
                for (var i in selBgusaWarehouseKey) {
                    BgusaWarehouseFilter = BgusaWarehouseFilter + "'" + selBgusaWarehouseKey[i] + "',";
                }
                BgusaWarehouseFilter = BgusaWarehouseFilter.substring(0, BgusaWarehouseFilter.length - 1);
                BgusaWarehouseFilter = BgusaWarehouseFilter + ")";
            }
			input.LANGUAGE = controller.language;
			input.WAREHOUSE_ID = BgusaWarehouseFilter;
			
            controllerBgusa.getDataSync("GET_CRATES", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.getCratesSuccess, controllerBgusa.transactionError);
        },
		
        getCratesSuccess: function (data, response) {
            try {
				var result = JSON.parse(jQuery(data).find("Row").text());
                controllerBgusa.bgusaModel.setProperty("/tabCrates", result);
				
				//Modello Filtro BgusaWarehouse
				var tmpObj = {},
					modBgusaWarehouseArr = [],
					check = true;
				for (var i in result) {
					if (i == 0) {
						tmpObj.WAREHOUSE_ID = result[i]["WAREHOUSE_ID"];
						tmpObj.WAREHOUSE = result[i]["WAREHOUSE"];
						modBgusaWarehouseArr.push(tmpObj);
						tmpObj = new Object;
					} else {
						for (var j in modBgusaWarehouseArr) {
							if (result[i]["WAREHOUSE"] === modBgusaWarehouseArr[j]["WAREHOUSE"]) {
								check = false;
								break;
							}
						}
						if (check) {
							tmpObj.WAREHOUSE_ID = result[i]["WAREHOUSE_ID"];
							tmpObj.WAREHOUSE = result[i]["WAREHOUSE"];
							modBgusaWarehouseArr.push(tmpObj);
							tmpObj = new Object;
						}
						check = true;
					}
				}

				controllerBgusa.bgusaModel.setProperty("/filterBgusaWarehouse", modBgusaWarehouseArr);
				
				//Clone Property
				controllerBgusa.bgusaModel.setProperty("/cloneReadyCreates", false);
				
				//Set Selection Mode
				controllerBgusa.byId("tabCrates").setSelectionMode("None");
				
				//Filter
				controllerBgusa.byId("filterBgusaWarehouse").setEnabled(true);
				controllerBgusa.byId("btnRemoveFilterBgusaWarehouse").setEnabled(true);
				
				//Buttons
				controllerBgusa.byId("btnNewCrates").setEnabled(true);
				controllerBgusa.byId("btnCloneCrates").setEnabled(true);
				controllerBgusa.byId("btnCloseCrates").setEnabled(false);
				controllerBgusa.byId("btnSaveCrates").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },	

		removeBgusaWarehouseListFilters: function(){
			controllerBgusa.byId("filterBgusaWarehouse").setSelectedKeys();
            controllerBgusa.getCrates();
		},		
		
        newCrates: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabCrates");
            var row = {
				"CRATE_ID": "0",
                "CRATE": "",
				"CRATE_DESCRIPTION": "",
				"LANGUAGE": controller.language,
				"DIMENSION": "",
				"UOM_ID": "0",
				"UOM": "",
				"WAREHOUSE_ID": "0",
				"OLD_WAREHOUSE_ID": "0",
				"WAREHOUSE": "",
				"OLD_WAREHOUSE": "",
				"NEW_CRATES": "true",
                "DEL": "false",
                "EDIT": "true",
				"LIMITED_EDITING": "false",
				"CLONE": "false"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerBgusa.bgusaModel.setProperty("/tabCrates", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabCrates", newArr);
                } else {
                    var addArr = controllerBgusa.bgusaModel.getProperty("/tabCrates");
                    addArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabCrates", addArr);
                }
            }
			
			//Filter
			controllerBgusa.byId("filterBgusaWarehouse").setEnabled(false);
			controllerBgusa.byId("btnRemoveFilterBgusaWarehouse").setEnabled(false);
			
			//Buttons
			controllerBgusa.byId("btnNewCrates").setEnabled(false);
			controllerBgusa.byId("btnCloneCrates").setEnabled(false);
			controllerBgusa.byId("btnCloseCrates").setEnabled(true);
            controllerBgusa.byId("btnSaveCrates").setEnabled(true);
			
			//Scroll to last table Element
			controllerBgusa.byId("tabCrates").setFirstVisibleRow(addRowModel.length);
        },
		
		cloneCrates: function(){
			//Set Selection Mode
			controllerBgusa.byId("tabCrates").setSelectionMode("MultiToggle");
			
			//Clone Property
			controllerBgusa.bgusaModel.setProperty("/cloneReadyCreates", true);
			
			//Filter
			controllerBgusa.byId("filterBgusaWarehouse").setEnabled(false);
			controllerBgusa.byId("btnRemoveFilterBgusaWarehouse").setEnabled(false);
			
			//Buttons
			controllerBgusa.byId("btnNewCrates").setEnabled(false);
			controllerBgusa.byId("btnCloneCrates").setEnabled(false);
			controllerBgusa.byId("btnCloseCrates").setEnabled(true);
            controllerBgusa.byId("btnSaveCrates").setEnabled(true);
		},
		
		tabCratesRowSelectionChange: function(oEvent){
			if(oEvent.getParameters().rowContext != null){
				var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.getParameters().rowContext.sPath);
				lineSel.CLONE = oEvent.getSource().mProperties.selectedIndex === -1 ? 'false' : 'true';
				oEvent.getSource().mProperties.selectedIndex === -1 ? delete lineSel.DEL : lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
			}
		},
		       
        saveCrates: function () {
			var model = controllerBgusa.bgusaModel.getProperty("/tabCrates"), 
				aDistinctBgusaWarehouse = [], 
				sWarehouseValue = "";
			//Logica di clonazione Casse
			if(controllerBgusa.bgusaModel.getProperty("/cloneReadyCreates")){
				for(var i in model){
					if(model[i]["CLONE"] === 'true'){
						if(aDistinctBgusaWarehouse.find((element) => element === model[i]["WAREHOUSE_ID"]) === undefined)
							aDistinctBgusaWarehouse.push(model[i]["WAREHOUSE_ID"]);						
					}
				}
				//Se non ho nulla da salvare esco dalla modalità di modifica e aggiorno i dati
				if(aDistinctBgusaWarehouse.length === 0)
					return controllerBgusa.getCrates()
				
				//Creo il filtro dei Depositi da escludere
				for(var i in aDistinctBgusaWarehouse){
					if(sWarehouseValue.length === 0){
						sWarehouseValue = "('" + aDistinctBgusaWarehouse[i] + "'";
					}else{
						sWarehouseValue = sWarehouseValue + ", '" + aDistinctBgusaWarehouse[i] + "'";
					}					
				}
				sWarehouseValue = sWarehouseValue + ")";
				
				//Apro la popup di selezione dei Depositi
				Fragment.load({
					name: "master_data.view.popup.listCloneReadyCratesBgusaWarehouse",
					controller: controllerBgusa
				}).then(function (oValueHelpDialogTmp) {
					controllerBgusa.bgusaModel.setProperty("/tabBgusaWarehouseList", controller.sendData("GET_WAREHOUSE_LIST", "BGUSA/TRANSACTION", {"SITE_ID": controller.SiteId, "WAREHOUSE_ID": sWarehouseValue}))
					controllerBgusa.popup = oValueHelpDialogTmp;
					controllerBgusa.getView().addDependent(controllerBgusa.popup);				
					controllerBgusa.popup.open();
				});				
			}else{
				var input = {}, 
					modInput = [],
					obj = {};

				for (var i = 0; i < model.length; i++) {
					if (model[i].EDIT === "true" || model[i].DEL === "true") {
						if ((model[i].CRATE === "" || model[i].CRATE_DESCRIPTION === "" || model[i].DIMENSION === "" || model[i].UOM === "" || model[i].WAREHOUSE === "") && model[i].DEL !== "true") {
							return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticStateFields"));
						} else {
							obj = model[i];
							modInput.push(obj);
							obj = new Object;
						}
					}
				}
				if (modInput.length !== 0){                
					input = {
						"DATA": JSON.stringify(modInput),
						"IS_CLONE": controllerBgusa.bgusaModel.getProperty("/cloneReadyCreates")
					};
					controllerBgusa.getDataSync("SAVE_CRATES", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveCratesSuccess, controllerBgusa.transactionError);                
				}
			}
        },
		
        saveCratesSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                if (jsonArr[0].RC == "0"){
                    controllerBgusa.getCrates();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		onConfirmCloneCratesInDifferentBgusaWarehouse: function(oEvent){
			var oSelectedRowModel = controllerBgusa.bgusaModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()),
				model = controllerBgusa.bgusaModel.getProperty("/tabCrates"),
				oTemp = {},
				aFinalResult = [];
			
			for(var i in model){
				if(model[i]["CLONE"] === 'true'){
					oTemp = model[i];
					oTemp["CRATE_ID"] = "0";
					oTemp["WAREHOUSE_ID"] = oSelectedRowModel["WAREHOUSE_ID"];
					oTemp["OLD_WAREHOUSE_ID"] = model[i]["OLD_WAREHOUSE_ID"];
					aFinalResult.push(oTemp);	
					oTemp = new Object;
				}
			}
			
			controllerBgusa.onClosePopup(oEvent);
			
           	var input = {
						"DATA": JSON.stringify(aFinalResult),
						"IS_CLONE": controllerBgusa.bgusaModel.getProperty("/cloneReadyCreates")
					};
			controllerBgusa.getDataSync("SAVE_CRATES", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveCratesSuccess, controllerBgusa.transactionError); 		
						
		},	
		
		editCrates: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("CRATE_IS_USED","BGUSA/TRANSACTION", {"CRATE_ID": lineSel["CRATE_ID"]});
			if(aResult[0]["RC"] === "4"){
				lineSel.EDIT = "true";
				lineSel.LIMITED_EDITING = "true";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUseLimitedEditing"));
			}else{
				lineSel.EDIT = "true";
				lineSel.LIMITED_EDITING = "false";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
			}			
				
			//Filter
			controllerBgusa.byId("filterBgusaWarehouse").setEnabled(false);
			controllerBgusa.byId("btnRemoveFilterBgusaWarehouse").setEnabled(false);
			
			//Buttons
			controllerBgusa.byId("btnNewCrates").setEnabled(false);
			controllerBgusa.byId("btnCloneCrates").setEnabled(false);
			controllerBgusa.byId("btnCloseCrates").setEnabled(true);
			controllerBgusa.byId("btnSaveCrates").setEnabled(true);						
        },
		
        deleteCrates: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("CRATE_IS_USED","BGUSA/TRANSACTION", {"CRATE_ID": lineSel["CRATE_ID"]});
			if(aResult[0]["RC"] === "4"){
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUse"));
			}else{
				lineSel.DEL = "true";
				controllerBgusa.bgusaModel.refresh();	

				//Filter
				controllerBgusa.byId("filterBgusaWarehouse").setEnabled(false);
				controllerBgusa.byId("btnRemoveFilterBgusaWarehouse").setEnabled(false);
				
				//Buttons
				controllerBgusa.byId("btnNewCrates").setEnabled(false);
				controllerBgusa.byId("btnCloneCrates").setEnabled(false);
				controllerBgusa.byId("btnCloseCrates").setEnabled(true);
				controllerBgusa.byId("btnSaveCrates").setEnabled(true);	
			}
        },
		
		//Matchcode Edit Description
		openPopupCratesDescription: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath);

            Fragment.load({
				name: "master_data.view.popup.editCrateDescription",
				controller: controllerBgusa
			}).then(function (oValueHelpDialogTmp) {
				//Estraggo tutte le descizioni
				controllerBgusa.bgusaModel.setProperty("/tabDescrCrate", controller.sendData("GET_ALL_CRATE_DESCRIPTION", "BGUSA/TRANSACTION", {"CRATE_ID": lineSel.CRATE_ID}))
				controllerBgusa.popup = oValueHelpDialogTmp;
				controllerBgusa.getView().addDependent(controllerBgusa.popup);				
				controllerBgusa.popup.open();
				sap.ui.getCore().getElementById("inputCrate").setValue(lineSel["CRATE"]);
			});			
        },        

        deleteDescrCrate: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
			lineSel.NEW_SITE = "false";
            controllerBgusa.bgusaModel.refresh();
        },

        newDescrCrate: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabDescrCrate"),
			row = {
                "CRATE_ID": controllerBgusa.bgusaModel.getProperty("/tabDescrCrate")[0]["CRATE_ID"],
                "LANG": "",
                "CRATE_DESCR": "",
                "DEL": "false",
            };
			
			if(addRowModel.length === 2)
				return
			
            addRowModel.push(row);
            controllerBgusa.bgusaModel.setProperty("/tabDescrCrate", addRowModel);
        },
		
		confirmEditCrateDescr: function () {
            var model = controllerBgusa.bgusaModel.getProperty("/tabDescrCrate"),
				arrInput = [];

            for (var i = 0; i < model.length; i++) {
                if (model[i].DEL == "false" || model[i].LANG != "") {
                    for (var j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANG == model[j].LANG & model[j].DEL == "false") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errSiteMod"));
                        }
                    }
                    arrInput.push(model[i]);
                }
            }
			
            var Input = {
                "DATA": JSON.stringify(arrInput)
            };
            var result = controller.sendData("EDIT_CRATE_DESCR", "BGUSA/TRANSACTION", Input);

            if (result[0].RC == "0") {
                controllerBgusa.onClosePopupCrateDescr();
                controllerBgusa.getCrates();
            } else {
                MessageBox.warning(result[0].MESSAGE);
            }
        },
		
		onClosePopupCrateDescr: function(){	
			controllerBgusa.popup.close();
			controllerBgusa.popup.destroy();
			controllerBgusa.popup = undefined;			
		},
		
		//Matchcode UoM		
		openPopupUoM: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext().sPath;
			Fragment.load({
				name: "master_data.view.popup.listAllUoM",
				controller: controllerBgusa
			}).then(function (oValueHelpDialogTmp) {
				controllerBgusa.getDataSync("GET_ALL_UOM", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", {}, controllerBgusa.getAllUoMSuccess, controllerBgusa.transactionError);
				controllerBgusa.popup = oValueHelpDialogTmp;
				controllerBgusa.getView().addDependent(controllerBgusa.popup);				
				controllerBgusa.popup.open();
				controllerBgusa.bgusaModel.setProperty("/sPath", (sPath));
			});           
		},
		
		getAllUoMSuccess: function (data, response) {
            try {
                controllerBgusa.bgusaModel.setProperty("/listAllUoM" ,JSON.parse(jQuery(data).find("Row").text()));                
            } catch (e) {
                console.log(e);
            }
        },
		
		searchAllUoM: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
				orFilter = [];
			orFilter.push(new Filter("UOM", FilterOperator.Contains, sValue));
			var	oFilter = new Filter(orFilter, false);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
		
		onConfirmUoM: function(oEvent){
			var oSelectedRowModel = controllerBgusa.bgusaModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()),
				oModelRowSelected = controllerBgusa.bgusaModel.getProperty(controllerBgusa.bgusaModel.getProperty("/sPath"));
            try {
				oModelRowSelected["UOM_ID"] = oSelectedRowModel["UOM_ID"];
				oModelRowSelected["UOM"] = oSelectedRowModel["UOM"];
				controllerBgusa.bgusaModel.refresh();
				
            } catch (err) {
				oModelRowSelected["UOM_ID"] = "";
				oModelRowSelected["UOM"] = "";
				controllerBgusa.bgusaModel.refresh();
			}
			
			controllerBgusa.onClosePopupUoM(oEvent);
			
		},	
		
		onClosePopupUoM: function(oEvent){
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			controllerBgusa.bgusaModel.setProperty("/sPath", "");			
			controllerBgusa.popup.destroy();
			controllerBgusa.popup = undefined;			
		},
		
		
		/*---*/	
		
		/* Caratteristics */
		
		getCaratteristics: function () {
			//Filtro Kmat
            var selKmatKey = controllerBgusa.byId("filterKmat").getSelectedKeys(),
				kmatFilter = "",
				input = {};
				
            if (selKmatKey.length !== 0) {
                kmatFilter = "(";
                for (var i in selKmatKey) {
                    kmatFilter = kmatFilter + "'" + selKmatKey[i] + "',";
                }
                kmatFilter = kmatFilter.substring(0, kmatFilter.length - 1);
                kmatFilter = kmatFilter + ")";
            }
			
			input.LANGUAGE = controller.language;
			input.SITE_ID = controller.SiteId;
			input.KMAT_ID = kmatFilter;		
			
            controllerBgusa.getDataSync("GET_CARATTERISTICS", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.getCaratteristicsSuccess, controllerBgusa.transactionError);
        },
		
        getCaratteristicsSuccess: function (data, response) {
            try {
				var result = JSON.parse(jQuery(data).find("Row").text());
                controllerBgusa.bgusaModel.setProperty("/tabCaratteristics", result);
				
				//Modello Filtro Kmat
				var tmpObj = {},
					modKmatArr = [],
					check = true;
				for (var i in result) {
					if (i == 0) {
						tmpObj.KMAT_ID = result[i]["KMAT_ID"];
						tmpObj.KMAT = result[i]["KMAT"];
						modKmatArr.push(tmpObj);
						tmpObj = new Object;
					} else {
						for (var j in modKmatArr) {
							if (result[i]["KMAT"] === modKmatArr[j]["KMAT"]) {
								check = false;
								break;
							}
						}
						if (check) {
							tmpObj.KMAT_ID = result[i]["KMAT_ID"];
							tmpObj.KMAT = result[i]["KMAT"];
							modKmatArr.push(tmpObj);
							tmpObj = new Object;
						}
						check = true;
					}
				}

				controllerBgusa.bgusaModel.setProperty("/filterKmat", modKmatArr);
				
				//Buttons
				controllerBgusa.byId("btnCloseCaratteristics").setEnabled(false);
				controllerBgusa.byId("btnSaveCaratteristics").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },		
		
		removeKmatListFilters: function(){
			controllerBgusa.byId("filterKmat").setSelectedKeys();
            controllerBgusa.getCaratteristics();
		},
		
        newCaratteristics: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabCaratteristics");
            var row = {
				"MACHINE_CARATTERISTICS_ID": "0",
                "MACHINE_CARATTERISTICS": "",
				"MACHINE_CARATTERISTICS_DESCRIPTION": "",
				"LANGUAGE": controller.language,
				"KMAT_ID": "0",
				"KMAT": "",
				"IS_ACTIVE": "1",
				"ORDER_VALUE": "999",
				"DELTA": "0",
				"NEW_MACHINE_CARATTERISTICS": "true",
                "DEL": "false",
                "EDIT": "true",
				"LIMITED_EDITING": "false"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerBgusa.bgusaModel.setProperty("/tabCaratteristics", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabCaratteristics", newArr);
                } else {
                    var addArr = controllerBgusa.bgusaModel.getProperty("/tabCaratteristics");
                    addArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabCaratteristics", addArr);
                }
            }
			
			//Buttons
			controllerBgusa.byId("btnCloseCaratteristics").setEnabled(true);
            controllerBgusa.byId("btnSaveCaratteristics").setEnabled(true);
			
			//Scroll to last table Element
			controllerBgusa.byId("tabCaratteristics").setFirstVisibleRow(addRowModel.length);
        },
		       
        saveCaratteristics: function () {
            var input = {};
            var model = controllerBgusa.bgusaModel.getProperty("/tabCaratteristics");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].MACHINE_CARATTERISTICS === "" || model[i].MACHINE_CARATTERISTICS_DESCRIPTION === "" || model[i].KMAT === "" || model[i].ORDER_VALUE === "" || model[i].DELTA === "") && model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticStateFields"));
                    } else {
						obj = model[i];
						modInput.push(obj);
						obj = new Object;
                    }
                }
            }
            if (modInput.length !== 0){                
                input = {
                    "DATA": JSON.stringify(modInput)
                };
                controllerBgusa.getDataSync("SAVE_MACHINE_CARATTERISTICS", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveCaratteristicsSuccess, controllerBgusa.transactionError);                
            }
        },
		
        saveCaratteristicsSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                if (jsonArr[0].RC == "0"){
                    controllerBgusa.getCaratteristics();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		editCaratteristics: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("MACHINE_CARATTERISTICS_IS_USED","BGUSA/TRANSACTION", {"MACHINE_CARATTERISTICS_ID": lineSel["MACHINE_CARATTERISTICS_ID"]});
			if(aResult[0]["RC"] === "4"){
				lineSel.EDIT = "true";
				lineSel.LIMITED_EDITING = "true";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUseLimitedEditing"));
			}else{
				lineSel.EDIT = "true";
				lineSel.LIMITED_EDITING = "false";
				lineSel.DEL = "false";
				controllerBgusa.bgusaModel.refresh();
			}
			
			//Buttons
			controllerBgusa.byId("btnCloseCaratteristics").setEnabled(true);
			controllerBgusa.byId("btnSaveCaratteristics").setEnabled(true);	
					
        },
		
        deleteCaratteristics: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
			aResult = controller.sendData("MACHINE_CARATTERISTICS_IS_USED","BGUSA/TRANSACTION", {"MACHINE_CARATTERISTICS_ID": lineSel["MACHINE_CARATTERISTICS_ID"]});
			if(aResult[0]["RC"] === "4"){
				MessageToast.show(controller.oBundle.getText("viewBgusa.isAlreadyInUse"));
			}else{
				lineSel.DEL = "true";
				controllerBgusa.bgusaModel.refresh();	

				//Buttons
				controllerBgusa.byId("btnCloseCaratteristics").setEnabled(true);
				controllerBgusa.byId("btnSaveCaratteristics").setEnabled(true);	
			}
        },
		
		onIsActiveChange: function(oEvent){
			controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath)["IS_ACTIVE"] = oEvent.oSource.getSelected() ? '1' : '0';			
			controllerBgusa.bgusaModel.refresh();
		},
		
		//Matchcode Edit Description
		openPopupCaratteristicsDescription: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath);

            Fragment.load({
				name: "master_data.view.popup.editMachineCaratteristicsDescription",
				controller: controllerBgusa
			}).then(function (oValueHelpDialogTmp) {
				//Estraggo tutte le descizioni
				controllerBgusa.bgusaModel.setProperty("/tabDescrMachineCaratteristics", controller.sendData("GET_ALL_MACHINE_CARATTERISTICS_DESCRIPTION", "BGUSA/TRANSACTION", {"MACHINE_CARATTERISTICS_ID": lineSel.MACHINE_CARATTERISTICS_ID}))
				controllerBgusa.popup = oValueHelpDialogTmp;
				controllerBgusa.getView().addDependent(controllerBgusa.popup);				
				controllerBgusa.popup.open();
				sap.ui.getCore().getElementById("inputMachineCaratteristics").setValue(lineSel["MACHINE_CARATTERISTICS"]);
			});			
        },        

        deleteDescrCaratteristics: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
			lineSel.NEW_SITE = "false";
            controllerBgusa.bgusaModel.refresh();
        },

        newDescrCaratteristics: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabDescrMachineCaratteristics"),
			row = {
                "MACHINE_CARATTERISTICS_ID": controllerBgusa.bgusaModel.getProperty("/tabDescrMachineCaratteristics")[0]["MACHINE_CARATTERISTICS_ID"],
                "LANG": "",
                "MACHINE_CARATTERISTICS_DESCR": "",
                "DEL": "false",
            };
			
			if(addRowModel.length === 2)
				return
			
            addRowModel.push(row);
            controllerBgusa.bgusaModel.setProperty("/tabDescrMachineCaratteristics", addRowModel);
        },
		
		confirmEditCaratteristicsDescr: function () {
            var model = controllerBgusa.bgusaModel.getProperty("/tabDescrMachineCaratteristics"),
				arrInput = [];

            for (var i = 0; i < model.length; i++) {
                if (model[i].DEL == "false" || model[i].LANG != "") {
                    for (var j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANG == model[j].LANG & model[j].DEL == "false") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errSiteMod"));
                        }
                    }
                    arrInput.push(model[i]);
                }
            }
			
            var Input = {
                "DATA": JSON.stringify(arrInput)
            };
            var result = controller.sendData("EDIT_MACHINE_CARATTERISTICS_DESCR", "BGUSA/TRANSACTION", Input);

            if (result[0].RC == "0") {
                controllerBgusa.onClosePopupCrateDescr();
                controllerBgusa.getCaratteristics();
            } else {
                MessageBox.warning(result[0].MESSAGE);
            }
        },
		
		onClosePopupCaratteristicsDescr: function(){	
			controllerBgusa.popup.close();
			controllerBgusa.popup.destroy();
			controllerBgusa.popup = undefined;			
		},
		
		//Ordinamento Caratteristiche
		onChangeOrderValue: function (oEvent) {
			if(oEvent.getParameters().value < oEvent.getSource().getMin() || oEvent.getParameters().value > oEvent.getSource().getMax()){
				oEvent.getSource().setValue();
				return MessageToast.show(controller.oBundle.getText("controllerBgusa.invalidValue"));
			}
			
            controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath)["ORDER_VALUE"] = oEvent.getSource().getValue();
            controllerBgusa.bgusaModel.refresh();
        },
		
		//Caratteristiche - Delta (Settimane)
		onChangeDeltaWeek: function (oEvent) {
			if(oEvent.getParameters().value < oEvent.getSource().getMin() || oEvent.getParameters().value > oEvent.getSource().getMax()){
				oEvent.getSource().setValue();
				return MessageToast.show(controller.oBundle.getText("controllerBgusa.invalidValue"));
			}
			
            controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath)["DELTA"] = oEvent.getSource().getValue();
            controllerBgusa.bgusaModel.refresh();              
        },
		
		
		//Matchcode Kmat		
		openPopupKmat: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext().sPath;
			Fragment.load({
				name: "master_data.view.popup.listAllKmat",
				controller: controllerBgusa
			}).then(function (oValueHelpDialogTmp) {
				controllerBgusa.getDataSync("GET_ALL_KMAT", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", {"SITE_ID": controller.SiteId}, controllerBgusa.getAllKmatSuccess, controllerBgusa.transactionError);
				controllerBgusa.popup = oValueHelpDialogTmp;
				controllerBgusa.getView().addDependent(controllerBgusa.popup);				
				controllerBgusa.popup.open();
				controllerBgusa.bgusaModel.setProperty("/sPath", (sPath));
			});           
		},
		
		getAllKmatSuccess: function (data, response) {
            try {
                controllerBgusa.bgusaModel.setProperty("/listAllKmat" ,JSON.parse(jQuery(data).find("Row").text()));                
            } catch (e) {
                console.log(e);
            }
        },
		
		searchAllKmat: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
				orFilter = [];
			orFilter.push(new Filter("KMAT", FilterOperator.Contains, sValue));
			var	oFilter = new Filter(orFilter, false);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
		
		onConfirmKmat: function(oEvent){
			var oSelectedRowModel = controllerBgusa.bgusaModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()),
				oModelRowSelected = controllerBgusa.bgusaModel.getProperty(controllerBgusa.bgusaModel.getProperty("/sPath"));
            try {
				oModelRowSelected["KMAT_ID"] = oSelectedRowModel["KMAT_ID"];
				oModelRowSelected["KMAT"] = oSelectedRowModel["KMAT"];
				controllerBgusa.bgusaModel.refresh();
				
            } catch (err) {
				oModelRowSelected["KMAT_ID"] = "";
				oModelRowSelected["KMAT"] = "";
				controllerBgusa.bgusaModel.refresh();
			}
			
			controllerBgusa.onClosePopupKmat(oEvent);
			
		},	
		
		onClosePopupKmat: function(oEvent){
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			controllerBgusa.bgusaModel.setProperty("/sPath", "");			
			controllerBgusa.popup.destroy();
			controllerBgusa.popup = undefined;			
		},
		
		  /*Warehouse*/
        getBgusaWarehouseList: function () {
            var result = controllerSite.sendData("GET_WAREHOUSE_LIST", "BGUSA/TRANSACTION", {"SITE_ID": controller.SiteId});
            controllerBgusa.bgusaModel.setProperty("/tabBgusaWarehouse", result);

            //Buttons
            controllerBgusa.byId("btnCloseBgusaWarehouse").setEnabled(false);
            controllerBgusa.byId("saveNewBgusaWarehouse").setEnabled(false);
        },

        newBgusaWarehouse: function () {
            var addRowModel = controllerBgusa.bgusaModel.getProperty("/tabBgusaWarehouse");
            var row = {
                "WAREHOUSE_ID": "",
				"SITE_ID": controller.SiteId,
                "WAREHOUSE": "",
                "SAP_DEPOSIT": "",
                "EDIT": "true",
                "VIS": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerBgusa.bgusaModel.setProperty("/tabwBgusaWarehouse", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabBgusaWarehouse", newArr);
                } else {
                    var addArr = controllerBgusa.bgusaModel.getProperty("/tabBgusaWarehouse");
                    addArr.push(row);
                    controllerBgusa.bgusaModel.setProperty("/tabBgusaWarehouse", addArr);
                }
            }

            //Buttons
            controllerBgusa.byId("btnCloseBgusaWarehouse").setEnabled(true);
            controllerBgusa.byId("saveNewBgusaWarehouse").setEnabled(true);

            //Scroll to last table Element
            controllerBgusa.byId("tabBgusaWarehouse").setFirstVisibleRow(addRowModel.length);
        },

        editBgusaWarehouse: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.VIS = "true";
            lineSel.DEL = "false";

            //Buttons
            controllerBgusa.byId("btnCloseBgusaWarehouse").setEnabled(true);
            controllerBgusa.byId("saveNewBgusaWarehouse").setEnabled(true);
            controllerBgusa.bgusaModel.refresh();
        },

        deleteBgusaWarehouse: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.VIS = "false";

            //Buttons
            controllerBgusa.byId("btnCloseBgusaWarehouse").setEnabled(true);
            controllerBgusa.byId("saveNewBgusaWarehouse").setEnabled(true);
            controllerBgusa.bgusaModel.refresh();
        },

        checkUniqueBgusaSAPDeposit: function (oEvent) {
            var lineSel = controllerBgusa.bgusaModel.getProperty(oEvent.oSource.getBindingContext().sPath),
            aModelWarehouse = controllerBgusa.bgusaModel.getProperty("/tabBgusaWarehouse"),
            countUniqueEntry = 0;

            for (var i in aModelWarehouse) {
                if (aModelWarehouse[i]["SAP_DEPOSIT"] === oEvent.oSource.getValue() && oEvent.oSource.getValue().trim() !== "")
                    countUniqueEntry = countUniqueEntry + 1;
            }
            if (countUniqueEntry > 1) {
                lineSel["SAP_DEPOSIT"] = "";
                controllerBgusa.bgusaModel.refresh();
                MessageToast.show(controller.oBundle.getText("contrSupWh.errDupInsert"));
            }
        },

        saveNewBgusaWarehouse: function () {
            var modInput = [];
            var obj = {};
            var model = controllerBgusa.bgusaModel.getProperty("/tabBgusaWarehouse");

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].DEL === "true" && model[i].WAREHOUSE_ID === "") || model[i].WAREHOUSE.trim() === "") {}
                    else {
                        obj.WAREHOUSE_ID = model[i].WAREHOUSE_ID;
						obj.SITE_ID = model[i].SITE_ID;
                        obj.WAREHOUSE = model[i].WAREHOUSE;
                        obj.SAP_DEPOSIT = model[i].SAP_DEPOSIT;
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }

            if (modInput.length === 0) {
                controllerBgusa.getBgusaWarehouseList();
            } else {

                var Input = {
                    "DATA": JSON.stringify(modInput)
                };

                var result = controllerSite.sendData("SAVE_WAREHOUSE", "BGUSA/TRANSACTION", Input);
                if (result[0].RC != "0") {
                    MessageBox.warning(controller.oBundle.getText("contrSupWh.insertKO") + " " + result[0].MESSAGE, {
                        onClose: function () {}
                    });
                } else {
                    MessageToast.show(controller.oBundle.getText("contrSupWh.insertOK"));
                    controllerBgusa.getBgusaWarehouseList();
                }
            }
        },
		
		/*Message Template*/
		createBgusaTagList: function () {
            var arrTag = [{                
							"descr": controller.oBundle.getText("controllerBgusa.SerialNumber"),
							"value": '%SERIAL_NUMBER%'
						},{                
							"descr": controller.oBundle.getText("controllerBgusa.Job"),
							"value": '%JOB%'
						},{                
							"descr": controller.oBundle.getText("controllerBgusa.Deposit"),
							"value": '%HUB%'
						},{                
							"descr": controller.oBundle.getText("controllerBgusa.RequiredReadyCratesDate"),
							"value": '%RRCD%'
						},{                
							"descr": controller.oBundle.getText("controllerBgusa.CrateLists"),
							"value": '%CRATE_LISTS%'
						}];
						
            controllerBgusa.bgusaModel.setProperty("/tagList", arrTag);
        },
		
		addTagObject: function () {
            if (controllerBgusa.byId("comboBgusaTagObject").getSelectedKey() != "") {
                controllerBgusa.byId("templateBgusaMessageObject").setValue(controllerBgusa.byId("templateBgusaMessageObject").getValue() + " " + controllerBgusa.byId("comboBgusaTagObject").getSelectedKey());
            }
        },
		
        addTagBody: function () {
            if (controllerBgusa.byId("comboTagBgusaMessageBody").getSelectedKey() != "") {
                controllerBgusa.byId("templateBgusaMessageBody").setValue(controllerBgusa.byId("templateBgusaMessageBody").getValue() + " " + controllerBgusa.byId("comboTagBgusaMessageBody").getSelectedKey());
            }
        },
		
        removeTagObject: function () {
            if (controllerBgusa.byId("comboBgusaTagObject").getSelectedKey() != "") {
                controllerBgusa.byId("templateBgusaMessageObject").setValue(controllerBgusa.byId("templateBgusaMessageObject").getValue().replace(" " + controllerBgusa.byId("comboBgusaTagObject").getSelectedKey(), ""));
            }
        },
		
        removeTagBody: function () {
            if (controllerBgusa.byId("comboTagBgusaMessageBody").getSelectedKey() != "") {
                controllerBgusa.byId("templateBgusaMessageBody").setValue(controllerBgusa.byId("templateBgusaMessageBody").getValue().replace(" " + controllerBgusa.byId("comboTagBgusaMessageBody").getSelectedKey(), ""));
            }
        },
		
        getAllBgusaTemplate: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
			
            controllerBgusa.getDataSync("GET_ALL_MESSAGE_TEMPLATE", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.getAllBgusaTemplateSuccess, controllerBgusa.transactionError);
        },
		
        getAllBgusaTemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            
            for (var i = 0; i < jsonArr.length; i++) {
				jsonArr[i]["MESSAGE_TEMPLATE_DESCRIPTION"] = jsonArr[i]["MESSAGE_TEMPLATE_DESCRIPTION"];//.replace(/_rn_/gm, '\r\n');
				jsonArr[i]["MESSAGE_OBJECT"] = jsonArr[i]["MESSAGE_OBJECT"];
                jsonArr[i]["MESSAGE_BODY"] = jsonArr[i]["MESSAGE_BODY"];
            }
			
            controllerBgusa.bgusaModel.setProperty("/templateMessagelist", jsonArr);            
        },
		
        checkIfExistBgusaMessageTemplate: function () {
            var input = {};
            input.TEMPLATE = controllerBgusa.byId("BgusaMessageTemplateName").getValue();
            input.SITE_ID = controller.SiteId;
			
            controllerBgusa.getDataSync("GET_IF_TEMPLATE_EXIST", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.checkIfExistBgusaMessageTemplateSuccess, controllerBgusa.transactionError);
        },
		
        checkIfExistBgusaMessageTemplateSuccess: function (data, response) {           
            var jsonArr = JSON.parse(jQuery(data).find("Row").text());
            if (jsonArr[0].RC != "0") {
                controllerBgusa.byId("BgusaMessageTemplateName").setValue("");
                MessageBox.error(controller.oBundle.getText("viewMail.template.alreadyExist"));
            }
        },
		
        closeBgusaTemplate: function () {	
			controllerBgusa.byId("BgusaMessageTemplateId").setText("");			
			controllerBgusa.byId("inputBgusaTemplateMessage").setValue("");
			controllerBgusa.byId("inputBgusaTemplateMessage").setEnabled(true);		
			
			controllerBgusa.byId("BgusaMessageTemplateName").setEnabled(false);
			controllerBgusa.byId("BgusaMessageTemplateName").setValue("");
			
			controllerBgusa.byId("newBgusaMessageTemplate").setEnabled(true);
			controllerBgusa.byId("delBgusaMessageTemplate").setEnabled(false);
			controllerBgusa.byId("resetBgusaMessageTemplate").setEnabled(false);
            controllerBgusa.byId("saveBgusaMessageTemplate").setEnabled(false);
			
			controllerBgusa.byId("BgusaMessageTemplateDescription").setEnabled(false);
			controllerBgusa.byId("BgusaMessageTemplateDescription").setValue("");			
			
			controllerBgusa.byId("comboBgusaTagObject").setSelectedKey("");
			controllerBgusa.byId("comboBgusaTagObject").setValue("");
            controllerBgusa.byId("templateBgusaMessageObject").setValue("");
			controllerBgusa.byId("comboTagBgusaMessageBody").setSelectedKey("");
			controllerBgusa.byId("comboTagBgusaMessageBody").setValue("");
            controllerBgusa.byId("templateBgusaMessageBody").setValue("");
        },
		
		newBgusaTemplate: function () {
			controllerBgusa.byId("BgusaMessageTemplateId").setText("");

			controllerBgusa.byId("inputBgusaTemplateMessage").setValue("");
			controllerBgusa.byId("inputBgusaTemplateMessage").setEnabled(false);			
			
			controllerBgusa.byId("BgusaMessageTemplateName").setEnabled(true);
			controllerBgusa.byId("BgusaMessageTemplateName").setValue("");
				
			controllerBgusa.byId("newBgusaMessageTemplate").setEnabled(true);
			controllerBgusa.byId("delBgusaMessageTemplate").setEnabled(false);
			controllerBgusa.byId("resetBgusaMessageTemplate").setEnabled(true);
            controllerBgusa.byId("saveBgusaMessageTemplate").setEnabled(true);			
			
			controllerBgusa.byId("BgusaMessageTemplateDescription").setEnabled(true);
			controllerBgusa.byId("BgusaMessageTemplateDescription").setValue("");
			
			controllerBgusa.byId("comboBgusaTagObject").setSelectedKey("");
			controllerBgusa.byId("comboBgusaTagObject").setValue("");
            controllerBgusa.byId("templateBgusaMessageObject").setValue("");
			controllerBgusa.byId("comboTagBgusaMessageBody").setSelectedKey("");
			controllerBgusa.byId("comboTagBgusaMessageBody").setValue("");
            controllerBgusa.byId("templateBgusaMessageBody").setValue("");			           
        },
		
        saveBgusaTemplate: function () {
            if (controllerBgusa.byId("BgusaMessageTemplateDescription").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("controllerLogistic.misstemplatdescr"))
            }
			
            if (controllerBgusa.byId("templateBgusaMessageObject").getValue() === "") {
                return MessageToast.warning(controller.oBundle.getText("viewMail.template.misstemplateobject"))
            }
			
            if (controllerBgusa.byId("templateBgusaMessageBody").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("viewMail.template.misstemplatebody"))
            }
			
            var input = {};
            input.MESSAGE_TEMPLATE_ID = controllerBgusa.byId("BgusaMessageTemplateId").getText();
			input.MESSAGE_TEMPLATE = controllerBgusa.byId("BgusaMessageTemplateName").getValue("");			
			input.MESSAGE_DESCRIPTION = controllerBgusa.byId("BgusaMessageTemplateDescription").getValue("");
            input.MESSAGE_OBJECT = controllerBgusa.byId("templateBgusaMessageObject").getValue().replace(/(\r\n|\n|\r)/gm, "\\r\\n");
            input.MESSAGE_BODY = controllerBgusa.byId("templateBgusaMessageBody").getValue().replace(/(\r\n|\n|\r)/gm, "\\r\\n");
            input.SITE_ID = controller.SiteId;
          
            controllerBgusa.getDataSync("SAVE_TEMPLATE", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveBgusaTemplateSuccess, controllerBgusa.transactionError);           
        },
		
		saveBgusaTemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {                
                controllerBgusa.closeBgusaTemplate();
                MessageToast.show(controller.oBundle.getText("viewMail.template.result"));
            }
        },
		
		deleteBgusaTemplate: function () {
			var input = {"MESSAGE_TEMPLATE_ID": controllerBgusa.byId("BgusaMessageTemplateId").getText()};
            
			MessageBox.confirm((controller.oBundle.getText("viewMail.template.deltemplate") + " " + controllerBgusa.byId("BgusaMessageTemplateName").getValue() + "?"), {
				styleClass: "sapUiSizeCompact",
				onClose: function (evt) {
					if (evt == "OK") {						
						controllerBgusa.getDataSync("DELETE_TEMPLATE", "ADIGE7/MASTER_DATA/BGUSA/TRANSACTION", input, controllerBgusa.saveBgusaTemplateSuccess, controllerBgusa.transactionError);
					}
				}
			});            
        },	       
		
		getBgusaMessageTemplate: function(){
			Fragment.load({
				name: "master_data.view.popup.listMessageTemplate",
				controller: controllerBgusa
			}).then(function (oValueHelpDialogTmp) {
				controllerBgusa.getAllBgusaTemplate();
				controllerBgusa.popup = oValueHelpDialogTmp;
				controllerBgusa.getView().addDependent(controllerBgusa.popup);				
				controllerBgusa.popup.open();
			});           
		},
		
		searchMessageTemplate: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("MESSAGE_TEMPLATE", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
		
		onConfirmMessageTemplate: function(oEvent){
			var oSelectedRowModel = controllerBgusa.bgusaModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath());
            try {
				controllerBgusa.byId("BgusaMessageTemplateId").setText(oSelectedRowModel["MESSAGE_TEMPLATE_ID"]);			
				controllerBgusa.byId("inputBgusaTemplateMessage").setValue(oSelectedRowModel["MESSAGE_TEMPLATE"]);
				controllerBgusa.byId("inputBgusaTemplateMessage").setEnabled(false);
				
				controllerBgusa.byId("BgusaMessageTemplateName").setEnabled(false);
				controllerBgusa.byId("BgusaMessageTemplateName").setValue(oSelectedRowModel["MESSAGE_TEMPLATE"]);					
				controllerBgusa.byId("newBgusaMessageTemplate").setEnabled(false);
				controllerBgusa.byId("delBgusaMessageTemplate").setEnabled(true);
				controllerBgusa.byId("resetBgusaMessageTemplate").setEnabled(true);
				controllerBgusa.byId("saveBgusaMessageTemplate").setEnabled(true);
				
				controllerBgusa.byId("BgusaMessageTemplateDescription").setValue(oSelectedRowModel["MESSAGE_TEMPLATE_DESCRIPTION"]);
				controllerBgusa.byId("BgusaMessageTemplateDescription").setEnabled(true);
				controllerBgusa.byId("comboBgusaTagObject").setSelectedKey("");
				controllerBgusa.byId("comboBgusaTagObject").setValue("");
				controllerBgusa.byId("templateBgusaMessageObject").setValue(oSelectedRowModel["MESSAGE_OBJECT"]);
				controllerBgusa.byId("comboTagBgusaMessageBody").setSelectedKey("");
				controllerBgusa.byId("comboTagBgusaMessageBody").setValue("");
				controllerBgusa.byId("templateBgusaMessageBody").setValue(oSelectedRowModel["MESSAGE_BODY"]);
			
				       
                controllerBgusa.popup = undefined;
            } catch (err) {}
		},	
		
		/*Formatter*/
        manageColor: function (DEL) {
            var color = 'None'
			if (!DEL) {
				color = 'None'
			} else {
				color = 'Error'
			}
			if (DEL == "false") {
				color = 'Warning'
			}
			return color;
        },         
     
        //FUNZIONI PER ESECUZIONI TRANSAZIONI
      		
        transactionError: function (error) {
            sap.ui.core.BusyIndicator.hide();
            console.error(error);
        },
		
        getDataSync: function (trans, rt, inp, suss, errf) {

            var transactionCall = rt + "/" + trans;
            var that = this;

            inp.TRANSACTION = transactionCall;
            inp.OutputParameter = "JSON";

            try {
                var req = jQuery.ajax({
                    url: "/XMII/Runner",
                    data: inp,
                    method: "POST",
                    dataType: "xml",
                    async: false
                });
                req.done(jQuery.proxy(suss, that));
                req.fail(jQuery.proxy(errf, that));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },

        //presslogisticITB
        pressBgusaTabBar: function (oSource) {
            var selKey = oSource.getSource().getSelectedKey();
            switch (selKey) {        
            case "KMAT":       
                controllerBgusa.getKmat();
                break;
            case "CARRIER":
				controllerBgusa.getCarrier();
                break;
            case "PORT":
				controllerBgusa.getPort();
                break; 	
			case "CRATES":
				controllerBgusa.getCrates();
                break;
			case "CARATTERISTICS":
				controllerBgusa.getCaratteristics();
                break;	
			case "WAREHOUSE":
				controllerBgusa.getBgusaWarehouseList();
                break;
			case "MSGTEMP":
				controllerBgusa.closeBgusaTemplate();
				controllerBgusa.createBgusaTagList();
                break;				
            default:
                //No Action
            }
        }
    });
});
