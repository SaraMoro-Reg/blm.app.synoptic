var controllerAtt;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/m/MessageToast',
        "sap/m/MessageBox",
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.Attached", {
        attModel: new sap.ui.model.json.JSONModel(),
        _popup: undefined,
        userLang: "",
        chklist_id: "0",
        pathRowSel: "",
		
        onInit: function () {
            controllerAtt = this;
            controllerAtt.getView().setModel(controllerAtt.attModel);
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
		
        downloadModel: function () {
            var dateExport = new Date();
            var mm = "";
            var dd = "";
            if (String(dateExport.getMonth() + 1).length == 1) {
                var mm = "0" + String(dateExport.getMonth() + 1)
            } else {
                mm = String(dateExport.getMonth() + 1)
            }
            if (String(dateExport.getDate()).length == 1) {
                var dd = "0" + String(dateExport.getDate())
            } else {
                dd = String(dateExport.getDate())
            }
            var dateExportStr = dateExport.getFullYear() + (dateExport.getMonth() + 1) + mm + dd;
            controllerAtt.getValueForExcel();
            var ws_data = controllerAtt.attModel.getProperty("/checklistattexc");
            var ws_data1 = controllerAtt.attModel.getProperty("/checklistopattexc");
            if (typeof XLSX == 'undefined')
                XLSX = require('xlsx');
            var ws = XLSX.utils.json_to_sheet(ws_data);
            var ws1 = XLSX.utils.json_to_sheet(ws_data1);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "ALLEGATI_CHECKLIST");
            XLSX.utils.book_append_sheet(wb, ws1, "ALLEGATI_FASE");
            XLSX.writeFile(wb, controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("documents") + dateExportStr + ".xlsx");
        },
		
        deleteDescr: function (evt) {
            var lineSel = controllerAtt.attModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            var infoModel = evt.oSource.getBindingContext().sPath.split("/");
            if (lineSel.ATTACHED == "" || lineSel.DESCRIPTION == "") {
                var model = controllerAtt.attModel.getProperty(evt.oSource.oParent.oParent.mBindingInfos.rows.path);
                var modInput = [];
                var obj = {};
                for (var i = 0; i < model.length; i++) {
                    if (i != parseInt(infoModel["2"])) {
                        obj.CHEKLISTATT_ID = model[i].CHEKLISTATT_ID;
                        obj.CHECKLIST_ID = model[i].CHEKLIST_ID;
                        obj.ATTACHED = model[i].ATTACHED;
                        obj.DESCRIPTION = model[i].DESCRIPTION;
                        obj.DEL = model[i].DEL;
                        obj.EDIT = model[i].EDIT;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
                controllerAtt.attModel.setProperty(evt.oSource.oParent.oParent.mBindingInfos.rows.path, JSON.parse(JSON.stringify(modInput)), false);
            }
            controllerAtt.attModel.refresh();
			
			//Buttons
			controllerAtt.byId("btnCloseAttachChecklist").setEnabled(true);
            controllerAtt.byId("btnSaveAttachChecklist").setEnabled(true);
        },
		
        deleteDescrOP: function (evt) {
            var lineSel = controllerAtt.attModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            var infoModel = evt.oSource.getBindingContext().sPath.split("/");
            if (lineSel.ATTACHED == "" || lineSel.DESCRIPTION == "") {
                var model = controllerAtt.attModel.getProperty(evt.oSource.oParent.oParent.mBindingInfos.rows.path);
                var modInput = [];
                var obj = {};
                for (var i = 0; i < model.length; i++) {
                    if (i != parseInt(infoModel["2"])) {
                        obj.CHECKLISTOPATT_ID = model[i].CHECKLISTOPATT_ID;
                        obj.CHECKLISTOP_ID = model[i].CHECKLISTOP_ID;
                        obj.ATTACHED = model[i].ATTACHED;
                        obj.DESCRIPTION = model[i].DESCRIPTION;
                        obj.DEL = model[i].DEL;
                        obj.EDIT = model[i].EDIT;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
                controllerAtt.attModel.setProperty(evt.oSource.oParent.oParent.mBindingInfos.rows.path, JSON.parse(JSON.stringify(modInput)), false);
            }
            controllerAtt.attModel.refresh();
			
			//Buttons
			controllerAtt.byId("btnCloseAttachPhase").setEnabled(true);
            controllerAtt.byId("btnSaveAttachPhase").setEnabled(true);
        },
		
        addAttachChkList: function () {
            var addRowModel = controllerAtt.attModel.getProperty("/checklistatt");
            var row = {
                "ATTACHED": "",
                "DESCRIPTION": "",
                "CHEKLIST_ID": controllerAtt.chklist_id,
                "DEL": "false",
                "EDIT": true
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerAtt.attModel.setProperty("/checklistatt", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerAtt.attModel.setProperty("/checklistatt", newArr);
                } else {
                    var addArr = controllerAtt.attModel.getProperty("/checklistatt");
                    addArr.push(row);
                    controllerAtt.attModel.setProperty("/checklistatt", addArr);
                }
            }
			
			//Buttons
			controllerAtt.byId("btnCloseAttachChecklist").setEnabled(true);
            controllerAtt.byId("btnSaveAttachChecklist").setEnabled(true);
			
			//Scroll to last table Element
			controllerAtt.byId("checklistatt").setFirstVisibleRow(addRowModel.length);
        },
		
        addAttachChkListOP: function () {
            var addRowModel = controllerAtt.attModel.getProperty("/checklistattop");
            var row = {
                "ATTACHED": "",
                "DESCRIPTION": "",
                "CHECKLISTOP_ID": controllerAtt.byId("comboPhase").getSelectedKey(),
                "DEL": "false",
                "EDIT": true
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerAtt.attModel.setProperty("/checklistattop", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerAtt.attModel.setProperty("/checklistattop", newArr);
                } else {
                    var addArr = controllerAtt.attModel.getProperty("/checklistattop");
                    addArr.push(row);
                    controllerAtt.attModel.setProperty("/checklistattop", addArr);
                }
            }
			
			//Buttons
			controllerAtt.byId("btnCloseAttachPhase").setEnabled(true);
            controllerAtt.byId("btnSaveAttachPhase").setEnabled(true);
			
			//Scroll to last table Element
			controllerAtt.byId("checklistattop").setFirstVisibleRow(addRowModel.length);
        },
		
        saveAttachChkList: function () {
            var model = controllerAtt.attModel.getProperty("/checklistatt");
            var modInput = [];
            var obj = {};
            var input = {};
            for (var i = 0; i < model.length; i++) {
                //if(model[i].DESCRIPTION!=""&&model[i].ATTACHED !=""&&!model[i].DEL){
                if (model[i].DESCRIPTION != "") {
                    if (model[i].ATTACHED != "") {
                        obj.CHEKLISTATT_ID = model[i].CHEKLISTATT_ID;
                        obj.CHECKLIST_ID = model[i].CHEKLIST_ID;
                        obj.ATTACHED = model[i].ATTACHED;
                        obj.DESCRIPTION = model[i].DESCRIPTION;
                        obj.DEL = model[i].DEL;
                        obj.EDIT = model[i].EDIT;
                        modInput.push(obj);
                        obj = new Object;
                    } else {
                        return MessageBox.warning(controller.oBundle.getText("viewAtt.missingattached"))
                    }
                } else {
                    return MessageBox.warning(controller.oBundle.getText("viewAtt.missingdescr"))
                }
                //}
            }
            input = {
                "DATA": JSON.stringify(modInput)
            };
            controllerAtt.getDataSync("INS_DEL_ATTACHED_CHKLIST", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.saveAttachChkListSuccess, controllerAtt.transactionError);
        },
		
        saveAttachChkListSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                MessageToast.show(controller.oBundle.getText("viewAtt.checklist.attachedsuccess"));
                controllerAtt.getCheckListAtt();
            }
        },
		
        saveAttachChkListOP: function () {
            var model = controllerAtt.attModel.getProperty("/checklistattop");
            var modInput = [];
            var obj = {};
            var input = {};
            for (var i = 0; i < model.length; i++) {
                if (model[i].DESCRIPTION != "") {
                    if (model[i].ATTACHED != "NA") {
                        obj.CHECKLISTOPATT_ID = model[i].CHECKLISTOPATT_ID;
                        obj.CHECKLISTOP_ID = model[i].CHECKLISTOP_ID;
                        obj.ATTACHED = model[i].ATTACHED;
                        obj.DESCRIPTION = model[i].DESCRIPTION;
                        obj.DEL = model[i].DEL;
                        obj.EDIT = model[i].EDIT;
                        modInput.push(obj);
                        obj = new Object;
                    } else {
                        return MessageBox.warning(controller.oBundle.getText("viewAtt.missingattached"))
                    }
                } else {
                    return MessageBox.warning(controller.oBundle.getText("viewAtt.missingdescr"))
                }
            }
            input = {
                "DATA": JSON.stringify(modInput)
            };
            controllerAtt.getDataSync("INS_DEL_ATTACHED_CHKLIST_OP", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.saveAttachChkListOPSuccess, controllerAtt.transactionError);
        },
		
        saveAttachChkListOPSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                MessageToast.show(controller.oBundle.getText("viewAtt.checklist.attachedsuccess"));
                controllerAtt.getChkListOp();
            }
        },
		
        getTimeout: function (error) {
            if (error.statusText == "timeout") {
                MessageBox.warning(controller.oBundle.getText("viewAtt.errorTimeout"))
            }
            controllerAtt.navBack();
        },
		
        closeChecklistAttachments: function () {
			//Input Field				
			controllerAtt.byId("checkListInput").setEditable(true);
            controllerAtt.byId("checkListInput").setValue("");
            controllerAtt.byId("dwnlxecl").setEnabled(false);
            controllerAtt.byId("resetChecklistAttachments").setEnabled(false);
			
            //Buttons Checklist
			controllerAtt.byId("btnNewAttachChecklist").setEnabled(false);
			controllerAtt.byId("btnCloseAttachChecklist").setEnabled(false);
            controllerAtt.byId("btnSaveAttachChecklist").setEnabled(false);
			
			//Buttons Phase
			controllerAtt.byId("btnNewAttachPhase").setEnabled(false);
			controllerAtt.byId("btnCloseAttachPhase").setEnabled(false);
            controllerAtt.byId("btnSaveAttachPhase").setEnabled(false);
			
			controllerAtt.chklist_id = "0";
            controllerAtt.byId("comboMacro").setSelectedKey("");
			controllerAtt.byId("comboMacro").setEditable(false);
            controllerAtt.byId("comboPhase").setSelectedKey("");
			controllerAtt.byId("comboPhase").setEditable(false);
			
			//Models
			controllerAtt.attModel.setProperty("/checklistatt", []);			
			controllerAtt.attModel.setProperty("/checklistattop", []);
        },
		
        getPathList: function () {
            var input = {};
            input.SITEID = controller.SiteId;
            controllerAtt.getDataSync("GET_PATH_LIST", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.getPathListSuccess, controllerAtt.transactionError);
        },
		
        getPathListSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerAtt.attModel.setProperty("/pathList", jsonArr["Rows"]);
        },
		
        //FUNZIONI GENERICHE
        //FUNZIONI DASHBOARD
        //------------Checklist---------------//
        getValueForExcel: function () {
            var input = {};
            input.CHECKLIST_ID = controllerAtt.chklist_id;
            controllerAtt.getDataSync("GET_VALUE_FRO_EXCEL", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION/TRANSDWN", input, controllerAtt.getValueForExcelSuccess, controllerAtt.transactionError);
        },
		
        getValueForExcelSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerAtt.attModel.setProperty("/checklistattexc", jsonArr.Rows[0].CKLSTATTACHED["Rows"]);
            controllerAtt.attModel.setProperty("/checklistopattexc", jsonArr.Rows[0].CKLSTOPATTACHED["Rows"]);
        },
		
        getCheckList: function (value) {
            var input = {};
            input.SITE_ID = controller.SiteId;
            input.LANGUAGE = controllerUSR.userLang;
			input.CHECKLIST = value;
            controllerAtt.getDataSync("GET_CHECK_LIST_NOT_DONE", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.getCheckListSuccess, controllerAtt.transactionError);
        },
		
        getCheckListSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerAtt.attModel.setProperty("/checklist", jsonArr["Rows"]);
            controllerAtt.byId("dwnlxecl").setEnabled(true);
        },
		
        getCheckListAtt: function () {
            var input = {};
            input.CHECKLIST_ID = controllerAtt.chklist_id;
            controllerAtt.getDataSync("GET_CHECK_LIST_ATTACHED", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.getCheckListAttSuccess, controllerAtt.transactionError);
        },
		
        getCheckListAttSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerAtt.attModel.setProperty("/checklistatt", jsonArr["Rows"]);
			
			//Buttons
			controllerAtt.byId("btnCloseAttachChecklist").setEnabled(false);
            controllerAtt.byId("btnSaveAttachChecklist").setEnabled(false);
        },
		
        createroot: function () {
            var path = "";
            sap.ui.getCore().byId("path").setValue(sap.ui.getCore().byId("root").getValue());
            path = sap.ui.getCore().byId("path").getValue();
            controllerAtt.getAttechedList(path);
        },
		
        navBack: function () {
            var previousURL = sap.ui.getCore().byId("path").getValue();
            previousURL = previousURL.substring(0, previousURL.lastIndexOf("/")).replace("http://srvmiiws.blmgroup.com/", "");
            sap.ui.getCore().byId("path").setValue(previousURL);
            controllerAtt.getAttechedList(previousURL);
        },
		
        selectAttach: function (oEvent) {
            var modelLnght = controllerAtt.attModel.getProperty(sap.ui.getCore().byId("pathDoc").getBinding().sPath).length
                var i = 0;
            for (i; i < modelLnght; i++) {
                if (controllerAtt.attModel.getProperty(sap.ui.getCore().byId("pathDoc").getBinding().sPath + "/" + i).NAME == oEvent.oSource.mProperties.text) {
                    var rowSel = controllerAtt.attModel.getProperty(sap.ui.getCore().byId("pathDoc").getBinding().sPath + "/" + i);
                    break;
                }
            }
            if (rowSel.TYPE == "folder") {
                sap.ui.getCore().byId("path").setValue(sap.ui.getCore().byId("path").getValue() + "/" + oEvent.oSource.mProperties.text);
                controllerAtt.getAttechedList(sap.ui.getCore().byId("path").getValue());
            } else {
                sap.ui.getCore().byId("path").setValue(rowSel.URI);
            }
        },
		
        getAttechedList: function (path) {
            var input = {};
            if (path != "") {
                input.ROOT = path;
                controllerAtt.getDataAsync("GET_FOLDER_FILE_LIST", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.getAttechedListSuccess, controllerAtt.transactionError);
            } else {
                controllerAtt.attModel.setProperty("/pathDoc", [], false);
            }
        },
		
        getAttechedListSuccess: function (data, response) {
            sap.ui.core.BusyIndicator.hide();
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            try {
                if (jsonArr.Rows[0].RC != "0") {
                    if (jsonArr.Rows[0].RC == "3") {
                        MessageBox.warning(controller.oBundle.getText("viewAtt.errorTimeout"))
                    }
                    if (jsonArr.Rows[0].RC == "4") {
                        MessageBox.error(jsonArr.Rows[0].MESSAGE + " - " + controller.oBundle.getText("viewAtt.accessdenied"));
                    }
                    controllerAtt.navBack();
                } else {
                    controllerAtt.attModel.setProperty("/pathDoc", jsonArr.Rows, false);
                    var tableAttach = sap.ui.getCore().byId("pathDoc").getBinding();
                    sap.ui.getCore().byId("NAME").setFilterValue("");
                    sap.ui.getCore().byId("NAME").setFiltered(false);
                    tableAttach.filter();
                }
            } catch (e) {
                controllerAtt.getTimeout(e)
            }
        },
		
        previewFile: function (oEvent) {
            var modelLnght = controllerAtt.attModel.getProperty(sap.ui.getCore().byId("pathDoc").getBinding().sPath).length
                var i = 0;
            for (i; i < modelLnght; i++) {
                if (controllerAtt.attModel.getProperty(sap.ui.getCore().byId("pathDoc").getBinding().sPath + "/" + i).NAME == oEvent.oSource.oParent.mAggregations.cells[1].mProperties.text) {
                    var rowSel = controllerAtt.attModel.getProperty(sap.ui.getCore().byId("pathDoc").getBinding().sPath + "/" + i);
                    break;
                }
            }
            window.open(rowSel.URI, "_blank");
        },
        //------------Checklist---------------//
        //------------Checklist operation---------------//
        getComboMacroFase: function () {
            var input = {};
            input.CHECKLIST_ID = controllerAtt.chklist_id;
            controllerAtt.getDataSync("GET_MACROFASE_COMBO", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.getComboMacroFaseSuccess, controllerAtt.transactionError);
        },
		
        getComboMacroFaseSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerAtt.attModel.setProperty("/macrofase", jsonArr["Rows"]);
        },
		
        getComboFase: function () {
            var input = {};
            input.CHECKLIST_ID = controllerAtt.chklist_id;
            input.MACROFASE = controllerAtt.byId("comboMacro").getSelectedKey();
            input.LANGUAGE = controllerUSR.userLang;
            controllerAtt.getDataSync("GET_PHASE_COMBO", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.getComboFaseSuccess, controllerAtt.transactionError);
        },
		
        getComboFaseSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerAtt.attModel.setProperty("/phase", jsonArr["Rows"]);
        },
		
        getChkListOp: function () {
            var input = {};
            input.CHECKLISTOP_ID = controllerAtt.byId("comboPhase").getSelectedKey();
            controllerAtt.getDataSync("GET_CHECK_LIST_OP_ATTACHED", "ADIGE7/MASTER_DATA/ATTACHED/TRANSACTION", input, controllerAtt.getChkListOpSuccess, controllerAtt.transactionError);
        },
		
        getChkListOpSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerAtt.attModel.setProperty("/checklistattop", jsonArr["Rows"]);
			
			//Buttons Phase
			controllerAtt.byId("btnNewAttachPhase").setEnabled(true);
			controllerAtt.byId("btnCloseAttachPhase").setEnabled(false);
            controllerAtt.byId("btnSaveAttachPhase").setEnabled(false);
        },

        //------------Checklist operation---------------//
        //FUNZIONI DASHBOARD
        //FUNZIONI DI RICERCA
        //-----------------------CheckLsit------------------------------//
        handleValueHelpChkList: function () {
            controllerAtt.getCheckList("");
            if (!controllerAtt._oValueHelpDialogChkList) {
                Fragment.load({
                    name: "master_data.view.popup.listchklist_tbl",
                    controller: controllerAtt
                }).then(function (oValueHelpDialogChkList) {
                    controllerAtt._oValueHelpDialogChkList = oValueHelpDialogChkList;
                    controllerAtt.getView().addDependent(controllerAtt._oValueHelpDialogChkList);
                    controllerAtt._configValueHelpDialogChkList();
                    controllerAtt._oValueHelpDialogChkList.open();
                });
            } else {
                controllerAtt._configValueHelpDialogChkList();
                controllerAtt._oValueHelpDialogChkList.open();
            }
        },

        _configValueHelpDialogChkList: function () {
            var oModel = controllerAtt.getView().getModel(),
            aProducts = oModel.getProperty("/checklist");
            oModel.setProperty("/checklist", aProducts);
        },

        handleValueHelpCloseChkList: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            try {
                controllerAtt.byId("checkListInput").setValue(oSelectedItem.mAggregations.cells[0].getText());
                controllerAtt.chklist_id = oSelectedItem.mAggregations.cells[1].getText();
                controllerAtt.getCheckListAtt();
                controllerAtt.getComboMacroFase();
                controllerAtt._oValueHelpDialogMat = undefined;
				
				//Input Field				
				controllerAtt.byId("checkListInput").setEditable(false);
				controllerAtt.byId("comboMacro").setEditable(true);
				controllerAtt.byId("comboPhase").setEditable(true);
				
				//Buttons Checklist				
				controllerAtt.byId("resetChecklistAttachments").setEnabled(true);
				controllerAtt.byId("btnNewAttachChecklist").setEnabled(true);
				controllerAtt.byId("btnCloseAttachChecklist").setEnabled(false);
				controllerAtt.byId("btnSaveAttachChecklist").setEnabled(false);
            } catch (err) {}
        },
		
        handleSearchChkList: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            /*var oFilter = new Filter("CHECKLIST", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);*/
			controllerAtt.getCheckList(sValue);
        },
		
        //-----------------------CheckLsit------------------------------//
        //----------------------Check list allegati--------------------//
        handleValueHelpChkListAtt: function (oEvent) {
            controllerAtt.pathRowSel = oEvent.oSource.oParent.oBindingContexts["undefined"].sPath;
            controllerAtt.getPathList();
            if (!controllerAtt._popup) {
                controllerAtt.getAttechedList("");
                controllerAtt._popup = sap.ui.xmlfragment("master_data.view.popup.searchPath", controllerAtt);
                controllerAtt.getView().addDependent(controllerAtt._popup);
            }
            controllerAtt._popup.open();
        },
		
        handleValueHelpChkListAttClose: function () {
            controllerAtt._popup.close();
            controllerAtt._popup.destroy();
            controllerAtt._popup = undefined;
        },
		
        copyValue: function (oEvent) {
            controllerAtt.attModel.getProperty(controllerAtt.pathRowSel)["ATTACHED"] = sap.ui.getCore().byId("path").getValue();
            controllerAtt.attModel.refresh();
            controllerAtt.handleValueHelpChkListAttClose();
        },
        //----------------------Check list allegati--------------------//
        //----------------------Check list operazioni allegati------//
        handleValueHelpChkListOPAtt: function (oEvent) {
            controllerAtt.pathRowSel = oEvent.oSource.oParent.oBindingContexts["undefined"].sPath;
            controllerAtt.getPathList();
            if (!controllerAtt._popup) {
                controllerAtt.getAttechedList("");
                controllerAtt._popup = sap.ui.xmlfragment("master_data.view.popup.searchPathOp", controllerAtt);
                controllerAtt.getView().addDependent(controllerAtt._popup);
            }
            controllerAtt._popup.open();
        },
		
        handleValueHelpChkListAttOPClose: function () {
            controllerAtt._popup.close();
            controllerAtt._popup.destroy();
            controllerAtt._popup = undefined;
        },
        copyValueOP: function (oEvent) {
            controllerAtt.attModel.getProperty(controllerAtt.pathRowSel)["ATTACHED"] = sap.ui.getCore().byId("path").getValue();
            controllerAtt.attModel.refresh();
            controllerAtt.handleValueHelpChkListAttClose();
        },
		
        //----------------------Check list operazioni allegati------//
        //FUNZIONI RICERCA
        //FUNZIONI PER ESECUZIONI TRANSAZIONI
        getDataAsync: function (transaction, route, input, successFunc, errorFunc) {
            sap.ui.core.BusyIndicator.show();

            var transactionCall = route + "/" + transaction;

            input.TRANSACTION = transactionCall;
            input.OutputParameter = "JSON";
            var that = controllerAtt;
            try {
                var req = jQuery.ajax({
                    url: "/XMII/Runner",
                    data: input,
                    method: "POST",
                    dataType: "xml",
                    async: true,
                    timeout: 30000
                });
                req.done(jQuery.proxy(successFunc, controllerAtt));
                req.fail(jQuery.proxy(errorFunc, controllerAtt));
            } catch (e) {
                that.getTimeout(e);
                if (e.statusText == 'timeout') {
                    that.getTimeout(e);
                    MessageBox.error('Native Promise: Failed from timeout');
                    //do something. Try again perhaps?
                }
            }
        },
		
        transactionError: function (error) {
            sap.ui.core.BusyIndicator.hide();
            controllerAtt.getTimeout(error);
            //console.error(error);
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
                req.done(jQuery.proxy(suss, controllerAtt));
                req.fail(jQuery.proxy(errf, controllerAtt));
            } catch (e) {}
        }
    });
});
