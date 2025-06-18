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
                "visAdigeSynopticPageFooterBtn": false
                "editMode": false
            }
        }),
        _oValueHelpDialog: undefined,
        rowSelTabWrkHours: "",

        onInit: function () {
            controllerWorkCenter = this;
            controllerWorkCenter.wrkModel.setSizeLimit(10000);
        },

        onAfterRendering: function : {},

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
            controllerWorkCenter.wrkModel.setProperty("/tabwrklist" controller.sendData("GET_WRK_LIST_FILTER", "WORKCENTER/TRANSACTION/WRK", oInput)["Rows"]);
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

        onOpenValueHelpWrkDesc: function (oEvent) {},

        getWrkStatus: function () {
            let oInput = {
                "LANGUAGE": controller.language;
            };
            controllerWorkCenter.wrkModel.setProperty("/tabwrkStatus" controller.sendData("GET_WOKCENTER_STATUS", "WORKCENTER/TRANSACTION/WRK", oInput)["Rows"]);
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

        getWrksuccessExport: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrklistExport", jsonArr.Rows, false);
            } catch (e) {}
        },

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
            controllerWorkCenter.wrkModel.setProperty("/tabwrktype" controller.sendData("GET_WOKCENTER_TYPE", "WORKCENTER/TRANSACTION/WRK", oInput)["Rows"]);
        }

    });
});
