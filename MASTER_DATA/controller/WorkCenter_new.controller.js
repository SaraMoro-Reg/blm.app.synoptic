var controllerWorkCenter;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/m/MessageToast',
        "sap/m/MessageBox",
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.WorkCenter", {
        wrkModel: new sap.ui.model.json.JSONModel({
            "currentSite": controller.site,
            "wrkDetails": {
                "PARENTWORKCENTER": "",
                "PARENTWORKCENTER_ID": "",
                "SITE_ID": "",
                "STATUS_ID": "",
                "WORKCENTER": "",
                "WORKCENTERTYPE": "",
                "WORKCENTERTYPE_DESC": "",
                "WORKCENTERTYPE_ID": "",
                "WORKCENTER_AUTHOMA": "",
                "WORKCENTER_DESC": "",
                "WORKCENTER_ID": "0",
                "IS_USED": false
            },
            "viewWrkElements": {
                "enabledWrkField": false,
                "enabledDescrWrkField": false,
                "enabledWrkType": false,
                "enabledWrkParent": false,
                "enabledWrkStatus": false,
                "enabledWrkAutomha": false,
                "visWrkPageFooterBtn": true,
                "editMode": false
            },
            tabwrklistExport: [],
            tabwrklist: [],
            tabwrktype: [],
            tabwrkStatus: [],
            "viewWrkTypeElements": {
                "visWrkTypePageFooterBtn": false,
                "editMode": false
            },
            "viewWrkHoursElements": {
                "visWrkHoursPageFooterBtn": false,
                "editMode": false
            },
            tabWrkHours: [],
            "viewWrkSynopticElements": {
                "visAdigeSynopticPageFooterBtn": false,
                "visAdigeStr1SynopticPageFooterBtn": false,
                "visBgs1SynopticPageFooterBtn": false,
                "visBgs2SynopticPageFooterBtn": false,
                "visAdigeSys1SysSynopticPageFooterBtn": false,
                "visAdigeSys2SysSynopticPageFooterBtn": false,
                "visAdigeSys3SysSynopticPageFooterBtn": false,
                "visBgusaSynopticPageFooterBtn": false,
                "visBlm1SynopticPageFooterBtn": false,
                "visBlm2SynopticPageFooterBtn": false,
                "visBlm3SynopticPageFooterBtn": false,
                "visBlm4SynopticPageFooterBtn": false,
                "editMode": false
            }
        }),
        _oValueHelpDialog: undefined,
        rowSelTabWrkHours: "",

        onInit: function () {
            controllerWorkCenter = this;
            controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            controllerWorkCenter.wrkModel.setSizeLimit(10000);
        },

        /* Gestisce il cambio di tab nell'ObjectPageLayout */
        pressWkcTabBar: function (oEvent) {
            // sezione di default
            let sPage = "WKC";
            
            if (oEvent && oEvent.getParameter) {
                sPage = oEvent.getParameter("section").sId.split("--")[1];
            }
            
            let viewWrkElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkElements");
            let viewWrkTypeElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkTypeElements");
            let viewWrkHoursElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkHoursElements");
            let viewWrkSynopticElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkSynopticElements");
            
            // Reset di tutti i footer
            viewWrkElements.visWrkPageFooterBtn = false;
            viewWrkTypeElements.visWrkTypePageFooterBtn = false;
            viewWrkHoursElements.visWrkHoursPageFooterBtn = false;
            
            // Reset di tutti i footer synoptic
            Object.keys(viewWrkSynopticElements).forEach(key => {
                if (key.includes("FooterBtn")) {
                    viewWrkSynopticElements[key] = false;
                }
            });
        
            // Imposta il footer corretto in base alla sezione attiva
            switch (sPage) {
                case "WKC":
                    viewWrkElements.visWrkPageFooterBtn = true;
                    break;
                case "WKC_TYPE":
                    viewWrkTypeElements.visWrkTypePageFooterBtn = true;
                    break;
                case "WKC_HOURS":
                    viewWrkHoursElements.visWrkHoursPageFooterBtn = true;
                    break;
                case "SYNOPTIC":
                    viewWrkSynopticElements.visAdigeSynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICADIGESTR1":
                    viewWrkSynopticElements.visAdigeStr1SynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICBGS1":
                    viewWrkSynopticElements.visBgs1SynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICBGS2":
                    viewWrkSynopticElements.visBgs2SynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICADIGESYS1":
                    viewWrkSynopticElements.visAdigeSys1SysSynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICADIGESYS2":
                    viewWrkSynopticElements.visAdigeSys2SysSynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICADIGESYS3":
                    viewWrkSynopticElements.visAdigeSys3SysSynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICBGUSA":
                    viewWrkSynopticElements.visBgusaSynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICBLM1":
                    viewWrkSynopticElements.visBlm1SynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICBLM2":
                    viewWrkSynopticElements.visBlm2SynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICBLM3":
                    viewWrkSynopticElements.visBlm3SynopticPageFooterBtn = true;
                    break;
                case "SYNOPTICBLM4":
                    viewWrkSynopticElements.visBlm4SynopticPageFooterBtn = true;
                    break;
                default:
                    // Default: mostra solo WKC
                    viewWrkElements.visWrkPageFooterBtn = true;
                    break;
            }
                
            // Aggiorna i modelli
            controllerWorkCenter.wrkModel.setProperty("/viewWrkElements", viewWrkElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkTypeElements", viewWrkTypeElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkHoursElements", viewWrkHoursElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkSynopticElements", viewWrkSynopticElements);
            
            // console.log("Footer visibility updated for section: " + sPage);
        },    

        /* Definizione Piazzola */

        newSlot: function (isNewWorkCenter) {
            //Update Workcenter Type
            if (isNewWorkCenter) {
                controllerWorkCenter.getWrkType();
                controllerWorkCenter.getWrkStatus();
            }

            controllerWorkCenter.enebledViewElements(isNewWorkCenter ? 'NEW' : 'CLOSED', isNewWorkCenter);
        },

        enebledViewElements: function (sAction, bValue) {
            let wrkViewElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkElements");

            switch (sAction) {
            case "NEW":
                wrkViewElements["enabledWrkField"] = bValue;
                wrkViewElements["enabledDescrWrkField"] = bValue;
                wrkViewElements["enabledWrkType"] = bValue;
                wrkViewElements["enabledWrkParent"] = bValue;
                wrkViewElements["enabledWrkStatus"] = bValue;
                wrkViewElements["enabledWrkAutomha"] = bValue;
                wrkViewElements["editMode"] = bValue;
                controllerWorkCenter.resetWrkHeaderModel();
                break;
            case "CLOSED":
                wrkViewElements["enabledWrkField"] = bValue;
                wrkViewElements["enabledDescrWrkField"] = bValue;
                wrkViewElements["enabledWrkType"] = bValue;
                wrkViewElements["enabledWrkParent"] = bValue;
                wrkViewElements["enabledWrkStatus"] = bValue;
                wrkViewElements["enabledWrkAutomha"] = bValue;
                wrkViewElements["editMode"] = bValue;
                controllerWorkCenter.resetWrkHeaderModel();
                break;
            case "RETRIEVE":
                wrkViewElements["enabledWrkField"] = !bValue;
                wrkViewElements["enabledDescrWrkField"] = true;
                wrkViewElements["enabledWrkType"] = true;
                wrkViewElements["enabledWrkParent"] = true;
                wrkViewElements["enabledWrkStatus"] = true;
                wrkViewElements["enabledWrkAutomha"] = true;
                wrkViewElements["editMode"] = true;
                break;
            default:
                wrkViewElements["enabledWrkField"] = false;
                wrkViewElements["enabledDescrWrkField"] = false;
                wrkViewElements["enabledWrkType"] = false;
                wrkViewElements["enabledWrkParent"] = false;
                wrkViewElements["enabledWrkStatus"] = false;
                wrkViewElements["enabledWrkAutomha"] = false;
                wrkViewElements["editMode"] = false;
            }
        },

        resetWrkHeaderModel: function () {
            controllerWorkCenter.wrkModel.setProperty("/wrkDetails", {
                "PARENTWORKCENTER": "",
                "PARENTWORKCENTER_ID": "",
                "SITE_ID": "",
                "STATUS_ID": "",
                "WORKCENTER": "",
                "WORKCENTERTYPE": "",
                "WORKCENTERTYPE_DESC": "",
                "WORKCENTERTYPE_ID": "",
                "WORKCENTER_AUTHOMA": "",
                "WORKCENTER_DESC": "",
                "WORKCENTER_ID": "0",
                "IS_USED": false
            });
        },

        onOpenSearchWrkValueHelp: function () {
            Fragment.load({
                name: "master_data.view.popup.workcenter.listwrk",
                controller: controllerWorkCenter
            }).then(function (oValueHelpDialog) {
                controllerWorkCenter._oValueHelpDialog = oValueHelpDialog;
                controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
                controllerWorkCenter.getWrkList();
                controllerWorkCenter._oValueHelpDialog.open();
            });
        },

        getWrkList: function () {
            let oInput = {
                "LANGUAGE": controller.language,
                "SITE": controller.site,
                "WORKCENTER": ""
            };
            controllerWorkCenter.wrkModel.setProperty("/tabwrklist", controller.sendData("GET_WRK_LIST_FILTER", "WORKCENTER/TRANSACTION/WRK", oInput)["Rows"]);
        },

        onSearchWrk: function (oEvent) {
            let sValue = oEvent.getParameter("newValue"),
            oFilter = new Filter("WORKCENTER", FilterOperator.Contains, sValue);

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        handleValueHelpClose: function (oEvent) {
            try {
                let oRowSel = controllerWorkCenter.wrkModel.getProperty(oEvent.getParameter("selectedItem").getBindingContext().sPath),
                oInput = {
                    "LANGUAGE": controller.language,
                    "SITE": controller.site,
                    "WORKCENTER": oRowSel["WORKCENTER"]
                };

                controllerWorkCenter.getWrkHeaderDetails(oInput);
            } catch (err) {}

            //Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
            controllerWorkCenter.closeDialog();
        },

        getWrkHeaderDetails: function (oInput) {
            let oResult = controller.sendData("GET_WRK_LIST_FILTER", "WORKCENTER/TRANSACTION/WRK", oInput)["Rows"][0];

            //Addictional Data
            controllerWorkCenter.getWrkType();
            controllerWorkCenter.getWrkStatus();

            controllerWorkCenter.enebledViewElements("RETRIEVE", oResult["IS_USED"]);

            controllerWorkCenter.wrkModel.setProperty("/wrkDetails", oResult);
        },

        closeDialog: function () {
            try {
                controllerWorkCenter._oValueHelpDialog.close();
                controllerWorkCenter._oValueHelpDialog.destroy();
            } catch (err) {}

            controllerWorkCenter._oValueHelpDialog = undefined;
        },

        /* Refresh Data */
		refreshWrkData: function(oInput){
		   let aResult = controller.sendData("GET_WRK_DATA", "WORKCENTER/TRANSACTION/WRK", oInput),     // TODO - Da Realizzare
			   oWrkData = aResult[0]["wrkDetails"][0],
			   aWrkType = aResult[0]["wrktype"];
		   
		   controllerWorkCenter.setModelProperty("/wrkDetails", oWrkData);
		   controllerWorkCenter.setModelProperty("/wrktype", aWrkType);
		   
		   controllerWorkCenter.enabledFieldType(oWrkData["WORKCENTERTYPE_ID"], oWrkData["IS_USED"] === "false", false);
		},

        /* Descrizione Piazzola - popup */
        onOpenValueHelpWrkDesc: function (oEvent) {
            let Input = {
				"WORKCENTER_ID": controllerWorkCenter.wrkModel.getProperty("/wrkDetails/WORKCENTER_ID")
			};
			
			Fragment.load({
				name: "master_data.view.popup.workcenter.listWrkDesc",
				controller: controllerWorkCenter
			}).then(function (oValueHelpDialogWrkDesc) {
				controllerWorkCenter._oValueHelpDialog = oValueHelpDialogWrkDesc;
				controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
				controllerWorkCenter.setModelProperty("/tabDescrWrk", controller.sendData("GET_WRK_LIST_DESC", "WORKCENTER/TRANSACTION/WRK", Input)["Rows"]);
				controllerWorkCenter._oValueHelpDialog.open();
			});
        },

        confirmEditWrkDescr: function () {
            let model = controllerWorkCenter.wrkModel.getProperty("/tabDescrWrk"),
				arrInput = [],
				countDel = 0;

            for (let i = 0; i < model.length; i++) {
                if (model[i].EDIT && model[i].LANGUAGE != "") {
                    for (let j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANGUAGE == model[j].LANGUAGE & model[j].DEL === false) {
                            return MessageBox.warning(controller.oBundle.getText("contrPopupDesc.errDescMod"), {
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
            }, result = controller.sendData("SAVE_WRK_DESC", "WORKCENTER/TRANSACTION/WRK", Input);      // TODO - Da Realizzare

            if (!result || !Array.isArray(result) || result.length === 0) {
                return MessageBox.error("Invalid response from server.");
            }
        
            if (result[0].RC == "0") {
                controllerWorkCenter.closePopup();

				let oInput = {
					"WORKCENTER_ID": arrInput[0]["WORKCENTER_ID"],
					"LANGUAGE": controller.language
				};
				
				controllerWorkCenter.refreshWrkData(oInput);
            } else {
                MessageBox.warning(result[0].MESSAGE, {
                    styleClass: "sapUiSizeCompact"
                });
            }
        },

        newDescrWrk: function () {
            let aRowModel = controllerWorkCenter.wrkModel.getProperty("/tabDescrWrk"),
				row = {
					"WORKCENTER_ID": aRowModel[0]["WORKCENTER_ID"],
					"LANG": "",
					"WORKCENTER_DESC": "",
					"IS_NEW": true,
					"DEL": false,
					"EDIT": true
				};
            aRowModel.push(row);
            controllerWorkCenter.wrkModel.setProperty("/tabDescrWrk", aRowModel);
        },
		
		onChangeDescription: function(oEvent){
			let oRowSel = controllerWorkCenter.wrkModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["EDIT"] = true;
		},
		
		deleteDescrWrk: function(oEvent){
			let oRowSel = controllerWorkCenter.wrkModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["DEL"] = true;
			oRowSel["EDIT"] = true;
			controllerWorkCenter.wrkModel.refresh(true);
		},

        /* --- */

        getWrkStatus: function () {
            let oInput = {
                "LANGUAGE": controller.language
            };
            controllerWorkCenter.wrkModel.setProperty("/tabwrkStatus", controller.sendData("GET_WOKCENTER_STATUS", "WORKCENTER/TRANSACTION/WRK", oInput)["Rows"]);
        },

        deletePiazzola: function () {
            let oInput = {
                "WORKCENTER_ID": controllerWorkCenter.wrkModel.getProperty("/wrkDetails/WORKCENTER_ID")
            };

            MessageBox.confirm((controller.oBundle.getText("viewWRK.messageConfirmDeletePiazzola") + " " + controllerWorkCenter.byId("inputPiazzola").getValue() + "?"), {
                styleClass: "sapUiSizeCompact",
                onClose: function (evt) {
                    if (evt == "OK") {
                        let aResult = controller.sendData("DELETE_WRK", "WORKCENTER/TRANSACTION/WRK", oInput);
                        if (aResult[0]["RC"] === "0") {
                            controllerWorkCenter.newSlot(false);
                        } else {
                            MessageBox.error(aResult[0]["MESSAGE"]);
                        }
                    }
                }
            });
        },

        saveUpdateNew: function () {
            let oWrkHeaderModel = controllerWorkCenter.wrkModel.getProperty("/wrkDetails"); 
			
            if (oWrkHeaderModel["WORKCENTER"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.missedcdl"));
            }
			
            if (oWrkHeaderModel["WORKCENTER_DESC"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.misseddescr"));
            }
			
            if (oWrkHeaderModel["WORKCENTERTYPE_ID"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.missedtype"));
            }
            
            if (oWrkHeaderModel["STATUS_ID"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.missedStatus"));
            }
			
            let xmlInput = "<root>";
			
			xmlInput = xmlInput + "<WORKCENTER>" + oWrkHeaderModel["WORKCENTER"] + "</WORKCENTER>";
			xmlInput = xmlInput + "<WORKCENTER_DESC>" + oWrkHeaderModel["WORKCENTER_DESC"] + "</WORKCENTER_DESC>";           
            xmlInput = xmlInput + "<SITE_ID>" + controller.SiteId + "</SITE_ID>";           
            xmlInput = xmlInput + "<WORKCENTER_ID>" + oWrkHeaderModel["WORKCENTER_ID"] + "</WORKCENTER_ID>";
            xmlInput = xmlInput + "<WORKCENTERTYPE_ID>" + oWrkHeaderModel["WORKCENTERTYPE_ID"]+ "</WORKCENTERTYPE_ID>";
            xmlInput = xmlInput + "<PARENTWORKCENTER_ID>" + oWrkHeaderModel["PARENTWORKCENTER_ID"] + "</PARENTWORKCENTER_ID>";
            xmlInput = xmlInput + "<STATUS_ID>" + oWrkHeaderModel["STATUS_ID"] + "</STATUS_ID>";
            xmlInput = xmlInput + "<WORKCENTER_AUTHOMA>" + oWrkHeaderModel["WORKCENTER_AUTHOMA"] + "</WORKCENTER_AUTHOMA>";
            xmlInput = xmlInput + "<LANGUAGE>" + controller.language + "</LANGUAGE>";
            xmlInput = xmlInput + "</root>";

            let oInput = {
                "DATA": xmlInput
            },
            aResult = controller.sendData("INSERT_WORKCENTER", "WORKCENTER/TRANSACTION/WRK", oInput);
           
		   if (aResult[0]["RC"] === "0") {
                controllerWorkCenter.newSlot(false);
           } else {
                let message = "";
				
                try {
                    message = controller.oBundle.getText(aResult[0]["MESSAGE"]);
                } catch (err) {
                    message = aResult[0]["MESSAGE"];
                }
                MessageBox.error(message);
            }
        },

        /*
        downloadModel: function () {
            //TODO - Capire se conviene passare alla libreria standard
            let dateExport = new Date(),
            mm = "",
            dd = "";

            if (String(dateExport.getMonth() + 1).length == 1) {
                mm = "0" + String(dateExport.getMonth() + 1);
            } else {
                mm = String(dateExport.getMonth() + 1);
            }

            if (String(dateExport.getDate()).length == 1) {
                dd = "0" + String(dateExport.getDate());
            } else {
                dd = String(dateExport.getDate());
            }

            let dateExportStr = dateExport.getFullYear() + (dateExport.getMonth() + 1) + mm + dd;

            controllerWorkCenter.getWrk(3);

            let ws_data = controllerWorkCenter.wrkModel.getProperty("/tabwrklistExport");
            if (typeof XLSX == 'undefined')
                XLSX = require('xlsx');
            let ws = XLSX.utils.json_to_sheet(ws_data),
            wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, controller.oBundle.getText("viewWRK.wrkmain"));
            XLSX.writeFile(wb, controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewWRK.wrkmain") + dateExportStr + ".xlsx");
        },
        */

        /* Download - libreria standard */
        downloadModel: function () { 
            			 try{	
				let aCols = controllerWorkCenter.createColumnExportWrk(),
					oSettings = {
							workbook: {
								columns: aCols,
								context: {
									sheetName: controllerWorkCenter.wrkModel.getProperty("/wrkDetails/WORKCENTER")
								}
							},
							dataSource: [controllerWorkCenter.wrkModel.getProperty("/wrkDetails")],
							fileName:  controller.oBundle.getText("viewPhase.download")
						},      
					oSheet = new Spreadsheet(oSettings);
					
                oSheet.build().then(function () {}).finally(function () {
                    oSheet.destroy();
                });
            } catch (err) {}
        },

        createColumnExportWrk: function () {
            return [{
                    // PIAZZOLA
                    label: controller.oBundle.getText("viewWRK.dwnl.workArea"),
                    property: 'WORKCENTER',
                    type: exportLibrary.EdmType.Number,
					width: '7',
					textAlign: 'begin'
                },{
                    // PIAZZOLA_DECR
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaDescr"),   
					property: 'WORKCENTER_DESC',
					type: exportLibrary.EdmType.String,
					width: '10',
					textAlign: 'begin'
                }, {
                    // TIPO - TIPO_DESCR
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaType"),
                    property: '{WORKCENTERTYPE} - {WORKCENTERTYPE_DESC}',
                    type: exportLibrary.EdmType.String,
					wrap: true,
					width: '60',
					textAlign: 'begin'
                }, {
                    // GRUPPO_PIAZZOLA
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaGroup"),
                    property: '{WORKCENTER} - {WORKCENTER_DESC}',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }, {
                    // STATO
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaStatus"),
                    property: '{STATUS_ID} - {STATUS_DESC}',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }, {
                    // PARTIZIONE_AUTHOMA
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaAuthoma"),
                    property: 'WORKCENTER_AUTHOMA',
                    type: exportLibrary.EdmType.String,
					width: '7',
					textAlign: 'Center'
                }]
		},

        getWrksuccessExport: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrklistExport", jsonArr.Rows, false);
            } catch (e) {}
        },

        /*
        getWrkDesc: function () {
            var input = {};
            input.WORKCENTER_ID = controllerWorkCenter._wrkcenterid;
            controllerWorkCenter.getDataSync("GET_WRK_LIST_DESC", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.getWrkDescSuccess, controllerWorkCenter.transactionError);
        },

        getWrkDescSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerWorkCenter.wrkModel.setProperty("/tabWrkDesc", jsonArr["Rows"]);
        },

        newWrkDesc: function () {
            var addRowModel = controllerWorkCenter.wrkModel.getProperty("/tabWrkDesc");
            var row = {
                "WORKCENTER_ID": "" + controllerWorkCenter._wrkcenterid + "",
                "LANGUAGE": "" + controller.language + "",
                "WORKCENTER_DESC": "",
                "DEL": "false",
                "EDIT": true
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerWorkCenter.wrkModel.setProperty("/tabWrkDesc", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerWorkCenter.wrkModel.setProperty("/tabWrkDesc", newArr);
                } else {
                    var addArr = controllerWorkCenter.wrkModel.getProperty("/tabWrkDesc");
                    addArr.push(row);
                    controllerWorkCenter.wrkModel.setProperty("/tabWrkDesc", addArr);
                }
            }

            //Input Fields
            controllerWorkCenter.byId("comboType").setEditable(false);
            controllerWorkCenter.byId("comboParent").setEditable(false);
            controllerWorkCenter.byId("comboStatus").setEditable(false);

            //Buttons
            controllerWorkCenter.byId("btnNewWrk").setEnabled(false);
            controllerWorkCenter.byId("closeWrk").setEnabled(true);
            controllerWorkCenter.byId("btnSaveWrk").setEnabled(false);
            controllerWorkCenter.byId("btnDelWrk").setEnabled(true);
            controllerWorkCenter.byId("btnWrkNewDescr").setEnabled(true);
            controllerWorkCenter.byId("btnWrkSaveDescr").setEnabled(true);
            controllerWorkCenter.getWrkType();
        },

        onChangeWrkDescr: function () {
            //Input Fields
            controllerWorkCenter.byId("comboType").setEditable(false);
            controllerWorkCenter.byId("comboParent").setEditable(false);
            controllerWorkCenter.byId("comboStatus").setEditable(false);

            //Buttons
            controllerWorkCenter.byId("btnNewWrk").setEnabled(false);
            controllerWorkCenter.byId("closeWrk").setEnabled(true);
            controllerWorkCenter.byId("btnSaveWrk").setEnabled(false);
            controllerWorkCenter.byId("btnDelWrk").setEnabled(true);
            controllerWorkCenter.byId("btnWrkNewDescr").setEnabled(true);
            controllerWorkCenter.byId("btnWrkSaveDescr").setEnabled(true);
        },

        deleteWorkCenterDescr: function (evt) {
            var lineSel = controllerWorkCenter.wrkModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            lineSel.EDIT = true;
            controllerWorkCenter.wrkModel.refresh();
        },

        confirmEditDescwrk: function () {
            var model = controllerWorkCenter.wrkModel.getProperty("/tabWrkDesc");
            var arrInput = [];
            var bCompact = !!controllerSite.getView().$().closest(".sapUiSizeCompact").length;

            for (var i = 0; i < model.length; i++) {
                if ((model[i].DEL == "false" || model[i].LANGUAGE != "") && model[i].WORKCENTER_DESC != "") {
                    for (var j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANGUAGE == model[j].LANGUAGE & model[j].DEL == "false") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errSiteMod"), {
                                styleClass: bCompact ? "sapUiSizeCompact" : ""
                            });
                        }
                    }
                    arrInput.push(model[i]);
                }
            }
            if (arrInput.length > 0) {
                var jsonInput = JSON.stringify(arrInput);
                var input = {
                    "DATA": jsonInput
                };
                controllerWorkCenter.getDataSync("EDIT_WORKCENTER_DESCR", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.confirmEditDescwrkSuccess, this.transactionError);
            }
        },

        confirmEditDescwrkSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.warning(jsonArr[0].MESSAGE)
            }
            //else{
            controllerWorkCenter.getWrkDesc();
            controllerWorkCenter.getWrk(1);
            //}
        },
        */

        getWrk: function (selection) {
            if (!selection) {
                selection = 0
            }
            var input = {};
            input.LANGUAGE = controller.language;
            input.SITE = controller.site;
            input.WORKCENTER = controllerWorkCenter._wrkcenter;
            switch (selection) {
            case 0:
                controllerWorkCenter.getDataSync("GET_LIST_WRK_FOR_SEARCH", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.getWrkListsuccess, controllerWorkCenter.transactionError);
                break;
            case 1:
                controllerWorkCenter.getDataSync("GET_WRK_LIST_FILTER", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.getWrksuccess, controllerWorkCenter.transactionError);
                break;
            case 3:
                controllerWorkCenter.getDataSync("GET_WRK_LIST_EXPORT", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/TRANSDWN", input, controllerWorkCenter.getWrksuccessExport, controllerWorkCenter.transactionError);
                break;
            default:
                controllerWorkCenter.getDataSync("GET_LIST_WRK_FOR_SEARCH", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.getWrkListsuccess, controllerWorkCenter.transactionError);
                break;
            }
        },

        /* Definizione Tipo Piazzola */
        undoWrkType: function () {
            //Buttons
            controllerWorkCenter.byId("btnCloseWrkType").setEnabled(false);
            controllerWorkCenter.byId("btnSaveWrkType").setEnabled(false);
            controllerWorkCenter.getWrkType();
        },

        getWrkType: function () {
            let oInput = {
                "LANGUAGE": controller.language
            };
            controllerWorkCenter.wrkModel.setProperty("/tabwrktype", controller.sendData("GET_WOKCENTER_TYPE", "WORKCENTER/TRANSACTION/WRK", oInput)["Rows"]);
        },

        /* Selection Synoptic Page */
        getSynopticPages: function () {
            
        },

        /* Footer */
        getSynopticList: function () {
            var synopticType = "", propertySynopticPath = "", propertySynopticPathBkc = "", tableId = "", undoBtnId = "", saveBtnId = "";
            switch (controllerWorkCenter.byId("wkcITB").getSelectedKey()) {
            case "SYNOPTIC":
                synopticType = 1;
                propertySynopticPath = "/tabSynoptic";
                propertySynopticPathBkc = "/tabSynopticBkc";
				tableId = "tabWrkSyn";
				undoBtnId = "btnUndoNewAdige";
				saveBtnId = "btnSaveAdige";
                break;
			 case "SYNOPTICADIGESTR1":
                synopticType = 2;
                propertySynopticPath = "/tabSynopticAdigeStr1";
                propertySynopticPathBkc = "/tabSynopticAdigeStr1Bkc";
				tableId = "tabWrkSynAdigeStr1";
				undoBtnId = "btnUndoNewAdigeStr1";
				saveBtnId = "btnSaveNewAdigeStr1";
                break;
            case "SYNOPTICBGS1":
                synopticType = 1;
                propertySynopticPath = "/tabSynopticBGS1";
                propertySynopticPathBkc = "/tabSynopticBGS1Bkc";
				tableId = "tabWrkSynBGS1";
				undoBtnId = "btnUndoNewBgs1";
				saveBtnId = "btnSaveNewBgs1";
                break;
            case "SYNOPTICBGS2":
                synopticType = 2;
                propertySynopticPath = "/tabSynopticBGS2";
                propertySynopticPathBkc = "/tabSynopticBGS2Bkc";
				tableId = "tabWrkSynBGS2";
				undoBtnId = "btnUndoNewBgs2";
				saveBtnId = "btnSaveNewBgs2";
                break;
            case "SYNOPTICADIGESYS1":
                synopticType = 1;
                propertySynopticPath = "/tabSynopticAdigeSys1";
                propertySynopticPathBkc = "/tabSynopticAdigeSys1Bkc";
				tableId = "tabWrkSynAdigeSys1";
				undoBtnId = "btnUndoNewAdigeSys1";
				saveBtnId = "btnSaveNewAdigeSys1";
                break;
            case "SYNOPTICADIGESYS2":
                synopticType = 2;
                propertySynopticPath = "/tabSynopticAdigeSys2";
                propertySynopticPathBkc = "/tabSynopticAdigeSys2Bkc";
				tableId = "tabWrkSynAdigeSys2";
				undoBtnId = "btnUndoAdigeSys2";
				saveBtnId = "btnSaveNewAdigeSys2";
                break;
            case "SYNOPTICADIGESYS3":
                synopticType = 3;
                propertySynopticPath = "/tabSynopticAdigeSys3";
                propertySynopticPathBkc = "/tabSynopticAdigeSys3Bkc";
				tableId = "tabWrkSynAdigeSys3";
				undoBtnId = "btnUndoNewAdigeSys3";
				saveBtnId = "btnSaveNewAdigeSys3";
                break; 
			case "SYNOPTICBGUSA":
                synopticType = 1;
                propertySynopticPath = "/tabSynopticBgusa";
                propertySynopticPathBkc = "/tabSynopticBgusaBkc";
				tableId = "tabWrkBgusa";
				undoBtnId = "btnUndoNewBgusa";
				saveBtnId = "btnSaveNewBgusa";
                break; 
			case "SYNOPTICBLM1":
                synopticType = 1;
                propertySynopticPath = "/tabSynopticBlm1";
                propertySynopticPathBkc = "/tabSynopticBlm1Bkc";
				tableId = "tabWrkSynBlm1";
				undoBtnId = "btnUndoNewBlm1";
				saveBtnId = "btnSaveNewBlm1";
                break;
			case "SYNOPTICBLM2":
                synopticType = 2;
                propertySynopticPath = "/tabSynopticBlm2";
                propertySynopticPathBkc = "/tabSynopticBlm2Bkc";
				tableId = "tabWrkSynBlm2";
				undoBtnId = "btnUndoNewBlm2";
				saveBtnId = "btnSaveNewBlm2";
                break;
            case "SYNOPTICBLM3":
                synopticType = 3;
                propertySynopticPath = "/tabSynopticBlm3";
                propertySynopticPathBkc = "/tabSynopticBlm3Bkc";
				tableId = "tabWrkSynBlm3";
				undoBtnId = "btnUndoNewBlm3";
				saveBtnId = "btnSaveNewBlm3";
                break;
            case "SYNOPTICBLM4":
                synopticType = 4;
                propertySynopticPath = "/tabSynopticBlm4";
                propertySynopticPathBkc = "/tabSynopticBlm4Bkc";
				tableId = "tabWrkSynBlm4";
				undoBtnId = "btnUndoNewBlm4";
				saveBtnId = "btnSaveNewBlm4";
                break;		
            default:
                synopticType = 1;
                propertySynopticPath = "/tabSynoptic";
                propertySynopticPathBkc = "/tabSynopticBkc";
				tableId = "tabWrkSyn";
				undoBtnId = "btnUndoNewAdige";
				saveBtnId = "btnSaveAdige";
                break;
            }
            var Input = {
                "SITE_ID": controller.SiteId,
                "LANGUAGE": controller.language,
                "SYNOPTIC_TYPE": synopticType
            };
            var result = controllerSite.sendData("GET_SYNOPTIC_LIST", "WORKCENTER/TRANSACTION", Input);
            controllerWorkCenter.wrkModel.setProperty(propertySynopticPath, result);
            controllerWorkCenter.wrkModel.setProperty(propertySynopticPathBkc, JSON.parse(JSON.stringify(result)));
			
			//Buttons
			controllerWorkCenter.byId(undoBtnId).setEnabled(false);
			controllerWorkCenter.byId(saveBtnId).setEnabled(false);
        },

        newPosSyn: function () {
            var propertySynopticPath = "", propertySynopticPathBkc = "", maxWkcNumber = 0, tableId = "", undoBtnId = "", saveBtnId = "";
            switch (controllerWorkCenter.byId("wkcITB").getSelectedKey()) {
            case "SYNOPTIC":
                maxWkcNumber = 40;
                propertySynopticPath = "/tabSynoptic";
                propertySynopticPathBkc = "/tabSynopticBkc";
				tableId = "tabWrkSyn";
				undoBtnId = "btnUndoNewAdige";
				saveBtnId = "btnSaveAdige";
                break;
			case "SYNOPTICADIGESTR1":
                maxWkcNumber = 22;
                propertySynopticPath = "/tabSynopticAdigeStr1";
                propertySynopticPathBkc = "/tabSynopticAdigeStr1Bkc";
				tableId = "tabWrkSynAdigeStr1";
				undoBtnId = "btnUndoNewAdigeStr1";
				saveBtnId = "btnSaveNewAdigeStr1";
                break;
            case "SYNOPTICBGS1":
                maxWkcNumber = 14;
                propertySynopticPath = "/tabSynopticBGS1";
                propertySynopticPathBkc = "/tabSynopticBGS1Bkc";
				tableId = "tabWrkSynBGS1";
				undoBtnId = "btnUndoNewBgs1";
				saveBtnId = "btnSaveNewBgs1";
                break;
            case "SYNOPTICBGS2":
                maxWkcNumber = 53;
                propertySynopticPath = "/tabSynopticBGS2";
                propertySynopticPathBkc = "/tabSynopticBGS2Bkc";
				tableId = "tabWrkSynBGS2";
				undoBtnId = "btnUndoNewBgs2";
				saveBtnId = "btnSaveNewBgs2";
                break;
            case "SYNOPTICADIGESYS1":
                maxWkcNumber = 24;
                propertySynopticPath = "/tabSynopticAdigeSys1";
                propertySynopticPathBkc = "/tabSynopticAdigeSys1Bkc";
				tableId = "tabWrkSynAdigeSys1";
				undoBtnId = "btnUndoNewAdigeSys1";
				saveBtnId = "btnSaveNewAdigeSys1";
                break;
			//Disabilitato	
            case "SYNOPTICADIGESYS2":
                maxWkcNumber = 11;
                propertySynopticPath = "/tabSynopticAdigeSys2";
                propertySynopticPathBkc = "/tabSynopticAdigeSys2Bkc";
				tableId = "tabWrkSynAdigeSys2";
				undoBtnId = "btnUndoAdigeSys2";
				saveBtnId = "btnSaveNewAdigeSys2";
                break;
            case "SYNOPTICADIGESYS3":
                maxWkcNumber = 27;
                propertySynopticPath = "/tabSynopticAdigeSys3";
                propertySynopticPathBkc = "/tabSynopticAdigeSys3Bkc";
				tableId = "tabWrkSynAdigeSys3";
				undoBtnId = "btnUndoNewAdigeSys3";
				saveBtnId = "btnSaveNewAdigeSys3";
                break; 
			case "SYNOPTICBGUSA":
                maxWkcNumber = 20;
                propertySynopticPath = "/tabSynopticBgusa";
                propertySynopticPathBkc = "/tabSynopticBgusaBkc";
				tableId = "tabWrkSynBgusa";
				undoBtnId = "btnUndoNewBgusa";
				saveBtnId = "btnSaveNewBgusa";
                break;
			case "SYNOPTICBLM1":
                maxWkcNumber = 244;
                propertySynopticPath = "/tabSynopticBlm1";
                propertySynopticPathBkc = "/tabSynopticBlm1Bkc";
				tableId = "tabWrkSynBlm1";
				undoBtnId = "btnUndoNewBlm1";
				saveBtnId = "btnSaveNewBlm1";
                break;
			case "SYNOPTICBLM2":
                maxWkcNumber = 48;
                propertySynopticPath = "/tabSynopticBlm2";
                propertySynopticPathBkc = "/tabSynopticBlm2Bkc";
				tableId = "tabWrkSynBlm2";
				undoBtnId = "btnUndoNewBlm2";
				saveBtnId = "btnSaveNewBlm2";
                break;
            case "SYNOPTICBLM3":
                maxWkcNumber = 56;
                propertySynopticPath = "/tabSynopticBlm3";
                propertySynopticPathBkc = "/tabSynopticBlm3Bkc";
				tableId = "tabWrkSynBlm3";
				undoBtnId = "btnUndoNewBlm3";
				saveBtnId = "btnSaveNewBlm3";
                break;
            case "SYNOPTICBLM4":
                maxWkcNumber = 12;
                propertySynopticPath = "/tabSynopticBlm4";
                propertySynopticPathBkc = "/tabSynopticBlm4Bkc";
				tableId = "tabWrkSynBlm4";
				undoBtnId = "btnUndoNewBlm4";
				saveBtnId = "btnSaveNewBlm4";
                break;		
            default:
                maxWkcNumber = 40;
                propertySynopticPath = "/tabSynoptic";
                propertySynopticPathBkc = "/tabSynopticBkc";
				tableId = "tabWrkSyn";
				undoBtnId = "btnUndoNewAdige";
				saveBtnId = "btnSaveAdige";
                break;
            }
            var addRowModel = controllerWorkCenter.wrkModel.getProperty(propertySynopticPath);

            if (addRowModel.length <= maxWkcNumber) {
                var row = {
                    "WORKCENTER_ID": "",
                    "WORKCENTER": "",
                    "WORKCENTER_DESCR": "",
                    "POSITION": "",
                    "EDIT": "true",
                    "DEL": "false"
                };
                addRowModel.push(row);
                controllerWorkCenter.wrkModel.setProperty(propertySynopticPath, addRowModel);
                controllerWorkCenter.wrkModel.setProperty(propertySynopticPathBkc, JSON.parse(JSON.stringify(addRowModel)));
            } else {
                return MessageToast.show(controller.oBundle.getText("contrWRK.maxLimit"));
            }
			
			//Buttons
			controllerWorkCenter.byId(undoBtnId).setEnabled(true);
			controllerWorkCenter.byId(saveBtnId).setEnabled(true);
			
			//Scroll to last table Element
			controllerWorkCenter.byId(tableId).setFirstVisibleRow(addRowModel.length);
        },

        savePosSyn: function () {
            var Input = {};
            var modelProperty = "";
            var synopticType = "";
            //Verifico e costruisco il modello per salvare i dati
            var modInput = [];
            var obj = {};
            var maxWkcNumber = 0;
            switch (controllerWorkCenter.byId("wkcITB").getSelectedKey()) {
            case "SYNOPTIC":
                maxWkcNumber = 40;
                synopticType = 1;
                modelProperty = "/tabSynoptic";
                break;
            case "SYNOPTICBGS1":
                maxWkcNumber = 14;
                synopticType = 1;
                modelProperty = "/tabSynopticBGS1";
                break;
            case "SYNOPTICBGS2":
                maxWkcNumber = 53;
                synopticType = 2;
                modelProperty = "/tabSynopticBGS2";
                break;
            case "SYNOPTICADIGESYS1":
                maxWkcNumber = 24;
                synopticType = 1;
                modelProperty = "/tabSynopticAdigeSys1";
                break;
			//Disabilitato	
            case "SYNOPTICADIGESYS2":
                maxWkcNumber = 11;
                synopticType = 2;
                modelProperty = "/tabSynopticAdigeSys2";
                break;
            case "SYNOPTICADIGESYS3":
                maxWkcNumber = 27;
                synopticType = 3;
                modelProperty = "/tabSynopticAdigeSys3";
                break;
            case "SYNOPTICADIGESTR1":
                maxWkcNumber = 22;
                synopticType = 2;
                modelProperty = "/tabSynopticAdigeStr1";
                break;
			case "SYNOPTICBGUSA":
                maxWkcNumber = 20;
                synopticType = 1;
                modelProperty = "/tabSynopticBgusa";
                break;
			case "SYNOPTICBLM1":
                maxWkcNumber = 244;
				synopticType = 1;
                modelProperty = "/tabSynopticBlm1";
                break;
			case "SYNOPTICBLM2":
                maxWkcNumber = 48;
				synopticType = 2;
                modelProperty = "/tabSynopticBlm2";
                break;
            case "SYNOPTICBLM3":
                maxWkcNumber = 56;
				synopticType = 1;
                modelProperty = "/tabSynopticBlm3";
                break;
			case "SYNOPTICBLM4":
                maxWkcNumber = 12;
				synopticType = 2;
                modelProperty = "/tabSynopticBlm4";
                break;
            default:
                maxWkcNumber = 40;
                synopticType = 1;
                modelProperty = "/tabSynoptic";
                break;
            }
            var model = controllerWorkCenter.wrkModel.getProperty(modelProperty);
            for (var i = 0; i < model.length; i++) {
                if (model[i].WORKCENTER === "" && model[i].WORKCENTER_ID === "") {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errMissWkc"), {
                        onClose: function () {}
                    });
                }

                if (model[i].POSITION === "" && model[i].DEL === "false") {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errMissPosition"), {
                        onClose: function () {}
                    });
                }

                if (model[i].POSITION.replace(".", ",") < 1 || model[i].POSITION > maxWkcNumber) {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errPosInterval"), {
                        onClose: function () {}
                    });
                }

                if (model[i].POSITION.replace(".", ",") % 1 != 0) {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errPosInt"), {
                        onClose: function () {}
                    });
                }

                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    obj.WORKCENTER_ID = model[i].WORKCENTER_ID;
                    obj.POSITION = model[i].POSITION;
                    obj.DEL = model[i].DEL;
                    modInput.push(obj);
                    obj = new Object;
                }
            }

            if (modInput.length === 0)
                return

                Input = {
                    "DATA": JSON.stringify(modInput),
                    "SYNOPTIC_TYPE": synopticType
                };

            var result = controllerSite.sendData("SAVE_SYNOPTIC_ASSIGNMENT", "WORKCENTER/TRANSACTION", Input);
            if (result[0].RC != "0") {
                MessageBox.warning(controller.oBundle.getText("contrWRK.insertKO") + " " + result[0].MESSAGE, {
                    onClose: function () {}
                });
            } else {
                MessageToast.show(controller.oBundle.getText("contrWRK.insertOK"));
            }
            controllerWorkCenter.getSynopticList();
        },

        /*General Function*/
		closePopup: function(){
			try{
				controllerWorkCenter._oValueHelpDialog.close();
				controllerWorkCenter._oValueHelpDialog.destroy();
			}catch(err){}

		},

    });
});
