var controllerMat;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/m/MessageToast',
        "sap/m/MessageBox",
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.Material", {
        matModel: new sap.ui.model.json.JSONModel(),    
        mat_id: "0",
		
        onInit: function () {
            controllerMat = this;
            controllerMat.getView().setModel(controllerMat.matModel);
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
            controllerMat.getAllMat();
            var ws_data = controllerMat.matModel.getProperty("/matList");
            if (typeof XLSX == 'undefined')
                XLSX = require('xlsx');
            var ws = XLSX.utils.json_to_sheet(ws_data);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, controller.oBundle.getText("viewMat.material"));
            XLSX.writeFile(wb, controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewMat.material") + dateExportStr + ".xlsx");
        },
		
        copyMat: function () {
            controllerMat.mat_id = "0";
			controllerMat.byId("materialInput").setEnabled(false);
            controllerMat.byId("descrMat").setValue("");
            controllerMat.byId("descrMat").setEnabled(true);
            controllerMat.byId("currentVer").setSelected(false);
            controllerMat.byId("currentVer").setEnabled(true);
			controllerMat.byId("btnNewMat").setEnabled(false);
            controllerMat.byId("saveMat").setEnabled(true);
			controllerMat.byId("btnAddMatDescr").setEnabled(false);
			controllerMat.byId("closeMat").setEnabled(true);
            controllerMat.checkNewVersAvailable();
			
            //Models
			controllerMat.matModel.setProperty("/matdescrList", []);
        },
		
        newMaterial: function () {
            controllerMat.byId("materialInput").setValue("");
			controllerMat.byId("materialInput").setEnabled(false);
            controllerMat.mat_id = "0";
            controllerMat.byId("inputMat").setValue("");
			controllerMat.byId("inputMat").setEnabled(true);
            controllerMat.byId("descrMat").setValue("");
			controllerMat.byId("descrMat").setEnabled(true);
            controllerMat.byId("versMat").setValue("");
			controllerMat.byId("versMat").setEnabled(true);
			controllerMat.byId("currentVer").setSelected(false);
            controllerMat.byId("currentVer").setEnabled(true);
			
			//Buttons
            controllerMat.byId("btnNewMat").setEnabled(true);
            controllerMat.byId("copyMat").setEnabled(false);
            controllerMat.byId("closeMat").setEnabled(true);           
            controllerMat.byId("saveMat").setEnabled(true);
            controllerMat.byId("delMat").setEnabled(false);
			controllerMat.byId("btnAddMatDescr").setEnabled(false);
			controllerMat.byId("btnSaveMatDescr").setEnabled(false);
			
			//Models
			controllerMat.matModel.setProperty("/matdescrList", []);
        },
		
        disabledField: function () {
			//Input Fields
            controllerMat.byId("materialInput").setValue("");
			controllerMat.byId("materialInput").setEnabled(true);
            controllerMat.mat_id = "0";
            controllerMat.byId("inputMat").setValue("");
			controllerMat.byId("inputMat").setEnabled(false);
            controllerMat.byId("descrMat").setValue("");
			controllerMat.byId("descrMat").setEnabled(false);
            controllerMat.byId("versMat").setValue("");
			controllerMat.byId("versMat").setEnabled(false);
			controllerMat.byId("currentVer").setSelected(false);
            controllerMat.byId("currentVer").setEnabled(false);
			
			//Buttons
            controllerMat.byId("btnNewMat").setEnabled(true);
            controllerMat.byId("copyMat").setEnabled(false);
            controllerMat.byId("closeMat").setEnabled(false);           
            controllerMat.byId("saveMat").setEnabled(false);
            controllerMat.byId("delMat").setEnabled(false);
			controllerMat.byId("btnAddMatDescr").setEnabled(false);
			controllerMat.byId("btnSaveMatDescr").setEnabled(false);
			
			//Models
			controllerMat.matModel.setProperty("/matdescrList", []);
        },
		
        addDescr: function () {
            var addRowModel = controllerMat.matModel.getProperty("/matdescrList");
            var row = {
                "LANGUAGE": "",
                "DESCRIPTION": "",
                "DEL": "false",
                "EDIT": true
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerMat.matModel.setProperty("/matdescrList", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerMat.matModel.setProperty("/matdescrList", newArr);
                } else {
                    var addArr = controllerMat.matModel.getProperty("/matdescrList");
                    addArr.push(row);
                    controllerMat.matModel.setProperty("/matdescrList", addArr);
                }
            }
			
			controllerMat.changeMaterialDescr();
        },
		
        updateDescr: function () {
            var model = controllerMat.matModel.getProperty("/matdescrList");
            var modInput = [];
            var obj = {};
            var input = {};
            for (var i = 0; i < model.length; i++) {
                if (model[i].USERID != "NA") {
                    obj.MAT_ID = controllerMat.mat_id;
                    obj.DESCRIPTION = model[i].DESCRIPTION;
                    obj.LANGUAGE = model[i].LANGUAGE;
                    obj.DEL = model[i].DEL;
                    modInput.push(obj);
                    obj = new Object;
                }
            }
            input = {
                "DATA": JSON.stringify(modInput)
            };
            controllerMat.getDataSync("INS_DEL_MATERIAL_TEXT", "ADIGE7/MASTER_DATA/MATERIAL/TRANSACTION", input, controllerMat.updateDescrSuccess, controllerMail.transactionError);
        },
		
        updateDescrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText("viewMail.alreadyExist"));
            } else {
                controllerMat.disabledField();
            }
        },
		
        deleteDescr: function (evt) {
            var lineSel = controllerMat.matModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            controllerMat.matModel.refresh();
			controllerMat.changeMaterialDescr();
        },
		
		changeMaterialDescr: function(){
			//Input Fields			
			controllerMat.byId("inputMat").setEnabled(false);           
			controllerMat.byId("descrMat").setEnabled(false);
			controllerMat.byId("versMat").setEnabled(false);
            controllerMat.byId("currentVer").setEnabled(false);
			
			//Buttons
            controllerMat.byId("btnNewMat").setEnabled(false);
            controllerMat.byId("copyMat").setEnabled(false);
            controllerMat.byId("closeMat").setEnabled(true);           
            controllerMat.byId("saveMat").setEnabled(false);
            controllerMat.byId("delMat").setEnabled(true);
			controllerMat.byId("btnAddMatDescr").setEnabled(true);
			controllerMat.byId("btnSaveMatDescr").setEnabled(true);
		},
		
        //FUNZIONI GENERICHE
        //FUNZIONI DASHBOARD
        ///-----------------Materiali------------------//
        getAllMat: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMat.getDataSync("GET_ALL_MATERIAL", "ADIGE7/MASTER_DATA/MATERIAL/TRANSACTION", input, controllerMat.getAllMatSuccess, controllerMat.transactionError);
        },
		
        getAllMatSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMat.matModel.setProperty("/matList", jsonArr.Rows, false);
        },
		
        getDescrMat: function () {
            var input = {};
            input.MAT_ID = controllerMat.mat_id;
            controllerMat.getDataSync("GET_DESCR_BY_MAT", "ADIGE7/MASTER_DATA/MATERIAL/TRANSACTION", input, controllerMat.getDescrMatSuccess, controllerMat.transactionError);
        },
		
        getDescrMatSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMat.matModel.setProperty("/matdescrList", jsonArr.Rows, false);
        },
		
        addNewMaterial: function () {
            var input = {};
            var current = 0;
            if (controllerMat.byId("currentVer").getSelected()) {
                current = 1
            }
            if (controllerMat.byId("inputMat").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewMat.missingmat"))
            }
            if (controllerMat.byId("descrMat").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewMat.missingdescr"))
            }
            if (controllerMat.byId("versMat").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewMat.missingvers"))
            }
            var requestXML = "<root>";
            requestXML = requestXML + "<materialid>" + controllerMat.mat_id + "</materialid>";
            requestXML = requestXML + "<material>" + controllerMat.byId("inputMat").getValue() + "</material>";
            requestXML = requestXML + "<materiadescr>" + controllerMat.byId("descrMat").getValue() + "</materiadescr>";
            requestXML = requestXML + "<materialvers>" + controllerMat.byId("versMat").getValue() + "</materialvers>";
            requestXML = requestXML + "<materialcurrent>" + current + "</materialcurrent>";
            requestXML = requestXML + "<siteid>" + controller.SiteId + "</siteid>";
            requestXML = requestXML + "<language>" + controller.language + "</language>";
            requestXML = requestXML + "</root>";
            input.REQUESTXML = requestXML;
            controllerMat.getDataSync("INS_NEW_MATERIAL", "ADIGE7/MASTER_DATA/MATERIAL/TRANSACTION", input, controllerMat.addNewMaterialSuccess, controllerMat.transactionError);
        },
		
        addNewMaterialSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC == "0") {
                controllerMat.disabledField();
                MessageToast.show(controller.oBundle.getText("viewMat.success"));
            } else {
                MessageBox.warning(jsonArr[0].MESSAGE)
            }
        },
		
        deleteMat: function () {
            if (controllerMat.mat_id != "0") {
                var input = {};
                var bCompact = !!controllerUSR.getView().$().closest(".sapUiSizeCompact").length;
                var requestXML = "<root>";
                requestXML = requestXML + "<materialid>" + controllerMat.mat_id + "</materialid>";
                requestXML = requestXML + "<material>" + controllerMat.byId("inputMat").getValue() + "</material>";
                requestXML = requestXML + "<siteid>" + controller.SiteId + "</siteid>";
                requestXML = requestXML + "</root>";
                input.REQUESTXML = requestXML;
                MessageBox.confirm((controller.oBundle.getText("viewMat.deleteMat") + " " + controllerMat.byId("inputMat").getValue() + " " + controller.oBundle.getText("viewMat.label.materialvers") + " " + controllerMat.byId("versMat").getValue() + "?"), {
                    styleClass: bCompact ? "sapUiSizeCompact" : "",
                    onClose: function (evt) {
                        if (evt == "OK") {
                            controllerMat.getDataSync("DEL_MATERIAL", "ADIGE7/MASTER_DATA/MATERIAL/TRANSACTION", input, controllerMat.deleteMatSuccess, controllerMat.transactionError);
                        }
                    }
                });
            }
        },
		
        deleteMatSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC == "0") {
                controllerMat.disabledField();
                MessageToast.show(controller.oBundle.getText("viewMat.success"));
            } else {
                MessageBox.warning(jsonArr[0].MESSAGE)
            }
        },
		
        changeDftValue: function () {
            if (controllerMat.mat_id != "0") {
                var input = {};
                var bCompact = !!controllerUSR.getView().$().closest(".sapUiSizeCompact").length;
                var requestXML = "<root>";
                requestXML = requestXML + "<materialid>" + controllerMat.mat_id + "</materialid>";
                requestXML = requestXML + "<material>" + controllerMat.byId("inputMat").getValue() + "</material>";
                requestXML = requestXML + "<siteid>" + controller.SiteId + "</siteid>";
                requestXML = requestXML + "</root>";
                input.REQUESTXML = requestXML;
                MessageBox.confirm((controller.oBundle.getText("viewPhase.changedft")), {
                    styleClass: bCompact ? "sapUiSizeCompact" : "",
                    onClose: function (evt) {
                        if (evt == "OK") {
                            controllerMat.getDataSync("CHANGE_DFT_VALUE", "ADIGE7/MASTER_DATA/MATERIAL/TRANSACTION", input, controllerMat.changeDftValueSuccess, controllerMat.transactionError);
                            controllerMat.byId("currentVer").setEnabled(false);
                        } else {
                            controllerMat.byId("currentVer").setSelected(false);
                        }
                    }
                });
            }
        },
		
        changeDftValueSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC == "0") {
                controllerMat.disabledField();
                MessageToast.show(controller.oBundle.getText("viewMat.success"));
            } else {
                MessageBox.warning(jsonArr[0].MESSAGE)
            }
        },
		
        checkNewVersAvailable: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            input.MATERIAL = controllerMat.byId("inputMat").getValue();
            controllerMat.getDataSync("GET_NEW_VERS", "ADIGE7/MASTER_DATA/MATERIAL/TRANSACTION", input, controllerMat.checkNewVersAvailableSuccess, controllerMat.transactionError);
        },
		
        checkNewVersAvailableSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            try {
                if (jsonArr.Rows[0].NEWVERS == "NA") {
                    controllerMat.byId("versMat").setValue("1");
                } else {
                    controllerMat.byId("versMat").setValue(jsonArr.Rows[0].NEWVERS);
                    controllerMat.byId("versMat").setEnabled(false);
                }
            } catch (err) {
                controllerMat.byId("versMat").setValue("1");
            }
        },
        ///-----------------Materiali------------------//
        //FUNZIONI DASHBOARD
        //FUNZIONI DI RICERCA
        ///-----------------Materiali------------------//
        handleValueHelpMat: function () {
            controllerMat.getAllMat();
            if (!controllerMat._oValueHelpDialogMat) {
                Fragment.load({
                    name: "master_data.view.popup.listmat_tbl",
                    controller: controllerMat
                }).then(function (oValueHelpDialogMat) {
                    controllerMat._oValueHelpDialogMat = oValueHelpDialogMat;
                    controllerMat.getView().addDependent(controllerMat._oValueHelpDialogMat);
                    controllerMat._configValueHelpDialogMat();
                    controllerMat._oValueHelpDialogMat.open();
                });
            } else {
                controllerMat._configValueHelpDialogMat();
                controllerMat._oValueHelpDialogMat.open();
            }
        },

        _configValueHelpDialogMat: function () {
            var oModel = controllerMat.getView().getModel(),
            aProducts = oModel.getProperty("/matList");
            oModel.setProperty("/matList", aProducts);
        },

        handleValueHelpCloseMat: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            try {
                controllerMat.byId("materialInput").setValue(oSelectedItem.mAggregations.cells[1].getText());
                controllerMat.mat_id = oSelectedItem.mAggregations.cells[4].getText();
                controllerMat.byId("inputMat").setValue(oSelectedItem.mAggregations.cells[1].getText());
                controllerMat.byId("descrMat").setValue(oSelectedItem.mAggregations.cells[2].getText());
                controllerMat.byId("versMat").setValue(oSelectedItem.mAggregations.cells[3].getText());
				controllerMat.byId("materialInput").setEnabled(false);
                controllerMat.byId("inputMat").setEnabled(false);
                controllerMat.byId("descrMat").setEnabled(false);
                controllerMat.byId("versMat").setEnabled(false);
                controllerMat.byId("saveMat").setEnabled(false);
                controllerMat.byId("copyMat").setEnabled(true);
				controllerMat.byId("btnAddMatDescr").setEnabled(true);
				controllerMat.byId("closeMat").setEnabled(true);
                if (oSelectedItem.mAggregations.cells[5].getText() == "true") {
                    controllerMat.byId("currentVer").setSelected(true);
                    controllerMat.byId("currentVer").setEnabled(false);
                    controllerMat.byId("delMat").setEnabled(false);
                } else {
                    controllerMat.byId("currentVer").setSelected(false);
                    controllerMat.byId("currentVer").setEnabled(true);
                    controllerMat.byId("delMat").setEnabled(true);
                }
                controllerMat.getDescrMat();
                controllerMat._oValueHelpDialogMat = undefined;
            } catch (err) {
                controllerMat.disabledField();
            }
        },
		
        handleSearchMat: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("MATERIAL", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
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
                req.done(jQuery.proxy(successFunc, controllerMat));
                req.fail(jQuery.proxy(errorFunc, controllerMat));
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
                req.done(jQuery.proxy(suss, controllerMat));
                req.fail(jQuery.proxy(errf, controllerMat));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },
        //FUNZIONI PER ESECUZIONI TRANSAZIONI
    });
});
