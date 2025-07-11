var controllerWorkCenter;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/m/MessageToast',
        "sap/m/MessageBox",
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'sap/ui/export/Spreadsheet',
        'sap/ui/export/library'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator, Spreadsheet, exportLibrary) {
    "use strict";

    return Controller.extend("master_data.controller.WorkCenter", {
        wrkModel: new sap.ui.model.json.JSONModel({
            "currentSite": controller.site,
            "wrkDetails": {
                "PARENTWORKCENTER": "",
                "PARENTWORKCENTER_ID": "0",
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
                "editMode": false,
                // Footer buttons enablement
                "enabledSearchInput": true,
                "enabledExcelDownloadBtn": true,
                "enabledNewWrkBtn": true,
                "enabledResetBtn": false,
                "enabledSaveBtn": false,
                "enabledDeleteBtn": false
            },
            tabwrklistExport: [],
            tabwrklist: [],
            tabwrktype: [],
            tabwrkStatus: [],
            "viewWrkTypeElements": {
                "visWrkTypePageFooterBtn": false,
                "editMode": false,
                // Footer buttons enablement
                "enabledNewWrkTypeBtn": true,
                "enabledUndoWrkTypeBtn": false,
                "enabledSaveWrkTypeBtn": false
            },
            tabWrkHours: [],
            "viewWrkHoursElements": {
                "visWrkHoursPageFooterBtn": false,
                "editMode": false,
                // Footer buttons enablement
                "enabledNewHoursBtn": true,
                "enabledDeleteAllHoursBtn": true,
                "enabledUndoHoursBtn": false,
                "enabledSaveHoursBtn": false
            },
            "viewWrkSynopticElements": {
                "visSynopticPageFooterBtn": false,
                "editMode": false,
                // Footer buttons enablement for all synoptic sections
                "enabledNewPosSynBtn": true,
                "enabledUndoSynBtn": false,
                "enabledSaveSynBtn": false
            },
			"SynopticDetails": {
				 "sPage": "",	
				 "SynopticType": 0,
				 "sPage": "",	
				 "synopticType": "",
                 "propertySynopticPath": "",
                 "propertySynopticPathBkc": "",
                 "tableId": "tabWrkSyn",
				 "maxWkcNumber": 0
			},
			"rowSynopticSel": "",
			"filterSynopticPage": []
        }),
        _oValueHelpDialog: undefined,
        rowSelTabWrkHours: "",

        onInit: function () {
            controllerWorkCenter = this;
            controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            controllerWorkCenter.wrkModel.setSizeLimit(10000);
            
            // Inizializza lo stato di default
            controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC", false);
        },

        /* Gestisce il cambio di tab nell'ObjectPageLayout */
        pressWkcTabBar: function (oEvent) {
            // sezione di default
            let sPage = "WKC";
            
            if (oEvent && oEvent.getParameter) {
                sPage = oEvent.getParameter("section").sId.split("--")[1];
            }
            
            let viewWrkElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkElements"),
				viewWrkTypeElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkTypeElements"),
				viewWrkHoursElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkHoursElements"),
				viewWrkSynopticElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkSynopticElements"),
				nSynopticType = 1,
				sSynopticPage = "";
            
            // Reset di tutti i footer
            viewWrkElements.visWrkPageFooterBtn = false;
            viewWrkTypeElements.visWrkTypePageFooterBtn = false;
            viewWrkHoursElements.visWrkHoursPageFooterBtn = false;
			viewWrkSynopticElements.visSynopticPageFooterBtn = false;
        
            // Imposta il footer corretto in base alla sezione attiva
            switch (sPage) {
                case "WKC":
                    viewWrkElements.visWrkPageFooterBtn = true;
                    // Reset allo stato di default per tab WKC
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC", false);
                    break;
                case "WKC_TYPE":
                    viewWrkTypeElements.visWrkTypePageFooterBtn = true;
                    // Reset allo stato di default per tab WKC_TYPE
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC_TYPE", false);
					controllerWorkCenter.getWrkType();
                    break;
                case "WKC_HOURS":
                    viewWrkHoursElements.visWrkHoursPageFooterBtn = true;
                    // Reset allo stato di default per tab WKC_HOURS
                    //controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC_HOURS", false);
					controllerWorkCenter.getHoursList();
                    break;
                case "SYNOPTIC":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 1;
					sSynopticPage = "ADIGE";
                  				
                    break;
                case "SYNOPTICADIGESTR1":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 2;
					sSynopticPage = "SEGATRICI";
                    break;
                case "SYNOPTICBGS1":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 1;
					sSynopticPage = "GOSSOLENGO";	
                    break;
                case "SYNOPTICBGS2":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 2;
					sSynopticPage = "PIACENZA";
                    break;
                case "SYNOPTICADIGESYS1":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 1;
					sSynopticPage = "JUMBO";
                    break;
                /*case "SYNOPTICADIGESYS2":
                    viewWrkSynopticElements.visAdigeSys2SysSynopticPageFooterBtn = true;
					nSynopticType = 2;
					sSynopticPage = "PageSawingMachineAdige1";
                    break;*/
                case "SYNOPTICADIGESYS3":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 3;
					sSynopticPage = "LAMIERA";
                    break;
                case "SYNOPTICBGUSA":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 1;
					sSynopticPage = "BENDER";
                    break;
                case "SYNOPTICBLM1":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 1;
					sSynopticPage = "ELECT-LN";
                    break;
                case "SYNOPTICBLM2":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 2;
					sSynopticPage = "LINEA-SMALL";
                    break;
                case "SYNOPTICBLM3":
					viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 3;
					sSynopticPage = "DH4010N";
                    break;
                case "SYNOPTICBLM4":
                    viewWrkSynopticElements.visSynopticPageFooterBtn = true;
					nSynopticType = 4;
					sSynopticPage = "LTFREEN";
                    break;	 
                default:
                    // Default: mostra solo WKC
                    viewWrkElements.visWrkPageFooterBtn = true;
					sDefaultPage = "";
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC", false);
                    break;
			}
			
			if(viewWrkSynopticElements.visSynopticPageFooterBtn){	
				//Estraggo il Setup delle Pagine
				let aResult = controller.sendData("GET_SYNOPTIC_PAGES_SETUP", "WORKCENTER/TRANSACTION", {SITE_ID: controller.SiteId})["Rows"];
				let filteredResult = _.filter(aResult, function(o){ return o.SynopticType == nSynopticType});
				// Ordina numericamente per PageOrders
				filteredResult.sort(function(a, b) {
					return parseInt(a.PageOrders || 0) - parseInt(b.PageOrders || 0);
				});
				controllerWorkCenter.wrkModel.setProperty("/filterSynopticPage", filteredResult);
				controllerWorkCenter.wrkModel.setProperty("/AllSynopticPages", aResult);
				//Chiamo la funzione per estrarre la lista delle Piazzole per Sinottico
				controllerWorkCenter.getSynopticList(sPage, nSynopticType, sSynopticPage);	
			}		
            
            // Aggiorna i modelli
            controllerWorkCenter.wrkModel.setProperty("/viewWrkElements", viewWrkElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkTypeElements", viewWrkTypeElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkHoursElements", viewWrkHoursElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkSynopticElements", viewWrkSynopticElements);
            
            // console.log("Footer visibility updated for section: " + sPage);
        },

        /* Gestione errori generici */
        transactionError: function (error) {
            console.error("Transaction error:", error);
            MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nella transazione");
        },

        /* Metodo per chiamate sincrone come in Phase.controller.js */
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
                console.error("Error in getDataSync:", err);
                errf.call(that, err);
            }
        },

        /* Gestisce l'abilitazione/disabilitazione dei campi e bottoni */
        enabledWorkCenterFields: function(sAction, bValue){
            let oWrkElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkElements");
            let oWrkTypeElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkTypeElements");
            let oWrkHoursElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkHoursElements");
            let oWrkSynopticElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkSynopticElements");
            
            switch (sAction) {
                case "DEFAULT_WKC":
                    // Stato di default per tab Piazzola
                    oWrkElements.enabledSearchInput = true;
                    oWrkElements.enabledExcelDownloadBtn = true;
                    oWrkElements.enabledNewWrkBtn = true;
                    oWrkElements.enabledResetBtn = false;
                    oWrkElements.enabledSaveBtn = false;
                    oWrkElements.enabledDeleteBtn = false;
                    
                    // Campi della sezione WKC disabilitati
                    oWrkElements.enabledWrkField = false;
                    oWrkElements.enabledDescrWrkField = false;
                    oWrkElements.enabledWrkType = false;
                    oWrkElements.enabledWrkParent = false;
                    oWrkElements.enabledWrkStatus = false;
                    oWrkElements.enabledWrkAutomha = false;
                    oWrkElements.editMode = false;
                    
                    // Reset dei dati
                    controllerWorkCenter.resetWrkHeaderModel();
                    break;
                    
                case "NEW_WKC":
                    // Modalità Nuova Piazzola
                    oWrkElements.enabledSearchInput = false;  
                    oWrkElements.enabledExcelDownloadBtn = true;
                    oWrkElements.enabledNewWrkBtn = false;  
                    oWrkElements.enabledResetBtn = true;     
                    oWrkElements.enabledSaveBtn = true;      
                    oWrkElements.enabledDeleteBtn = false;  
                    
                    // Abilita campi della sezione WKC
                    oWrkElements.enabledWrkField = true;
                    oWrkElements.enabledDescrWrkField = true;
                    oWrkElements.enabledWrkType = true;
                    oWrkElements.enabledWrkParent = true;
                    oWrkElements.enabledWrkStatus = true;
                    oWrkElements.enabledWrkAutomha = true;
                    oWrkElements.editMode = true;
                    
                    // Reset dei dati per nuova piazzola
                    controllerWorkCenter.resetWrkHeaderModel();
                    break;
                    
                case "SELECTED_WKC":
                    // Piazzola selezionata (modalità edit)
                    oWrkElements.enabledSearchInput = false;
                    oWrkElements.enabledExcelDownloadBtn = true;
                    oWrkElements.enabledNewWrkBtn = true;
                    oWrkElements.enabledResetBtn = true;     
                    oWrkElements.enabledSaveBtn = true;     
                    oWrkElements.enabledDeleteBtn = bValue;
                    
                    // Abilita campi della sezione WKC (tranne il campo piazzola)
                    oWrkElements.enabledWrkField = false;  
                    oWrkElements.enabledDescrWrkField = true;
                    oWrkElements.enabledWrkType = true;
                    oWrkElements.enabledWrkParent = true;
                    oWrkElements.enabledWrkStatus = true;
                    oWrkElements.enabledWrkAutomha = true;
                    oWrkElements.editMode = true;
                    break;
                    
                case "DEFAULT_WKC_TYPE":
                    // Stato di default per tab Tipo Piazzola
                    oWrkTypeElements.enabledNewWrkTypeBtn = true;
                    oWrkTypeElements.enabledUndoWrkTypeBtn = false;
                    oWrkTypeElements.enabledSaveWrkTypeBtn = false;
                    oWrkTypeElements.editMode = false;
                    break;
                    
                case "NEW_WKC_TYPE":
                    // Modalità Nuovo Tipo
                    oWrkTypeElements.enabledNewWrkTypeBtn = true;
                    oWrkTypeElements.enabledUndoWrkTypeBtn = true;
                    oWrkTypeElements.enabledSaveWrkTypeBtn = true;
                    oWrkTypeElements.editMode = true;
                    break;
                    
                case "DEFAULT_WKC_HOURS":
                    // Stato di default per tab Orari Lavorativi
                    oWrkHoursElements.enabledNewHoursBtn = true;
                    oWrkHoursElements.enabledDeleteAllHoursBtn = true;
                    oWrkHoursElements.enabledUndoHoursBtn = false;
                    oWrkHoursElements.enabledSaveHoursBtn = false;
                    oWrkHoursElements.editMode = false;
                    break;
                    
                case "NEW_WKC_HOURS":
                    // Modalità Nuovo Orario
                    oWrkHoursElements.enabledNewHoursBtn = true;
                    oWrkHoursElements.enabledDeleteAllHoursBtn = true;
                    oWrkHoursElements.enabledUndoHoursBtn = true;
                    oWrkHoursElements.enabledSaveHoursBtn = true;
                    oWrkHoursElements.editMode = true;
                    break;
                    
                case "ENABLE_SAVE_HOURS":
                    // Abilita Salva quando viene inserita la piazzola negli orari
                    oWrkHoursElements.enabledSaveHoursBtn = true;
                    break;
                    
                case "DEFAULT_SYNOPTIC":
                    // Stato di default per tab Sinottico
                    oWrkSynopticElements.enabledNewPosSynBtn = true;
                    oWrkSynopticElements.enabledUndoSynBtn = false;
                    oWrkSynopticElements.enabledSaveSynBtn = false;
                    oWrkSynopticElements.editMode = false;
                    break;
                    
                case "NEW_SYNOPTIC":
                    // Modalità Nuova Postazione Sinottico
                    oWrkSynopticElements.enabledNewPosSynBtn = true;
                    oWrkSynopticElements.enabledUndoSynBtn = true;
                    oWrkSynopticElements.enabledSaveSynBtn = true;
                    oWrkSynopticElements.editMode = true;
                    break;
                    
                default:
                    break;
            }
            
            // Aggiorna i modelli
            controllerWorkCenter.wrkModel.setProperty("/viewWrkElements", oWrkElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkTypeElements", oWrkTypeElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkHoursElements", oWrkHoursElements);
            controllerWorkCenter.wrkModel.setProperty("/viewWrkSynopticElements", oWrkSynopticElements);
        },


        /* -------------------- Definizione Piazzola -------------------- */

        newSlot: function (isNewWorkCenter) {
            //Update Workcenter Type
            if (isNewWorkCenter) {
                controllerWorkCenter.getWrkType();
                controllerWorkCenter.getWrkStatus();
                // Modalità Nuova Piazzola
                controllerWorkCenter.enabledWorkCenterFields("NEW_WKC", false);
            } else {
                // Modalità di default/chiusura
                controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC", false);
            }
        },

        enebledViewElements: function (sAction, bValue) {
            // Questa funzione è ora sostituita da enabledWorkCenterFields
            // Mantengo per compatibilità ma uso il nuovo sistema
            switch (sAction) {
                case "NEW":
                    controllerWorkCenter.enabledWorkCenterFields("NEW_WKC", bValue);
                    break;
                case "CLOSED":
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC", bValue);
                    break;
                case "RETRIEVE":
                    // Piazzola selezionata - bValue indica se è in uso
                    controllerWorkCenter.enabledWorkCenterFields("SELECTED_WKC", !bValue);
                    break;
                default:
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC", bValue);
            }
        },

        resetWrkHeaderModel: function () {
            controllerWorkCenter.wrkModel.setProperty("/wrkDetails", {
                "PARENTWORKCENTER": "",
                "PARENTWORKCENTER_ID": "0",
                "SITE_ID": controller.SiteId,
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

        sendData: function (Transaction, route, Input) {
            var results;
            var transactionCall = route + "/" + Transaction;
            Input.TRANSACTION = transactionCall;
            Input.OutputParameter = "JSON";
            
            try {
                $.ajax({
                    type: 'POST',
                    data: Input,
                    dataType: 'xml',
                    async: false,
                    url: "/XMII/Runner",
                    success: function (data) {
                        try {
                            var textContent = data.documentElement.textContent;
                            if (textContent && textContent.trim() !== "") {
                                results = JSON.parse(textContent);
                            } else {
                                console.error("Empty or null response from server");
                                results = null;
                            }
                        } catch (parseError) {
                            console.error("JSON parsing error:", parseError);
                            console.error("Raw response:", data.documentElement.textContent);
                            results = null;
                        }
                    },
                    error: function searchError(xhr, err) {
                        console.error("Error on ajax call: " + err);
                        console.error("Status:", xhr.status);
                        console.error("Response:", xhr.responseText);
                        results = null;
                    }
                });
            } catch (error) {
                console.error("Ajax call failed:", error);
                results = null;
            }
            return results;
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
            try {
                let oInput = {
                    "LANGUAGE": controller.language,
                    "SITE": controller.site
                };
                let result = controller.sendData("GET_LIST_WRK_FOR_SEARCH", "WORKCENTER/TRANSACTION/WRK", oInput);
                
                if (result && result["Rows"]) {
                    controllerWorkCenter.wrkModel.setProperty("/tabwrklist", result["Rows"]);
                } else {
                    console.error("Invalid response from GET_LIST_WRK_FOR_SEARCH:", result);
                    controllerWorkCenter.wrkModel.setProperty("/tabwrklist", []);
                    if (result && result[0] && result[0].MESSAGE) {
                        MessageBox.error(result[0].MESSAGE);
                    }
                }
            } catch (error) {
                console.error("Error in getWrkList:", error);
                controllerWorkCenter.wrkModel.setProperty("/tabwrklist", []);
                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nel caricamento dati");
            }
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
                    "WORKCENTER_ID": oRowSel["WORKCENTER_ID"]
                };

                controllerWorkCenter.getWrkHeaderDetails(oInput);
            } catch (err) {}

            //Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
            controllerWorkCenter.closeDialog();
        },

        handleSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("WORKCENTER", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        getWrkHeaderDetails: function (oInput) {
            try {
                let result = controller.sendData("GET_WRK_DATA", "WORKCENTER/TRANSACTION/WRK", oInput);
                    
                if (result && result["Rows"] && result["Rows"].length > 0) {
                    let oResult = result["Rows"][0];

                    controllerWorkCenter.getWrkType();
                    controllerWorkCenter.getWrkStatus();

                    controllerWorkCenter.enabledWorkCenterFields("SELECTED_WKC", !oResult["IS_USED"]);

                    controllerWorkCenter.wrkModel.setProperty("/wrkDetails", oResult);
                } else {
                    console.error("Invalid response from GET_WRK_DATA:", result);
                    if (result && result[0] && result[0].MESSAGE) {
                        MessageBox.error(result[0].MESSAGE);
                    } else {
                        MessageBox.warning(controller.oBundle ? controller.oBundle.getText("viewWRK.noDataFound") : "Nessun dato trovato");
                    }
                }
            } catch (error) {
                console.error("Error in getWrkHeaderDetails:", error);
                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nel caricamento dettagli");
            }
        },

        /* -------------------- Refresh Data -------------------- */
		refreshWrkData: function(oInput){
		   let aResult = controller.sendData("GET_WRK_DATA", "WORKCENTER/TRANSACTION/WRK", oInput),     // TODO - Da Realizzare
			   oWrkData = aResult["Rows"][0];
			   
			   controllerWorkCenter.getWrkType();
               controllerWorkCenter.getWrkStatus();
		   
		   controllerWorkCenter.wrkModel.setProperty("/wrkDetails", oWrkData);
		   
		   controllerWorkCenter.enebledViewElements("RETRIEVE", oWrkData["IS_USED"]);
		},

        /* -------------------- Descrizione Piazzola - popup -------------------- */
        onOpenValueHelpWrkDesc: function (oEvent) {
            try {
                let Input = {
                    "WORKCENTER_ID": controllerWorkCenter.wrkModel.getProperty("/wrkDetails/WORKCENTER_ID")
                };
                
                Fragment.load({
                    name: "master_data.view.popup.workcenter.listWrkDesc",
                    controller: controllerWorkCenter
                }).then(function (oValueHelpDialogWrkDesc) {
                    controllerWorkCenter._oValueHelpDialog = oValueHelpDialogWrkDesc;
                    controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
                    
                    try {
                        let result = controller.sendData("GET_WRK_LIST_DESC", "WORKCENTER/TRANSACTION/WRK", Input);
                        if (result && result["Rows"]) {
                            controllerWorkCenter.wrkModel.setProperty("/tabDescrWrk", result["Rows"]);
                        } else {
                            console.error("Invalid response from GET_WRK_LIST_DESC:", result);
                            controllerWorkCenter.wrkModel.setProperty("/tabDescrWrk", []);
                        }
                    } catch (error) {
                        console.error("Error loading work center descriptions:", error);
                        controllerWorkCenter.wrkModel.setProperty("/tabDescrWrk", []);
                        MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nel caricamento delle descrizioni");
                    }
                    
                    controllerWorkCenter._oValueHelpDialog.open();
                });
            } catch (error) {
                console.error("Error opening value help dialog:", error);
                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nell'apertura del dialogo");
            }
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
            }, result = controller.sendData("SAVE_WRK_DESC", "WORKCENTER/TRANSACTION/WRK", Input);

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
            try {
                let oInput = {
                    "LANGUAGE": controller.language
                };
                let result = controller.sendData("GET_WOKCENTER_STATUS", "WORKCENTER/TRANSACTION/WRK", oInput);
                
                if (result && result["Rows"]) {
                    controllerWorkCenter.wrkModel.setProperty("/tabwrkStatus", result["Rows"]);
                } else {
                    console.error("Invalid response from GET_WOKCENTER_STATUS:", result);
                    controllerWorkCenter.wrkModel.setProperty("/tabwrkStatus", []);
                }
            } catch (error) {
                console.error("Error in getWrkStatus:", error);
                controllerWorkCenter.wrkModel.setProperty("/tabwrkStatus", []);
            }
        },

        deletePiazzola: function () {
            try {
                let oModel = controllerWorkCenter.wrkModel.getProperty("/wrkDetails"),
					oInput = {
						"WORKCENTER_ID": oModel["WORKCENTER_ID"] 
					};

                MessageBox.confirm((controller.oBundle.getText("viewWRK.messageConfirmDeletePiazzola") + " " + oModel["WORKCENTER"] + "?"), {
                    styleClass: "sapUiSizeCompact",
                    onClose: function (evt) {
                        if (evt == "OK") {
                            try {
                                let aResult = controller.sendData("DELETE_WRK", "WORKCENTER/TRANSACTION/WRK", oInput);
                                if (aResult && aResult[0] && aResult[0]["RC"] === "0") {
                                    controllerWorkCenter.newSlot(false);
                                    MessageToast.show(controller.oBundle ? controller.oBundle.getText("viewWRK.deleteSuccess") : "Piazzola eliminata con successo");
                                } else {
                                    let errorMessage = (aResult && aResult[0] && aResult[0]["MESSAGE"]) ? aResult[0]["MESSAGE"] : "Errore nell'eliminazione";
                                    MessageBox.error(errorMessage);
                                }
                            } catch (error) {
                                console.error("Error deleting work center:", error);
                                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nell'eliminazione della piazzola");
                            }
                        }
                    }
                });
            } catch (error) {
                console.error("Error in deletePiazzola:", error);
                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nell'operazione di eliminazione");
            }
        },

        saveUpdateNew: function () {
            try {
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
                };
                
                let aResult = controller.sendData("INSERT_WORKCENTER", "WORKCENTER/TRANSACTION/WRK", oInput);
                
                if (aResult && aResult[0] && aResult[0]["RC"] === "0") {
                    controllerWorkCenter.newSlot(false);
                    MessageToast.show(controller.oBundle ? controller.oBundle.getText("contrWRK.insertOK") : "Piazzola salvata con successo");
                } else {
                    let message = "";
                    
                    try {
                        message = (aResult && aResult[0] && aResult[0]["MESSAGE"]) ? 
                                 controller.oBundle.getText(aResult[0]["MESSAGE"]) : 
                                 aResult[0]["MESSAGE"];
                    } catch (err) {
                        message = (aResult && aResult[0] && aResult[0]["MESSAGE"]) ? 
                                 aResult[0]["MESSAGE"] : 
                                 "Errore nel salvataggio";
                    }
                    MessageBox.error(message);
                }
            } catch (error) {
                console.error("Error in saveUpdateNew:", error);
                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nel salvataggio della piazzola");
            }
        },

        /* -------------------- Download - libreria standard -------------------- */
        downloadModel: function () { 
            try{
                // Prima carica i dati per l'export
                let oInput = {
                    "LANGUAGE": controller.language,
                    "SITE": controller.site
                };
                let result = controller.sendData("GET_WRK_LIST_EXPORT", "WORKCENTER/TRANSACTION/TRANSDWN", oInput);
                
                // console.log("Export result:", result); // Debug
                
                // Controlla diversi possibili formati di risposta
                let exportData = null;
                if (result && result["Rows"]) {
                    exportData = result["Rows"];
                } else if (result && Array.isArray(result)) {
                    exportData = result;
                } else if (result) {
                    exportData = [result];
                }
                
                if (!exportData || exportData.length === 0) {
                    MessageBox.warning(controller.oBundle.getText("viewWRK.noDataToExport"));
                    return;
                }
                              
                let aCols = controllerWorkCenter.createColumnExportWrk();
                
                // Crea il nome file con data
                let dateExport = new Date();
                let mm = String(dateExport.getMonth() + 1).padStart(2, '0');
                let dd = String(dateExport.getDate()).padStart(2, '0');
                let dateExportStr = dateExport.getFullYear() + mm + dd;
                let fileName = controller.oBundle.getText("exportttle") + "_" + 
                               controller.oBundle.getText("viewWRK.wrkmain") + 
                               "_" + dateExportStr;
                
                let oSettings = {
                    workbook: {
                        columns: aCols,
                        context: {
                            sheetName: controller.oBundle.getText("viewWRK.wrkmain")
                        }
                    },
                    dataSource: exportData,
                    fileName: fileName
                };
                
                let oSheet = new Spreadsheet(oSettings);
                                 oSheet.build().then(function () {
                     MessageToast.show(controller.oBundle.getText("viewWRK.exportSuccess"));
                 }).finally(function () {
                     oSheet.destroy();
                 });
             } catch (err) {
                 console.error("Error in downloadModel:", err);
                 MessageBox.error(controller.oBundle.getText("controllerUpdate.err"));
             }
        },

        createColumnExportWrk: function () {
            let columns = [{
                    // PIAZZOLA
                    label: controller.oBundle.getText("viewWRK.dwnl.workArea"),
                    property: 'PIAZZOLA',
                    type: exportLibrary.EdmType.String,
					wrap : true,
					width: 25
                },{
                    // PIAZZOLA_DESCR
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaDescr"),   
					property: 'PIAZZOLA_DESCR',
					type: exportLibrary.EdmType.String,
					wrap : true,
					width: 60
                }, {
                    // TIPO - TIPO_DESCR
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaType") + " - " + controller.oBundle.getText("viewWRK.dwnl.workAreaDescr"),
                    property: ['TIPO', 'TIPO_DESCR'],
                    template: '{0} - {1}',
                    type: exportLibrary.EdmType.String,
					wrap : true,
					width: 60
                }, {
                    // GRUPPO_PIAZZOLA
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaGroup"),
                    property: 'GRUPPO_PIAZZOLA',
                    type: exportLibrary.EdmType.String,
					wrap : true,
					width: 15
                }];
                
            // Aggiungi colonna Authoma solo per sito ADIGE
            if (controller.site === "ADIGE") {
                columns.push({
                    // PARTIZIONE_AUTHOMA
                    label: controller.oBundle.getText("viewWRK.dwnl.workAreaAuthoma"),
                    property: 'PIAZZOLA_AUTHOMA',
                    type: exportLibrary.EdmType.String,
					wrap : true,
                    width: 25
                });
            }
            
            return columns;
		},

        /* -------------------- Definizione Tipo Piazzola -------------------- */
        getWrkType: function () {
            try {
                let oInput = {
                    "LANGUAGE": controller.language
                };
                let result = controller.sendData("GET_WOKCENTER_TYPE", "WORKCENTER/TRANSACTION", oInput);
                
                if (result && result["Rows"]) {
                    controllerWorkCenter.wrkModel.setProperty("/tabwrktype", result["Rows"]);
                } else {
                    console.error("Invalid response from GET_WOKCENTER_TYPE:", result);
                    controllerWorkCenter.wrkModel.setProperty("/tabwrktype", []);
                }
            } catch (error) {
                console.error("Error in getWrkType:", error);
                controllerWorkCenter.wrkModel.setProperty("/tabwrktype", []);
            }
        },
		
		undoWrkType: function(){
			controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC_TYPE", false);

			controllerWorkCenter.getWrkType();

			controllerWorkCenter.byId("btnCloseWrkType").setEnabled(false);
			controllerWorkCenter.byId("btnSaveWrkType").setEnabled(false);
		},
        
        newType: function () {
            var addRowModel = controllerWorkCenter.wrkModel.getProperty("/tabwrktype");
            var row = {
                "WORKCENTERTYPE_ID": "",
                "WORKCENTERTYPE": "",
                "WORKCENTERTYPE_DESC": "",
                "EDIT": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerWorkCenter.wrkModel.setProperty("/tabwrktype", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerWorkCenter.wrkModel.setProperty("/tabwrktype", newArr);
                } else {
                    var addArr = controllerWorkCenter.wrkModel.getProperty("/tabwrktype");
                    addArr.push(row);
                    controllerWorkCenter.wrkModel.setProperty("/tabwrktype", addArr);
                }
            }
			
			//Buttons
			controllerWorkCenter.byId("btnCloseWrkType").setEnabled(true);
			controllerWorkCenter.byId("btnSaveWrkType").setEnabled(true);
			
			//Scroll to last table Element
			controllerWorkCenter.byId("tabWrkType").setFirstVisibleRow(addRowModel.length); 
        },
		
        saveNewType: function () {
            try {
                var input = {};
                var model = controllerWorkCenter.wrkModel.getProperty("/tabwrktype");
                var Name = false;
                var Desc = false;
                var modInput = [];
                var obj = {};

                for (var i = 0; i < model.length; i++) {
                    if (model[i].EDIT === "true") {
                        if (model[i].WORKCENTERTYPE === "") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errMissSite"));
                        } else {
                            obj.WORKCENTERTYPE = model[i].WORKCENTERTYPE;
                            Name = true;
                        }
                        if (model[i].WORKCENTERTYPE_DESC === "") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errMissSiteDescr"));
                        } else {
                            obj.WORKCENTERTYPE_DESC = model[i].WORKCENTERTYPE_DESC;
                            Desc = true
                        }
                        obj.LANGUAGE = controller.language;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
                if (modInput.length === 0) {
                    return MessageToast.show(controller.oBundle.getText("contrSite.insertSite"));
                } else {
                    if (Desc && Name) {
                        input = {
                            "DATA": JSON.stringify(modInput)
                        };
                        controllerWorkCenter.getDataSync("INSERT_WRKTYPE", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION", input, controllerWorkCenter.saveNewTypeSuccess, controllerWorkCenter.transactionError);
                    }
                }
            } catch (error) {
                console.error("Error in saveNewType:", error);
                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nel salvataggio del tipo piazzola");
            }
        },
		
        saveNewTypeSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                if (jsonArrStr && jsonArrStr.trim() !== "") {
                    var jsonArr = JSON.parse(jsonArrStr);
                    if (jsonArr && jsonArr[0] && jsonArr[0].RC == "0") {
                        controllerWorkCenter.getWrkType();
                        
                        // Disabilita i bottoni dopo il salvataggio con successo
                        controllerWorkCenter.byId("btnCloseWrkType").setEnabled(false);
                        controllerWorkCenter.byId("btnSaveWrkType").setEnabled(false);
                        
                        MessageToast.show(controller.oBundle ? controller.oBundle.getText("contrWRK.insertOK") : "Operazione completata con successo");
                    } else {
                        var errorMessage = (jsonArr && jsonArr[0] && jsonArr[0].MESSAGE) ? jsonArr[0].MESSAGE : "Errore nell'operazione";
                        MessageBox.error(errorMessage);
                    }
                } else {
                    console.error("Empty response from server");
                    MessageBox.error("Risposta vuota dal server");
                }
            } catch (e) {
                console.error("Error parsing response:", e);
                console.error("Raw response:", jsonArrStr);
                MessageBox.error(controller.oBundle ? controller.oBundle.getText("controllerUpdate.err") : "Errore nell'elaborazione della risposta");
            }
        },
		
        deleteNewType: function (oEvent) {
            var lineSel = controllerWorkCenter.wrkModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            var typeID = {
                "WORKCENTERTYPE_ID": lineSel.WORKCENTERTYPE_ID
            };
            var input = [];
            input = typeID;
            var bCompact = !!controllerWorkCenter.getView().$().closest(".sapUiSizeCompact").length;
            MessageBox.confirm((controller.oBundle.getText("viewWRK.messageConfirmDelete") + " " + lineSel.WORKCENTERTYPE + "?"), {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (evt) {
                    if (evt == "OK") {
                        controllerWorkCenter.getDataSync("DELETE_WORKCENTER_TYPE", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION", input, controllerWorkCenter.deleteNewTypeSuccess, this.transactionError);
                    } else {
                        controllerWorkCenter.getWrkType();
                    }
                }
            });
        },
		
		deleteNewTypeSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC == "0")
                    controllerWorkCenter.getWrkType();
                else {
                    MessageBox.warning(jsonArr[0].MESSAGE)
                }
            } catch (e) {
                //MessageBox.warning("TRANSACTION ERROR: GET_SITE. Main Controller line: 43", {onClose: function () {}});
            }
        },
		
		editType: function (evt) {
            var lineSel = controllerWorkCenter.wrkModel.getProperty(evt.oSource.getBindingContext().sPath);
            if (!controllerWorkCenter._oValueHelpDialog) {
                controllerWorkCenter._oValueHelpDialog = sap.ui.xmlfragment("master_data.view.popup.workcenter.modType", controllerWorkCenter);
                controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
            }
            
            controllerWorkCenter._selectedTypeData = {
                WORKCENTERTYPE: lineSel.WORKCENTERTYPE,
                WORKCENTERTYPE_ID: lineSel.WORKCENTERTYPE_ID
            };
            
            var input = {
                "WORKCENTERTYPE_ID": lineSel.WORKCENTERTYPE_ID
            };
            controllerWorkCenter.getDataSync("GET_WOKCENTER_TYPE_DESCR", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION", input, controllerWorkCenter.editTypeSuccess, this.transactionError);
        },
		
        editTypeSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabDescrtype", jsonArr.Rows, false);
                controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
                controllerWorkCenter._oValueHelpDialog.open();
                
                setTimeout(function() {
                    var inputTypeControl = sap.ui.getCore().byId("inputType");
                    var typeIdControl = sap.ui.getCore().byId("TypeId");
                    
                    if (inputTypeControl && controllerWorkCenter._selectedTypeData) {
                        inputTypeControl.setValue(controllerWorkCenter._selectedTypeData.WORKCENTERTYPE);
                    }
                    if (typeIdControl && controllerWorkCenter._selectedTypeData) {
                        typeIdControl.setValue(controllerWorkCenter._selectedTypeData.WORKCENTERTYPE_ID);
                    }
                }, 100);
            } catch (error) {}
        },
		
         newDescrType: function () {
            var addRowModel = controllerWorkCenter.wrkModel.getProperty("/tabDescrtype");
            var idType = sap.ui.getCore().byId("TypeId").getValue();
            var row = {
                "WORKCENTERTYPE_ID": "" + idType + "",
                "LANG": "",
                "WORKCENTERTYPE_DESC": "",
                "DEL": "false"
            };
            addRowModel.push(row);
            controllerWorkCenter.wrkModel.setProperty("/tabDescrSite", addRowModel);
        },
		
        confirmEditType: function () {
            var model = controllerWorkCenter.wrkModel.getProperty("/tabDescrtype");
            var arrInput = [];
            var bCompact = !!controllerWorkCenter.getView().$().closest(".sapUiSizeCompact").length;

            for (var i = 0; i < model.length; i++) {
                if (model[i].DEL == "false" || model[i].LANG != "") {
                    for (var j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANG == model[j].LANG & model[j].DEL == "false") {
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
                controllerWorkCenter.getDataSync("EDIT_WORKCENTER_TYPE_DESCR", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION", input, controllerWorkCenter.confirmEditTypeSuccess, this.transactionError);
            }
        },
		
        confirmEditTypeSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC == "0") {
                    controllerWorkCenter.getWrkType();
                    controllerWorkCenter.closePopup();
                    MessageToast.show(controller.oBundle.getText("contrWRK.insertOK"));
                } else {
                    MessageBox.warning(jsonArr[0].MESSAGE);
                }
            } catch (e) {
                console.error("Error parsing response:", e);
                MessageBox.error(controller.oBundle.getText("errRoleActivity.inputErr"));
            }
        },
		
        deleteWorkCenterTypeDescr: function (evt) {
            var lineSel = controllerWorkCenter.wrkModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            controllerWorkCenter.wrkModel.refresh();
        },
       
        /* -------------------- Orari Lavorativi -------------------- */
        openWkcHelpHours: function (oEvent) {
            // Dati apertura popup presi da controllerWorkCenter.wrkModel.getProperty("/tabwrklist");

            //if(!controllerWorkCenter.wrkModel.getProperty("/tabwrklist")){
            var input = {};
            input.LANGUAGE = controller.language;
            input.SITE = controller.site;
            input.WORKCENTER = controllerWorkCenter._wrkcenter;
            controllerWorkCenter.getDataSync("GET_LIST_WRK_FOR_SEARCH_DISP", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.getWrkListsuccess, controllerWorkCenter.transactionError);
            //  }

            if (!controllerWorkCenter._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.workcenter.listwrkHours",
                    controller: controllerWorkCenter
                }).then(function (oValueHelpDialog) {
                    controllerWorkCenter._oValueHelpDialog = oValueHelpDialog;
                    controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
                    controllerWorkCenter._oValueHelpDialog.open();
                });
            } else {
                controllerWorkCenter._oValueHelpDialog.open();
            }

            //Salvo la riga selezionata
            controllerWorkCenter.wrkModel.setProperty("/rowSynopticSel", oEvent.oSource.getBindingContext().sPath);
        },

        getWrkListsuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrklist", jsonArr.Rows, false);
                controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            } catch (e) {}
        },

        confirmWkcHelpHours: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var modelRowSel = controllerWorkCenter.wrkModel.getProperty(controllerWorkCenter.wrkModel.getProperty("/rowSynopticSel"));
            var model = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours");
            var checkField = oSelectedItem.mProperties.highlightText + "-" + modelRowSel["USER_ID"];

            for (var i = 0; i < model.length; i++) {
                if (model[i].CHECK_FIELD === checkField) {
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errSelUser"));
                }
            }

            modelRowSel.CHECK_FIELD = checkField;
            modelRowSel.WORKCENTER_ID = oSelectedItem.mProperties.highlightText;
            modelRowSel.WORKCENTER = oSelectedItem.mProperties.title;

            modelRowSel.EDIT = "true";
			controllerWorkCenter.byId("saveNewHours").setEnabled(true);
            controllerWorkCenter.wrkModel.refresh();
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			
            controllerWorkCenter.closeDialog();
            controllerWorkCenter.wrkModel.setProperty("/rowSynopticSel", "");
        },

        openUserHelpHours: function (oEvent) {

            var input = {};
            input.SITE_ID = controller.model.getProperty("/user")[0]["SiteId"];
            controllerWorkCenter.getDataSync("GET_LIST_USER", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerWorkCenter.getUserListsuccess, controllerWorkCenter.transactionError);

            if (!controllerWorkCenter._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.workcenter.listUsrHours",
                    controller: controllerWorkCenter
                }).then(function (oValueHelpDialog) {
                    controllerWorkCenter._oValueHelpDialog = oValueHelpDialog;
                    controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
                    controllerWorkCenter._oValueHelpDialog.open();
                });
            } else {
                controllerWorkCenter._oValueHelpDialog.open();
            }

            //Salvo la riga selezionata
            controllerWorkCenter.wrkModel.setProperty("/rowSynopticSel", oEvent.oSource.getBindingContext().sPath);
        },

        getUserListsuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabUserlist", jsonArr.Rows, false);
                controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            } catch (e) {}
        },
		
		onSelectionChangeRowTabHours: function (oEvent) {
            if (oEvent.oSource.getSelectedIndex() < 0) {
                controllerWorkCenter.rowSelTabWrkHours = "";
            } else {
                controllerWorkCenter.rowSelTabWrkHours = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours/" + oEvent.oSource.getSelectedIndex());
            }
        },

        newHours: function () {
            var addRowModel = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours");

            if (controllerWorkCenter.rowSelTabWrkHours === "") {
                var row = {
                    "WORKING_HOURS_ID": "",
                    "WORKCENTER_ID": "",
                    "WORKCENTER": "",
                    "USER_ID": "",
                    "USER": "",
                    "HOURS_TO_1": "",
                    "HOURS_FROM_1": "",
                    "HOURS_TO_2": "",
                    "HOURS_FROM_2": "",
                    "HOURS_TO_3": "",
                    "HOURS_FROM_3": "",
                    "EDIT": "true",
                    "VIS": "true",
                    "DEL": "false"
                };
            } else {
                var row = {
                    "WORKING_HOURS_ID": "",
                    "WORKCENTER_ID": "",
                    "WORKCENTER": "",
                    "USER_ID": "",
                    "USER": "",
                    "HOURS_TO_1": controllerWorkCenter.rowSelTabWrkHours["HOURS_TO_1"],
                    "HOURS_FROM_1": controllerWorkCenter.rowSelTabWrkHours["HOURS_FROM_1"],
                    "HOURS_TO_2": controllerWorkCenter.rowSelTabWrkHours["HOURS_TO_2"],
                    "HOURS_FROM_2": controllerWorkCenter.rowSelTabWrkHours["HOURS_FROM_2"],
                    "HOURS_TO_3": controllerWorkCenter.rowSelTabWrkHours["HOURS_TO_3"],
                    "HOURS_FROM_3": controllerWorkCenter.rowSelTabWrkHours["HOURS_FROM_3"],
                    "EDIT": "true",
                    "VIS": "true",
                    "DEL": "false"
                };
            }

            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerWorkCenter.wrkModel.setProperty("/tabWrkHours", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerWorkCenter.wrkModel.setProperty("/tabWrkHours", newArr);
                } else {
                    var addArr = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours");
                    addArr.push(row);
                    controllerWorkCenter.wrkModel.setProperty("/tabWrkHours", addArr);
                }
            }
			
			// Abilita modalità di modifica per gli orari
			controllerWorkCenter.enabledWorkCenterFields("NEW_WKC_HOURS", true);
			
			//Scroll to last table Element
			controllerWorkCenter.byId("tabWrkHours").setFirstVisibleRow(addRowModel.length); 
        },

        saveNewHours: function () {
            var modInput = [];
            var obj = {};
            var model = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours");

            /*Controllo unicità inserimenti prima di salvare*/
            for (var i = 0; i < model.length; i++) {
                for (var j = i + 1; j < model.length; j++) {
                    if ((model[i].CHECK_FIELD === (model[j].CHECK_FIELD.split("-")[0] === "" ? "NULL" : model[j].CHECK_FIELD.split("-")[0]) + "-" + (model[j].CHECK_FIELD.split("-")[1] === "" ? "NULL" : model[j].CHECK_FIELD.split("-")[1])) && model[j].DEL != 'true' && model[j].DEL != 'true') {
                        return MessageToast.show(controller.oBundle.getText("contrWRK.errSelUser"));
                    }
                }
            }

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if (model[i].DEL === "true" && model[i].WORKING_HOURS_ID === "") {}
                    else {
                        obj.WORKING_HOURS_ID = model[i].WORKING_HOURS_ID;
                        obj.WORKCENTER_ID = model[i].WORKCENTER_ID;
                        obj.USER_ID = model[i].USER_ID;
                        obj.HOURS_TO_1 = model[i].HOURS_TO_1;
                        obj.HOURS_FROM_1 = model[i].HOURS_FROM_1;
                        obj.HOURS_TO_2 = model[i].HOURS_TO_2;
                        obj.HOURS_FROM_2 = model[i].HOURS_FROM_2;
                        obj.HOURS_TO_3 = model[i].HOURS_TO_3;
                        obj.HOURS_FROM_3 = model[i].HOURS_FROM_3;
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }

            if (modInput.length === 0) {
                controllerWorkCenter.getHoursList();
                return
            }

            var Input = {
                "DATA": JSON.stringify(modInput),
                "SITE_ID": controller.SiteId
            };

            var result = controller.sendData("SAVE_WORKING_HOURS", "WORKCENTER/TRANSACTION", Input);
            if (result[0].RC != "0") {
                MessageBox.warning(controller.oBundle.getText("contrWRK.insertKO") + " " + result[0].MESSAGE, {
                    onClose: function () {}
                });
                         } else {
                 MessageToast.show(controller.oBundle.getText("contrWRK.insertOK"));
                 
                 // Reset alla modalità default dopo il salvataggio
                 controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC_HOURS", false);
                 controllerWorkCenter.rowSelTabWrkHours = "";
             }
            controllerWorkCenter.getHoursList();
        },

        getHoursList: function () {
            var Input = {
                "SITE_ID": controller.SiteId
                //,"LANGUAGE": controller.language
            };
            var result = controller.sendData("GET_HOURS_LIST", "WORKCENTER/TRANSACTION", Input);
            controllerWorkCenter.wrkModel.setProperty("/tabWrkHours", result);
			
			//Buttons
			controllerWorkCenter.byId("btnCloseNewHours").setEnabled(false);
			controllerWorkCenter.byId("saveNewHours").setEnabled(false);
        },

        handleChangeHours: function (oEvent) {
            var indexRowSelObj = oEvent.getParameter("id").split("-")[0].substring(oEvent.getParameter("id").split("-")[0].length - 1, oEvent.getParameter("id").split("-")[0].length);
	        var rowSel = controllerWorkCenter.wrkModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            var regex = new RegExp(':', 'g');
            var prefix,
            prevPrefix,
            nextPrefix;
            var previndexRowSelObj,
            nextIndexRowSelObj;

            switch (indexRowSelObj) {
            case 0:
                indexRowSelObj = 1;
                previndexRowSelObj = 1;
                nextIndexRowSelObj = 1;
                prefix = "HOURS_TO_";
                prevPrefix = "HOURS_TO_";
                nextPrefix = "HOURS_FROM_";
                break;
            case 1:
                indexRowSelObj = 1;
                previndexRowSelObj = 1;
                nextIndexRowSelObj = 2;
                prefix = "HOURS_FROM_";
                prevPrefix = "HOURS_TO_";
                nextPrefix = "HOURS_TO_";
                break;
            case 2:
                indexRowSelObj = 2;
                previndexRowSelObj = 1;
                nextIndexRowSelObj = 2;
                prefix = "HOURS_TO_";
                prevPrefix = "HOURS_FROM_";
                nextPrefix = "HOURS_FROM_";
                break;
            case 3:
                indexRowSelObj = 2;
                previndexRowSelObj = 2;
                nextIndexRowSelObj = 3;
                prefix = "HOURS_FROM_";
                prevPrefix = "HOURS_TO_";
                nextPrefix = "HOURS_TO_";
                break;
            case 4:
                indexRowSelObj = 3;
                previndexRowSelObj = 2;
                nextIndexRowSelObj = 3;
                prefix = "HOURS_TO_";
                prevPrefix = "HOURS_FROM_";
                nextPrefix = "HOURS_FROM_";
                break;
            case 5:
                indexRowSelObj = 3;
                previndexRowSelObj = 3;
                nextIndexRowSelObj = 3;
                prefix = "HOURS_FROM_";
                prevPrefix = "HOURS_TO_";
                nextPrefix = "HOURS_FROM_";
                break;
            default:
                indexRowSelObj = 1;
                previndexRowSelObj = 1;
                nextIndexRowSelObj = 1;
                prefix = "HOURS_TO_";
                prevPrefix = "HOURS_TO_";
                nextPrefix = "HOURS_FROM_";
                break;
            }

            if (!isNaN(parseInt(rowSel[nextPrefix + nextIndexRowSelObj].replace(regex, ''), 10))) {
                if ((parseInt(rowSel[prefix + indexRowSelObj].replace(regex, ''), 10) < parseInt(rowSel[prevPrefix + previndexRowSelObj].replace(regex, ''), 10))
                     || (parseInt(rowSel[prefix + indexRowSelObj].replace(regex, ''), 10) > parseInt(rowSel[nextPrefix + nextIndexRowSelObj].replace(regex, ''), 10))
                     || isNaN(parseInt(rowSel[prefix + indexRowSelObj].replace(regex, ''), 10)) || isNaN(parseInt(rowSel[prevPrefix + previndexRowSelObj].replace(regex, ''), 10))) {
                    rowSel[prefix + indexRowSelObj] = "";
                    controllerWorkCenter.byId("saveNewHours").setEnabled(false);
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errinsertHours"))
                }
                rowSel.EDIT = "true";
                rowSel.DEL = "false";
				//Buttons
				controllerWorkCenter.byId("btnCloseNewHours").setEnabled(true);
                controllerWorkCenter.byId("saveNewHours").setEnabled(true);
                controllerWorkCenter.wrkModel.refresh();
            } else {
                if ((parseInt(rowSel[prefix + indexRowSelObj].replace(regex, ''), 10) < parseInt(rowSel[prevPrefix + previndexRowSelObj].replace(regex, ''), 10))
                     || isNaN(parseInt(rowSel[prefix + indexRowSelObj].replace(regex, ''), 10)) || isNaN(parseInt(rowSel[prevPrefix + previndexRowSelObj].replace(regex, ''), 10))) {
                    rowSel[prefix + indexRowSelObj] = "";
                    controllerWorkCenter.byId("saveNewHours").setEnabled(false);
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errinsertHours"))
                } 
                rowSel.EDIT = "true";
                rowSel.DEL = "false";
                controllerWorkCenter.wrkModel.refresh();

                if (nextPrefix === "HOURS_FROM_") {
                    controllerWorkCenter.byId("saveNewHours").setEnabled(false);
                } else {
					//Buttons
					controllerWorkCenter.byId("btnCloseNewHours").setEnabled(true);
                    controllerWorkCenter.byId("saveNewHours").setEnabled(true);
                }
            }

        },

        deleteAllHours: function () {
			MessageBox.confirm(controller.oBundle.getText("contrWRK.confirmDeleteAllWorkingHours"), {
					title: controller.oBundle.getText("contrWRK.confirmDeleteAllWorkingHoursTitle"),
					onClose: function (oAction) {
						if(oAction === "OK"){
							var modWrkHours = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours");

							for (var i in modWrkHours) {
								modWrkHours[i]["DEL"] = "true";
								modWrkHours[i]["VIS"] = "false";
							}

							// Abilita modalità di modifica
							controllerWorkCenter.enabledWorkCenterFields("NEW_WKC_HOURS", true);
							controllerWorkCenter.wrkModel.refresh();
						}
					},
					actions: [ sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					emphasizedAction: sap.m.MessageBox.Action.CANCEL,
					initialFocus: sap.m.MessageBox.Action.CANCEL,
					textDirection: sap.ui.core.TextDirection.Inherit
			});        
        },

        deleteHoursPos: function (oEvent) {
            var lineSel = controllerWorkCenter.wrkModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.VIS = "false";
            lineSel.EDIT = "true";
            
            // Abilita modalità di modifica
            controllerWorkCenter.enabledWorkCenterFields("NEW_WKC_HOURS", true);
            controllerWorkCenter.wrkModel.refresh();
        },

        /*
        onWorkcenterChangeInHours: function (oEvent) {
            let sValue = oEvent.getParameter("value");
            if (sValue && sValue.trim() !== "") {
                controllerWorkCenter.enabledWorkCenterFields("ENABLE_SAVE_HOURS", true);
            }
        },
        */

        confirmUserHelpHours: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var modelRowSel = controllerWorkCenter.wrkModel.getProperty(controllerWorkCenter.wrkModel.getProperty("/rowSynopticSel"));
            var model = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours");
            var checkField = modelRowSel["WORKCENTER_ID"] + "-" + oSelectedItem.mProperties.highlightText;

            for (var i = 0; i < model.length; i++) {
                if (model[i].CHECK_FIELD === checkField) {
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errSelUser"));
                }
            }

            modelRowSel.CHECK_FIELD = checkField;
            modelRowSel.USER_ID = oSelectedItem.mProperties.highlightText;
            modelRowSel.USER = oSelectedItem.mProperties.title;

            modelRowSel.EDIT = "true";
			controllerWorkCenter.byId("saveNewHours").setEnabled(true);
            controllerWorkCenter.wrkModel.refresh();
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			
            controllerWorkCenter.closeDialog();
            controllerWorkCenter.wrkModel.setProperty("/rowSynopticSel", "");
        },

        handleUserSearchHours: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        /* -------------------- Sinottico -------------------- */
        
        // Funzione helper per impostare maxWkcNumber con controllo errori
        setMaxWkcNumber: function(oModel, oSynopticSetup, sSynopticPage) {
            if (oSynopticSetup && oSynopticSetup["MaxWorkcenterNumber"]) {
                oModel["maxWkcNumber"] = oSynopticSetup["MaxWorkcenterNumber"];
                return true; // Successo
            } else {
                oModel["maxWkcNumber"] = null;
                console.error("Errore: MaxWorkcenterNumber non trovato per la pagina", sSynopticPage);
                MessageBox.error(controller.oBundle.getText("contrWRK.errMaxWkcNumberNotFound") || 
                               "Errore: Impossibile determinare il numero massimo di posizioni per questa pagina sinottico.");
                return false; // Errore
            }
        },

        getSynopticList: function (sSynopticKey, nSynopticType, sSynopticPage) {        
			// Reset alla modalità default per sinottico
			controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
			
            let oModel = controllerWorkCenter.wrkModel.getProperty("/SynopticDetails"),
				oSynopticSetup = _.filter(controllerWorkCenter.wrkModel.getProperty("/AllSynopticPages"), function(o){ return o.SynopticPage === sSynopticPage})[0];
				// console.log("Setup dati sinottico per pagina", sSynopticPage, ":", oSynopticSetup);
				
                switch (sSynopticKey) {
                    case "SYNOPTIC":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynoptic";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBkc";
                        oModel["tableId"] = "tabWrkSyn";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return; // Ferma l'esecuzione se ci sono errori
						}
                        break;
                    case "SYNOPTICADIGESTR1":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticAdigeStr1";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticAdigeStr1Bkc";
                        oModel["tableId"] = "tabWrkSynAdigeStr1";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                    case "SYNOPTICBGS1":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticBGS1";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBGS1Bkc";
                        oModel["tableId"] = "tabWrkSynBGS1";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                    case "SYNOPTICBGS2":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticBGS2";
                        oModel["synopticType"] = "/tabSynopticBGS2Bkc";
                        oModel["propertySynopticPathBkc"] = "tabWrkSynBGS2";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                    case "SYNOPTICADIGESYS1":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticAdigeSys1";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticAdigeSys1Bkc";
                        oModel["tableId"] = "tabWrkSynAdigeSys1";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                    /*case "SYNOPTICADIGESYS2":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticAdigeSys2";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticAdigeSys2Bkc";
                        oModel["tableId"] = "tabWrkSynAdigeSys2";
						oModel["maxWkcNumber"] = 11;
                        break;*/
                    case "SYNOPTICADIGESYS3":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticAdigeSys3";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticAdigeSys3Bkc";
                        oModel["tableId"] = "tabWrkSynAdigeSys3";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break; 
                    case "SYNOPTICBGUSA":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticBgusa";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBgusaBkc";
                        oModel["tableId"] = "tabWrkBgusa";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break; 
                    case "SYNOPTICBLM1":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticBlm1";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBlm1Bkc";
                        oModel["tableId"] = "tabWrkSynBlm1";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                    case "SYNOPTICBLM2":
					    oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticBlm2";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBlm2Bkc";
                        oModel["tableId"] = "tabWrkSynBlm2";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                    case "SYNOPTICBLM3":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticBlm3";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBlm3Bkc";
                        oModel["tableId"] = "tabWrkSynBlm3";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                    case "SYNOPTICBLM4":
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynopticBlm4";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBlm4Bkc";
                        oModel["tableId"] = "tabWrkSynBlm4";
						if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;		
                    default:	
						oModel["sKey"] = sSynopticKey;
						oModel["sPage"] = sSynopticPage;
                        oModel["synopticType"] = nSynopticType;
                        oModel["propertySynopticPath"] = "/tabSynoptic";
                        oModel["propertySynopticPathBkc"] = "/tabSynopticBkc";
                        oModel["tableId"] = "tabWrkSyn";
                        if (!controllerWorkCenter.setMaxWkcNumber(oModel, oSynopticSetup, sSynopticPage)) {
							return;
						}
                        break;
                }
				
                let oInput = {
                    "SITE_ID": controller.SiteId,
                    "LANGUAGE": controller.language,
                    "SYNOPTIC_TYPE": nSynopticType,
					"PAGE": sSynopticPage
                };
				
				controllerWorkCenter.refreshSynopticData(oInput);
        },
		
		onChangeSynopticPages: function(oEvent){
		 let oItemSel = controllerWorkCenter.wrkModel.getProperty(oEvent.getParameter("selectedItem").getBindingContext().sPath),
			 oInput = {
				"SITE_ID": controller.SiteId,
				"LANGUAGE": controller.language,
				"SYNOPTIC_TYPE": oItemSel["SynopticType"],
				"PAGE": oItemSel["SynopticPage"]
			 };
			
			// aggiorna anche SynopticDetails con la nuova pagina selezionata
			let oSynopticDetails = controllerWorkCenter.wrkModel.getProperty("/SynopticDetails");
			oSynopticDetails["sPage"] = oItemSel["SynopticPage"];
			oSynopticDetails["synopticType"] = oItemSel["SynopticType"];
			
			// aggiorno il maxWkcNumber per la nuova pagina selezionata
			if (oItemSel["MaxWorkcenterNumber"]) {
				oSynopticDetails["maxWkcNumber"] = parseInt(oItemSel["MaxWorkcenterNumber"]);
			} else {
				console.error("Debug onChangeSynopticPages - MaxWorkcenterNumber non trovato per la pagina:", oItemSel["SynopticPage"]);
			}
			
			controllerWorkCenter.wrkModel.setProperty("/SynopticDetails", oSynopticDetails);
			
			 controllerWorkCenter.refreshSynopticData(oInput);
		},
		
		refreshSynopticData: function(oInput){
			let oModel = controllerWorkCenter.wrkModel.getProperty("/SynopticDetails");
			
			if(oInput === ""){				
				oInput = {
					"SITE_ID": controller.SiteId,
					"LANGUAGE": controller.language,
					"SYNOPTIC_TYPE": oModel["synopticType"],
					"PAGE": oModel["sPage"]
				}; 
			}
			
			// verifico che maxWkcNumber sia ancora corretto per la pagina corrente
			let oSynopticSetup = _.filter(controllerWorkCenter.wrkModel.getProperty("/AllSynopticPages"), function(o){ 
				return o.SynopticPage === oInput.PAGE;
			})[0];
			
			if (oSynopticSetup && oSynopticSetup.MaxWorkcenterNumber) {
				let newMaxWkc = parseInt(oSynopticSetup.MaxWorkcenterNumber);
				if (oModel["maxWkcNumber"] !== newMaxWkc) {
					oModel["maxWkcNumber"] = newMaxWkc;
					controllerWorkCenter.wrkModel.setProperty("/SynopticDetails", oModel);
				}
			}
			
			let aResult = controller.sendData("GET_SYNOPTIC_LIST", "WORKCENTER/TRANSACTION", oInput);
                
				controllerWorkCenter.wrkModel.setProperty(oModel["propertySynopticPath"], aResult);
                controllerWorkCenter.wrkModel.setProperty(oModel["propertySynopticPathBkc"], JSON.parse(JSON.stringify(aResult)));
		},

        newPosSyn: function () {            
            let oModel = controllerWorkCenter.wrkModel.getProperty("/SynopticDetails"),            
				// Determina la sezione attiva per ottenere il path corretto
				addRowModel = controllerWorkCenter.wrkModel.getProperty(oModel["propertySynopticPath"]);
			
            if (!addRowModel) addRowModel = [];

            // Controllo se maxWkcNumber è disponibile
            if (oModel["maxWkcNumber"] === null || oModel["maxWkcNumber"] === undefined) {
                MessageBox.error(controller.oBundle.getText("contrWRK.errMaxWkcNumberNotFound") || 
                               "Errore: Impossibile determinare il numero massimo di posizioni.");
                return;
            }

            // Conta solo le righe attive (non eliminate)
            let activeRows = addRowModel.filter(row => row.DEL !== "true");
            let currentActiveCount = activeRows.length;
            
            if (currentActiveCount < oModel["maxWkcNumber"]) {
                let oRow = {
                    "WORKCENTER_ID": "",
                    "WORKCENTER": "",
                    "WORKCENTER_DESCR": "",
                    "POSITION": "",
                    "EDIT": "true",
                    "DEL": "false"
                };
                addRowModel.push(oRow);
                controllerWorkCenter.wrkModel.setProperty(oModel["propertySynopticPath"], addRowModel);
                controllerWorkCenter.wrkModel.setProperty(oModel["propertySynopticPathBkc"], JSON.parse(JSON.stringify(addRowModel)));
				
				controllerWorkCenter.enabledWorkCenterFields("NEW_SYNOPTIC", true);
				
				//Scroll to last table Element
				controllerWorkCenter.byId(oModel["tableId"]).setFirstVisibleRow(addRowModel.length);
            } else {
                return MessageToast.show(controller.oBundle.getText("contrWRK.maxLimit"));
            }
        },

        openWkcHelp: function (oEvent) {            
            let input = {
				LANGUAGE: controller.language,
				SITE: controller.site,
				WORKCENTER: controllerWorkCenter._wrkcenter
			};
            controllerWorkCenter.getDataSync("GET_LIST_WRK_FOR_SEARCH_DISP", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.getWrkListsuccess, controllerWorkCenter.transactionError);

            if (!controllerWorkCenter._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.workcenter.listwrkSynoptic",
                    controller: controllerWorkCenter
                }).then(function (oValueHelpDialog) {
                    controllerWorkCenter._oValueHelpDialog = oValueHelpDialog;
                    controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
                    controllerWorkCenter._oValueHelpDialog.open();
                });
            } else {
                controllerWorkCenter._oValueHelpDialog.open();
            }

            //Salvo la riga selezionata
			controllerWorkCenter.wrkModel.setProperty("/rowSynopticSel", oEvent.oSource.getBindingContext().sPath);
        },
		
		confirmWkcHelp: function (oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem"),
				aModelRowSel = controllerWorkCenter.wrkModel.getProperty(controllerWorkCenter.wrkModel.getProperty("/rowSynopticSel")),
				oModelSynopticDetails = controllerWorkCenter.wrkModel.getProperty("/SynopticDetails"),
				aModel = controllerWorkCenter.wrkModel.getProperty(oModelSynopticDetails["propertySynopticPath"]);


            for (let i = 0; i < aModel.length; i++) {
                if (aModel[i].WORKCENTER === oSelectedItem.mProperties.title) {
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errSelWkc"));
                }
            }

            aModelRowSel["WORKCENTER_ID"] = oSelectedItem.mProperties.highlightText;
            aModelRowSel["WORKCENTER"] = oSelectedItem.mProperties.title;
            aModelRowSel["WORKCENTER_DESCR"] = oSelectedItem.mProperties.description;

            aModelRowSel["EDIT"] = "true";
            controllerWorkCenter.wrkModel.refresh();
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			
            controllerWorkCenter.closeDialog();
			controllerWorkCenter.wrkModel.setProperty("/rowSynopticSel", "");
        },
		
		controlPositionValue: function (oEvent) {
            let valueParam = oEvent.mParameters.value,
				oModelSynopticDetails = controllerWorkCenter.wrkModel.getProperty("/SynopticDetails"),
				aModel = controllerWorkCenter.wrkModel.getProperty(oModelSynopticDetails["propertySynopticPath"]),
				aModelBkc = controllerWorkCenter.wrkModel.getProperty(oModelSynopticDetails["propertySynopticPathBkc"]),
				sRowPath = oEvent.oSource.oParent.oBindingContexts.undefined.sPath;

            // Controllo se maxWkcNumber è disponibile
            if (oModelSynopticDetails["maxWkcNumber"] === null || oModelSynopticDetails["maxWkcNumber"] === undefined) {
                MessageBox.error(controller.oBundle.getText("contrWRK.errMaxWkcNumberNotFound") || 
                               "Errore: Impossibile determinare il numero massimo di posizioni.");
                return;
            }

            if (valueParam != "") {
                if (valueParam < 1 || valueParam > oModelSynopticDetails["maxWkcNumber"]) {
                    valueParam = oEvent.oSource.mProperties.value;
                    aModel[sRowPath.split("/")[2]]["POSITION"] = aModelBkc[sRowPath.split("/")[2]]["POSITION"];
                    controllerWorkCenter.wrkModel.refresh(true);
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errPosInterval") + oModelSynopticDetails["maxWkcNumber"])
                } else if (valueParam.replace(".", ",") % 1 != 0) {
                    valueParam = oEvent.oSource.mProperties.value;
                    aModel[sRowPath.split("/")[2]]["POSITION"] = aModelBkc[sRowPath.split("/")[2]]["POSITION"];
                    controllerWorkCenter.wrkModel.refresh(true);
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errPosInt"))
                } else {
                    controllerWorkCenter.wrkModel.getProperty(sRowPath)["EDIT"] = "true";                    
                }

                let index = sRowPath.split("/")[2];

                for (let i = 0; i < aModel.length; i++) {
                    if (aModel[i].POSITION === valueParam && i != index) {
                        valueParam = oEvent.oSource.mProperties.value;
                        aModel[sRowPath.split("/")[2]]["POSITION"] = aModelBkc[sRowPath.split("/")[2]]["POSITION"];
                        controllerWorkCenter.getView().byId("tabWrkSyn").getModel().refresh(true);
                        return MessageToast.show(controller.oBundle.getText("contrWRK.errPosAlreadyExists"))
                    }
                }

            } else {
               controllerWorkCenter.wrkModel.getProperty(sRowPath)["EDIT"] = "true"; 
            }
			
			controllerWorkCenter.enabledWorkCenterFields("NEW_SYNOPTIC", true);
        },
		
		deleteSynopticPos: function (oEvent) {
            let lineSel = controllerWorkCenter.wrkModel.getProperty(oEvent.oSource.getBindingContext().sPath);
				lineSel["DEL"] = "true";
				lineSel["EDIT"] = "true";
				
            controllerWorkCenter.wrkModel.refresh();
			controllerWorkCenter.enabledWorkCenterFields("NEW_SYNOPTIC", true);
        },

        savePosSyn: function () {
			let oModelSynopticDetails = controllerWorkCenter.wrkModel.getProperty("/SynopticDetails"),
				aModel = controllerWorkCenter.wrkModel.getProperty(oModelSynopticDetails["propertySynopticPath"]),
				obj = {},
				aModInput = [];

            // Controllo se maxWkcNumber è disponibile
            if (oModelSynopticDetails["maxWkcNumber"] === null || oModelSynopticDetails["maxWkcNumber"] === undefined) {
                MessageBox.error(controller.oBundle.getText("contrWRK.errMaxWkcNumberNotFound") || 
                               "Errore: Impossibile determinare il numero massimo di posizioni.");
                return;
            }
			
            for (let i = 0; i < aModel.length; i++) {
                if (aModel[i].WORKCENTER === "" && aModel[i].WORKCENTER_ID === "") {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errMissWkc"), {
                        onClose: function () {}
                    });
                }

                if (aModel[i].POSITION === "" && aModel[i].DEL === "false") {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errMissPosition"), {
                        onClose: function () {}
                    });
                }

                // validazione della posizione
                let position = parseInt(aModel[i].POSITION);
                let maxNumber = parseInt(oModelSynopticDetails["maxWkcNumber"]);
                
                if (isNaN(position) || position < 1 || position > maxNumber) {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errPosInterval") + maxNumber, {
                        onClose: function () {}
                    });
                }

                if (aModel[i].POSITION.replace(".", ",") % 1 != 0) {
                    return MessageBox.warning(controller.oBundle.getText("contrWRK.errPosInt"), {
                        onClose: function () {}
                    });
                }

                if (aModel[i].EDIT === "true" || aModel[i].DEL === "true") {
                    obj.WORKCENTER_ID = aModel[i].WORKCENTER_ID;
                    obj.WORKCENTER = aModel[i].WORKCENTER || "";
                    obj.WORKCENTER_DESCR = aModel[i].WORKCENTER_DESCR || "";
                    obj.POSITION = aModel[i].POSITION;
                    obj.DEL = (aModel[i].DEL === "true"); // Converte in boolean
                    aModInput.push(obj);
                    obj = new Object;
                }
            }

            if (aModInput.length === 0)
                return

            let oInput = {
                "DATA": JSON.stringify(aModInput),
                "SYNOPTIC_TYPE": oModelSynopticDetails["synopticType"],
                "PAGE": oModelSynopticDetails["sPage"]
                };
                
            let aResult = controller.sendData("SAVE_SYNOPTIC_ASSIGNMENT", "WORKCENTER/TRANSACTION", oInput);
            
			if (aResult[0].RC != "0") {
                MessageBox.warning(controller.oBundle.getText("contrWRK.insertKO") + " " + aResult[0].MESSAGE, {
                    onClose: function () {}
                });
            } else {
                MessageToast.show(controller.oBundle.getText("contrWRK.insertOK"));
            }
			
            controllerWorkCenter.refreshSynopticData("");
        },


        /* -------------------- General Function --------------------*/		
		
        closeDialog: function () {
            try {
                controllerWorkCenter._oValueHelpDialog.close();
                controllerWorkCenter._oValueHelpDialog.destroy();
            } catch (err) {}

            controllerWorkCenter._oValueHelpDialog = undefined;
        },
		
		closePopup: function(){
			try{
				if(controllerWorkCenter._oValueHelpDialog){
					controllerWorkCenter._oValueHelpDialog.close();
					controllerWorkCenter._oValueHelpDialog.destroy();
					controllerWorkCenter._oValueHelpDialog = undefined;
				}
			}catch(err){
				controllerWorkCenter._oValueHelpDialog = undefined;
			}
		},
		
		manageColor: function (DEL) {
			//TODO Da rimuovere 
            let color = 'None'
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

    });
});
