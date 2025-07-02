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
                "editMode": false,
                // Footer buttons enablement for all synoptic sections
                "enabledNewPosSynBtn": true,
                "enabledUndoSynBtn": false,
                "enabledSaveSynBtn": false
            }
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
                    viewWrkSynopticElements.visAdigeSynopticPageFooterBtn = true;
                    // Reset allo stato di default per tab Synoptic
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICADIGESTR1":
                    viewWrkSynopticElements.visAdigeStr1SynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICBGS1":
                    viewWrkSynopticElements.visBgs1SynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICBGS2":
                    viewWrkSynopticElements.visBgs2SynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICADIGESYS1":
                    viewWrkSynopticElements.visAdigeSys1SysSynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICADIGESYS2":
                    viewWrkSynopticElements.visAdigeSys2SysSynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICADIGESYS3":
                    viewWrkSynopticElements.visAdigeSys3SysSynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICBGUSA":
                    viewWrkSynopticElements.visBgusaSynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICBLM1":
                    viewWrkSynopticElements.visBlm1SynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICBLM2":
                    viewWrkSynopticElements.visBlm2SynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICBLM3":
                    viewWrkSynopticElements.visBlm3SynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                case "SYNOPTICBLM4":
                    viewWrkSynopticElements.visBlm4SynopticPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
                    break;
                default:
                    // Default: mostra solo WKC
                    viewWrkElements.visWrkPageFooterBtn = true;
                    controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC", false);
                    break;
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
                    oWrkHoursElements.enabledSaveHoursBtn = false;
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

        closeDialog: function () {
            try {
                controllerWorkCenter._oValueHelpDialog.close();
                controllerWorkCenter._oValueHelpDialog.destroy();
            } catch (err) {}

            controllerWorkCenter._oValueHelpDialog = undefined;
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
			controllerWorkCenter.pressWkcTabBar();
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
            sap.ui.getCore().byId("inputType").setValue(lineSel.WORKCENTERTYPE);
            sap.ui.getCore().byId("TypeId").setValue(lineSel.WORKCENTERTYPE_ID);
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
            var bCompact = !!controllerSite.getView().$().closest(".sapUiSizeCompact").length;

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
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC == "0")
                controllerWorkCenter.getWrkType();
            else {
                MessageBox.warning(jsonArr[0].MESSAGE)
            }
            controllerWorkCenter._popup.close();
        },
		
        deleteWorkCenterTypeDescr: function (evt) {
            var lineSel = controllerWorkCenter.wrkModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            controllerWorkCenter.wrkModel.refresh();
        },

        /* -------------------- Selection Synoptic Page -------------------- */
        getSynopticPages: function () {
            // Funzione per gestire la selezione delle pagine sinottiche
            // Implementazione specifica se necessaria
        },

        getSynopticList: function () {
            // Reset alla modalità default per sinottico
            controllerWorkCenter.enabledWorkCenterFields("DEFAULT_SYNOPTIC", false);
            
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

        /* -------------------- Orari Lavorativi -------------------- */
        /*
        newHours: function () {
            controllerWorkCenter.enabledWorkCenterFields("NEW_WKC_HOURS", true);
            
            // Aggiungi una nuova riga alla tabella orari
            let tabWrkHours = controllerWorkCenter.wrkModel.getProperty("/tabWrkHours");
            if (!tabWrkHours) tabWrkHours = [];
            
            let newRow = {
                "WORKCENTER": "",
                "USER": "",
                "HOURS_TO_1": "",
                "HOURS_FROM_1": "",
                "HOURS_TO_2": "",
                "HOURS_FROM_2": "",
                "HOURS_TO_3": "",
                "HOURS_FROM_3": "",
                "VIS": "true",
                "DEL": "false"
            };
            
            tabWrkHours.push(newRow);
            controllerWorkCenter.wrkModel.setProperty("/tabWrkHours", tabWrkHours);
        },*/

        getHoursList: function () {
            // Reset alla modalità default
            controllerWorkCenter.enabledWorkCenterFields("DEFAULT_WKC_HOURS", false);
            
            let oInput = {
                "SITE_ID": controller.SiteId
                //,"LANGUAGE": controller.language
            }, aResult = controllerSite.sendData("GET_HOURS_LIST", "WORKCENTER/TRANSACTION", oInput);
            
			controllerWorkCenter.wrkModel.setProperty("/tabWrkHours", aResult);
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
			
			controllerWorkCenter.byId("btnCloseNewHours").setEnabled(true);
			
			//Scroll to last table Element
			controllerWorkCenter.byId("tabWrkHours").setFirstVisibleRow(addRowModel.length); 
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

							//lineSel.EDIT = "true";
							//Buttons
							controllerWorkCenter.byId("btnCloseNewHours").setEnabled(true);
							controllerWorkCenter.byId("saveNewHours").setEnabled(true);
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
            //lineSel.EDIT = "true";
			//Buttons
			controllerWorkCenter.byId("btnCloseNewHours").setEnabled(true);
            controllerWorkCenter.byId("saveNewHours").setEnabled(true);
            controllerWorkCenter.wrkModel.refresh();
        },

        onWorkcenterChangeInHours: function (oEvent) {
            let sValue = oEvent.getParameter("value");
            if (sValue && sValue.trim() !== "") {
                controllerWorkCenter.enabledWorkCenterFields("ENABLE_SAVE_HOURS", true);
            }
        },

        /* -------------------- Sinottico -------------------- */
        newPosSyn: function () {
            controllerWorkCenter.enabledWorkCenterFields("NEW_SYNOPTIC", true);
            
            // Logica esistente per aggiungere nuova posizione
            var propertySynopticPath = "", propertySynopticPathBkc = "", maxWkcNumber = 0, tableId = "", undoBtnId = "", saveBtnId = "";
            
            // Determina la sezione attiva per ottenere il path corretto
            let currentSection = controllerWorkCenter.getCurrentSynopticSection();
            
            switch (currentSection) {
                case "SYNOPTIC":
                    maxWkcNumber = 40;
                    propertySynopticPath = "/tabSynoptic";
                    break;
                case "SYNOPTICADIGESTR1":
                    maxWkcNumber = 22;
                    propertySynopticPath = "/tabSynopticAdigeStr1";
                    break;
                    case "SYNOPTICBGS1":
                        maxWkcNumber = 14;
                        propertySynopticPath = "/tabSynopticBGS1";
                        break;
                        case "SYNOPTICBGS2":
                            maxWkcNumber = 53;
                            propertySynopticPath = "/tabSynopticBGS2";
                            break;
                    case "SYNOPTICADIGESYS1":
                        maxWkcNumber = 24;
                        propertySynopticPath = "/tabSynopticAdigeSys1";
                        break;
                    case "SYNOPTICADIGESYS2":
                        maxWkcNumber = 11;
                        propertySynopticPath = "/tabSynopticAdigeSys2";
                        break;
                    case "SYNOPTICADIGESYS3":
                        maxWkcNumber = 27;
                        propertySynopticPath = "/tabSynopticAdigeSys3";
                        break;
                    case "SYNOPTICBGUSA":
                        maxWkcNumber = 20;
                        propertySynopticPath = "/tabSynopticBgusa";
                        break;
                    case "SYNOPTICBLM1":
                        maxWkcNumber = 244;
                        propertySynopticPath = "/tabSynopticBlm1";
                        break;
                    case "SYNOPTICBLM2":
                        maxWkcNumber = 48;
                        propertySynopticPath = "/tabSynopticBlm2";
                        break;
                    case "SYNOPTICBLM3":
                        maxWkcNumber = 56;
                        propertySynopticPath = "/tabSynopticBlm3";
                        break;
                    case "SYNOPTICBLM4":
                        maxWkcNumber = 12;
                        propertySynopticPath = "/tabSynopticBlm4";
                        break;
                default:
                    maxWkcNumber = 40;
                    propertySynopticPath = "/tabSynoptic";
                    break;
            }
            
            var addRowModel = controllerWorkCenter.wrkModel.getProperty(propertySynopticPath);
            if (!addRowModel) addRowModel = [];

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
        },

        /* Funzione helper per determinare la sezione sinottico attiva */
        getCurrentSynopticSection: function () {
            let viewWrkSynopticElements = controllerWorkCenter.wrkModel.getProperty("/viewWrkSynopticElements");
            
            if (viewWrkSynopticElements.visAdigeSynopticPageFooterBtn) return "SYNOPTIC";
            if (viewWrkSynopticElements.visAdigeStr1SynopticPageFooterBtn) return "SYNOPTICADIGESTR1";
            if (viewWrkSynopticElements.visBgs1SynopticPageFooterBtn) return "SYNOPTICBGS1";
            if (viewWrkSynopticElements.visBgs2SynopticPageFooterBtn) return "SYNOPTICBGS2";
            if (viewWrkSynopticElements.visAdigeSys1SysSynopticPageFooterBtn) return "SYNOPTICADIGESYS1";
            if (viewWrkSynopticElements.visAdigeSys2SysSynopticPageFooterBtn) return "SYNOPTICADIGESYS2";
            if (viewWrkSynopticElements.visAdigeSys3SysSynopticPageFooterBtn) return "SYNOPTICADIGESYS3";
            if (viewWrkSynopticElements.visBgusaSynopticPageFooterBtn) return "SYNOPTICBGUSA";
            if (viewWrkSynopticElements.visBlm1SynopticPageFooterBtn) return "SYNOPTICBLM1";
            if (viewWrkSynopticElements.visBlm2SynopticPageFooterBtn) return "SYNOPTICBLM2";
            if (viewWrkSynopticElements.visBlm3SynopticPageFooterBtn) return "SYNOPTICBLM3";
            if (viewWrkSynopticElements.visBlm4SynopticPageFooterBtn) return "SYNOPTICBLM4";
            
            return "SYNOPTIC"; // default
        },

        /*General Function*/
		closePopup: function(){
			try{
				controllerWorkCenter._oValueHelpDialog.close();
				controllerWorkCenter._oValueHelpDialog.destroy();
			}catch(err){}

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
