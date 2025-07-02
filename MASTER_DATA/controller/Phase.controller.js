var controllerPhase;
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.Phase", {
        phaseModel: new sap.ui.model.json.JSONModel({
            "currentSite": controller.site,
            "viewPhaseElements": {
                "visPhasePageFooterBtn": true,
                "visAutomhaPageFooterBtn": false,
                "editMode": false,
				"isMasterPhaseFooter": false,
                "isFilterMasterChecklist": false,

                //phase toolbar enablements
                "enabledPhaseInput": true,
                "enabledNewPhaseBtn": true,
                "enabledDownloadModelBtn": false,
                "enabledClosePhaseBtn": false,
                "enabledCopyPhaseBtn": false,
                "enabledClonePhaseBtn": false,
                "enabledNewVersionPhaseBtn": false,
                "enabledSavePhaseBtn": false,
                "enabledDeletePhaseBtn": false,
                "enableNotesBtn": false,
                "enabledSaveMasterFilterBtn": false,

                //phase heading form enablements
                "enabledSequenceField": false,
                "enabledVersionField": false,
                "enabledMacroPhaseField": false,
                "enabledDescriptionField": false,
                "enabledPriceListCodeField": false,
                "enabledStateField": false,
                "enabledPhaseTypeField": false,
                "enabledKmatField": false,
                "enabledParallelField": false,
                "enabledCurrentVersionField": false,
                "enabledRelevantTimeField": false,
                "enabledOperatorsStdField": false,
                "enabledStandardTimeField": false,
                "enabledRecoveryField": false
            },

            //phase heading
            "PhaseData": {
                "CURRENT_VERSION": false,
                "IS_USED": false,
                "MAINSEQUENCE": "",
                "OPERATORS": "",
                "OP_CODE": "",
                "OP_CODE_DESCR": "",
                "OP_CODE_ID": "0",
                "OP_ID": "0",
                "PARALLEL": false,
                "RECOVERYPHASE": false,
                "SEQUENCE": "",
				"SEQUENCE_TYPE": "0",
                "SITE_ID": "0",
                "STATE_ID": "0",
                "STDTIME": "0",
                "TIMEREL": "0",
                "KMAT_ID": [],
				"CODE_LIST": ""
            },
            "PhaseParameters": [],
            "parametersButtons": {
                "btnNewParameterEnabled": false,
            },
            //phase attachments
            "PhaseAttachments": [],
            "PhaseAttachmentsButtons": {
                "btnNewAttachmentEnabled": false
            },
            //attachments paths value help
            "attachmentPathList": [],
            "pathDoc": [],
			
			//Master Phases
			"MasterPhaseList": [],

            // Master Phases Filter
            "filterMasterChecklist": {
                "KMAT_ID": [],
                "MAINSEQUENCE": [],
                "RECOVERYPHASE": false
            }
        }),		
		oPhaseSelectionValueHelp: undefined,
		oDescrDialog: undefined,
		attachmentPathValueHelp: undefined,
		_oNotesDialog: undefined,
		_oValueHelpDialogPopupParam: undefined,
		
        onInit: function () {
            controllerPhase = this;
            controllerPhase.getView().setModel(controllerPhase.phaseModel);
            controllerPhase.phaseModel.setSizeLimit(50000);
        },

        /* cambio ObjectPageSection */
        pressTabBar: function (oEvent) {
            let sPage = oEvent.getParameter("section").sId.split("--")[1];

            switch (sPage) {
                case "OP_PHASE":
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visPhasePageFooterBtn", true);
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visAutomhaPageFooterBtn", false);
					controllerPhase.phaseModel.setProperty("/viewPhaseElements/isMasterPhaseFooter", false);
                    controllerPhase.newPhase(false);
                    break;
                case "OPAUTOMHA":
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visPhasePageFooterBtn", false);
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visAutomhaPageFooterBtn", true);
					controllerPhase.phaseModel.setProperty("/viewPhaseElements/isMasterPhaseFooter", false);
                    controllerPhase.getOperationAutomha();
                    break;
				case "MASTER_CHECKLIST":
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visPhasePageFooterBtn", true);
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visAutomhaPageFooterBtn", false);
					controllerPhase.phaseModel.setProperty("/viewPhaseElements/isMasterPhaseFooter", true);
                    controllerPhase.removePhaseMasterView();
                    break;
                default:
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visPhasePageFooterBtn", false);
                    controllerPhase.phaseModel.setProperty("/viewPhaseElements/visAutomhaPageFooterBtn", false);
					controllerPhase.phaseModel.setProperty("/viewPhaseElements/isMasterPhaseFooter", false);
            }
        },

        setModelProperty: function (sPath, oValue) {
            controllerPhase.phaseModel.setProperty(sPath, oValue);
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

        transactionError: function (error) {
            sap.ui.core.BusyIndicator.hide();
            console.error(error);
        },

        getComboValue: function () {
            try {
				let oInput = {
                "SITE_ID": controller.SiteId,
                "LANGUAGE": controller.language
				},
                oComboData = controller.sendData("GET_COMBO_VALUE", "OPERATION/TRANSACTION", oInput);
                controllerPhase.phaseModel.setProperty("/prefixlist", oComboData.Rows[0].PREFIXOP.Rows);
                controllerPhase.phaseModel.setProperty("/macrophaselist", oComboData.Rows[0].MAINSEQUENCE.Rows);
            } catch (error) {
                controllerPhase.transactionError(error)
            }
        },
		
		getKmatMacrophaseComboValue: function(){
            try {
				let oInput = {
					"SITE_ID": controller.SiteId
				}, aResult = controller.sendData("GET_KMAT_MACRO_PHASE", "OPERATION/TRANSACTION", oInput);
                controllerPhase.phaseModel.setProperty("/kmatlist", aResult[0]["KMAT"]);
				controllerPhase.phaseModel.setProperty("/macrophaselist", aResult[0]["MACRO_PHASE"]);
            } catch (error) {
                controllerPhase.transactionError(error);
            }
		},
		
		enabledPhaseFields: function(sAction, bValue){
			let oPhaseHeaderModel = controllerPhase.phaseModel.getProperty("/viewPhaseElements"),
				oActionTblParams = controllerPhase.phaseModel.getProperty("/parametersButtons"),
				oActionTableAttachments = controllerPhase.phaseModel.getProperty("/PhaseAttachmentsButtons");
			
			switch (sAction) {
				case 'NEW':
				    //footer buttons
					oPhaseHeaderModel["enabledPhaseInput"] = !bValue;           
					oPhaseHeaderModel["enabledNewPhaseBtn"] = !bValue;
					oPhaseHeaderModel["enabledDownloadModelBtn"] = false;  
					oPhaseHeaderModel["enabledClosePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledCopyPhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledClonePhaseBtn"] = false;
					oPhaseHeaderModel["enabledNewVersionPhaseBtn"] = false;
					oPhaseHeaderModel["enabledSavePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledDeletePhaseBtn"] = false;
					oPhaseHeaderModel["enableNotesBtn"] = false;
					
					//heading form data
					oPhaseHeaderModel["enabledSequenceField"] = bValue;
					oPhaseHeaderModel["enabledVersionField"] = false;
					oPhaseHeaderModel["enabledMacroPhaseField"] = bValue;
					oPhaseHeaderModel["enabledDescriptionField"] = bValue;
					oPhaseHeaderModel["enabledPriceListCodeField"] = bValue;
					oPhaseHeaderModel["enabledStateField"] = bValue;
					oPhaseHeaderModel["enabledPhaseTypeField"] = bValue;
					oPhaseHeaderModel["enabledKmatField"] = bValue;
					oPhaseHeaderModel["enabledParallelField"] = bValue;
					oPhaseHeaderModel["enabledCurrentVersionField"] = false;
					oPhaseHeaderModel["enabledRelevantTimeField"] = bValue;
					oPhaseHeaderModel["enabledOperatorsStdField"] = bValue;					
					oPhaseHeaderModel["enabledStandardTimeField"] = bValue;
					oPhaseHeaderModel["enabledRecoveryField"] = bValue;
					
					//Set Edit Mode
					oPhaseHeaderModel["editMode"] =	true;	
					
					//Set Model
					controllerPhase.resetModels(sAction);
					
					//Table Actions
					oActionTblParams["btnNewParameterEnabled"] = true;
					oActionTableAttachments["btnNewAttachmentEnabled"] = true;
				break;
				
				case 'CLOSED':
				    //footer buttons
					oPhaseHeaderModel["enabledPhaseInput"] = !bValue;      
					oPhaseHeaderModel["enabledNewPhaseBtn"] = !bValue;      
					oPhaseHeaderModel["enabledDownloadModelBtn"] = bValue;
					oPhaseHeaderModel["enabledClosePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledCopyPhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledClonePhaseBtn"] = false;
					oPhaseHeaderModel["enabledNewVersionPhaseBtn"] = false;
					oPhaseHeaderModel["enabledSavePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledDeletePhaseBtn"] = bValue;
					oPhaseHeaderModel["enableNotesBtn"] = false;
					
					//heading form data
					oPhaseHeaderModel["enabledSequenceField"] = bValue;
					oPhaseHeaderModel["enabledVersionField"] = false;
					oPhaseHeaderModel["enabledMacroPhaseField"] = bValue;
					oPhaseHeaderModel["enabledDescriptionField"] = bValue;
					oPhaseHeaderModel["enabledPriceListCodeField"] = bValue;
					oPhaseHeaderModel["enabledStateField"] = bValue;
					oPhaseHeaderModel["enabledPhaseTypeField"] = bValue;
					oPhaseHeaderModel["enabledKmatField"] = bValue;
					oPhaseHeaderModel["enabledParallelField"] = bValue;
					oPhaseHeaderModel["enabledCurrentVersionField"] = false;
					oPhaseHeaderModel["enabledRelevantTimeField"] = bValue;
					oPhaseHeaderModel["enabledOperatorsStdField"] = bValue;					
					oPhaseHeaderModel["enabledStandardTimeField"] = bValue;
					oPhaseHeaderModel["enabledRecoveryField"] = bValue;
					
					//Set Edit Mode
					oPhaseHeaderModel["editMode"] =	false;
					
					//Set Model
					controllerPhase.resetModels(sAction);
					
					//Table Actions
					oActionTblParams["btnNewParameterEnabled"] = false;
					oActionTableAttachments["btnNewAttachmentEnabled"] = false;
				break;
				
				case 'RETRIVE':
                    // Se fase in uso permetto la modifica dei seguenti campi: Stato, Versione Corrente, Kmat, Descrizione Fase, Parallela 

					//footer buttons
					oPhaseHeaderModel["enabledPhaseInput"] = false;
					oPhaseHeaderModel["enabledNewPhaseBtn"] = true;
					oPhaseHeaderModel["enabledDownloadModelBtn"] = true;
					oPhaseHeaderModel["enabledClosePhaseBtn"] = true;
					oPhaseHeaderModel["enabledCopyPhaseBtn"] = true;
					oPhaseHeaderModel["enabledClonePhaseBtn"] = true;
					oPhaseHeaderModel["enabledNewVersionPhaseBtn"] = true;
					oPhaseHeaderModel["enabledSavePhaseBtn"] = true;
					oPhaseHeaderModel["enabledDeletePhaseBtn"] = !bValue;
					oPhaseHeaderModel["enableNotesBtn"] = true;
					
					//heading form data
					oPhaseHeaderModel["enabledSequenceField"] = !bValue;
					oPhaseHeaderModel["enabledVersionField"] = false;
					oPhaseHeaderModel["enabledMacroPhaseField"] = !bValue;
					oPhaseHeaderModel["enabledDescriptionField"] = true;      
					oPhaseHeaderModel["enabledPriceListCodeField"] = true;
					oPhaseHeaderModel["enabledStateField"] = true;            
					oPhaseHeaderModel["enabledPhaseTypeField"] = !bValue;
					oPhaseHeaderModel["enabledKmatField"] = true;              
					oPhaseHeaderModel["enabledParallelField"] = true;
					oPhaseHeaderModel["enabledCurrentVersionField"] = true;    
					oPhaseHeaderModel["enabledRelevantTimeField"] = !bValue;
					oPhaseHeaderModel["enabledOperatorsStdField"] = !bValue;					
					oPhaseHeaderModel["enabledStandardTimeField"] = !bValue;
					oPhaseHeaderModel["enabledRecoveryField"] = !bValue;
					
					//Set Edit Mode
					oPhaseHeaderModel["editMode"] =	true;
					
					//Table Actions
					oActionTblParams["btnNewParameterEnabled"] = true;
					oActionTableAttachments["btnNewAttachmentEnabled"] = true;
				break;
				
				case 'COPY':
                    // aprire tutto, tranne Versione e Versione Corrente

                    //footer buttons
					oPhaseHeaderModel["enabledPhaseInput"] = !bValue;      
					oPhaseHeaderModel["enabledNewPhaseBtn"] = false;
					oPhaseHeaderModel["enabledDownloadModelBtn"] = false; 
					oPhaseHeaderModel["enabledClosePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledCopyPhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledClonePhaseBtn"] = false;
					oPhaseHeaderModel["enabledNewVersionPhaseBtn"] = false;
					oPhaseHeaderModel["enabledSavePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledDeletePhaseBtn"] = false;
					oPhaseHeaderModel["enableNotesBtn"] = false;
					
					//heading form data
					oPhaseHeaderModel["enabledSequenceField"] = bValue;
					oPhaseHeaderModel["enabledVersionField"] = false;   
					oPhaseHeaderModel["enabledMacroPhaseField"] = bValue;
					oPhaseHeaderModel["enabledDescriptionField"] = bValue;
					oPhaseHeaderModel["enabledPriceListCodeField"] = bValue;
					oPhaseHeaderModel["enabledStateField"] = bValue;
					oPhaseHeaderModel["enabledPhaseTypeField"] = bValue;
					oPhaseHeaderModel["enabledKmatField"] = bValue;
					oPhaseHeaderModel["enabledParallelField"] = bValue;
					oPhaseHeaderModel["enabledCurrentVersionField"] = false;
					oPhaseHeaderModel["enabledRelevantTimeField"] = bValue;
					oPhaseHeaderModel["enabledOperatorsStdField"] = bValue;					
					oPhaseHeaderModel["enabledStandardTimeField"] = bValue;
					oPhaseHeaderModel["enabledRecoveryField"] = bValue;
					
					//Set Edit Mode
					oPhaseHeaderModel["editMode"] =	true;

                    //Set Model
					controllerPhase.editModels(sAction);
					
					//Table Actions
					oActionTblParams["btnNewParameterEnabled"] = true;
					oActionTableAttachments["btnNewAttachmentEnabled"] = true;
				
				break;
				
				case 'NEW_VERSION':
                    // non apro i seguenti campi: ID Fase, Versione (viene automaticamente incrementata), Macrofase, Fase di rispristino

                    //footer buttons
					oPhaseHeaderModel["enabledPhaseInput"] = !bValue;      
					oPhaseHeaderModel["enabledNewPhaseBtn"] = !bValue;
					oPhaseHeaderModel["enabledDownloadModelBtn"] = false; 
					oPhaseHeaderModel["enabledClosePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledCopyPhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledClonePhaseBtn"] = false;
					oPhaseHeaderModel["enabledNewVersionPhaseBtn"] = false;
					oPhaseHeaderModel["enabledSavePhaseBtn"] = bValue;
					oPhaseHeaderModel["enabledDeletePhaseBtn"] = false;
					oPhaseHeaderModel["enableNotesBtn"] = false;
					
					//heading form data
					oPhaseHeaderModel["enabledSequenceField"] = false;
					oPhaseHeaderModel["enabledVersionField"] = false;
					oPhaseHeaderModel["enabledMacroPhaseField"] = false;
					oPhaseHeaderModel["enabledDescriptionField"] = bValue;
					oPhaseHeaderModel["enabledPriceListCodeField"] = bValue;
					oPhaseHeaderModel["enabledStateField"] = bValue;
					oPhaseHeaderModel["enabledPhaseTypeField"] = bValue;
					oPhaseHeaderModel["enabledKmatField"] = bValue;
					oPhaseHeaderModel["enabledParallelField"] = bValue;
					oPhaseHeaderModel["enabledCurrentVersionField"] = bValue;
					oPhaseHeaderModel["enabledRelevantTimeField"] = bValue;
					oPhaseHeaderModel["enabledOperatorsStdField"] = bValue;					
					oPhaseHeaderModel["enabledStandardTimeField"] = bValue;
					oPhaseHeaderModel["enabledRecoveryField"] = false;
					
					//Set Edit Mode
					oPhaseHeaderModel["editMode"] =	true;

                    //Set Model
					controllerPhase.editModels(sAction);
					
					//Table Actions
					oActionTblParams["btnNewParameterEnabled"] = true;
					oActionTableAttachments["btnNewAttachmentEnabled"] = true;
				break;
				
				default:
					//footer buttons
					oPhaseHeaderModel["enabledPhaseInput"] = true;
					oPhaseHeaderModel["enabledNewPhaseBtn"] = true;
					oPhaseHeaderModel["enabledDownloadModelBtn"] = false;
					oPhaseHeaderModel["enabledClosePhaseBtn"] = false;
					oPhaseHeaderModel["enabledCopyPhaseBtn"] = false;
					oPhaseHeaderModel["enabledClonePhaseBtn"] = false;
					oPhaseHeaderModel["enabledNewVersionPhaseBtn"] = false;
					oPhaseHeaderModel["enabledSavePhaseBtn"] = false;
					oPhaseHeaderModel["enabledDeletePhaseBtn"] = false;
					oPhaseHeaderModel["enableNotesBtn"] = false;
					
					//heading form data
					oPhaseHeaderModel["enabledSequenceField"] = false;
					oPhaseHeaderModel["enabledVersionField"] = false;
					oPhaseHeaderModel["enabledMacroPhaseField"] = false;
					oPhaseHeaderModel["enabledDescriptionField"] = false;
					oPhaseHeaderModel["enabledPriceListCodeField"] = false;
					oPhaseHeaderModel["enabledStateField"] = false;
					oPhaseHeaderModel["enabledPhaseTypeField"] = false;
					oPhaseHeaderModel["enabledKmatField"] = false;
					oPhaseHeaderModel["enabledParallelField"] = false;
					oPhaseHeaderModel["enabledCurrentVersionField"] = false;
					oPhaseHeaderModel["enabledRelevantTimeField"] = false;
					oPhaseHeaderModel["enabledOperatorsStdField"] = false;					
					oPhaseHeaderModel["enabledStandardTimeField"] = false;
					oPhaseHeaderModel["enabledRecoveryField"] = false;
					
					//Set Edit Mode
					oPhaseHeaderModel["editMode"] =	false;
					
					//Table Actions
					oActionTblParams["btnNewParameterEnabled"] = false;
					oActionTableAttachments["btnNewAttachmentEnabled"] = false;
					
					//Visible Footer Button 
					oPhaseHeaderModel["visPhasePageFooterBtn"] = true
					oPhaseHeaderModel["visAutomhaPageFooterBtn"] = false;
					
			}
			
			controllerPhase.setModelProperty("/viewPhaseElements", oPhaseHeaderModel);
			controllerPhase.setModelProperty("/parametersButtons", oActionTblParams);
			controllerPhase.setModelProperty("/PhaseAttachmentsButtons", oActionTableAttachments);
		},
		
		resetModels: function(sAction){
			let oPhaseData = {
                "CURRENT_VERSION": false,
                "IS_USED": false,
                "MAINSEQUENCE": "",
                "OPERATORS": "",
                "OP_CODE": "",
                "OP_CODE_DESCR": "",
                "OP_CODE_ID": "0",
                "OP_ID": "0",
                "PARALLEL": false,
                "RECOVERYPHASE": false,
                "SEQUENCE": "",
				"SEQUENCE_TYPE": "0",
                "SITE_ID": controller.SiteId,
                "STATE_ID": "0",
                "STDTIME": "0",
                "TIMEREL": "0",
				"CODE_LIST": "",
				"KMAT_ID": [],
				"SITE_ID": controller.SiteId
            };
			
			switch(sAction){
				case 'NEW':
					oPhaseData["OP_CODE"] = "1";
					oPhaseData["CURRENT_VERSION"] = true;					
					oPhaseData["STATE_ID"] = "1";
				break;
				default:
				// Nothing
			}
			
			controllerPhase.setModelProperty("/PhaseData", oPhaseData);
			controllerPhase.setModelProperty("/PhaseParameters", []);
			controllerPhase.setModelProperty("/PhaseAttachments", []);
			controllerPhase.phaseModel.setProperty("/desrclist", []);
            controllerPhase.phaseModel.setProperty("/phaselist", []);
		},

        editModels: function (sAction) { 
            let oPhaseData = controllerPhase.phaseModel.getProperty("/PhaseData"),
				aPhaseParameters = controllerPhase.phaseModel.getProperty("/PhaseParameters"),
				aPhaseAttachments = controllerPhase.phaseModel.getProperty("/PhaseAttachments");
				
            switch (sAction) {
                case 'COPY':
                    oPhaseData["SEQUENCE"] = "";
                    oPhaseData["OP_CODE"] = "1";
                    oPhaseData["OP_CODE_ID"] = "0";
                    oPhaseData["OP_ID"] = "0";
					oPhaseData["IS_USED"] = false;
					for(let i in aPhaseParameters){
						aPhaseParameters[i]["EDIT"] = true;
					}
					for(let j in aPhaseAttachments){
						aPhaseAttachments[j]["EDIT"] = true;
					}
                break;
                case 'NEW_VERSION':
                    oPhaseData["OP_CODE_ID"] = "0";
					
					//Retrive last Phase Version
					let oInput = {
						"SEQUENCE": oPhaseData["SEQUENCE"],
						"SITE_ID": controller.SiteId
					};
                    oPhaseData["OP_CODE"] = (parseInt(controller.sendData("GET_LAST_PHASE_VERSION","OPERATION/TRANSACTION", oInput)["Rows"][0]["PHASE_LAST_VERSION"], 10) + 1).toString(); 
					oPhaseData["IS_USED"] = false;
					for(let i in aPhaseParameters){
						aPhaseParameters[i]["EDIT"] = true;
					}
					for(let j in aPhaseAttachments){
						aPhaseAttachments[j]["EDIT"] = true;
					}
                break;
                default:
                    // Nothing
            }
        },

        newPhase: function (isNewPhase) {
           controllerPhase.enabledPhaseFields(isNewPhase ? 'NEW' : 'CLOSED', isNewPhase);	

		    if(isNewPhase) {
				controllerPhase.getKmatMacrophaseComboValue();
		    }else if(controllerPhase.phaseModel.getProperty("/viewPhaseElements/isMasterPhaseFooter")){
				//Logica Deselezione Riga Master Phases 
				controllerPhase.byId("MasterPhasesList").removeSelections();
			}
        },

        changeStepInputCheck: function (oEvent) {
            var iValue = oEvent.getParameter("value"),
                oControl = oEvent.getSource();

            if (!iValue || iValue < 0) {
                oControl.setValue(0)
            }
        },

        checkifPhasehasDot: function (oEvent) { 
            let oPhaseData = controllerPhase.phaseModel.getProperty("/PhaseData");

            // validazione campo
            if(!oPhaseData["SEQUENCE"].includes("_") || !oPhaseData["SEQUENCE"].includes(".")) {
				oPhaseData["SEQUENCE"] = "";
                return MessageBox.warning(controller.oBundle.getText("viewPhase.sequenceFormatInvalid"));
            }

            // validazione fase
            try {
				let oInput = { 
                    "SEQUENCE": oPhaseData["SEQUENCE"],
                    "SITE_ID": controller.SiteId,
                },
                result = controller.sendData("CHECK_PHASE_ALREADY_EXIST","OPERATION/TRANSACTION", oInput);
                if (result[0].RC != "0") { 
                    MessageBox.error(controller.oBundle.getText("viewPhase.phaseAlreadyInUse"));
					oPhaseData["SEQUENCE"] = "";
                }
            } catch (error) {
                MessageBox.error(controller.oBundle.getText("controllerUpdate.err"));
            }
        },

        updDftValue: function (oEvent) { 
            let bNewValue = oEvent.getParameter("state");
            let sPath = oEvent.getSource().getBindingContext().getPath();
            controllerPhase.phaseModel.setProperty(sPath + "/CURRENT_VERSION", bNewValue);
        },

        /*-------- Phase search and selection dialog functions --------*/
        onOpenSearchPhasePopup: function (oEvent) {           
			Fragment.load({
				name: "master_data.view.popup.phase.phaseSelection",
				controller: controllerPhase
			}).then(function (oPhaseSelDialog) {
				controllerPhase.oPhaseSelectionValueHelp = oPhaseSelDialog;
				controllerPhase.getView().addDependent(oPhaseSelDialog);
				controllerPhase.getComboValue();
				controllerPhase.getView().addDependent(oPhaseSelDialog);
				controllerPhase.oPhaseSelectionValueHelp.open();
			});
        },
		
		onClosePhaseValueHelp: function () {
            controllerPhase.oPhaseSelectionValueHelp.close();
			controllerPhase.oPhaseSelectionValueHelp.destroy();
			controllerPhase.oPhaseSelectionValueHelp = undefined;
			
			controllerPhase.phaseModel.setProperty("/phaselist", []);
        },

        handleValueHelpSelect: function (oEvent) {            
            if (oEvent.getParameter("rowIndex") >= 0) {
				//Retrive Kmat Values
				controllerPhase.getKmatMacrophaseComboValue();
				
				//Retrive Phase Data
                let oSelRow = controllerPhase.phaseModel.getProperty(oEvent.getParameter("rowContext").sPath),
					oInput = {
						"OP_CODE_ID": oSelRow["OP_CODE_ID"],
						"LANGUAGE": controller.language
					};					
					
				controllerPhase.getPhaseData(oInput);	
				
				//Closing the Popup
                controllerPhase.onClosePhaseValueHelp();
            }
        },
		
		getPhaseData: function(oInput){
			let aResult = controller.sendData("GET_PHASE_DETAILS", "OPERATION/TRANSACTION", oInput),
				aPhaseHeader = aResult[0].PhaseHeader["Rows"][0];
				
				try{
					aPhaseHeader["KMAT_ID"] = JSON.parse(aPhaseHeader["KMAT_ID"]);
				}catch(err){}
			
			controllerPhase.phaseModel.setProperty("/PhaseData", aPhaseHeader);
            controllerPhase.phaseModel.setProperty("/PhaseAttachments", aResult[0].PhaseAttachments["Rows"]);
            controllerPhase.phaseModel.setProperty("/PhaseParameters", aResult[0].PhaseParameters["Rows"]);
			
			//Enable Fields
			controllerPhase.enabledPhaseFields("RETRIVE", aResult[0].PhaseHeader["Rows"][0]["IS_USED"]);
		},

        onChangePrex: function (oEvent) {
            sap.ui.getCore().byId("comboMainSeq").setValue("");
            sap.ui.getCore().byId("comboMainSeq").setSelectedKey("");
            controllerPhase.getPhaseList();
        },

        onChangeMain: function (oEvent) {
            controllerPhase.getPhaseList();
        },

        getPhaseList: function () {
            let oInput = {
                "SITE_ID": controller.SiteId,
                "LANGUAGE": controller.language,
                "PREFIXSEQ": sap.ui.getCore().byId("comboPrex").getSelectedKey(),
                "MAINSEQUENCE": sap.ui.getCore().byId("comboMainSeq").getSelectedKey()
            }, aDataResult = controller.sendData("GET_PHASE_LIST", "OPERATION/TRANSACTION", oInput);
			
			aDataResult.Rows.forEach(row => {
                row.OPERATIONDESCR = row.OPERATIONDESCR.replace(/_rn_/gm, '\r\n');
            });

            controllerPhase.phaseModel.setProperty("/phaselist", aDataResult.Rows);            
        },   
        
        onChangeFilterType: function(oEvent){
            sap.ui.getCore().getElementById("searchFieldParamDescr").setValue("");
        },

        handleSearchParamDescr: function(oEvent){
            let sValue = oEvent.getParameter("newValue"),
                oFilter = new Filter(sap.ui.getCore().getElementById("selectFilterType").getSelectedKey(), FilterOperator.Contains, sValue),
                oBinding = sap.ui.getCore().getElementById("tabPopPhaseList").getBinding();
                oBinding.filter([oFilter]);   
        },

        /*-------- Phase description dialog functions --------*/
        handlePhaseDescrValueHelp: function (evt) {
			Fragment.load({
				name: "master_data.view.popup.phase.description",
				controller: controllerPhase
			}).then(function (oDescrPhaseDialog) {
				controllerPhase.oDescrDialog = oDescrPhaseDialog;
				controllerPhase.getView().addDependent(oDescrPhaseDialog);
				controllerPhase.getPhaseDescrList();
				controllerPhase.oDescrDialog.open();
			});           
        },

        getPhaseDescrList: function () {
            let oInput = {
                "VERSION": controllerPhase.phaseModel.getProperty("/PhaseData/OP_CODE"),
                "SITE_ID": controller.SiteId,
                "OPERATIONID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_ID")
                }, aDataResult = [];
            try {
                aDataResult = controller.sendData("GET_DESCRIPTION", "OPERATION/TRANSACTION", oInput);
                aDataResult.Rows.forEach(row => {
                    row.OPERATIONDESCR = row.OPERATIONDESCR.replace(/  /gm, '\r\n');
                });
                controllerPhase.phaseModel.setProperty("/desrclist", aDataResult.Rows);
            } catch (error) {
                controllerPhase.transactionError(error)
            }
        },

        addDescr: function () {
            var aDescrModel = controllerPhase.phaseModel.getProperty("/desrclist");
            var row = {
                "LANGUAGE": "",
                "OPERATIONDESCR": "",
                "OPERATIONCODEID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_CODE"),
                "OPERATIONID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_ID"),
                "DEL": false,
                "EDIT": true
            };

            aDescrModel.push(row);
            controllerPhase.phaseModel.setProperty("/desrclist", aDescrModel);
        },

        updateDescr: function () {        
            try {
                let aDescrList = controllerPhase.phaseModel.getProperty("/desrclist");
                let oPhaseData = controllerPhase.phaseModel.getProperty("/PhaseData");

                let aLanguages = aDescrList.filter(row => !row.DEL).map(row => row.LANGUAGE);
                let aUniqueLanguages = [...new Set(aLanguages)];
                if (aLanguages.length !== aUniqueLanguages.length) {
                    MessageBox.warning(controller.oBundle.getText("viewPhase.duplicateLanguage"));
                    return;
                }

                let aDescrSave = aDescrList.filter(row => row.EDIT).map(row => ({
                    "LANGUAGE": row.LANGUAGE,
                    "OP_CODE_ID": oPhaseData.OP_CODE_ID,
                    "OP_CODE_DESCR": row.OPERATIONDESCR,
                    "DEL": row.DEL,
                    "EDIT": row.EDIT
                }));

                let aDescrToDelete = aDescrList.filter(row => row.EDIT && row.DEL);
                let aDescrToAdd = aDescrList.filter(row => row.EDIT && !row.DEL);
                
                if (aDescrToDelete.length === aDescrList.length && aDescrToAdd.length === 0) {
                    MessageBox.warning(controller.oBundle.getText("viewPhase.cannotDeleteAllDescr"));  
                    return;
                }

                if (aDescrSave.length > 0) { 
                    let oDescrInput = {
                        "DATA": JSON.stringify(aDescrSave)
                    };
                    let result = controller.sendData("SAVE_PHASE_DESCR", "OPERATION/TRANSACTION", oDescrInput);
                    if (result[0].RC != "0") {
                        MessageBox.error(result[0].MESSAGE || controller.oBundle.getText("controllerUpdate.err"));
                    } else {						
                        controllerPhase.onClosePhaseDescrDialog();
                        MessageToast.show(controller.oBundle.getText("controllerPhase.insertOK"));
						
                        //Retrive Phase Data
						let oInput = {
								"OP_CODE_ID": oPhaseData.OP_CODE_ID,
								"LANGUAGE": controller.language
							};					
							
						controllerPhase.getPhaseData(oInput);
                    }
                }
            } catch (error) { 
                MessageBox.error(controller.oBundle.getText("controllerUpdate.err"));
            }
        },
		
		onChangeDescription: function(oEvent){
			let oRowSel = controllerPhase.phaseModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["DEL"] = false;
			oRowSel["EDIT"] = true;
		},

        deleteDescr: function (oEvent) { 
            let oRowSel = controllerPhase.phaseModel.getProperty(oEvent.getSource().getBindingContext().sPath);
			oRowSel["DEL"] = true;
			oRowSel["EDIT"] = true;
        },

        onClosePhaseDescrDialog: function () {
            controllerPhase.oDescrDialog.close();
			controllerPhase.oDescrDialog.destroy();
			controllerPhase.oDescrDialog = undefined;
			controllerPhase.phaseModel.setProperty("/desrclist", []);
        },
		
        /* --------------------------------------------------------- */
        //--------Attachments--------

        onDeleteAttachment: function (oEvent) {
            let sPath = oEvent.getSource().getBindingContext().getPath(),
                oAttachmentRow = controllerPhase.phaseModel.getProperty(sPath);
				
			oAttachmentRow["DEL"] = true;
			oAttachmentRow["EDIT"] = true;
           
            controllerPhase.setModelProperty(sPath, oAttachmentRow);
        },

        onAddAttachment: function () {
            let aAttachmentsModel = controllerPhase.phaseModel.getProperty("/PhaseAttachments"),
				oRow = {
					"OP_CODE_ATTCH_ID": "",
					"OP_CODE_ID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_CODE"),
					"URI": "",
					"URI_DESCR": "",
					"DEL": false,
					"EDIT": true
				};
            if (!aAttachmentsModel || aAttachmentsModel.length === 0) {
                controllerPhase.phaseModel.setProperty("/PhaseAttachments", [oRow]);
            } else {
                aAttachmentsModel.push(oRow);
                controllerPhase.phaseModel.setProperty("/PhaseAttachments", aAttachmentsModel);
            }

            //Scroll to last table Element
            //controllerPhase.byId("tablePhaseAttachments").setFirstVisibleRow(aAttachmentsModel.length);
        },

        handleAttachmentPathValueHelp: function (oEvent) {
            controllerPhase.pathRowSel = oEvent.getSource().getParent().getBindingContext().getPath();          
			
			Fragment.load({
				name: "master_data.view.popup.phase.searchPath",
				controller: controllerPhase
			}).then(function (oAttachmentPathValueHelp) {
				controllerPhase.attachmentPathValueHelp = oAttachmentPathValueHelp;
				controllerPhase.getView().addDependent(oAttachmentPathValueHelp);
				controllerPhase.getPathList();
				controllerPhase.getAttechedList("");
				controllerPhase.attachmentPathValueHelp.open();
			}); 
        },

        getPathList: function () {
            let oInput = {
                "SITEID": controller.SiteId
            }, aDataResult = [];
            try {
                aDataResult = controller.sendData("GET_PATH_LIST", "ATTACHED/TRANSACTION", oInput);
                controllerPhase.phaseModel.setProperty("/attachmentPathList", aDataResult.Rows);
            } catch (error) {
                controllerPhase.transactionError(error)
            }
        },

        getAttechedList: function (path) {
            let oInput = {},
                aDataResult = [];
            if (path != "") {
                oInput.ROOT = path;
                try {
                    aDataResult = controller.sendData("GET_FOLDER_FILE_LIST", "ATTACHED/TRANSACTION", oInput);
                    if (aDataResult.Rows[0].RC != "0") {
                        if (aDataResult.Rows[0].RC == "3") {
                            MessageBox.warning(controller.oBundle.getText("viewAtt.errorTimeout"))
                        }
                        if (aDataResult.Rows[0].RC == "4") {
                            MessageBox.error(aDataResult.Rows[0].MESSAGE + " - " + controller.oBundle.getText("viewAtt.accessdenied"));
                        }
                        controllerPhase.navBack();
                    } else {
                        controllerPhase.phaseModel.setProperty("/pathDoc", aDataResult.Rows, false);                       
                        sap.ui.getCore().byId("NAME").setFilterValue("");
                        sap.ui.getCore().byId("NAME").setFiltered(false);
                        sap.ui.getCore().byId("pathDocTable").getBinding().filter();
                    }
                } catch (error) {
                    controllerPhase.transactionError(error)
                }
            } else {
                controllerPhase.phaseModel.setProperty("/pathDoc", [], false);
            }
        },

        createroot: function () {            
            sap.ui.getCore().byId("path").setValue(sap.ui.getCore().byId("root").getValue());           
            controllerPhase.getAttechedList(sap.ui.getCore().byId("path").getValue());
        },
		
        navBack: function () {
            let previousURL = sap.ui.getCore().byId("path").getValue();
            previousURL = previousURL.substring(0, previousURL.lastIndexOf("/")).replace("http://srvmiiws.blmgroup.com/", "");
            sap.ui.getCore().byId("path").setValue(previousURL);
            controllerPhase.getAttechedList(previousURL);
        },
		
        previewFile: function (oEvent) {
            let aDocList = controllerPhase.phaseModel.getProperty("/pathDoc"),
                sSelectedUri = "";
				
            aDocList.forEach(oDocRow => {
                if (oDocRow.NAME == oEvent.getSource().getParent().getAggregation("cells")[1].getProperty("text")) {
                    sSelectedUri = oDocRow.URI
                }
            });            
            window.open(sSelectedUri, "_blank");
        },

        selectAttach: function (oEvent) {
            let aDocList = controllerPhase.phaseModel.getProperty("/pathDoc"),
                sSelectedName = oEvent.getSource().getProperty("text"),
                oDocSelected = {};

            aDocList.forEach(oDocRow => {
                if (oDocRow.NAME == sSelectedName) {
                    oDocSelected = oDocRow;
                }
            });

            if (oDocSelected.TYPE == "folder") {
                sap.ui.getCore().byId("path").setValue(sap.ui.getCore().byId("path").getValue() + "/" + sSelectedName);
                controllerPhase.getAttechedList(sap.ui.getCore().byId("path").getValue());
            } else {
                sap.ui.getCore().byId("path").setValue(oDocSelected.URI);
            }
        },

        copyValue: function (oEvent) {
            controllerPhase.phaseModel.getProperty(controllerPhase.pathRowSel)["URI"] = sap.ui.getCore().byId("path").getValue();
            controllerPhase.phaseModel.refresh();
            controllerPhase.handleValueHelpChkListAttClose();
        },

        handleValueHelpChkListAttClose: function () {
            controllerPhase.attachmentPathValueHelp.close();
            controllerPhase.attachmentPathValueHelp.destroy();
            controllerPhase.attachmentPathValueHelp = undefined;
			controllerPhase.pathRowSel = "";
        },

        /* --------------------------------------------------------- */
        /* Phase Notes */
        onOpenPhaseNotes: function () {        
			controllerPhase.pNotesDialog = Fragment.load({
				id: controllerPhase.getView().getId(),
				name: "master_data.view.popup.phase.phaseNotes",
				controller: controllerPhase
			}).then(function (oNotesDialogParam) {
				controllerPhase._oNotesDialog = oNotesDialogParam;
				controllerPhase.getView().addDependent(controllerPhase._oNotesDialog);
				
				let oInput = {
					"OP_CODE_ID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_CODE_ID"),
				}, result = controller.sendData("GET_OP_CODE_NOTES", "OPERATION/TRANSACTION", oInput)["Rows"];
				
				result.forEach(row => {
					row.NOTES = decodeURIComponent(row.NOTES);
				});
				
				controllerPhase.setModelProperty("/noteslist", result);
				controllerPhase._oNotesDialog.open();
			});        
        },

        onSaveNotes: function () { 
            try {
				let oInput = { 
                    "NOTES": encodeURIComponent(controllerPhase.phaseModel.getProperty("/noteslist/0/NOTES")),
                    "OP_CODE_ID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_CODE_ID")
                },
                result = controller.sendData("SAVE_OP_CODE_NOTES","OPERATION/TRANSACTION", oInput);
                if (result[0].RC != "0") { 
                    MessageBox.error(result[0].MESSAGE);
                } else {
                    controllerPhase.onCloseNotesDialog();
                    MessageToast.show(controller.oBundle.getText("controllerPhase.insertOK"));
                }
            } catch (error) {
                MessageBox.error(controller.oBundle.getText("controllerUpdate.err"));
            }
        },

        onCloseNotesDialog: function () { 
            controllerPhase._oNotesDialog.close();
            controllerPhase._oNotesDialog.destroy();
            controllerPhase._oNotesDialog = undefined;
        },

        /* --------------------------------------------------------- */
        /* Table Parameters Collection */

        onSearchParam: function (oEvent) {
            controllerDC.setModelProperty("/sRowParPath", oEvent.getSource().getBindingContext().sPath);
            Fragment.load({
                name: "master_data.view.popup.phase.selectAndEditParam",
                controller: controllerDC
            }).then(function (oValueHelpDialogParam) {
                controllerDC._oValueHelpDialogPopupParam = oValueHelpDialogParam;
                controllerDC.getView().addDependent(controllerDC._oValueHelpDialogPopupParam);
                let oInput = {
                    "SITE_ID": controller.SiteId,
                    "LANGUAGE": controller.language
                };
                controllerDC.setModelProperty("/paramlist", controller.sendData("GET_LIST_PARAM", "DATACOLLECTION/TRANSACTION", oInput)["Rows"]);
                controllerDC.setModelProperty("/isPopupMode", true);
                controllerDC._oValueHelpDialogPopupParam.open();
            });
        },
		
		addNewParam: function () {
            let oNewRow = {
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
                "IS_USED": false,
                "SITE_ID": controller.SiteId,
                "EDIT": true,
                "DEL": false
            }, aTableData = controllerPhase.phaseModel.getProperty("/PhaseParameters") || [];
			
            aTableData.push(oNewRow);
			
            controllerPhase.setModelProperty("/PhaseParameters", aTableData);
			
			//Scroll to last table Element
            //controllerPhase.byId("tablePhaseParameters").setFirstVisibleRow(aTableData.length);
        },
		
		onChangeParameterOrderValue: function(oEvent){
			if(oEvent.getSource().getValue() < oEvent.getSource().getMin())
				oEvent.getSource().setValue(oEvent.getSource().getMin());
			
			let sPath = oEvent.getSource().getBindingContext().getPath(),
                oParamRow = controllerPhase.phaseModel.getProperty(sPath);
				
			oParamRow["DEL"] = false;
			oParamRow["EDIT"] = true;
           
            controllerPhase.setModelProperty(sPath, oParamRow);
		},

		deleteParam: function (oEvent) {           
			let sPath = oEvent.getSource().getBindingContext().getPath(),
                oParamRow = controllerPhase.phaseModel.getProperty(sPath);
				
			oParamRow["DEL"] = true;
			oParamRow["EDIT"] = true;
           
            controllerPhase.setModelProperty(sPath, oParamRow);

        },
		
        savePhase: function () {
            let oPhaseData = controllerPhase.phaseModel.getProperty("/PhaseData");

            // Validazione campi obbligatori - Check all fields
            // id fase
            if (oPhaseData["SEQUENCE"] === "") {    
                return MessageBox.warning(controller.oBundle.getText("viewPhase.misssequence"));
            }
            if(!oPhaseData["SEQUENCE"].includes("_") || !oPhaseData["SEQUENCE"].includes(".")) {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.sequenceFormatInvalid"));
            }
            // versione
            if (oPhaseData["OP_CODE"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missvers"));
            }
            // macrofase
            if (oPhaseData["MAINSEQUENCE"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missmainsequence"));
            }
            // descrizione fase
            if (oPhaseData["OP_CODE_DESCR"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missdescr"));
            }
            // stato
            if (oPhaseData["STATE_ID"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missstate"));
            }
            // tipo fase
            if (oPhaseData["SEQUENCE_TYPE"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missseqtype"));
            }
            // kmat
            if (oPhaseData["KMAT_ID"] === "" || oPhaseData["KMAT_ID"].length === 0) {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.misskmat"));
            }
            // parallela
            if (oPhaseData["PARALLEL"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missparallel"));
            }
            // versione corrente
            if (oPhaseData["CURRENT_VERSION"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.misscurrvers"));
            }
            // tempo rilevante
            if (oPhaseData["TIMEREL"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.misstimerel"));
            }
            // operatori std
            if (oPhaseData["OPERATORS"] === "" || oPhaseData["OPERATORS"] === "NA") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missoperators")); 
            }
            // tempo standard fase
            if (oPhaseData["STDTIME"] === "" || oPhaseData["STDTIME"] === "NA") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missstdtime"));
            }
            // fase di ripristino
            if (oPhaseData["RECOVERYPHASE"] === "") {
                return MessageBox.warning(controller.oBundle.getText("viewPhase.missrecovphase"));    
            }
			
			let aPhaseParametersModel = controllerPhase.phaseModel.getProperty("/PhaseParameters"),
				aPhaseAttachmentsModel = controllerPhase.phaseModel.getProperty("/PhaseAttachments"),
				aFinalPhaseParametersModel = [],
				aFinalPhaseAttachmentsModel = [];
			
			//Prepare Parameters and Attachments Model to save
			for(let i in aPhaseParametersModel){
				if(aPhaseParametersModel[i]["EDIT"] && aPhaseParametersModel[i]["PARAM_ID"] !== "")
					aFinalPhaseParametersModel.push(aPhaseParametersModel[i]);
			}
			
			for(let i in aPhaseAttachmentsModel){
				if(aPhaseAttachmentsModel[i]["EDIT"] && aPhaseAttachmentsModel[i]["URI"] !== "" && aPhaseAttachmentsModel[i]["URI_DESCR"] !== "")
					aFinalPhaseAttachmentsModel.push(aPhaseAttachmentsModel[i]);
			}
			
            // SAVE_PHASE_DATA
            try {
				let oInput = { 
						"LANGUAGE": controller.language,
                        "KMAT_ID": oPhaseData["KMAT_ID"].join(","),
						"PHASE_HEADER": JSON.stringify(oPhaseData),
						"PHASE_PARAMETERS": JSON.stringify(aFinalPhaseParametersModel),
						"PHASE_ATTACHMENTS": JSON.stringify(aFinalPhaseAttachmentsModel)	
					},
					result = controller.sendData("SAVE_PHASE_DATA","OPERATION/TRANSACTION", oInput);
                
				if (result && result[0] && result[0].RC === "0") {                
                    //controllerPhase.newPhase(false);
					
					let oInput = {
						"OP_CODE_ID": result[0]["MESSAGE"],
						"LANGUAGE": controller.language
					};					
					
					controllerPhase.getPhaseData(oInput);
                    MessageToast.show(controller.oBundle.getText("controllerPhase.insertOK"));
					
					//Master Data - Refresh List
					if(controllerPhase.phaseModel.getProperty("/isMasterPhaseFooter"))
						controllerPhase.getMasterPhasesListData();
                } else {
                    MessageBox.error(result[0].MESSAGE || controller.oBundle.getText("controllerUpdate.err"));
                }
            } catch (error) {
                MessageBox.error(controller.oBundle.getText("controllerUpdate.err"));
            }
        },
        
        deletePhase: function () {		
            MessageBox.confirm(controller.oBundle.getText("viewPhase.delete"), {
                styleClass: "sapUiSizeCompact",
                onClose: function (evt) {
                    if (evt === "OK") {
						let oInput = {
								"OP_CODE_ID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_CODE_ID"),
                                "OP_ID": controllerPhase.phaseModel.getProperty("/PhaseData/OP_ID"),
                                "SEQUENCE": controllerPhase.phaseModel.getProperty("/PhaseData/SEQUENCE"),
                                "SITE_ID": controller.SiteId,
							 }, result = controller.sendData("DELETE_PHASE","OPERATION/TRANSACTION", oInput);
			
						if (result && result[0] && result[0].RC === "0") {                   
							controllerPhase.newPhase(false);
							MessageToast.show(controller.oBundle.getText("viewPhase.deletesucc"));
							
							//Master Data - Refresh List
							if(controllerPhase.phaseModel.getProperty("/isMasterPhaseFooter"))
								controllerPhase.getMasterPhasesListData();
						} else {
							MessageBox.error(result[0].MESSAGE || controller.oBundle.getText("controllerUpdate.err"));
						}
                    }
                }
            });
        },

        transactionError: function (error) {
            sap.ui.core.BusyIndicator.hide();
            console.error(error);
        },

        clonePhase: function () { 
            controllerPhase.enabledPhaseFields('COPY', true);	

            controllerPhase.getKmatMacrophaseComboValue();
        },
		
		newVersionPhase: function () { 
            var oPhaseData = controllerPhase.phaseModel.getProperty("/PhaseData");
            if (!oPhaseData || !oPhaseData.SEQUENCE) {
                MessageBox.warning(controller.oBundle.getText("viewPhase.missingphaseselect"));
                return;
            }

            controllerPhase.enabledPhaseFields('NEW_VERSION', true);	

		    controllerPhase.getKmatMacrophaseComboValue();
        },

        downloadModel: function () { 
            let oModel = JSON.parse('{"DETTAGLIO_FASI": [{"SEQUENZA": "", "FASE": "", "DESCRIZIONE_FASE": "", "CODICE": "", "MACROFASE": "", "PARALLELO": "", "TIPO_FASE": "", "CODICE_LISTINO": "", "STD_TIME": "", "RILEVANTE_PER_TEMPI": "", "STD_OPERATORS": "", "FATTORE_CORREZIONE": "", "TIPO_RACCOLTA_DATI": "", "PARAMETRO": "", "DESCRIZIONE_PARAMETRO": "", "UM": "", "MINIMO": "", "MASSIMO": "", "VALORE_STANDARD": "", "ORDINAMENTO_PARAMETRI": "", "RAGGRUPPAMENTO_PARAMETRI": ""}],"ALLEGATI_FASE": [{"ID_FASE": "", "NOME_ALLEGATO": "", "URL": ""}]}');
            
            let ws_PhaseData = controllerPhase.phaseModel.getProperty("/PhaseData");
            let ws_phaseParameters = controllerPhase.phaseModel.getProperty("/PhaseParameters");
            let ws_PhaseAttachments = controllerPhase.phaseModel.getProperty("/PhaseAttachments");

            // oggetto con Testata e (forEach)Parametri
            let phaseDetails = [];
            let template = oModel.DETTAGLIO_FASI[0];

            // se non ci sono parametri, creo una riga con i dati della fase
            if (!ws_phaseParameters || ws_phaseParameters.length === 0) {
                let row = Object.assign({}, template);
                // Fase
                row["SEQUENZA"] = "0";
                row["FASE"] = ws_PhaseData.SEQUENCE || "";
                row["DESCRIZIONE_FASE"] = ws_PhaseData.OP_CODE_DESCR || "";
                row["CODICE"] = ws_PhaseData.OP_CODE || "";
                row["MACROFASE"] = ws_PhaseData.MAINSEQUENCE || "";
                row["PARALLELO"] = (ws_PhaseData.PARALLEL) ? "X" : "";
                row["TIPO_FASE"] = ws_PhaseData.SEQUENCE_TYPE || "";
                row["CODICE_LISTINO"] = ws_PhaseData.CODE_LIST || "";
                row["STD_TIME"] = ws_PhaseData.STDTIME || "";
                row["RILEVANTE_PER_TEMPI"] = ws_PhaseData.TIMEREL || "";
                row["STD_OPERATORS"] = ws_PhaseData.OPERATORS || "";
                row["FATTORE_CORREZIONE"] = "0"; 
                phaseDetails.push(row);
            } else {
                // se ci sono parametri, crea una riga per ogni parametro
                ws_phaseParameters.forEach(param => {
                    let row = Object.assign({}, template);
                    // Fase
                    row["SEQUENZA"] = "0";
                    row["FASE"] = ws_PhaseData.SEQUENCE || "";
                    row["DESCRIZIONE_FASE"] = ws_PhaseData.OP_CODE_DESCR || "";
                    row["CODICE"] = ws_PhaseData.OP_CODE || "";
                    row["MACROFASE"] = ws_PhaseData.MAINSEQUENCE || "";
                    row["PARALLELO"] = (ws_PhaseData.PARALLEL) ? "X" : "";
                    row["TIPO_FASE"] = ws_PhaseData.SEQUENCE_TYPE || "";
                    row["CODICE_LISTINO"] = ws_PhaseData.CODE_LIST || "";
                    row["STD_TIME"] = ws_PhaseData.STDTIME || "";
                    row["RILEVANTE_PER_TEMPI"] = ws_PhaseData.TIMEREL || "";
                    row["STD_OPERATORS"] = ws_PhaseData.OPERATORS || "";
                    row["FATTORE_CORREZIONE"] = "0";  
                    // Parametro
                    row["PARAMETRO"] = param.PARAMNAME || "";
                    row["DESCRIZIONE_PARAMETRO"] = param.PARAMDESC || "";
                    row["UM"] = param.UOM || "";
                    row["MINIMO"] = param.PARAM_MIN || "";
                    row["MASSIMO"] = param.PARAM_MAX || "";
                    row["VALORE_STANDARD"] = param.PARAM_STD || "";
                    row["ORDINAMENTO_PARAMETRI"] = param.PARAM_ORD || "";   
                    row["RAGGRUPPAMENTO_PARAMETRI"] = param.PARAM_TYPE || "";  
                    row["TIPO_RACCOLTA_DATI"] = param.DC_TYPE || "";   
                    phaseDetails.push(row);
                });
            }

            // PhaseAttachments
            let phaseAttachments = [];
            let templateAtt = oModel.ALLEGATI_FASE[0];
            ws_PhaseAttachments.forEach(att => {
                let row = Object.assign({}, templateAtt);
                row["ID_FASE"] = att.OP_CODE_ID || "";
                row["NOME_ALLEGATO"] = att.URI_DESCR || "";
                row["URL"] = att.URI || "";
                phaseAttachments.push(row);
            });

            if(typeof XLSX == 'undefined') XLSX = require('xlsx');
            let wb = XLSX.utils.book_new();
            
            let ws = XLSX.utils.json_to_sheet(phaseDetails, {header: Object.keys(template)});
            XLSX.utils.book_append_sheet(wb, ws, "DETTAGLIO_FASI");

            let ws2 = XLSX.utils.json_to_sheet(phaseAttachments, {header: Object.keys(templateAtt)});
            XLSX.utils.book_append_sheet(wb, ws2, "ALLEGATI_FASE");

            XLSX.writeFile(wb, "DATI_FASE.xlsx");
        },
		
		/* --------------------------------------------------------- */
        /* Operation-Automha */

        getOperationAutomha: function () {
            //Filtro Fase
            let selPhaseKey = controllerPhase.byId("filterOperationAutomha").getSelectedKeys(),
                phaseFilter = "",
                input = {};

            if (selPhaseKey.length !== 0) {
                phaseFilter = "(";
                for (let i in selPhaseKey) {
                    phaseFilter = phaseFilter + "'" + selPhaseKey[i] + "',";
                }
                phaseFilter = phaseFilter.substring(0, phaseFilter.length - 1);
                phaseFilter = phaseFilter + ")";
            }

            input.SITE_ID = controller.SiteId;
            input.PHASE_ID = phaseFilter;

            controllerPhase.getDataSync("GET_OPERATION_AUTOMHA", "ADIGE7/MASTER_DATA/OPERATION/TRANSACTION", input, controllerPhase.getOperationAutomhaSuccess, controllerPhase.transactionError);
        },

        getOperationAutomhaSuccess: function (data, response) {
            try {
                let result = JSON.parse(jQuery(data).find("Row").text())[0],

                    //Modello Filtro Fase
                    tmpObj = {},
                    modPhaseArr = [],
                    check = true;
                for (let i in result["Data"]) {
                    if (i == 0) {
                        tmpObj.PHASE_ID = result["Data"][i]["PHASE_ID"];
                        tmpObj.PHASE = result["Data"][i]["PHASE"];
                        modPhaseArr.push(tmpObj);
                        tmpObj = new Object;
                    } else {
                        for (let j in modPhaseArr) {
                            if (result["Data"][i]["PHASE_ID"] === modPhaseArr[j]["PHASE_ID"]) {
                                check = false;
                                break;
                            }
                        }
                        if (check) {
                            tmpObj.PHASE_ID = result["Data"][i]["PHASE_ID"];
                            tmpObj.PHASE = result["Data"][i]["PHASE"];
                            modPhaseArr.push(tmpObj);
                            tmpObj = new Object;
                        }
                        check = true;
                    }
                }

                controllerPhase.phaseModel.setProperty("/tabOperationAutomha", result["Data"]);
                controllerPhase.phaseModel.setProperty("/PhaseOperationAutomhaCombo", result["AllOpForMatchcode"]);
                controllerPhase.phaseModel.setProperty("/filterOperationAutomhaPhase", modPhaseArr);

                //Buttons
                controllerPhase.byId("filterOperationAutomha").setEnabled(true);
                controllerPhase.byId("resetFilterOperationAutomha").setEnabled(true);
                controllerPhase.byId("btnCloseOperationAutomha").setEnabled(false);
                controllerPhase.byId("btnSaveOperationAutomha").setEnabled(false);
            } catch (e) {
                console.log(e);
            }
        },

        removeAutomhaPhaseListFilters: function () {
            controllerPhase.byId("filterOperationAutomha").setSelectedKeys();
            controllerPhase.getOperationAutomha();
        },

        newOperationAutomha: function () {
            var addRowModel = controllerPhase.phaseModel.getProperty("/tabOperationAutomha");
            var row = {
                "OPERATION_AUTOMHA_ID": "0",
                "SITE_ID": controller.SiteId,
                "PHASE_ID": "",
                "NETWORK_OPERATION": "",
                "WORK_CENTER_AUTOMHA": "",
                "SENDING_TRIGGER": "",
                "DEL": "false",
                "EDIT": "true"
            };

            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerPhase.phaseModel.setProperty("/tabOperationAutomha", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerPhase.phaseModel.setProperty("/tabOperationAutomha", newArr);
                } else {
                    var addArr = controllerPhase.phaseModel.getProperty("/tabOperationAutomha");
                    addArr.push(row);
                    controllerPhase.phaseModel.setProperty("/tabOperationAutomha", addArr);
                }
            }

            //Buttons
            controllerPhase.byId("filterOperationAutomha").setEnabled(false);
            controllerPhase.byId("resetFilterOperationAutomha").setEnabled(false);
            controllerPhase.byId("btnCloseOperationAutomha").setEnabled(true);
            controllerPhase.byId("btnSaveOperationAutomha").setEnabled(true);

            //Scroll to last table Element
            controllerPhase.byId("tabOperationAutomha").setFirstVisibleRow(addRowModel.length);
        },

        saveOperationAutomha: function () {
            let input = {},
                model = controllerPhase.phaseModel.getProperty("/tabOperationAutomha"),
                modInput = [],
                obj = {};


            for (let i in model) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].PHASE_ID === "" || model[i].NETWORK_OPERATION === "" || model[i].SENDING_TRIGGER === "") && model[i].DEL !== "true") {
                        return MessageBox.warning(controller.oBundle.getText("controllerLogistic.errMissLogisticStateFields"));
                    } else {
                        obj = model[i];
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }
            if (modInput.length !== 0) {
                input = {
                    "DATA": JSON.stringify(modInput)
                };
                controllerPhase.getDataSync("SAVE_OPERATION_AUTOMHA", "ADIGE7/MASTER_DATA/OPERATION/TRANSACTION", input, controllerPhase.saveOperationAutomhaSuccess, controllerPhase.transactionError);
            }
        },

        saveOperationAutomhaSuccess: function (data, response) {
            try {
                var jsonArr = JSON.parse(jQuery(data).find("Row").text());
                if (jsonArr[0].RC == "0") {
                    controllerPhase.getOperationAutomha();
                    MessageToast.show(controller.oBundle.getText("controllerPhase.insertOK"));
                } else {
                    MessageBox.error(jsonArr[0].MESSAGE);
                }
            } catch (e) {
                console.log(e);
            }
        },

        editOperationAutomha: function (oEvent) {
            let lineSel = controllerPhase.phaseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.DEL = "false";
            controllerPhase.phaseModel.refresh();
            //Buttons
            controllerPhase.byId("filterOperationAutomha").setEnabled(false);
            controllerPhase.byId("resetFilterOperationAutomha").setEnabled(false);
            controllerPhase.byId("btnCloseOperationAutomha").setEnabled(true);
            controllerPhase.byId("btnSaveOperationAutomha").setEnabled(true);
        },

        deleteOperationAutomha: function (oEvent) {
            let lineSel = controllerPhase.phaseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.DEL = "true";
            controllerPhase.phaseModel.refresh();
            //Buttons
            controllerPhase.byId("filterOperationAutomha").setEnabled(false);
            controllerPhase.byId("resetFilterOperationAutomha").setEnabled(false);
            controllerPhase.byId("btnCloseOperationAutomha").setEnabled(true);
            controllerPhase.byId("btnSaveOperationAutomha").setEnabled(true);
        },

        /* --------------------------------------------------------- */
		
		/*Master Phases*/
		getMasterPhasesListData: function(){
			 try {
                let oFilterMasterPhase = controllerPhase.phaseModel.getProperty("/filterMasterChecklist"),
                    oInput = { 
                    "SITE_ID": controller.SiteId,
					"LANGUAGE": controller.language,
                    "KMAT_ID": oFilterMasterPhase["KMAT_ID"].join(","),
                    "MAIN_SEQUENCE": oFilterMasterPhase["MAINSEQUENCE"].length > 0 ? oFilterMasterPhase["MAINSEQUENCE"].join(",") : "",
                    "IS_RECOVERY": oFilterMasterPhase["RECOVERYPHASE"]
                };
				
                controllerPhase.setModelProperty("/MasterPhaseList", controller.sendData("GET_MASTER_PHASES_LIST","OPERATION/TRANSACTION", oInput)["Rows"]);
               
            } catch (error) {
                controllerPhase.setModelProperty("/MasterPhaseList", []);
            }
		},
		
		openFilterPopup: function(){
            Fragment.load({
				name: "master_data.view.popup.phase.phaseMasterFilter",
				controller: controllerPhase
			}).then(function (oPhaseMasterFilter) {
				controllerPhase.oMasterFilter = oPhaseMasterFilter;
				controllerPhase.getView().addDependent(oPhaseMasterFilter);
                controllerPhase.getKmatMacrophaseComboValue();
				controllerPhase.oMasterFilter.open();
			});
		},

        onFilterMasterChecklistChange: function () {
            
        },

        resetFilterMasterChecklist: function () {
            controllerPhase.phaseModel.setProperty("/filterMasterChecklist", {
                "KMAT_ID": [],
                "MAINSEQUENCE": [],
                "RECOVERYPHASE": false
            });
            controllerPhase.phaseModel.setProperty("/viewPhaseElements/enabledSaveMasterFilterBtn", false);
        },

        removePhaseMasterView: function () {
            controllerPhase.resetFilterMasterChecklist();
            controllerPhase.phaseModel.setProperty("/viewPhaseElements/isFilterMasterChecklist", false);
            controllerPhase.newPhase(false);
            controllerPhase.setModelProperty("/MasterPhaseList", []);
        },

        removePhaseMasterFilter: function () {
            controllerPhase.resetFilterMasterChecklist();
            controllerPhase.phaseModel.setProperty("/viewPhaseElements/isFilterMasterChecklist", false);
            controllerPhase.getMasterPhasesListData();
        },

        savePhaseMasterFilter: function () { 

            controllerPhase.getMasterPhasesListData();
            controllerPhase.phaseModel.setProperty("/viewPhaseElements/isFilterMasterChecklist", true);

            // chiudo il dialog
            controllerPhase.oMasterFilter.close();
            controllerPhase.oMasterFilter.destroy();
            controllerPhase.oMasterFilter = undefined;
                
        },

        onClosePopupPhaseMasterFilter: function () { 
            // pulisco i valori inseriti
            controllerPhase.resetFilterMasterChecklist();
            controllerPhase.phaseModel.setProperty("/viewPhaseElements/enabledSaveMasterFilterBtn", false);

            // chiudo il dialog
            if (controllerPhase.oMasterFilter) {
                controllerPhase.oMasterFilter.close();
                controllerPhase.oMasterFilter.destroy();
                controllerPhase.oMasterFilter = undefined;
            }
        },
		
		onSelectMasterPhase: function(oEvent){			
			if(oEvent.getParameter("selected")){
				let oSelRow = controllerPhase.phaseModel.getProperty(oEvent.getParameter("listItem").getBindingContext().sPath),
					oInput = {
						"OP_CODE_ID": oSelRow["OP_CODE_ID"],
						"LANGUAGE": controller.language
					};			
					
				controllerPhase.getKmatMacrophaseComboValue();	
				controllerPhase.getPhaseData(oInput);
			}else{
				controllerPhase.newPhase(false);
			}
		},

        onSearchMasterPhaseFilter: function (oEvent) { 
            let sQuery = oEvent.getParameter("newValue"),
                aFilter = [];

            if (sQuery && sQuery.length > 0) {
                aFilter.push(new Filter("OP_CODE_DESCR", FilterOperator.Contains, sQuery));
            }

            controllerPhase.byId("MasterPhasesList").getBinding("items").filter(aFilter);
        }

    });
});
