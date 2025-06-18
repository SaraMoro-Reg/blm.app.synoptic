var controllerLogistic;
sap.ui.define([
        'sap/ui/core/mvc/Controller',
        'sap/m/MessageToast',
        'sap/m/MessageBox',
		'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.Logistic", {
        logisticModel: new sap.ui.model.json.JSONModel(),
		popup: undefined,
		
        onInit: function () {
            controllerLogistic = this; 
			controller.enableElement(controllerLogistic.logisticModel);
        },
		
		/*Logistic Type*/
		
		getLogisticType: function () {
            controllerLogistic.getDataSync("GET_LOGISTIC_TYPE", "ADIGE7/MASTER_DATA/LOGISTIC_TYPE/TRANSACTION", {}, controllerLogistic.getLogisticTypeSuccess, controllerLogistic.transactionError);
        },
		
        getLogisticTypeSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerLogistic.logisticModel.setProperty("/tabLogisticType", jsonArr);
                controllerLogistic.getView().setModel(controllerLogistic.logisticModel);
				
				//Buttons
				controllerLogistic.byId("btnCloseLogisticType").setEnabled(false);
				controllerLogistic.byId("btnSaveLogisticType").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },		
		
        newLogisticType: function () {
            var addRowModel = controllerLogistic.logisticModel.getProperty("/tabLogisticType");
            var row = {
				"LOGISTIC_TYPE_ID": "0",
                "LOGISTIC_TYPE": "",
                "DEL": "false",
                "EDIT": "true"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerLogistic.logisticModel.setProperty("/tabLogisticType", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticType", newArr);
                } else {
                    var addArr = controllerLogistic.logisticModel.getProperty("/tabLogisticType");
                    addArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticType", addArr);
                }
            }
			
			//Buttons
			controllerLogistic.byId("btnCloseLogisticType").setEnabled(true);
            controllerLogistic.byId("btnSaveLogisticType").setEnabled(true);
			
			//Scroll to last table Element
			controllerLogistic.byId("tabLogisticType").setFirstVisibleRow(addRowModel.length);
        },
		       
        saveNewLogisticType: function () {
            var input = {};
            var model = controllerLogistic.logisticModel.getProperty("/tabLogisticType");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if (model[i].LOGISTIC_TYPE === "" && model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticType"));
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
                controllerLogistic.getDataSync("SAVE_LOGISTIC_TYPE", "ADIGE7/MASTER_DATA/LOGISTIC_TYPE/TRANSACTION", input, controllerLogistic.saveNewLogisticTypeSuccess, controllerLogistic.transactionError);                
            }
        },
		
        saveNewLogisticTypeSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC == "0"){
                    controllerLogistic.getLogisticType();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		editLogisticType: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
			lineSel.DEL = "false";
			controllerLogistic.logisticModel.refresh();
			
			//Buttons
			controllerLogistic.byId("btnCloseLogisticType").setEnabled(true);
            controllerLogistic.byId("btnSaveLogisticType").setEnabled(true);			
        },
		
        deleteLogisticType: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
			controllerLogistic.logisticModel.refresh();	

			//Buttons
			controllerLogistic.byId("btnCloseLogisticType").setEnabled(true);
            controllerLogistic.byId("btnSaveLogisticType").setEnabled(true);			
        },
		
		/*---*/
		
		/*Logistic Dimension*/
		getAllUom: function(){
			controllerLogistic.getDataSync("GET_ALL_UOM", "ADIGE7/MASTER_DATA/LOGISTIC_DIMENSION/TRANSACTION", {}, controllerLogistic.getUoMSuccess, controllerLogistic.transactionError);
		},
		
		getUoMSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerLogistic.logisticModel.setProperty("/uomList", jsonArr, false);
                controllerLogistic.getView().setModel(controllerLogistic.logisticModel);
            } catch (e) {
				console.log(e);
			}
        },
		
        getLogisticDimension: function () {
            controllerLogistic.getDataSync("GET_LOGISTIC_DIMENSION", "ADIGE7/MASTER_DATA/LOGISTIC_DIMENSION/TRANSACTION", {}, controllerLogistic.getLogisticDimensionSuccess, controllerLogistic.transactionError);
        },
		
        getLogisticDimensionSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerLogistic.logisticModel.setProperty("/tabLogisticDimension", jsonArr, false);
                controllerLogistic.getView().setModel(controllerLogistic.logisticModel);
				
				//Buttons
				controllerLogistic.byId("btnCloseLogisticDimension").setEnabled(false);
				controllerLogistic.byId("btnSaveLogisticDimension").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },
		
        newLogisticDimension: function () {
            var addRowModel = controllerLogistic.logisticModel.getProperty("/tabLogisticDimension");
            var row = {
				"LOGISTIC_DIMENSION_ID": "0",
                "LOGISTIC_DIMENSION": "",
				"UOM_ID": "",
				"UOM": "",
                "DEL": "false",
                "EDIT": "true"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerLogistic.logisticModel.setProperty("/tabLogisticDimension", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticDimension", newArr);
                } else {
                    var addArr = controllerLogistic.logisticModel.getProperty("/tabLogisticDimension");
                    addArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticDimension", addArr);
                }
            }
			
			//Buttons
			controllerLogistic.byId("btnCloseLogisticDimension").setEnabled(true);
            controllerLogistic.byId("btnSaveLogisticDimension").setEnabled(true);
			
			//Scroll to last table Element
			controllerLogistic.byId("tabLogisticDimension").setFirstVisibleRow(addRowModel.length);
        },
		       
        saveNewLogisticDimension: function () {
            var input = {};
            var model = controllerLogistic.logisticModel.getProperty("/tabLogisticDimension");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if (model[i].LOGISTIC_DIMENSION === "" && model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticDimension"));
                    }else if (model[i].UOM_ID === "") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticUoM"));
                    }  else {
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
                controllerLogistic.getDataSync("SAVE_LOGISTIC_DIMENSION", "ADIGE7/MASTER_DATA/LOGISTIC_DIMENSION/TRANSACTION", input, controllerLogistic.saveNewLogisticDimensionSuccess, controllerLogistic.transactionError);                
            }
        },
		
        saveNewLogisticDimensionSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC == "0"){
                    controllerLogistic.getLogisticDimension();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		comboUoMChange: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
			lineSel.UOM_ID = oEvent.oSource.getSelectedKey();
			lineSel.UOM = oEvent.oSource.getValue();
			controllerLogistic.logisticModel.refresh();	
		},
		
		editLogisticDimension: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
			lineSel.DEL = "false";
			controllerLogistic.logisticModel.refresh();	

			//Buttons
			controllerLogistic.byId("btnCloseLogisticDimension").setEnabled(true);
            controllerLogistic.byId("btnSaveLogisticDimension").setEnabled(true);			
        },
		
        deleteLogisticDimension: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
			controllerLogistic.logisticModel.refresh();	

			//Buttons
			controllerLogistic.byId("btnCloseLogisticDimension").setEnabled(true);
            controllerLogistic.byId("btnSaveLogisticDimension").setEnabled(true);
        },
		
		/*---*/
		
		/*Logistic Province*/
		
        getLogisticProvince: function () {
            controllerLogistic.getDataSync("GET_PROVINCE", "ADIGE7/MASTER_DATA/LOGISTIC_PROVINCE/TRANSACTION", {}, controllerLogistic.getLogisticProvinceSuccess, controllerLogistic.transactionError);
        },
		
        getLogisticProvinceSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerLogistic.logisticModel.setProperty("/tabLogisticProvince", jsonArr, false);
                controllerLogistic.getView().setModel(controllerLogistic.logisticModel);
				
				//Buttons
				controllerLogistic.byId("btnCloseLogisticProvince").setEnabled(false);
				controllerLogistic.byId("btnSaveLogisticProvince").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },
		
        newLogisticProvince: function () {
            var addRowModel = controllerLogistic.logisticModel.getProperty("/tabLogisticProvince");
            var row = {
				"PROVINCE_ID": "0",
                "PROVINCE": "",
				"DESCRIPTION": "",
				"SATE_ID": "",
				"STATE": "",
                "DEL": "false",
                "EDIT": "true"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerLogistic.logisticModel.setProperty("/tabLogisticProvince", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticProvince", newArr);
                } else {
                    var addArr = controllerLogistic.logisticModel.getProperty("/tabLogisticProvince");
                    addArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticProvince", addArr);
                }
            }
			
			//Buttons
			controllerLogistic.byId("btnCloseLogisticProvince").setEnabled(true);
			controllerLogistic.byId("btnSaveLogisticProvince").setEnabled(true);
			
			//Scroll to last table Element
			controllerLogistic.byId("tabLogisticProvince").setFirstVisibleRow(addRowModel.length);
        },
		       
        saveNewProvince: function () {
            var input = {};
            var model = controllerLogistic.logisticModel.getProperty("/tabLogisticProvince");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].PROVINCE === "" || model[i].STATE === "" )&& model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticProvince"));
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
                controllerLogistic.getDataSync("SAVE_PROVINCE", "ADIGE7/MASTER_DATA/LOGISTIC_PROVINCE/TRANSACTION", input, controllerLogistic.saveNewProvinceSuccess, controllerLogistic.transactionError);                
            }
        },
		
        saveNewProvinceSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC == "0"){
                    controllerLogistic.getLogisticProvince();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		editProvince: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
			lineSel.DEL = "false";
			controllerLogistic.logisticModel.refresh();	

			//Buttons
			controllerLogistic.byId("btnCloseLogisticProvince").setEnabled(true);
			controllerLogistic.byId("btnSaveLogisticProvince").setEnabled(true);			
        },
		
        deleteProvince: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
			controllerLogistic.logisticModel.refresh();	

			//Buttons
			controllerLogistic.byId("btnCloseLogisticProvince").setEnabled(true);
			controllerLogistic.byId("btnSaveLogisticProvince").setEnabled(true);			
        },
		
		openStatePopup: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext().sPath;
			Fragment.load({
				name: "master_data.view.popup.listAllStates",
				controller: controllerLogistic
			}).then(function (oValueHelpDialogTmp) {
				controllerLogistic.getDataSync("GET_STATES", "ADIGE7/MASTER_DATA/LOGISTIC_PROVINCE/TRANSACTION", {}, controllerLogistic.getAllStatesSuccess, controllerLogistic.transactionError);
				controllerLogistic.popup = oValueHelpDialogTmp;
				controllerLogistic.getView().addDependent(controllerLogistic.popup);				
				controllerLogistic.popup.open();
				sap.ui.getCore().getElementById("sRowPath").setText(sPath);
			});           
		},
		
		getAllStatesSuccess: function (data, response) {
            try {
                controllerLogistic.logisticModel.setProperty("/listAllStates" ,JSON.parse(jQuery(data).find("Row").text()));                
            } catch (e) {
                console.log(e);
            }
        },
		
		searchAllStates: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
				orFilter = [];
			orFilter.push(new Filter("STATE", FilterOperator.Contains, sValue));
			orFilter.push(new Filter("STATE_DESCRIPTION", FilterOperator.Contains, sValue));
			orFilter.push(new Filter("COUNTRY_ID", FilterOperator.Contains, sValue));
			var	oFilter = new Filter(orFilter, false);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
		
		onConfirmState: function(oEvent){
			var oSelectedRowModel = controllerLogistic.logisticModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()),
				oModelRowSelected = controllerLogistic.logisticModel.getProperty(sap.ui.getCore().getElementById("sRowPath").getText());
            try {
				oModelRowSelected["STATE_ID"] = oSelectedRowModel["STATE_ID"];
				oModelRowSelected["STATE"] = oSelectedRowModel["STATE"];
				oModelRowSelected["STATE_DESCRIPTION"] = oSelectedRowModel["STATE_DESCRIPTION"];
				controllerLogistic.logisticModel.refresh();
				
            } catch (err) {
				oModelRowSelected["STATE_ID"] = "";
				oModelRowSelected["STATE"] = "";
				oModelRowSelected["STATE_DESCRIPTION"] = "";
				controllerLogistic.logisticModel.refresh();
			}
			
			controllerLogistic.onClosePopupState(oEvent);
			
		},	
		
		onClosePopupState: function(oEvent){
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			
			controllerLogistic.popup.destroy();
			controllerLogistic.popup = undefined;			
		},
		
		/*---*/
		
		/*States*/
		
		getLogisticState: function () {
            controllerLogistic.getDataSync("GET_STATES", "ADIGE7/MASTER_DATA/LOGISTIC_PROVINCE/TRANSACTION", {}, controllerLogistic.getLogisticStateSuccess, controllerLogistic.transactionError);
        },
		
        getLogisticStateSuccess: function (data, response) {
            try {
                controllerLogistic.logisticModel.setProperty("/tabLogisticStates", JSON.parse(jQuery(data).find("Row").text()));
				
				//Buttons
				controllerLogistic.byId("btnCloseLogisticState").setEnabled(false);
				controllerLogistic.byId("btnSaveLogisticState").setEnabled(false);
            } catch (e) {
				console.log(e);
			}
        },
		
        newLogisticState: function () {
            var addRowModel = controllerLogistic.logisticModel.getProperty("/tabLogisticStates");
            var row = {
				"STATE_ID": "0",
                "STATE": "",
				"STATE_DESCRIPTION": "",
				"COUNTRY_ID": "",
                "DEL": "false",
				"NEW_STATE": "true",
                "EDIT": "true"
            };
			
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerLogistic.logisticModel.setProperty("/tabLogisticStates", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticStates", newArr);
                } else {
                    var addArr = controllerLogistic.logisticModel.getProperty("/tabLogisticStates");
                    addArr.push(row);
                    controllerLogistic.logisticModel.setProperty("/tabLogisticStates", addArr);
                }
            }
			
			//Buttons
			controllerLogistic.byId("btnCloseLogisticState").setEnabled(true);
			controllerLogistic.byId("btnSaveLogisticState").setEnabled(true);
			
			//Scroll to last table Element
			controllerLogistic.byId("tabLogisticStates").setFirstVisibleRow(addRowModel.length);
        },
		       
        saveNewState: function () {
            var input = {};
            var model = controllerLogistic.logisticModel.getProperty("/tabLogisticStates");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].STATE === "" || model[i].COUNTRY_ID === "" )&& model[i].DEL !== "true") {
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
                controllerLogistic.getDataSync("SAVE_STATES", "ADIGE7/MASTER_DATA/LOGISTIC_PROVINCE/TRANSACTION", input, controllerLogistic.saveNewStateSuccess, controllerLogistic.transactionError);                
            }
        },
		
        saveNewStateSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                if (jsonArr[0].RC == "0"){
                    controllerLogistic.getLogisticState();
					MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
				}else{
					MessageBox.error(jsonArr[0].MESSAGE);
				}
            } catch (e) {
                console.log(e);
            }
        },
		
		editState: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
			lineSel.NEW_STATE = "false";
			lineSel.DEL = "false";
			controllerLogistic.logisticModel.refresh();	

			//Buttons
			controllerLogistic.byId("btnCloseLogisticState").setEnabled(true);
			controllerLogistic.byId("btnSaveLogisticState").setEnabled(true);			
        },
		
        deleteState: function (oEvent) {
            var lineSel = controllerLogistic.logisticModel.getProperty(oEvent.oSource.getBindingContext().sPath);
			lineSel.NEW_STATE = "false";
            lineSel.DEL = "true";
			controllerLogistic.logisticModel.refresh();	

			//Buttons
			controllerLogistic.byId("btnCloseLogisticState").setEnabled(true);
			controllerLogistic.byId("btnSaveLogisticState").setEnabled(true);			
        },
		
		/**/
		
		
		/*Template*/
		
		createTagList: function () {
            var arrTag = [{                
							"descr": controller.oBundle.getText("controllerLogistic.Mission"),
							"value": '%MISSION%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.MissionGrp"),
							"value": '%MISSION_GRP%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.User"),
							"value": '%USER%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.NotifDate"),
							"value": '%NOTIF_DATE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.NotifTime"),
							"value": '%NOTIF_TIME%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.DepProvince"),
							"value": '%DEPARTURE_PROVINCE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.ArrProvince"),
							"value": '%ARRIVAL_PROVINCE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.Qty"),
							"value": '%QTY%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.Weight"),
							"value": '%WEIGHT%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.Price"),
							"value": '%PRICE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.ActionDueDate"),
							"value": '%AUCTION_DUE_DATE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.Commitment"),
							"value": '%COMMITMENT%'
						}];
						
            controllerLogistic.logisticModel.setProperty("/tagList", arrTag);
        },
		
		createTransporterTagList: function () {
            var arrTag = [{                
							"descr": controller.oBundle.getText("controllerLogistic.MissionGrp"),
							"value": '%MISSION_GRP%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.User"),
							"value": '%USER%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.NotifDate"),
							"value": '%NOTIF_DATE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.NotifTime"),
							"value": '%NOTIF_TIME%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.OldPrice"),
							"value": '%OLD_PRICE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.Price"),
							"value": '%PRICE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.ActionDueDate"),
							"value": '%AUCTION_DUE_DATE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.OldPickUpDate"),
							"value": '%OLD_PICK_UP_DATE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.PickUpDate"),
							"value": '%PICK_UP_DATE%'
						},{                
							"descr": controller.oBundle.getText("controllerLogistic.Commitment"),
							"value": '%COMMITMENT%'
						}];
						
            controllerLogistic.logisticModel.setProperty("/tagList", arrTag);
        },
		
		createMessagePriority: function(){
			var arrPriority = [{                
							"STATUS": "Error",
							"STATUS_DESCRIPTION": controller.oBundle.getText("controllerLogistic.stsMessageError"),
							"ORDER": 0
						},{                
							"STATUS": "Warning",
							"STATUS_DESCRIPTION": controller.oBundle.getText("controllerLogistic.stsMessageWarning"),
							"ORDER": 1
						},{                
							"STATUS": "Success",
							"STATUS_DESCRIPTION": controller.oBundle.getText("controllerLogistic.stsMessageSuccess"),
							"ORDER": 2							
						}];
			controllerLogistic.logisticModel.setProperty("/messageStatusList", arrPriority);
		},
		
		addTagObject: function () {
            if (controllerLogistic.byId("comboTagObject").getSelectedKey() != "") {
                controllerLogistic.byId("templateMessageObject").setValue(controllerLogistic.byId("templateMessageObject").getValue() + " " + controllerLogistic.byId("comboTagObject").getSelectedKey());
            }
        },
		
        addTagBody: function () {
            if (controllerLogistic.byId("comboTagMessageBody").getSelectedKey() != "") {
                controllerLogistic.byId("templateMessageBody").setValue(controllerLogistic.byId("templateMessageBody").getValue() + " " + controllerLogistic.byId("comboTagMessageBody").getSelectedKey());
            }
        },
		
        removeTagObject: function () {
            if (controllerLogistic.byId("comboTagObject").getSelectedKey() != "") {
                controllerLogistic.byId("templateMessageObject").setValue(controllerLogistic.byId("templateMessageObject").getValue().replace(" " + controllerLogistic.byId("comboTagObject").getSelectedKey(), ""));
            }
        },
		
        removeTagBody: function () {
            if (controllerLogistic.byId("comboTagMessageBody").getSelectedKey() != "") {
                controllerLogistic.byId("templateMessageBody").setValue(controllerLogistic.byId("templateMessageBody").getValue().replace(" " + controllerLogistic.byId("comboTagMessageBody").getSelectedKey(), ""));
            }
        },
		
        getAlltemplate: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
			
            controllerLogistic.getDataSync("GET_ALL_MESSAGE_TEMPLATE", "ADIGE7/MASTER_DATA/LOGISTIC_MESSAGE/TRANSACTION", input, controllerLogistic.getAlltemplateSuccess, controllerLogistic.transactionError);
        },
		
        getAlltemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            
            for (var i = 0; i < jsonArr.length; i++) {
				jsonArr[i]["MESSAGE_TEMPLATE_DESCRIPTION"] = jsonArr[i]["MESSAGE_TEMPLATE_DESCRIPTION"];//.replace(/_rn_/gm, '\r\n');
				jsonArr[i]["MESSAGE_OBJECT"] = jsonArr[i]["MESSAGE_OBJECT"];
                jsonArr[i]["MESSAGE_BODY"] = jsonArr[i]["MESSAGE_BODY"];
            }
			
            controllerLogistic.logisticModel.setProperty("/templateMessagelist", jsonArr);            
        },
		
        checkIfExistTemplate: function () {
            var input = {};
            input.TEMPLATE = controllerLogistic.byId("messageTemplateName").getValue();
            input.SITE_ID = controller.SiteId;
			
            controllerLogistic.getDataSync("GET_IF_TEMPLATE_EXIST", "ADIGE7/MASTER_DATA/LOGISTIC_MESSAGE/TRANSACTION", input, controllerLogistic.checkIfExistTemplateSuccess, controllerLogistic.transactionError);
        },
		
        checkIfExistTemplateSuccess: function (data, response) {           
            var jsonArr = JSON.parse(jQuery(data).find("Row").text());
            if (jsonArr[0].RC != "0") {
                controllerLogistic.byId("messageTemplateName").setValue("");
                MessageBox.error(controller.oBundle.getText("viewMail.template.alreadyExist"));
            }
        },
		
        closeTemplate: function () {	
			controllerLogistic.byId("messageTemplateId").setText("");
			
			controllerLogistic.byId("inputTemplateMessage").setValue("");
			controllerLogistic.byId("inputTemplateMessage").setEnabled(true);	
			
			if(controller.checkUserActivity("ALL_ADMIN")){
				controllerLogistic.byId("messageTemplateName").setEnabled(false);
				controllerLogistic.byId("messageTemplateName").setValue("");
				
				controllerLogistic.byId("newMessageTemplate").setEnabled(true);
				controllerLogistic.byId("delMessageTemplate").setEnabled(false);
			}
			controllerLogistic.byId("messageTemplateDescription").setEnabled(false);
			controllerLogistic.byId("messageTemplateDescription").setValue("");
			
			controllerLogistic.byId("comboTemplateStatus").setSelectedKey("");
			controllerLogistic.byId("comboTemplateStatus").setEnabled(false);
			
			controllerLogistic.byId("comboTagObject").setSelectedKey("");
			controllerLogistic.byId("comboTagObject").setValue("");
            controllerLogistic.byId("templateMessageObject").setValue("");
			controllerLogistic.byId("comboTagMessageBody").setSelectedKey("");
			controllerLogistic.byId("comboTagMessageBody").setValue("");
            controllerLogistic.byId("templateMessageBody").setValue("");            
           
            controllerLogistic.byId("resetMessageTemplate").setEnabled(false);
            controllerLogistic.byId("saveMessageTemplate").setEnabled(false)            
        },
		
		newTemplate: function () {
			controllerLogistic.byId("messageTemplateId").setText("");

			controllerLogistic.byId("inputTemplateMessage").setValue("");
			controllerLogistic.byId("inputTemplateMessage").setEnabled(false);			
			
			controllerLogistic.byId("messageTemplateName").setEnabled(true);
			controllerLogistic.byId("messageTemplateName").setValue("");
				
			controllerLogistic.byId("newMessageTemplate").setEnabled(true);
			controllerLogistic.byId("delMessageTemplate").setEnabled(false);			
			
			controllerLogistic.byId("messageTemplateDescription").setEnabled(true);
			controllerLogistic.byId("messageTemplateDescription").setValue("");
			
			controllerLogistic.byId("comboTemplateStatus").setSelectedKey("");
			controllerLogistic.byId("comboTemplateStatus").setEnabled(true);
			
			controllerLogistic.byId("comboTagObject").setSelectedKey("");
			controllerLogistic.byId("comboTagObject").setValue("");
            controllerLogistic.byId("templateMessageObject").setValue("");
			controllerLogistic.byId("comboTagMessageBody").setSelectedKey("");
			controllerLogistic.byId("comboTagMessageBody").setValue("");
            controllerLogistic.byId("templateMessageBody").setValue("");
			
            controllerLogistic.byId("resetMessageTemplate").setEnabled(true);
            controllerLogistic.byId("saveMessageTemplate").setEnabled(true);            
        },
		
        saveTemplate: function () {
            if (controllerLogistic.byId("messageTemplateDescription").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("controllerLogistic.misstemplatdescr"))
            }
			
            if (controllerLogistic.byId("templateMessageObject").getValue() === "") {
                return MessageToast.warning(controller.oBundle.getText("viewMail.template.misstemplateobject"))
            }
			
            if (controllerLogistic.byId("templateMessageBody").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("viewMail.template.misstemplatebody"))
            }
			
			if (controllerLogistic.byId("comboTemplateStatus").getSelectedKey() === "") {
                return MessageBox.warning(controller.oBundle.getText("controllerLogistic.misstemplatests"))
            }
			
            var input = {};
            input.MESSAGE_TEMPLATE_ID = controllerLogistic.byId("messageTemplateId").getText();
			
			if(controller.checkUserActivity("ALL_ADMIN")){
				input.MESSAGE_TEMPLATE = controllerLogistic.byId("messageTemplateName").getValue("");
			}
			input.MESSAGE_DESCRIPTION = controllerLogistic.byId("messageTemplateDescription").getValue("");
            input.MESSAGE_STATUS = controllerLogistic.byId("comboTemplateStatus").getSelectedKey("");
            input.MESSAGE_OBJECT = controllerLogistic.byId("templateMessageObject").getValue().replace(/(\r\n|\n|\r)/gm, "\\r\\n");
            input.MESSAGE_BODY = controllerLogistic.byId("templateMessageBody").getValue().replace(/(\r\n|\n|\r)/gm, "\\r\\n");
            input.SITE_ID = controller.SiteId;
          
            controllerLogistic.getDataSync("SAVE_TEMPLATE", "ADIGE7/MASTER_DATA/LOGISTIC_MESSAGE/TRANSACTION", input, controllerLogistic.saveTemplateSuccess, controllerLogistic.transactionError);           
        },
		
		deleteTemplate: function () {
			var input = {"MESSAGE_TEMPLATE_ID": controllerLogistic.byId("messageTemplateId").getText()};
            
			MessageBox.confirm((controller.oBundle.getText("viewMail.template.deltemplate") + " " + controllerLogistic.byId("messageTemplateName").getValue() + "?"), {
				styleClass: "sapUiSizeCompact",
				onClose: function (evt) {
					if (evt == "OK") {						
						controllerLogistic.getDataSync("DELETE_TEMPLATE", "ADIGE7/MASTER_DATA/LOGISTIC_MESSAGE/TRANSACTION", input, controllerLogistic.saveTemplateSuccess, controllerLogistic.transactionError);
					}
				}
			});            
        },
		
        saveTemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {                
                controllerLogistic.closeTemplate();
                MessageToast.show(controller.oBundle.getText("viewMail.template.result"));
            }
        },
		
		getMessageTemplate: function(){
			Fragment.load({
				name: "master_data.view.popup.listMessageTemplate",
				controller: controllerLogistic
			}).then(function (oValueHelpDialogTmp) {
				controllerLogistic.getAlltemplate();
				controllerLogistic.popup = oValueHelpDialogTmp;
				controllerLogistic.getView().addDependent(controllerLogistic.popup);				
				controllerLogistic.popup.open();
			});           
		},
		
		searchMessageTemplate: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("MESSAGE_TEMPLATE", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
		
		onConfirmMessageTemplate: function(oEvent){
			var oSelectedRowModel = controllerLogistic.logisticModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath());
            try {
				controllerLogistic.byId("messageTemplateId").setText(oSelectedRowModel["MESSAGE_TEMPLATE_ID"]);			
				controllerLogistic.byId("inputTemplateMessage").setValue(oSelectedRowModel["MESSAGE_TEMPLATE"]);
				controllerLogistic.byId("inputTemplateMessage").setEnabled(false);
				
				if(controller.checkUserActivity("ALL_ADMIN")){
					controllerLogistic.byId("messageTemplateName").setEnabled(false);
					controllerLogistic.byId("messageTemplateName").setValue(oSelectedRowModel["MESSAGE_TEMPLATE"]);					
					controllerLogistic.byId("newMessageTemplate").setEnabled(false);
					controllerLogistic.byId("delMessageTemplate").setEnabled(true);
				}
				controllerLogistic.byId("messageTemplateDescription").setValue(oSelectedRowModel["MESSAGE_TEMPLATE_DESCRIPTION"]);
				controllerLogistic.byId("messageTemplateDescription").setEnabled(true);
				controllerLogistic.byId("comboTemplateStatus").setSelectedKey(oSelectedRowModel["MESSAGE_STATUS"]);
				controllerLogistic.byId("comboTemplateStatus").setEnabled(true);
				controllerLogistic.byId("comboTagObject").setSelectedKey("");
				controllerLogistic.byId("comboTagObject").setValue("");
				controllerLogistic.byId("templateMessageObject").setValue(oSelectedRowModel["MESSAGE_OBJECT"]);
				controllerLogistic.byId("comboTagMessageBody").setSelectedKey("");
				controllerLogistic.byId("comboTagMessageBody").setValue("");
				controllerLogistic.byId("templateMessageBody").setValue(oSelectedRowModel["MESSAGE_BODY"]);
			
				controllerLogistic.byId("resetMessageTemplate").setEnabled(true);
				controllerLogistic.byId("saveMessageTemplate").setEnabled(true);       
                controllerLogistic.popup = undefined;
				
				if(oSelectedRowModel["MESSAGE_TEMPLATE"] !== 'AUCTION_PRICE_DATE_CHANGE'){
					controllerLogistic.createTagList();
				}else{
					controllerLogistic.createTransporterTagList();
				}
            } catch (err) {}
		},
		   
		/*---*/		
		
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
        pressLogisticTabBar: function (oSource) {
            var selKey = oSource.getSource().getSelectedKey();
            switch (selKey) {        
            case "LTYPE":       
                controllerLogistic.getLogisticType();
                break;
            case "LDIM":
				controllerLogistic.getAllUom();
				controllerLogistic.getLogisticDimension();
                break;
            case "LPROV":
				controllerLogistic.getLogisticProvince();
                break; 
			case "LSTATE":
				controllerLogistic.getLogisticState();
                break; 	
			case "LTEMP":
				controllerLogistic.closeTemplate();
				//Creo il modello relativo ai tag dei Messaggi
				controllerLogistic.createTagList();
				//Creo il modello relativo alla priorità dei Messaggi
				controllerLogistic.createMessagePriority();
                break;				
            default:
                //No Action
            }
        }
    });
});
