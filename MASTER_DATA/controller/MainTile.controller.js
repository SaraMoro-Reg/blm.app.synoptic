var controllerMainTile;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/m/MessageToast',
        "sap/m/MessageBox",
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.MainTile", {
        model: new sap.ui.model.json.JSONModel({
			"viewTileElements": {
                "editMode": false,
				"tabSelectionMode": "None",
                // Footer buttons enablement
                "enabledAddBtn": true,
                "enabledCopyBtn": true,
                "enabledUndoBtn": false,
                "enabledSaveBtn": false
            },
			"tabMainTile": []
		}),
        tileActivityPath: "",
		_oValueHelpDialogActivity: undefined,
		_oValueHelpDialogSite: undefined,

        onInit: function () {
            controllerMainTile = this;
            controllerMainTile.getView().setModel(controllerMainTile.model);
        },

        //FUNZIONI GENERICHE
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
		
		enabledTileFields: function(sAction, bValue){
            let oTileElements = controllerMainTile.model.getProperty("/viewTileElements");
            
            switch (sAction) {
                case "ADD_ROW":
					oTileElements["editMode"] = true;
					oTileElements["enabledAddBtn"] = true;
					oTileElements["enabledCopyBtn"] = false;
					oTileElements["enabledUndoBtn"] = bValue;
					oTileElements["enabledSaveBtn"] = bValue;					
				break;
				case "EDIT_ROW":
					oTileElements["editMode"] = true;
					oTileElements["enabledAddBtn"] = true;
					oTileElements["enabledCopyBtn"] = false;
					oTileElements["enabledUndoBtn"] = bValue;
					oTileElements["enabledSaveBtn"] = bValue;
				break;
				case "DEL_ROW":
					oTileElements["editMode"] = true;
					oTileElements["enabledAddBtn"] = true;
					oTileElements["enabledCopyBtn"] = false;
					oTileElements["enabledUndoBtn"] = bValue;
					oTileElements["enabledSaveBtn"] = bValue;
				break;
				case "COPY":
					oTileElements["editMode"] = true;
					oTileElements["enabledAddBtn"] = false;
					oTileElements["enabledCopyBtn"] = false;
					oTileElements["enabledUndoBtn"] = bValue;
					oTileElements["enabledSaveBtn"] = bValue;
					oTileElements["tabSelectionMode"] = "MultiToggle";
				break;
				case "CLOSED":
					oTileElements["editMode"] = true;
					oTileElements["enabledAddBtn"] = true;
					oTileElements["enabledCopyBtn"] = true;
					oTileElements["enabledUndoBtn"] = bValue;
					oTileElements["enabledSaveBtn"] = bValue;
					oTileElements["tabSelectionMode"] = "None";
				break;
				default:
					oTileElements["editMode"] = false;
					oTileElements["enabledAddBtn"] = true;
					oTileElements["enabledCopyBtn"] = true;
					oTileElements["enabledUndoBtn"] = false;
					oTileElements["enabledSaveBtn"] = false;
					oTileElements["tabSelectionMode"] = "None";
			}

			controllerMainTile.model.setProperty("/viewTileElements", oTileElements);	
		},

        getData: function () {
            let oInput = {
				"SITE_ID": controller.SiteId
			};
            controllerMainTile.getDataSync("GET_DATA", "ADIGE7/MASTER_DATA/MAIN_TILE/TRANSACTION", oInput, controllerMainTile.getDataSuccess, controllerMainTile.transactionError);
        },

        getDataSuccess: function (data, response) {
            controllerMainTile.model.setProperty("/tabMainTile", JSON.parse(jQuery(data).find("Row").text()));
			
			controllerMainTile.enabledTileFields("CLOSED", false);
        },

        addTile: function () {
            let addRowModel = controllerMainTile.model.getProperty("/tabMainTile"),
				row = {
					"TILE_MAIN_ID": "",
					"SITE_ID": controller.SiteId,
					"ACTIVITY": "",
					"ACTIVITY_ID": "",
					"POSITION": "0",
					"TILE_ICON": "",
					"TILE_PRESS": "",
					"TILE_VISIBLE": "false",
					"SECTION": "",
					"ORDER_SECTION": "0",
					"DEL": "false",
					"EDIT": "true"
				}, newArr = [];

            if (!addRowModel) {
                newArr.push(row);
                controllerMainTile.model.setProperty("/tabMainTile", newArr);
            } else {
                if (addRowModel.length === 0) {                   
                    newArr.push(row);
                    controllerMainTile.model.setProperty("/tabMainTile", newArr);
                } else {
                    let addArr = controllerMainTile.model.getProperty("/tabMainTile");
                    addArr.push(row);
                    controllerMainTile.model.setProperty("/tabMainTile", addArr);
                }
            }
			
			controllerMainTile.enabledTileFields("ADD_ROW", true);
			
			//Scroll to last table Element
			controllerMainTile.byId("tabMainTiles").setFirstVisibleRow(addRowModel.length); 
        },

        deleteTileMain: function (evt) {
            controllerMainTile.enabledTileFields("DEL_ROW", true);
            let lineSel = controllerMainTile.model.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.DEL = "true";
            controllerMainTile.model.refresh();
        },

        editTileMain: function (evt) {
            controllerMainTile.enabledTileFields("EDIT_ROW", true);
            let lineSel = controllerMainTile.model.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.DEL = "false";
            controllerMainTile.model.refresh();
        },
		
		cloneMainTile: function(){
			controllerMainTile.enabledTileFields("COPY", true);
		},

        /*Match Code selezione Attività*/
        handleValueHelpActivity: function (oEvent) {

            controllerMainTile.tileActivityPath = oEvent.oSource.oParent.oBindingContexts["undefined"].sPath;

            var input = {};
            input.LANGUAGE = controller.language;

            controllerMainTile.getDataSync("GET_ACTIVITY_LIST", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerMainTile.getActivityListSuccess, controllerMainTile.transactionError);

            if (!controllerMainTile._oValueHelpDialogActivity) {
                Fragment.load({
                    name: "master_data.view.popup.listActivities",
                    controller: controllerMainTile
                }).then(function (oValueHelpDialogActivity) {
                    controllerMainTile._oValueHelpDialogActivity = oValueHelpDialogActivity;
                    controllerMainTile.getView().addDependent(controllerMainTile._oValueHelpDialogActivity);
                    controllerMainTile._oValueHelpDialogActivity.open();
                });
            } else {
                controllerUSR._oValueHelpDialogActivity.open();
            }
        },

        getActivityListSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            controllerMainTile.model.setProperty("/tabActivityList", JSON.parse(jsonArrStr));
        },

        valueHelpActivityConfirm: function (oEvent) {
            try {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                controllerMainTile.model.getProperty(controllerMainTile.tileActivityPath)["ACTIVITY"] = oSelectedItem.mProperties.title;
                controllerMainTile.model.getProperty(controllerMainTile.tileActivityPath)["ACTIVITY_ID"] = oSelectedItem.mProperties.highlightText;
                controllerMainTile.model.getProperty(controllerMainTile.tileActivityPath)["EDIT"] = "true";
                controllerMainTile.model.getProperty(controllerMainTile.tileActivityPath)["DEL"] = "false";
                controllerMainTile.tileActivityPath = "";
                controllerMainTile._oValueHelpDialogActivity = undefined;
                controllerMainTile.model.refresh();
            } catch (err) {}
        },

        handleSearchActivity: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("ACTIVITY", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        /*---*/

        onChangeTileName: function (oEvent) {
             var sValue = oEvent.getParameter("value"),
				oModel = controllerMainTile.model.getProperty("/tabMainTile"),
				sActualRowIndex = oEvent.getSource().getBindingContext().sPath.split("/")[2];

            for (var i = 0; i < oModel.length - 1; i++) {
                if (oModel[i]["TILE_NAME"] === sValue && i != sActualRowIndex) {
                    oEvent.getSource().setValue("");
                    return MessageToast.show(controller.oBundle.getText("controllerMainTile.sameTilePress"))
                }
            }
        },

        onChangeTilePress: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
				oModel = controllerMainTile.model.getProperty("/tabMainTile"),
				sActualRowIndex = oEvent.getSource().getBindingContext().sPath.split("/")[2];

            for (var i = 0; i < oModel.length - 1; i++) {
                if (oModel[i]["TILE_PRESS"] === sValue && i != sActualRowIndex) {
					oEvent.getSource().setValue("");
                    return MessageToast.show(controller.oBundle.getText("controllerMainTile.sameTilePress"))
                }
            }
        },

        onChangeOrderSection: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            if (sValue < 0) {
                sap.ui.getCore().getElementById(oEvent.getParameter("id")).setValue(0);
                return MessageToast.show(controller.oBundle.getText("controllerMainTile.valueGraterThanZero"))
            }
        },

        onChangePosition: function (oEvent) {
            var sValue = oEvent.getParameter("value");

            if (sValue < 0) {
                sap.ui.getCore().getElementById(oEvent.getParameter("id")).setValue(0);
                return MessageToast.show(controller.oBundle.getText("controllerMainTile.valueGraterThanZero"))
            }

            //TODO Eventuale riordinamento automatico?
        },

        updateTiles: function () {
			
			if(controllerMainTile.byId("tabMainTiles").getSelectionMode() !== "MultiToggle") {
				var input = {};
				var model = controllerMainTile.model.getProperty("/tabMainTile");
				var tileArray = [];

				for (var i = 0; i < model.length; i++) {
					if (model[i]["EDIT"] == "true") {
						tileArray.push(model[i]);
					}
				}

				//Check input Arr
				for (var i = 0; i < tileArray.length; i++) {
					if (tileArray[i]["ACTIVITY_ID"] === "") {
						return MessageToast.show(controller.oBundle.getText("controllerMainTile.missActivity"))
					}
					if (tileArray[i]["SECTION"] === "") {
						return MessageToast.show(controller.oBundle.getText("controllerMainTile.missSection"))
					}
					if (tileArray[i]["SITE_ID"] === "") {
						return MessageToast.show(controller.oBundle.getText("controllerMainTile.missSite"))
					}
					if (tileArray[i]["TILE_ICON"] === "") {
						return MessageToast.show(controller.oBundle.getText("controllerMainTile.missTileIcon"))
					}
					if (tileArray[i]["TILE_NAME"] === "") {
						return MessageToast.show(controller.oBundle.getText("controllerMainTile.missTileName"))
					}
					if (tileArray[i]["TILE_PRESS"] === "") {
						return MessageToast.show(controller.oBundle.getText("controllerMainTile.missTilePress"))
					}
				}

				input.DATA = JSON.stringify(tileArray);
				controllerMainTile.getDataSync("SAVE_DATA", "ADIGE7/MASTER_DATA/MAIN_TILE/TRANSACTION", input, controllerMainTile.updateTileSuccess, controllerMainTile.transactionError);
			}else{
				if(controllerMainTile.byId("tabMainTiles").getSelectedIndices().length === 0)
					return MessageToast.show(controller.oBundle.getText("controllerMainTile.selectOneRow"))
				
				Fragment.load({
					name: "master_data.view.popup.popupSiteList",
					controller: controllerMainTile
					}).then(function (oValueHelpDialogTmp) {
					controllerMainTile.model.setProperty("/siteList", JSON.parse(JSON.stringify(controllerSite.siteModel.getProperty("/tabSite"))))
					controllerMainTile._oValueHelpDialogSite = oValueHelpDialogTmp;
					controllerMainTile.getView().addDependent(controllerMainTile._oValueHelpDialogSite);				
					controllerMainTile._oValueHelpDialogSite.open();
				});
			}
	    },
		
		onSearchSite: function(oEvent){
            var oFilter = new Filter("SITE", FilterOperator.Contains, oEvent.getParameter("value"));
            oEvent.getSource().getBinding("items").filter([oFilter]);       
		},
		
		confirmSiteAndCloneMainTile: function(oEvent){
			if(oEvent.getParameters().selectedItems.length === 0){
				oEvent.preventDefault();
				MessageToast.show(controller.oBundle.getText("controllerMainTile.selectOneRow"))
			}else{
				var tileMainId = controllerMainTile.byId("tabMainTiles"),
					aSelTileMainIndices = tileMainId.getSelectedIndices(),
					oSelSiteItems = oEvent.getParameters().selectedItems,
					aFinalArr = [],
					tmpObj = {},
					input = {};
					
					for(var i in aSelTileMainIndices){
						for(var j in oSelSiteItems){
							tmpObj = JSON.parse(JSON.stringify(controllerMainTile.model.getProperty(tileMainId.getContextByIndex(aSelTileMainIndices[i]).sPath)));
							tmpObj["SITE_ID"] = controllerMainTile.model.getProperty(oSelSiteItems[j].getBindingContext().sPath)["SITE_ID"];
							aFinalArr.push(tmpObj);
							tmpObj = new Object;
						}
					}
					
				input.DATA = JSON.stringify(aFinalArr);
				controllerMainTile.getDataSync("SAVE_CLONE_DATA", "ADIGE7/MASTER_DATA/MAIN_TILE/TRANSACTION", input, controllerMainTile.updateCopySuccess, controllerMainTile.transactionError);
				
			}
			//Remove Filter Value
			oEvent.getSource().getBinding("items").filter([]);			
		},
		
		updateCopySuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);

            if (jsonArr[0]["RC"] != "0") {
                MessageBox.error(jsonArr[0]["MESSAGE"]);
            } else {
                MessageToast.show(controller.oBundle.getText("controllerMainTile.successfullySaved"));
				controllerMainTile.closeSiteDialog();
            }
        },
		
		closeSiteDialog: function(oEvent){
			//Remove Filter Value
			if(oEvent)
				oEvent.getSource().getBinding("items").filter([]);

			controllerMainTile._oValueHelpDialogSite.destroy();
			controllerMainTile._oValueHelpDialogSite = undefined;
			controllerMainTile.getData();
		},

        updateTileSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);

            if (jsonArr[0]["RC"] != "0") {
                MessageBox.error(jsonArr[0]["MESSAGE"]);
            } else {
                MessageToast.show(controller.oBundle.getText("controllerMainTile.successfullySaved"));
                controllerMainTile.getData();
            }
        },

        onChangeState: function (oEvent) {
            controllerMainTile.model.getProperty(oEvent.getSource().getBindingContext().sPath)["TILE_VISIBLE"] = oEvent.getSource().getState() + "";
        },

        ///-----------------Materiali------------------//
        //FUNZIONI RICERCA
        //FUNZIONI PER ESECUZIONI TRANSAZIONI
        getDataAsync: function (transaction, route, input, successFunc, errorFunc) {
            sap.ui.core.BusyIndicator.show();

            var transactionCall = route + "/" + transaction;

            input.TRANSACTION = transactionCall;
            input.OutputParameter = "JSON";

            try {
                var req = jQuery.ajax({
                    url: "/XMII/Runner",
                    data: input,
                    method: "POST",
                    dataType: "xml",
                    async: true
                });
                req.done(jQuery.proxy(successFunc, controllerMainTile));
                req.fail(jQuery.proxy(errorFunc, controllerMainTile));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },

        transactionError: function (error) {
            sap.ui.core.BusyIndicator.hide();

            console.error(error);
        },

        getDataSync: function (trans, rt, inp, suss, errf) {

            var transactionCall = rt + "/" + trans;

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
                req.done(jQuery.proxy(suss, controllerMainTile));
                req.fail(jQuery.proxy(errf, controllerMainTile));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },
        //FUNZIONI PER ESECUZIONI TRANSAZIONI
    });
});
