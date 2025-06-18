var controllerDC;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/m/MessageToast',
        "sap/m/MessageBox",
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
		'sap/ui/export/library',
        'sap/ui/export/Spreadsheet',
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator, exportLibrary, Spreadsheet) {
    "use strict";

    return Controller.extend("master_data.controller.WorkCenter", {
        dcModel: new sap.ui.model.json.JSONModel({
			"viewParamElements": {
				"visInputParam" : true,
				"enabledInputParam": false,
				"visDescriptionParam": true,
				"enabledDescriptionParam": false,
				"visParamType": true,
				"enabledParamType": false,				
				"visGroupParam": true,
				"enabledGroupParam": false,
				"visUdM": false,
				"enabledUdM": false,
				"visInputMin": false,
				"enabledInputMin": false,
				"visInputMax": false,
				"enabledInputMax": false,
				"visInputStd": false,
				"enabledInputStd": false,
				"visInputUri": false,
				"enabledInputUri": false,
				"visParamPageFooterBtn": true,
				"visAssignPageFooterBtn": false,
				"editMode": false,
				"editPopupParamGrp": false,
				"editPopupParamUom": false,
			},
			"viewCriticalItemElements": {
				"editMode": false
			},
			"paramDetails": {
				"PARAM_ID": "0",
				"PARAM": "",
				"PARAM_SEARCH_FIELD": "",
				"PARAM_DESCR": "",
				"PARAM_TYPE_ID": "",
				"PARAM_TYPE": "",				
				"PARAM_GROUP_ID": "0",
				"PARAM_GROUP": "",
				"UOM_ID": "0",
				"UOM": "",
				"PARAM_MIN": "",
				"PARAM_STD": "",
				"PARAM_MAX": "",
				"PARAM_URI": "",
				"PARAM_ORD": "",
				"IS_USED": "false",
				"SITE_ID": ""
			},
			"paramlist": [],
			"tabDescrParam": [],
			"tabParamGrplist": [],
			"tableOpDCMaterial": [],
			"Phasecombo": [],
			"DatacollectorParameterCombo": [],
			"filterOpDCPhaseCombo": [],
			"isPopupMode": false,
			"sRowParPath": ""
		}),
        _oValueHelpDialog: undefined,

        onInit: function () {
            controllerDC = this;
            controllerDC.getView().setModel(controllerDC.dcModel);
            controllerDC.dcModel.setSizeLimit(50000);
        },

        setModelProperty: function(sPath, oValue){
			controllerDC.dcModel.setProperty(sPath, oValue);
		},	
		
		/*Refresh Data*/
		refreshParamData: function(oInput){
		   let aResult = controller.sendData("GET_PARAM_DATA", "DATACOLLECTION/TRANSACTION", oInput),
			   oParamData = aResult[0]["paramDetails"][0],
			   aParamType = aResult[0]["paramtype"];
		   
		   controllerDC.setModelProperty("/paramDetails", oParamData);
		   controllerDC.setModelProperty("/paramtype", aParamType);
		   
		   controllerDC.enabledFieldType(oParamData["PARAM_TYPE_ID"], oParamData["IS_USED"] === "false", false);
		},
		
		/*Funzione per Ricerca Parametro - Popup*/
		onSearchParam: function (oEvent) {           
			Fragment.load({
				name: "master_data.view.popup.dc.listparam2",
				controller: controllerDC
			}).then(function (oValueHelpDialogParam2) {
				controllerDC._oValueHelpDialog = oValueHelpDialogParam2;
				controllerDC.getView().addDependent(controllerDC._oValueHelpDialog);
				controllerDC.refreshParameterList();
				controllerDC._oValueHelpDialog.open();
			});            
        },
		
		refreshParameterList: function(){
			let oInput = {
					"SITE_ID": controller.SiteId,
					"LANGUAGE": controller.language
				};
			controllerDC.setModelProperty("/paramlist", controller.sendData("GET_LIST_PARAM", "DATACOLLECTION/TRANSACTION", oInput)["Rows"]);
		},
		
		onConfirmSearchParam: function (oEvent) {
			if(controllerDC.dcModel.getProperty("/isPopupMode")){
                controllerPhase.phaseModel.setProperty(controllerDC.dcModel.getProperty("/sRowParPath"), JSON.parse(JSON.stringify(controllerDC.dcModel.getProperty(oEvent.getSource().getSelectedContextPaths()[0]))));
                controllerDC.onClosePhaseControllerPopupParam();
            }else{
                let oModel = controllerDC.dcModel.getProperty(oEvent.getParameter("selectedItem").getBindingContext().sPath),
                oInput = {
                    "PARAM_ID": oModel["PARAM_ID"],
                    "LANGUAGE": controller.language
                };
                
               controllerDC.refreshParamData(oInput);
               controllerDC.setModelProperty("/viewParamElements/editMode", true);
               controllerDC.closePopup();
            }		   
        },		
		
		onSearchParamFilter: function (oEvent) {
            let sValue = controllerDC.dcModel.getProperty("/isPopupMode") ? oEvent.getParameter("newValue") : oEvent.getParameter("value"),
				oFilter =  new Filter("PARAMDESC", FilterOperator.Contains, sValue),
				oBinding = controllerDC.dcModel.getProperty("/isPopupMode") ? sap.ui.getCore().getElementById("paramList").getBinding("items") : oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
        },
		
		/*Funzione per Descrizione Parametro - Popup*/
		handleValueHelpParamDesc: function (oEvent) { 
			//TODO - Da verificare
			let Input = {
				"PARAM_ID": controllerDC.dcModel.getProperty("/paramDetails/PARAM_ID")
			};
			
			Fragment.load({
				name: "master_data.view.popup.dc.listparamdesc",
				controller: controllerDC
			}).then(function (oValueHelpDialogParamDesc) {
				controllerDC._oValueHelpDialog = oValueHelpDialogParamDesc;
				controllerDC.getView().addDependent(controllerDC._oValueHelpDialog);
				controllerDC.setModelProperty("/tabDescrParam", controller.sendData("GET_PARAM_DESC", "DATACOLLECTION/TRANSACTION", Input)["Rows"]);
				controllerDC._oValueHelpDialog.open();
			});            
        },

        confirmEditParamDescr: function () {
            let model = controllerDC.dcModel.getProperty("/tabDescrParam"),
				arrInput = [],
				countDel = 0;

            for (let i = 0; i < model.length; i++) {
                if (model[i].EDIT && model[i].LANGUAGE != "") {
                    for (let j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANGUAGE == model[j].LANGUAGE & model[j].DEL === false) {
                            return MessageBox.warning(controller.oBundle.getText("contrParamDesc.errParamDescMod"), {
                                styleClass:"sapUiSizeCompact"
                            });
                        }
                    }
                    arrInput.push(model[i]);
					
					if(model[i].DEL)
						countDel = countDel + 1;
					
                }
            }
			
			//Blocco nel caso non ci sia nulla da salvare
			if(arrInput.length === 0)
				return MessageToast.show(controller.oBundle.getText("contrSite.insertSite"))
			
			//Blocco in caso l'utente provi ad eliminare tutte le descrizioni
			if(model.length === countDel)
				return MessageToast.show(controller.oBundle.getText("contrSite.errMissSiteDescr"))
			
            let Input = {
                "DATA": JSON.stringify(arrInput)
            }, result = controller.sendData("SAVE_PARAM_DESC", "DATACOLLECTION/TRANSACTION", Input); //TODO - Da Realizzare

            if (!result || !Array.isArray(result) || result.length === 0) {
                return MessageBox.error("Invalid response from server.");
            }
        
            if (result[0].RC == "0") {
                controllerDC.closePopup();
                // Refresh Data
				let oInput = {
					"PARAM_ID": arrInput[0]["PARAMETER_ID"],
					"LANGUAGE": controller.language
				};
				
				controllerDC.refreshParamData(oInput);
            } else {
                MessageBox.warning(result[0].MESSAGE, {
                    styleClass: "sapUiSizeCompact"
                });
            }
        },

        newDescrParam: function () {
            let aRowModel = controllerDC.dcModel.getProperty("/tabDescrParam"),
				row = {
					"PARAMETER_ID": aRowModel[0]["PARAMETER_ID"],
					"LANG": "",
					"PARAM_DESCR": "",
					"IS_NEW": true,
					"DEL": false,
					"EDIT": true
				};
            aRowModel.push(row);
            controllerDC.dcModel.setProperty("/tabDescrParam", aRowModel);
        },
		
		onChangeDescription: function(oEvent){
			let oRowSel = controllerDC.dcModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["EDIT"] = true;
			// controllerDC.dcModel.refresh(true);
		},
		
		deleteDescrParam: function(oEvent){
			let oRowSel = controllerDC.dcModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["DEL"] = true;
			oRowSel["EDIT"] = true;
			controllerDC.dcModel.refresh(true);
		},
		
		/*Popup - Gruppo parametri */
        onOpenValueHelpGrp: function () {
            Fragment.load({
                name: "master_data.view.popup.dc.listparamgroup",
                controller: controllerDC
            }).then(function (oValueHelpDialogGrp) {
                controllerDC._oValueHelpDialog = oValueHelpDialogGrp;
                controllerDC.getView().addDependent(controllerDC._oValueHelpDialog);
                controllerDC.refreshParameterGroupList();
                controllerDC._oValueHelpDialog.open();
            });
        },
		
		refreshParameterGroupList: function(){
			controllerDC.setModelProperty("/tabParamGrp", controller.sendData("GET_PARAM_GRP_LIST", "DATACOLLECTION/TRANSACTION", {})["Rows"]);
			
			//Disable Buttons - Edit Mode
			sap.ui.getCore().getElementById("dlg_tabParType").setSelectionMode("Single");
            controllerDC.setModelProperty("/viewParamElements/editPopupParamGrp", false);
		},
       
        onSelectParamGroup: function (oEvent) {
			try {
				let oModSelRow = controllerDC.dcModel.getProperty(oEvent.getParameter("rowContext").sPath),
					oModParam = controllerDC.dcModel.getProperty("/paramDetails");
					
				//Change Model	
				oModParam["PARAM_GROUP_ID"] = oModSelRow["PARAM_GROUP_ID"];
                oModParam["PARAM_GROUP"] = oModSelRow["PARAM_GROUP"];				
				controllerDC.dcModel.refresh(true);
				controllerDC.closePopup();
            } catch (err) {}
        },

        handleSearchGrp: function (oEvent) {
            let sValue = oEvent.getParameter("newValue"),
				oFilter = new Filter("PARAM_GROUP", FilterOperator.Contains, sValue),
				oBinding = sap.ui.getCore().getElementById("dlg_tabParType").getBinding();
            oBinding.filter([oFilter]);
        },
		
		addParType: function () {

			let oSearchField = sap.ui.getCore().byId("searchFieldGrp");
			if(oSearchField){
				oSearchField.setValue("");
			}

			let oTable = sap.ui.getCore().byId("dlg_tabParType");
			if (oTable) {
				var oBinding = oTable.getBinding();
				if (oBinding) {
					oBinding.filter([]);
				}
			} 

            let addRowModel = controllerDC.dcModel.getProperty("/tabParamGrp"),
				oRow = {
					"PARAM_GROUP_ID": "0",
					"PARAM_GROUP": "",
					"EDIT": true,
					"DEL": false,
					"IS_USED": false
				},
				aNewArr = [];
				
            if (!addRowModel) {
                aNewArr.unshift(oRow);
                controllerDC.setModelProperty("/tabParamGrp", aNewArr);
            } else {
                if (addRowModel.length === 0) {
                    aNewArr.unshift(oRow);
                    controllerDC.setModelProperty("/tabParamGrp", aNewArr);
                } else {
					addRowModel.unshift(oRow);
                    controllerDC.setModelProperty("/tabParamGrp", addRowModel);
                }
            }

            //Enable Buttons - Edit Mode
            controllerDC.setModelProperty("/viewParamElements/editPopupParamGrp", true);

            //Scroll to first table Element
			sap.ui.getCore().getElementById("dlg_tabParType").setSelectionMode("None");
            sap.ui.getCore().getElementById("dlg_tabParType").setFirstVisibleRow(0);
        },
		
		onChangeParamGroup: function(oEvent){
			let oRowSel = controllerDC.dcModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["EDIT"] = true;
			// controllerDC.dcModel.refresh(true);
			
			//Enable Buttons - Edit Mode
			sap.ui.getCore().getElementById("dlg_tabParType").setSelectionMode("None");
            controllerDC.setModelProperty("/viewParamElements/editPopupParamGrp", true);
		},
		
		deleteParamGroup: function(oEvent){
			let oRowSel = controllerDC.dcModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["DEL"] = true;
			oRowSel["EDIT"] = true;
			controllerDC.dcModel.refresh(true);
			
			//Enable Buttons - Edit Mode
			sap.ui.getCore().getElementById("dlg_tabParType").setSelectionMode("None");
            controllerDC.setModelProperty("/viewParamElements/editPopupParamGrp", true);
		},
		
		confirmEditParamGroup: function(){
			let aModel = controllerDC.dcModel.getProperty("/tabParamGrp"),
				arrInput = []

            for (let i = 0; i < aModel.length; i++) {
                if (aModel[i].EDIT) {  
					if(aModel[i].DEL && aModel[i]["PARAM_GROUP_ID"] === "0"){
						//Elemento non salvato nel DB. Inutile procedere con la cancellazione lato transazione
					}else{
						arrInput.push(aModel[i]);
					}
                }
            }

            let oInput = {
                "DATA": JSON.stringify(arrInput)
            }, aResult = controller.sendData("SAVE_PARAM_GRP", "DATACOLLECTION/TRANSACTION", oInput); //TODO - Da Realizzare

            if (!aResult || !Array.isArray(aResult) || aResult.length === 0) {
                return MessageBox.error("Invalid response from server.");
            }
        
            if (aResult[0].RC == "0") {
                //Refresh Data
				controllerDC.refreshParameterGroupList();
            } else {
                MessageBox.error(aResult[0].MESSAGE, {styleClass: "sapUiSizeCompact"});
            }			
		},

		/*Popup - Edit UoM */
		handleValueHelpParamUom: function () {
            Fragment.load({
                name: "master_data.view.popup.dc.editUom",
                controller: controllerDC
            }).then(function (oValueHelpDialogGrp) {
                controllerDC._oValueHelpDialog = oValueHelpDialogGrp;
                controllerDC.getView().addDependent(controllerDC._oValueHelpDialog);
                controllerDC.refreshParameterUom();
                controllerDC._oValueHelpDialog.open();
            });
        },

		refreshParameterUom: function(){			
			controllerDC.setModelProperty("/tabParamUom", controller.sendData("GET_PARAM_UOM", "DATACOLLECTION/TRANSACTION", {})["Rows"]);
			
			//Disable Buttons - Edit Mode
			sap.ui.getCore().getElementById("tabUom").setSelectionMode("Single");
            controllerDC.setModelProperty("/viewParamElements/editPopupParamUom", false);
		},

		onSelectParamUom: function (oEvent) {
			try {
				let oModSelRow = controllerDC.dcModel.getProperty(oEvent.getParameter("rowContext").sPath),
					oModParam = controllerDC.dcModel.getProperty("/paramDetails");
					
				//Change Model	
				oModParam["UOM_ID"] = oModSelRow["UOM_ID"];
                oModParam["UOM"] = oModSelRow["UOM"];				
				controllerDC.dcModel.refresh(true);
				controllerDC.closePopup();
            } catch (err) {}
        },

		handleSearchUom: function (oEvent) {
            let sValue = oEvent.getParameter("newValue"),
				oFilter = new Filter("UOM", FilterOperator.Contains, sValue),
				oBinding = sap.ui.getCore().getElementById("tabUom").getBinding();
            oBinding.filter([oFilter]);
        },

		addParUom: function () {
			let oSearchField = sap.ui.getCore().byId("searchFieldUom");
			if(oSearchField){
				oSearchField.setValue("");
			}

			let oTable = sap.ui.getCore().byId("tabUom");
			if (oTable) {
				var oBinding = oTable.getBinding();
				if (oBinding) {
					oBinding.filter([]);
				}
			} 

            let addRowModel = controllerDC.dcModel.getProperty("/tabParamUom"),
				oRow = {
					"UOM_ID": "0",
					"UOM": "",
					"EDIT": true,
					"DEL": false,
					"IS_USED": false
				},
				aNewArr = [];
				
            if (!addRowModel) {
                aNewArr.unshift(oRow);
                controllerDC.setModelProperty("/tabParamUom", aNewArr);
            } else {
                if (addRowModel.length === 0) {
                    aNewArr.unshift(oRow);
                    controllerDC.setModelProperty("/tabParamUom", aNewArr);
                } else {
					addRowModel.unshift(oRow);
                    controllerDC.setModelProperty("/tabParamUom", addRowModel);
                }
            }

            //Enable Buttons - Edit Mode
            controllerDC.setModelProperty("/viewParamElements/editPopupParamUom", true);

            //Scroll to first table Element
			sap.ui.getCore().getElementById("tabUom").setSelectionMode("None");
            sap.ui.getCore().getElementById("tabUom").setFirstVisibleRow(0);
        },

		onChangeParamUom: function(oEvent){
			let oRowSel = controllerDC.dcModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["EDIT"] = true;
			// controllerDC.dcModel.refresh(true);
			
			//Enable Buttons - Edit Mode
			sap.ui.getCore().getElementById("tabUom").setSelectionMode("None");
            controllerDC.setModelProperty("/viewParamElements/editPopupParamUom", true);
		},

		deleteParamUom: function(oEvent){
			let oRowSel = controllerDC.dcModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["DEL"] = true;
			oRowSel["EDIT"] = true;
			controllerDC.dcModel.refresh(true);
			
			//Enable Buttons - Edit Mode
			sap.ui.getCore().getElementById("tabUom").setSelectionMode("None");
            controllerDC.setModelProperty("/viewParamElements/editPopupParamUom", true);
		},

		confirmEditParamUom: function(){
			let aModel = controllerDC.dcModel.getProperty("/tabParamUom"),
				arrInput = []

            for (let i = 0; i < aModel.length; i++) {
                if (aModel[i].EDIT) {  
					if(aModel[i].DEL && aModel[i]["UOM_ID"] === "0"){
						//Elemento non salvato nel DB. Inutile procedere con la cancellazione lato transazione
					}else{
						arrInput.push(aModel[i]);
					}
                }
            }

            let oInput = {
                "DATA": JSON.stringify(arrInput)
            }, aResult = controller.sendData("SAVE_PARAM_UOM", "DATACOLLECTION/TRANSACTION", oInput); //TODO - Da Realizzare

            if (!aResult || !Array.isArray(aResult) || aResult.length === 0) {
                return MessageBox.error("Invalid response from server.");
            }
        
            if (aResult[0].RC == "0") {
                //Refresh Data
				controllerDC.refreshParameterUom();
            } else {
                MessageBox.error(aResult[0].MESSAGE, {styleClass: "sapUiSizeCompact"});
            }			
		},
		
		
		/*General Function*/
		closePopup: function(){
			try{
				controllerDC._oValueHelpDialog.close();
				controllerDC._oValueHelpDialog.destroy();
				controllerDC._oValueHelpDialog = undefined;
			}catch(err){}

		},
		
		onChangeType: function (oEvent) {
			//Reset Fields value			
			let oViewElements = controllerDC.dcModel.getProperty("/viewParamElements"),
				oParamModel = controllerDC.dcModel.getProperty("/paramDetails");
			
			oParamModel["UOM_ID"] = "";	
			oParamModel["UOM"] = "";
			oParamModel["PARAM_MIN"] = "";
			oParamModel["PARAM_MAX"] = "";
			oParamModel["PARAM_STD"] = "";
			oParamModel["PARAM_URI"] = "";
			
            switch (oEvent.oSource.mProperties.selectedKey) {
				//Booleano
				case "1":
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//Numero con Massimo e Minimo
				case "2":
					oViewElements["visUdM"] = true;
					oViewElements["enabledUdM"] = true;
					oViewElements["visInputMin"] = true;
					oViewElements["enabledInputMin"] = true;
					oViewElements["visInputMax"] = true;
					oViewElements["enabledInputMax"] = true;
					oViewElements["visInputStd"] = true;
					oViewElements["enabledInputStd"] = true;
					oViewElements["visInputUri"] = false;
					break;
				//Testo	
				case "3":
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//Booleano con soglia	
				case "4":
					oViewElements["visUdM"] = true;
					oViewElements["enabledUdM"] = true;
					oViewElements["visInputMin"] = true;
					oViewElements["enabledInputMin"] = true;
					oViewElements["visInputMax"] = true;
					oViewElements["enabledInputMax"] = true;
					oViewElements["visInputStd"] = true;
					oViewElements["enabledInputStd"] = true;
					oViewElements["visInputUri"] = false;
					break;				
				//Materiale Critico	
				case "6":
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//URL	
				case "7":
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = true;
					oViewElements["enabledInputUri"] = true;
					break;
				//Booleano a 3 Stati - OK/NOK/NA
				case "8":					
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				default:
					oViewElements["visUdM"] = false;
					oViewElements["enabledUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["enabledInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["enabledInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["enabledInputStd"] = false;
					oViewElements["visInputUri"] = false;
					oViewElements["enabledInputUri"] = false;
				}
				
			controllerDC.setModelProperty("/paramDetails", oParamModel);	
			controllerDC.setModelProperty("/viewParamElements", oViewElements);			
        },
		
		enabledFieldType: function (sType, bEdit, bResetFields) {
			//Reset Fields value			
			let oViewElements = controllerDC.dcModel.getProperty("/viewParamElements");
			
            switch (sType) {
				//Booleano
				case "1":					
					oViewElements["enabledInputParam"] = bEdit;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = bEdit;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//Numero con Massimo e Minimo
				case "2":
					oViewElements["enabledInputParam"] = bEdit;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = bEdit;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visUdM"] = true;
					oViewElements["enabledUdM"] = bEdit;
					oViewElements["visInputMin"] = true;
					oViewElements["enabledInputMin"] = bEdit;
					oViewElements["visInputMax"] = true;
					oViewElements["enabledInputMax"] = bEdit;
					oViewElements["visInputStd"] = true;
					oViewElements["enabledInputStd"] = bEdit;
					oViewElements["visInputUri"] = false;
					oViewElements["enabledInputUri"] = false;
					break;
				//Testo	
				case "3":
					oViewElements["enabledInputParam"] = bEdit;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = bEdit;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//Booleano con soglia	
				case "4":
				    oViewElements["enabledInputParam"] = bEdit;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = bEdit;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visUdM"] = true;
					oViewElements["enabledUdM"] = bEdit;
					oViewElements["visInputMin"] = true;
					oViewElements["enabledInputMin"] = bEdit;
					oViewElements["visInputMax"] = true;
					oViewElements["enabledInputMax"] = bEdit;
					oViewElements["visInputStd"] = true;
					oViewElements["enabledInputStd"] = bEdit;
					oViewElements["visInputUri"] = false;
					break;				
				//Materiale Critico	
				case "6":
				    oViewElements["enabledInputParam"] = bEdit;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = bEdit;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//URL	
				case "7":
				    oViewElements["enabledInputParam"] = bEdit;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = bEdit;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["enabledInputStd"] = false;
					oViewElements["visInputUri"] = true;
					oViewElements["enabledInputUri"] = bEdit;
					break;
				//Booleano a 3 Stati - OK/NOK/NA
				case "8":					
					oViewElements["enabledInputParam"] = bEdit;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = bEdit;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//NEW PARAM	
				case "NEW":
				    oViewElements["enabledInputParam"] = true;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["enabledParamType"] = true;
					oViewElements["enabledGroupParam"] = true;
					oViewElements["visInputParam"] = true;
					oViewElements["visDescriptionParam"] = true;
					oViewElements["enabledDescriptionParam"] = true;
					oViewElements["visParamType"] = true;
					oViewElements["enabledParamType"] = bEdit;				
					oViewElements["visGroupParam"] = true;
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				//CLOSE PARAM	
				case "CLOSE":
					oViewElements["enabledInputParam"] = false;
					oViewElements["enabledDescriptionParam"] = false;
					oViewElements["enabledParamType"] = false;
					oViewElements["enabledGroupParam"] = false;
					oViewElements["visInputParam"] = true;
					oViewElements["visDescriptionParam"] = true;
					oViewElements["enabledDescriptionParam"] = false;
					oViewElements["visParamType"] = true;					
					oViewElements["visGroupParam"] = true;
					oViewElements["enabledGroupParam"] = false;
					oViewElements["visUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["visInputUri"] = false;
					break;
				default:
					oViewElements["enabledInputParam"] = false;
					oViewElements["enabledDescriptionParam"] = false;
					oViewElements["enabledParamType"] = false;
					oViewElements["enabledGroupParam"] = false;
					oViewElements["visUdM"] = false;
					oViewElements["enabledUdM"] = false;
					oViewElements["visInputMin"] = false;
					oViewElements["enabledInputMin"] = false;
					oViewElements["visInputMax"] = false;
					oViewElements["enabledInputMax"] = false;
					oViewElements["visInputStd"] = false;
					oViewElements["enabledInputStd"] = false;
					oViewElements["visInputUri"] = false;
					oViewElements["enabledInputUri"] = false;
				}
					
			controllerDC.setModelProperty("/viewParamElements", oViewElements);	
			
			if(bResetFields)
				controllerDC.resetParamDetailModel();
        },
		
		resetParamDetailModel: function(){
			controllerDC.dcModel.setProperty("/paramDetails",{
				"PARAM_ID": "0",
				"PARAM": "",
				"PARAM_SEARCH_FIELD": "",
				"PARAM_DESCR": "",
				"PARAM_TYPE_ID": "",
				"PARAM_TYPE": "",
				"PARAM_GROUP_ID": "0",
				"PARAM_GROUP": "",
				"UOM_ID": "0",
				"UOM": "",
				"PARAM_MIN": "",
				"PARAM_STD": "",
				"PARAM_MAX": "",
				"PARAM_URI": "",
				"PARAM_ORD": "",
				"IS_USED": "false",
				"SITE_ID": controller.SiteId
			});
			
		},
		
		/*New Param*/
		newParam: function (isNewParam) {
            controllerDC.enabledFieldType(isNewParam ? "NEW" : "CLOSED", isNewParam, true);
			//Get Value for Combo
			if(isNewParam){
				controllerDC.getValueForCombo();
			}
			
			controllerDC.setModelProperty("/viewParamElements/editMode", isNewParam);
			if(controllerDC.dcModel.getProperty("/isPopupMode")){
				controllerDC.refreshParameterList();
				sap.ui.getCore().getElementById("paramNavContainer").to(isNewParam ? "paramEditPage2": "paramListPage1");
			}

        },
		
		/*Change Page*/
		pressTabBar: function(oEvent){
			let sParge = oEvent.getParameter("section").sId.split("--")[1];
			 switch (sParge) {
				case "PARAM":
					controllerDC.newParam(false);
					controllerDC.setModelProperty("/viewParamElements/visParamPageFooterBtn", true);
					controllerDC.setModelProperty("/viewParamElements/visAssignPageFooterBtn", false);
				break;	
				case "ASSIGN_PHASE":
					controllerDC.refreshOpDCMaterial();
					controllerDC.setModelProperty("/viewParamElements/visParamPageFooterBtn", false);
					controllerDC.setModelProperty("/viewParamElements/visAssignPageFooterBtn", true);
				break;
				default:
					controllerDC.newParam("CLOSED");
					controllerDC.setModelProperty("/viewParamElements/visParamPageFooterBtn", true);
					controllerDC.setModelProperty("/viewParamElements/visAssignPageFooterBtn", false);
			 }
		},
		
		/*Get Combo Vale*/
		getValueForCombo: function () {
               controllerDC.setModelProperty("/paramtype", controller.sendData("GET_VALUE_FOR_COMBO", "DATACOLLECTION/TRANSACTION", {LANGUAGE: controller.language}));
		},
		
		/*Export Parameter*/
		downloadParam: function(){	
			 try{	
				let aCols = controllerDC.createColumnExportParameters(),
					oSettings = {
							workbook: {
								columns: aCols,
								context: {
									sheetName: controllerDC.dcModel.getProperty("/paramDetails/PARAM")
								}
							},
							dataSource: [controllerDC.dcModel.getProperty("/paramDetails")],
							fileName:  controller.oBundle.getText("viewPhase.download")
						},      
					oSheet = new Spreadsheet(oSettings);
					
                oSheet.build().then(function () {}).finally(function () {
                    oSheet.destroy();
                });
            } catch (err) {}
		},
		
		createColumnExportParameters: function () {
            return [{
                    label: 'TIPO_RACCOLTA_DATI',
                    property: 'PARAM_TYPE',
                    type: exportLibrary.EdmType.Number,
					width: '7',
					textAlign: 'begin'
                },{
                    label: 'PARAMETRO',
					property: 'PARAM',
					type: exportLibrary.EdmType.String,
					width: '10',
					textAlign: 'begin'
                }, {
                    label: 'DESCRIZIONE_PARAMETRO',
                    property: 'PARAM_DESCR',
                    type: exportLibrary.EdmType.String,
					wrap: true,
					width: '60',
					textAlign: 'begin'
                }, {
                    label: 'UM',
                    property: 'UOM',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }, {
                    label: 'MINIMO',
                    property: 'PARAM_MIN',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }, {
                    label: 'MASSIMO',
                    property: 'PARAM_MAX',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }, {
                    label: 'VALORE_STANDARD',
                    property: 'PARAM_STD',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }, {
                    label: 'ORDINAMENTO_PARAMETRI',
                    property: 'PARAM_ORD',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }, {
                    label: 'RAGGRUPPAMENTO_PARAMETRI',
                    property: 'PARAM_GROUP',
                    type: exportLibrary.EdmType.String,
					width: '20',
					wrap: true,
					textAlign: 'begin'
                }]
		},

		/*Save New Param*/
		saveNewParam: function () {

			let oModeParam = controllerDC.dcModel.getProperty("/paramDetails"),
				oInput = {DATA: JSON.stringify([oModeParam]), LANGUAGE: controller.language};

			if (oModeParam["PARAM"] === "") {
				return MessageBox.warning(controller.oBundle.getText("viewDC.warnmissparamname"))
			}
			if (oModeParam["PARAM_DESCR"] === "") {
				return MessageBox.warning(controller.oBundle.getText("viewDC.warnmissparamdesc"))
			}
			if (oModeParam["PARAM_TYPE_ID"] === "") {
				return MessageBox.warning(controller.oBundle.getText("viewDC.warnmissparamtype"))
			}
			if (oModeParam["PARAM_GROUP"] === "") {
				return MessageBox.warning(controller.oBundle.getText("viewDC.warnmissgrouptype"))
			};

			let aResult = controller.sendData("SAVE_PARAM", "DATACOLLECTION/TRANSACTION", oInput);

            if (!aResult || !Array.isArray(aResult) || aResult.length === 0) {
                return MessageBox.error("Invalid response from server.");
            }
        
            if (aResult[0].RC == "0") {
                //Close Parameter
				controllerDC.newParam(false);
				MessageToast.show(controller.oBundle.getText("viewDC.saveParam"));
            } else {
                MessageBox.error(aResult[0].MESSAGE, {styleClass: "sapUiSizeCompact"});
            }	

		},

		/*Delete Param*/
		deleteParam: function () {
			let oModeParam = controllerDC.dcModel.getProperty("/paramDetails"),
				oInput = {PARAM_ID: oModeParam.PARAM_ID};
			
			MessageBox.confirm(controller.oBundle.getText("viewDC.deletparam") + " " + oModeParam.PARAM + "?", {
				onClose: function (evt) {
					if (evt === "OK") {
						try {
							let aResult = controller.sendData("DELETE_PARAM", "DATACOLLECTION/TRANSACTION", oInput);
							
							if (!aResult || !Array.isArray(aResult) || aResult.length === 0) {
								MessageBox.error("Invalid response from server.");
								return;
							}
						
							if (aResult[0].RC === "0") {
								controllerDC.newParam(false);
								MessageToast.show(controller.oBundle.getText("viewDC.deleParam"));
							} else {
								MessageBox.error(aResult[0].MESSAGE);
							}
						} catch (error) {
							MessageBox.error("Error deleting parameter");
						}
					}
				}
			});
		},

		/*------------------------------------------------------------*/
		/* DC Critical Material to Phase */

        newOpDCMaterial: function () {
			let addRowModel = controllerDC.dcModel.getProperty("/tableOpDCMaterial"),
				row = {
					"OP_DC_MATERIAL_ID": "",
					"PHASE_ID": "",
					"PARAMETER_ID": "",
					"JSON_PARAM": [],
					"SEND_TRIGGER": "",
					"EDIT": true,
					"DEL": false
				},
				aNewArr = [],
				oInput = {
					"SITE_ID": controller.SiteId,
					"LANGUAGE": controller.language
				};
		
			if (!addRowModel) {
				aNewArr.push(row);
				controllerDC.dcModel.setProperty("/tableOpDCMaterial", aNewArr);
			} else {
				if (addRowModel.length === 0) {
					aNewArr.push(row);
					controllerDC.dcModel.setProperty("/tableOpDCMaterial", aNewArr);
				} else {
					var addArr = controllerDC.dcModel.getProperty("/tableOpDCMaterial");
					addArr.push(row);
					controllerDC.dcModel.setProperty("/tableOpDCMaterial", addArr);
				}
			}
		
			//Refresh Combo Values
			let aResult = controller.sendData("GET_VALUE_FOR_COMBO_OP_DC", "DATACOLLECTION/TRANSACTION", oInput);
			if (aResult) {
				controllerDC.setModelProperty("/Phasecombo", aResult[0]["AllPhase"]);
				controllerDC.setModelProperty("/DatacollectorCombo", aResult[0]["AllDCCriticalItem"]);
			}
		
			//Buttons
			controllerDC.setModelProperty("/viewCriticalItemElements/editMode", true);
		
			//Scroll to last table Element
			controllerDC.byId("tableOpDCMaterial").setFirstVisibleRow(addRowModel.length);
		},


		refreshOpDCMaterial: function () {
			//Filtro Fase
			let selPhaseKey = controllerDC.byId("filterOpDCPhase").getSelectedKeys(),
				phaseFilter = "", 
				oInput = {
					"SITE_ID": controller.SiteId,
					"LANGUAGE": controller.language
				};
		
			if (selPhaseKey.length !== 0) {
				phaseFilter = "(";
				for (let i in selPhaseKey) {
					phaseFilter = phaseFilter + "'" + selPhaseKey[i] + "',";
				}
				phaseFilter = phaseFilter.substring(0, phaseFilter.length - 1);
				phaseFilter = phaseFilter + ")";
				oInput.PHASE_ID = phaseFilter;
			}

			// Aggiorna i valori delle combo
			controllerDC.setModelProperty("/Phasecombo", controller.sendData("GET_VALUE_FOR_COMBO_OP_DC", "DATACOLLECTION/TRANSACTION", oInput)[0]["AllPhase"]);
			controllerDC.setModelProperty("/DatacollectorParameterCombo", controller.sendData("GET_VALUE_FOR_COMBO_OP_DC", "DATACOLLECTION/TRANSACTION", oInput)[0]["AllDCCriticalItem"]);
			
			// Aggiorna la tabella
			let aResult = controller.sendData("GET_OPERATON_DC_MATERIAL", "DATACOLLECTION/TRANSACTION", oInput),
				aDistinctPhase = [], 
				oTempPhase = {}, 
				insertElement = true;

			if (aResult && aResult["Rows"]) {
				for(var i in aResult["Rows"]){					
					//Popolo il modello del filtro per Fase
					for(var j in aDistinctPhase){
						if(aDistinctPhase[j]["PHASE_ID"] === aResult["Rows"][i]["PHASE_ID"]){
							insertElement = false;
							break;
						}
					}
					if(insertElement){
						oTempPhase.PHASE_ID = aResult["Rows"][i]["PHASE_ID"];
						oTempPhase.PHASE = aResult["Rows"][i]["PHASE"];
						aDistinctPhase.push(oTempPhase);
						oTempPhase = new Object;
					}
				}
				
				controllerDC.setModelProperty("/tableOpDCMaterial", aResult["Rows"]);
				controllerDC.setModelProperty("/filterOpDCPhaseCombo", aDistinctPhase);

				//Buttons
				controllerDC.setModelProperty("/viewCriticalItemElements/editMode", false);
			}
		},
		
		removeOpDCPhaseFilters: function(){
			controllerDC.byId("filterOpDCPhase").setSelectedKeys();
            controllerDC.refreshOpDCMaterial();
		},

        onChangePhase: function (oEvent) {},

        onChangeParameter: function (oEvent) {},

        deleteOpDCMaterial: function (oEvent) {
            var lineSel = controllerDC.dcModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            controllerDC.dcModel.refresh();

            //Buttons
            controllerDC.setModelProperty("/viewCriticalItemElements/editMode", true);
        },
		
		editOpDCMaterial: function(oEvent){
			var lineSel = controllerDC.dcModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = true;
			lineSel.DEL = false;
            controllerDC.dcModel.refresh();

            //Buttons
            controllerDC.setModelProperty("/viewCriticalItemElements/editMode", true);
		},
		
        saveOpDCMaterial: function () {
			let model = controllerDC.dcModel.getProperty("/tableOpDCMaterial"),
				modInput = [],
				obj = {},
				oInput = {
					"SITE_ID": controller.SiteId
				};
		
			for (let i = 0; i < model.length; i++) {
				if (model[i].PHASE_ID == "") {
					return MessageBox.warning(controller.oBundle.getText("controllerDC.missingoperation"))
				}
				if (model[i].PARAMETER_ID == "") {
					return MessageBox.warning(controller.oBundle.getText("controllerDC.parameter"))
				}
				if (model[i].SEND_TRIGGER == "") {
					return MessageBox.warning(controller.oBundle.getText("controllerDC.missingSendingTrigger"))
				}
				if (model[i].EDIT === true || model[i].DEL === true) {
					obj.OP_DC_MATERIAL_ID = model[i].OP_DC_MATERIAL_ID;
					obj.PHASE_ID = model[i].PHASE_ID;
					obj.PARAMETER_ID = model[i].PARAMETER_ID;
					obj.SEND_TRIGGER = model[i].SEND_TRIGGER;
					obj.DEL = model[i].DEL;
					modInput.push(obj);
					obj = new Object;
				}
			}
			
			oInput.DATA = JSON.stringify(modInput);
			
			let aResult = controller.sendData("SAVE_OPERATION_DC_MATERIAL", "DATACOLLECTION/TRANSACTION", oInput);
			
			if (!aResult || !Array.isArray(aResult) || aResult.length === 0) {
				return MessageBox.error("Invalid response from server.");
			}
		
			if (aResult[0].RC == "0") {
				controllerDC.refreshOpDCMaterial();
				MessageToast.show(controller.oBundle.getText("viewMail.attach.result"));
			} else {
				MessageBox.error(aResult[0].MESSAGE);
			}
		},

		/*Popup ControllerPhase */

		backListParamPopup: function () { 
			sap.ui.getCore().getElementById("paramNavContainer").to("paramListPage1");
		},

		onEditParamInPhase: function (oEvent) { 
			let oModel = controllerDC.dcModel.getProperty(oEvent.getSource().getBindingContext().sPath),
                oInput = {
                    "PARAM_ID": oModel["PARAM_ID"],
                    "LANGUAGE": controller.language
                };
                
           controllerDC.refreshParamData(oInput);
           controllerDC.setModelProperty("/viewParamElements/editMode", true);
           sap.ui.getCore().getElementById("paramNavContainer").to("paramEditPage2");
		},
		
		onClosePhaseControllerPopupParam: function(){
			controllerDC._oValueHelpDialogPopupParam.close();
			controllerDC._oValueHelpDialogPopupParam.destroy();
			controllerDC._oValueHelpDialogPopupParam = undefined;
		}
		
    });
});