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
        wrkModel: new sap.ui.model.json.JSONModel(),
        userLang: "",
        _popup: undefined,
        _wrkcenter: "",        
        _wrkcenterid: "",
        rowSelTabWrkHours: "",
		
        onInit: function () {
            controllerWorkCenter = this;
			controllerWorkCenter.wrkModel.setSizeLimit(10000);
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
            controllerWorkCenter.getWrk(3);
            var ws_data = controllerWorkCenter.wrkModel.getProperty("/tabwrklistExport");
            if (typeof XLSX == 'undefined')
                XLSX = require('xlsx');
            var ws = XLSX.utils.json_to_sheet(ws_data);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, controller.oBundle.getText("viewWRK.wrkmain"));
            XLSX.writeFile(wb, controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewWRK.wrkmain") + dateExportStr + ".xlsx");
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
		
        getWrksuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrk", jsonArr["Rows"]);
				controllerWorkCenter._wrkcenterid = jsonArr["Rows"][0]["WORKCENTER_ID"];
				 
                //ASSEGNAZIONE VALORI NEGLI INPUT
				controllerWorkCenter.byId("siteId").setText(jsonArr["Rows"][0]["SITE_ID"]);
                controllerWorkCenter.byId("wrkId").setText(jsonArr["Rows"][0]["WORKCENTER_ID"]);
                
				controllerWorkCenter.byId("piazzolaInput").setEditable(false);
                controllerWorkCenter.byId("inputPiazzola").setEditable(false);
				controllerWorkCenter.byId("descrPiazzola").setValue(jsonArr["Rows"][0]["WORKCENTER_DESC"]);
                controllerWorkCenter.byId("descrPiazzola").setEditable(false);                
                controllerWorkCenter.byId("comboType").setValue(jsonArr["Rows"][0]["WORKCENTERTYPE"]);
                controllerWorkCenter.byId("comboType").setSelectedKey(jsonArr["Rows"][0]["WORKCENTERTYPE_ID"]);
				controllerWorkCenter.byId("comboType").setEditable(true);
                controllerWorkCenter.byId("comboParent").setValue(jsonArr["Rows"][0]["PARENTWORKCENTER"]);
                controllerWorkCenter.byId("comboParent").setSelectedKey(jsonArr["Rows"][0]["PARENTWORKCENTER_ID"]);
				controllerWorkCenter.byId("comboParent").setEditable(true);				
                controllerWorkCenter.byId("comboStatus").setSelectedKey(jsonArr["Rows"][0]["STATUS_ID"]);
				controllerWorkCenter.byId("comboStatus").setEditable(true);	
				controllerWorkCenter.byId("inputPiazzolaAuthoma").setValue(jsonArr["Rows"][0]["WORKCENTER_AUTHOMA"]);
				controllerWorkCenter.byId("inputPiazzolaAuthoma").setEditable(controller.site === "ADIGE");				
				
				//Buttons
				controllerWorkCenter.byId("btnNewWrk").setEnabled(false);
				controllerWorkCenter.byId("closeWrk").setEnabled(true);
				controllerWorkCenter.byId("btnSaveWrk").setEnabled(true);
				controllerWorkCenter.byId("btnDelWrk").setEnabled(true);
				controllerWorkCenter.byId("btnWrkNewDescr").setEnabled(true);
				controllerWorkCenter.byId("btnWrkSaveDescr").setEnabled(false);
				
				controllerWorkCenter.getWrkType();				
                controllerWorkCenter.getWrkDesc();
                
            } catch (e) {}
        },
		
        getWrkListsuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrklist", jsonArr.Rows, false);
                controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            } catch (e) {}
        },

        //Aggiorno lista stati
        getWrkStatus: function () {
            var input = {};
            input.LANGUAGE = controller.language;
            controllerWorkCenter.getDataSync("GET_WOKCENTER_STATUS", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.getWrkStatusSuccess, controllerWorkCenter.transactionError);
        },

        getWrkStatusSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrkStatus", jsonArr.Rows, false);
                controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            } catch (e) {}
        },

        getWrksuccessExport: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrklistExport", jsonArr.Rows, false);
            } catch (e) {}
        },
		
		undoWrkType: function(){
			//Buttons
			controllerWorkCenter.byId("btnCloseWrkType").setEnabled(false);
			controllerWorkCenter.byId("btnSaveWrkType").setEnabled(false);
			controllerWorkCenter.getWrkType();
		},
		
        getWrkType: function () {
            var input = {};
            input.LANGUAGE = controller.language;
            controllerWorkCenter.getDataSync("GET_WOKCENTER_TYPE", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION", input, controllerWorkCenter.getWrkTypesuccess, controllerWorkCenter.transactionError);
        },
		
        getWrkTypesuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabwrktype", jsonArr.Rows, false);
                controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            } catch (e) {}
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
		
		onChangeWrkDescr: function(){
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
            if (modInput.length === 0)
                return MessageToast.show(controller.oBundle.getText("contrSite.insertSite"));
            else {
                if (Desc && Name) {
                    input = {
                        "DATA": JSON.stringify(modInput)
                    };
                    controllerWorkCenter.getDataSync("INSERT_WRKTYPE", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION", input, controllerWorkCenter.saveNewTypeSuccess, this.transactionError);
                }
            }
        },
		
        saveNewTypeSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC == "0")
                    controllerWorkCenter.getWrkType();
                //controllerWorkCenter.wrkModel.setProperty("/tabwrktype",jsonArr.Rows,false);
                //controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            } catch (e) {
                MessageBox.warning("TRANSACTION ERROR: GET_SITE. Main Controller line: 43", {
                    onClose: function () {}
                });
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
		
        deletePiazzola: function () {
            var input = {};
            input.WORKCENTER_ID = controllerWorkCenter.byId("wrkId").getText();
            var bCompact = !!controllerWorkCenter.getView().$().closest(".sapUiSizeCompact").length;
            MessageBox.confirm((controller.oBundle.getText("viewWRK.messageConfirmDeletePiazzola") + " " + controllerWorkCenter.byId("inputPiazzola").getValue() + "?"), {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (evt) {
                    if (evt == "OK") {
                        controllerWorkCenter.getDataSync("DELETE_WRK", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.deleteWorkCenterSuccess, this.transactionError);
                    }
                }
            });
        },
		
        deleteWorkCenterSuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC == "0") {
                    controllerWorkCenter.newSlot(false);
                    controllerWorkCenter.getWrk(0);
                } else {
                    MessageBox.warning(jsonArr[0].MESSAGE)
                }
            } catch (e) {
                //MessageBox.warning("TRANSACTION ERROR: GET_SITE. Main Controller line: 43", {onClose: function () {}});
            }
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
            if (!controllerWorkCenter._popup) {
                controllerWorkCenter._popup = sap.ui.xmlfragment("master_data.view.popup.modType", controllerWorkCenter);
                controllerWorkCenter.getView().addDependent(controllerWorkCenter._popup);
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
                controllerWorkCenter._popup.open();
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
		
        closePopup: function () {
            controllerWorkCenter._popup.close();
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
		
        newCdl: function () {
            var addRowModel = controllerWorkCenter.wrkModel.getProperty("/tabwrk");
            var row = {
                "WORKCENTER": "",
                "WORKCENTER_DESC": "",
                "WORKCENTERTYPE_DESC": "",
                "EDIT": "true"
            };
            if (addRowModel.length === 0) {
                var newArr = [];
                newArr.push(row);
                controllerWorkCenter.wrkModel.setProperty("/tabwrktype", newArr);
            } else {
                var addArr = controllerWorkCenter.wrkModel.getProperty("/tabwrktype");
                addArr.push(row);
                controllerWorkCenter.wrkModel.setProperty("/tabwrktype", addArr);
            }
        },
		
        newSlot: function (isNewWorkCenter) {	
			//Update Workcenter Type
			controllerWorkCenter.getWrkType();
			
			//Input Fields
			controllerWorkCenter.byId("siteId").setText("");
            controllerWorkCenter.byId("wrkId").setText("");
			controllerWorkCenter.byId("piazzolaInput").setValue("");
			controllerWorkCenter.byId("piazzolaInput").setEditable(!isNewWorkCenter);
			controllerWorkCenter.byId("inputPiazzola").setEditable(!isNewWorkCenter);
			controllerWorkCenter.byId("inputPiazzola").setValue("");
            controllerWorkCenter.byId("inputPiazzola").setEditable(isNewWorkCenter);
            controllerWorkCenter.byId("descrPiazzola").setValue("");
            controllerWorkCenter.byId("descrPiazzola").setEditable(isNewWorkCenter);            
            controllerWorkCenter.byId("comboType").setValue("");
            controllerWorkCenter.byId("comboType").setSelectedKey("");
			controllerWorkCenter.byId("comboType").setEditable(isNewWorkCenter); 
            controllerWorkCenter.byId("comboParent").setValue("");
            controllerWorkCenter.byId("comboParent").setSelectedKey("");
			controllerWorkCenter.byId("comboParent").setEditable(isNewWorkCenter); 
            controllerWorkCenter.byId("comboStatus").setValue("");
            controllerWorkCenter.byId("comboStatus").setSelectedKey("");
			controllerWorkCenter.byId("comboStatus").setEditable(isNewWorkCenter); 
			controllerWorkCenter.byId("inputPiazzolaAuthoma").setValue("");
			controllerWorkCenter.byId("inputPiazzolaAuthoma").setEditable(isNewWorkCenter && controller.site === "ADIGE");
			
			//Buttons
			controllerWorkCenter.byId("btnNewWrk").setEnabled(!isNewWorkCenter);
			controllerWorkCenter.byId("closeWrk").setEnabled(isNewWorkCenter);
			controllerWorkCenter.byId("btnSaveWrk").setEnabled(isNewWorkCenter);
			controllerWorkCenter.byId("btnDelWrk").setEnabled(isNewWorkCenter);
			controllerWorkCenter.byId("btnWrkNewDescr").setEnabled(false);
			controllerWorkCenter.byId("btnWrkSaveDescr").setEnabled(false);
            
			//Model
			controllerWorkCenter.wrkModel.setProperty("/tabWrkDesc", []);
			controllerWorkCenter.wrkModel.setProperty("/tabwrk", []);
            
            controllerWorkCenter._wrkcenterid = "";
        },
		
        saveUpdateNew: function () {
            var input = {};
            var parentid = "";
            if (controllerWorkCenter.byId("inputPiazzola").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.missedcdl"));
            }
            if (controllerWorkCenter.byId("descrPiazzola").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.misseddescr"));
            }
            if (controllerWorkCenter.byId("comboType").getSelectedKey() === "" || !controllerWorkCenter.byId("comboType").getSelectedKey()) {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.missedtype"));
            }
            if (controllerWorkCenter.byId("comboParent").getSelectedKey() === "" || !controllerWorkCenter.byId("comboParent").getSelectedKey() || controllerWorkCenter.byId("comboParent").getSelectedKey() === "0") {
                parentid = "";
            } else {
                parentid = controllerWorkCenter.byId("comboParent").getSelectedKey();
            }
            if (controllerWorkCenter.byId("comboStatus").getSelectedKey() === "" || !controllerWorkCenter.byId("comboStatus").getSelectedKey()) {
                return MessageBox.warning(controller.oBundle.getText("viewWRK.warnig.missedStatus"));
            }
            var xmlInput = "<root>";
            xmlInput = xmlInput + "<WORKCENTER>" + controllerWorkCenter.byId("inputPiazzola").getValue() + "</WORKCENTER>";
            xmlInput = xmlInput + "<WORKCENTER_DESC>" + controllerWorkCenter.byId("descrPiazzola").getValue() + "</WORKCENTER_DESC>";
            if (controllerWorkCenter.byId("siteId").getText() === "" || !controllerWorkCenter.byId("siteId").getText()) {
                xmlInput = xmlInput + "<SITE_ID>" + controller.SiteId+ "</SITE_ID>";
            } else {
                xmlInput = xmlInput + "<SITE_ID>" + controllerWorkCenter.byId("siteId").getText() + "</SITE_ID>";
            }
            xmlInput = xmlInput + "<WORKCENTER_ID>" + controllerWorkCenter.byId("wrkId").getText() + "</WORKCENTER_ID>";
            xmlInput = xmlInput + "<WORKCENTERTYPE_ID>" + controllerWorkCenter.byId("comboType").getSelectedKey() + "</WORKCENTERTYPE_ID>";
            xmlInput = xmlInput + "<PARENTWORKCENTER_ID>" + parentid + "</PARENTWORKCENTER_ID>";
            xmlInput = xmlInput + "<STATUS_ID>" + controllerWorkCenter.byId("comboStatus").getSelectedKey() + "</STATUS_ID>";
			xmlInput = xmlInput + "<WORKCENTER_AUTHOMA>" + controllerWorkCenter.byId("inputPiazzolaAuthoma").getValue() + "</WORKCENTER_AUTHOMA>";
            xmlInput = xmlInput + "<LANGUAGE>" + controller.language + "</LANGUAGE>";
            xmlInput = xmlInput + "</root>";
            input.DATA = xmlInput;
            controllerWorkCenter.getDataSync("INSERT_WORKCENTER", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerWorkCenter.saveUpdateNewSuccess, this.transactionError);
        },
		
        saveUpdateNewSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                var message = "";
                try {
                    message = controller.oBundle.getText(jsonArr[0].MESSAGE);
                } catch (err) {
                    message = jsonArr[0].MESSAGE;
                }
                MessageBox.warning(message);
            } else {
                controllerWorkCenter.newSlot(false);
                controllerWorkCenter.getWrk(0);
            }
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
		
        //FUNZIONI PER RICERCA WRK
        handleValueHelp: function () {
            controllerWorkCenter.getWrk(0);
            if (!controllerWorkCenter._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.listwrk",
                    controller: controllerWorkCenter
                }).then(function (oValueHelpDialog) {
                    controllerWorkCenter._oValueHelpDialog = oValueHelpDialog;
                    controllerWorkCenter.getView().addDependent(controllerWorkCenter._oValueHelpDialog);
                    controllerWorkCenter._configValueHelpDialog();
                    controllerWorkCenter._oValueHelpDialog.open();
                });
            } else {
                controllerWorkCenter._configValueHelpDialog();
                controllerWorkCenter._oValueHelpDialog.open();
            }
        },

        _configValueHelpDialog: function () {
            var sInputValue = controllerWorkCenter.byId("piazzolaInput").getValue(),
            oModel = controllerWorkCenter.getView().getModel(),
            aProducts = oModel.getProperty("/tabwrklist");

            aProducts.forEach(function (oProduct) {
                oProduct.selected = (oProduct.Name === sInputValue);
            });
            oModel.setProperty("/ProductCollection", aProducts);
        },

        handleValueHelpClose: function (oEvent) {
            try {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                controllerWorkCenter.byId("piazzolaInput").setValue(oSelectedItem.mProperties.title);
                controllerWorkCenter._wrkcenter = oSelectedItem.mProperties.title;
                controllerWorkCenter.byId("inputPiazzola").setValue(controllerWorkCenter._wrkcenter);
                controllerWorkCenter.getWrk(1);
                controllerWorkCenter.closeDialog();
            } catch (err) {
                controllerWorkCenter.closeDialog();
            }
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
        },

        handleSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("WORKCENTER", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        //FUNZIONI PER ESECUZIONI TRANSAZIONI
        getDataAsync: function (transaction, route, input, successFunc, errorFunc) {
            sap.ui.core.BusyIndicator.show();

            var transactionCall = route + "/" + transaction;
            var that = this;

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
                req.done(jQuery.proxy(successFunc, that));
                req.fail(jQuery.proxy(errorFunc, that));
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

        //pressWkcTabBar
        pressWkcTabBar: function (oSource) {
            var selKey = oSource.getSource().getSelectedKey();
            switch (selKey) {
            case "WKC":
                controllerWorkCenter.newSlot(false);
                break;
            case "WKC_TYPE":
                //Refresh del modello
                controllerWorkCenter.getWrkType();
                break;
            case "SYNOPTIC":
                controllerWorkCenter.wrkModel.setProperty("/tabSynoptic", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBkc", []);
                controllerWorkCenter.getSynopticList();
                break;
            case "SYNOPTICBGS1":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS1", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS1Bkc", []);
                controllerWorkCenter.getSynopticList();
                break;
            case "SYNOPTICBGS2":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS2", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS2Bkc", []);
                controllerWorkCenter.getSynopticList();
                break;
            case "SYNOPTICADIGESYS1":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeSys1", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeSys1Bkc", []);
                controllerWorkCenter.getSynopticList();
                break;
            case "SYNOPTICADIGESYS2":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeSys2", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeSys2Bkc", []);
                controllerWorkCenter.getSynopticList();
                break;
            case "SYNOPTICADIGESYS3":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeSys3", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeSys3Bkc", []);
                controllerWorkCenter.getSynopticList();
                break
            case "SYNOPTICADIGESTR1":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeStr1", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticAdigeStr1Bkc", []);
                controllerWorkCenter.getSynopticList();
                break
			case "SYNOPTICBGUSA":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBgusa", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBgusaBkc", []);
                controllerWorkCenter.getSynopticList();
                break
			case "SYNOPTICBLM1":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm1", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm1Bkc", []);
                controllerWorkCenter.getSynopticList();
                break
			case "SYNOPTICBLM2":
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm2", []);
                controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm2Bkc", []);
                controllerWorkCenter.getSynopticList();
                break
            case "WKC_HOURS":
                controllerWorkCenter.getHoursList();
                controllerWorkCenter.rowSelTabWrkHours = "";
                break
            default:
                //No Action
            }
        },

        //Configurazione Sinottico
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
				undoBtnId = "btnUndoNewAgigeSys1";
				saveBtnId = "btnSaveNewAgigeSys1";
                break;
            case "SYNOPTICADIGESYS2":
                synopticType = 2;
                propertySynopticPath = "/tabSynopticAdigeSys2";
                propertySynopticPathBkc = "/tabSynopticAdigeSys2Bkc";
				tableId = "tabWrkSynAdigeSys2";
				undoBtnId = "btnUndoAgigeSys2";
				saveBtnId = "btnSaveNewAgigeSys2";
                break;
            case "SYNOPTICADIGESYS3":
                synopticType = 3;
                propertySynopticPath = "/tabSynopticAdigeSys3";
                propertySynopticPathBkc = "/tabSynopticAdigeSys3Bkc";
				tableId = "tabWrkSynAdigeSys3";
				undoBtnId = "btnUndoNewAgigeSys3";
				saveBtnId = "btnSaveNewAgigeSys3";
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
				undoBtnId = "btnUndoNewAgigeSys1";
				saveBtnId = "btnSaveNewAgigeSys1";
                break;
			//Disabilitato	
            case "SYNOPTICADIGESYS2":
                maxWkcNumber = 11;
                propertySynopticPath = "/tabSynopticAdigeSys2";
                propertySynopticPathBkc = "/tabSynopticAdigeSys2Bkc";
				tableId = "tabWrkSynAdigeSys2";
				undoBtnId = "btnUndoAgigeSys2";
				saveBtnId = "btnSaveNewAgigeSys2";
                break;
            case "SYNOPTICADIGESYS3":
                maxWkcNumber = 27;
                propertySynopticPath = "/tabSynopticAdigeSys3";
                propertySynopticPathBkc = "/tabSynopticAdigeSys3Bkc";
				tableId = "tabWrkSynAdigeSys3";
				undoBtnId = "btnUndoNewAgigeSys3";
				saveBtnId = "btnSaveNewAgigeSys3";
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
                maxWkcNumber = 80;
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
		
		enabledSynopticBtn: function () {
            var tableId = "", undoBtnId = "", saveBtnId = "";
            switch (controllerWorkCenter.byId("wkcITB").getSelectedKey()) {
            case "SYNOPTIC":                
				tableId = "tabWrkSyn";
				undoBtnId = "btnUndoNewAdige";
				saveBtnId = "btnSaveAdige";
                break;
			case "SYNOPTICADIGESTR1":
				tableId = "tabWrkSynAdigeStr1";
				undoBtnId = "btnUndoNewAdigeStr1";
				saveBtnId = "btnSaveNewAdigeStr1";
                break;
            case "SYNOPTICBGS1":
				tableId = "tabWrkSynBGS1";
				undoBtnId = "btnUndoNewBgs1";
				saveBtnId = "btnSaveNewBgs1";
                break;
            case "SYNOPTICBGS2":
				tableId = "tabWrkSynBGS2";
				undoBtnId = "btnUndoNewBgs2";
				saveBtnId = "btnSaveNewBgs2";
                break;
            case "SYNOPTICADIGESYS1":
				tableId = "tabWrkSynAdigeSys1";
				undoBtnId = "btnUndoNewAgigeSys1";
				saveBtnId = "btnSaveNewAgigeSys1";
                break;
            case "SYNOPTICADIGESYS2":
				tableId = "tabWrkSynAdigeSys2";
				undoBtnId = "btnUndoAgigeSys2";
				saveBtnId = "btnSaveNewAgigeSys2";
                break;
            case "SYNOPTICADIGESYS3":
				tableId = "tabWrkSynAdigeSys3";
				undoBtnId = "btnUndoNewAgigeSys3";
				saveBtnId = "btnSaveNewAgigeSys3";
                break; 
			case "SYNOPTICBGUSA":
				tableId = "tabWrkSynBgusa";
				undoBtnId = "btnUndoNewBgusa";
				saveBtnId = "btnSaveNewBgusa";
                break; 
			case "SYNOPTICBLM1":
                tableId = "tabWrkSynBlm1";
				undoBtnId = "btnUndoNewBlm1";
				saveBtnId = "btnSaveNewBlm1";
                break;
			case "SYNOPTICBLM2":
                tableId = "tabWrkSynBlm2";
				undoBtnId = "btnUndoNewBlm2";
				saveBtnId = "btnSaveNewBlm2";
                break;		
            default:
				tableId = "tabWrkSyn";
				undoBtnId = "btnUndoNewAdige";
				saveBtnId = "btnSaveAdige";
                break;
            }
            			
			//Buttons
			controllerWorkCenter.byId(undoBtnId).setEnabled(true);
			controllerWorkCenter.byId(saveBtnId).setEnabled(true);
        },

        deleteSynopticPos: function (oEvent) {
            var lineSel = controllerWorkCenter.wrkModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            //lineSel.EDIT = "true";
            controllerWorkCenter.wrkModel.refresh();
			controllerWorkCenter.enabledSynopticBtn();
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
                maxWkcNumber = 80;
				synopticType = 1;
                modelProperty = "/tabSynopticBlm1";
                break;
			case "SYNOPTICBLM2":
                maxWkcNumber = 48;
				synopticType = 2;
                modelProperty = "/tabSynopticBlm2";
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

        //Match Code WorkCenter
        openWkcHelp: function (oEvent) {
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
                    name: "master_data.view.popup.listwrkSynoptic",
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
            controllerWorkCenter.byId("rowSynopticSel").setText(oEvent.oSource.getBindingContext().sPath);
        },

        confirmWkcHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var modelRowSel = controllerWorkCenter.wrkModel.getProperty(controllerWorkCenter.byId("rowSynopticSel").getText());
            var model = controllerWorkCenter.wrkModel.getProperty("/tabSynoptic");

            for (var i = 0; i < model.length; i++) {
                if (model[i].WORKCENTER === oSelectedItem.mProperties.title) {
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errSelWkc"));
                }
            }

            modelRowSel.WORKCENTER_ID = oSelectedItem.mProperties.highlightText;
            modelRowSel.WORKCENTER = oSelectedItem.mProperties.title;
            modelRowSel.WORKCENTER_DESCR = oSelectedItem.mProperties.description;

            modelRowSel.EDIT = "true";
            controllerWorkCenter.wrkModel.refresh();
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
			
            controllerWorkCenter.closeDialog();
        },

        controlPositionValue: function (oEvent) {
            var valueParam = oEvent.mParameters.value;
            var maxWkcNumber = 0;
            var modelProperty = "";
            var modelPropertyBcp = "";
            switch (controllerWorkCenter.byId("wkcITB").getSelectedKey()) {
            case "SYNOPTIC":
                maxWkcNumber = 40;
                modelProperty = "/tabSynoptic";
                modelPropertyBcp = "/tabSynopticBkc";
                break;
            case "SYNOPTICBGS1":
                maxWkcNumber = 14;
                modelProperty = "/tabSynopticBGS1";
                modelPropertyBcp = "/tabSynopticBGS1Bkc";
                break;
            case "SYNOPTICBGS2":
                maxWkcNumber = 53;
                modelProperty = "/tabSynopticBGS2";
                modelPropertyBcp = "/tabSynopticBGS2Bkc";
                break;
            case "SYNOPTICADIGESYS1":
                maxWkcNumber = 24;
                modelProperty = "/tabSynopticAdigeSys1";
                modelPropertyBcp = "/tabSynopticAdigeSys1Bkc";
                break;
            //Disabilitato
			case "SYNOPTICADIGESYS2":
                maxWkcNumber = 11;
                modelProperty = "/tabSynopticAdigeSys2";
                modelPropertyBcp = "/tabSynopticAdigeSys2Bkc";
                break;
            case "SYNOPTICADIGESYS3":
                maxWkcNumber = 27;
                modelProperty = "/tabSynopticAdigeSys3";
                modelPropertyBcp = "/tabSynopticAdigeSys3Bkc";
                break;
            case "SYNOPTICADIGESTR1":
                maxWkcNumber = 22;
                modelProperty = "/tabSynopticAdigeStr1";
                modelPropertyBcp = "/tabSynopticAdigeStr1Bkc";
                break;
			case "SYNOPTICBGUSA":
                maxWkcNumber = 20;
                modelProperty = "/tabSynopticBgusa";
                modelPropertyBcp = "/tabSynopticBgusa";
                break;
			case "SYNOPTICBLM1":
                maxWkcNumber = 80;
                modelProperty = "/tabSynopticBlm1";
                modelPropertyBcp = "/tabSynopticBlm1";
                break;
			case "SYNOPTICBLM2":
                maxWkcNumber = 48;
                modelProperty = "/tabSynopticBlm2";
                modelPropertyBcp = "/tabSynopticBlm2";
                break;
            default:
                maxWkcNumber = 40;
                modelProperty = "/tabSynoptic";
                modelPropertyBcp = "/tabSynopticBkc";
                break;
            }

            var model = controllerWorkCenter.wrkModel.getProperty(modelProperty);
            var modelBkc = controllerWorkCenter.wrkModel.getProperty(modelPropertyBcp);

            if (valueParam != "") {
                if (valueParam < 1 || valueParam > maxWkcNumber) {
                    valueParam = oEvent.oSource.mProperties.value;
                    model[oEvent.oSource.oParent.oBindingContexts.undefined.sPath.split("/")[2]]["POSITION"] = modelBkc[oEvent.oSource.oParent.oBindingContexts.undefined.sPath.split("/")[2]]["POSITION"];
                    controllerWorkCenter.getView().byId("tabWrkSyn").getModel().refresh(true);
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errPosInterval") + maxWkcNumber)
                } else if (valueParam.replace(".", ",") % 1 != 0) {
                    valueParam = oEvent.oSource.mProperties.value;
                    model[oEvent.oSource.oParent.oBindingContexts.undefined.sPath.split("/")[2]]["POSITION"] = modelBkc[oEvent.oSource.oParent.oBindingContexts.undefined.sPath.split("/")[2]]["POSITION"]; //oEvent.oSource.mProperties.value;
                    controllerWorkCenter.getView().byId("tabWrkSyn").getModel().refresh(true);
                    return MessageToast.show(controller.oBundle.getText("contrWRK.errPosInt"))
                } else {
                    var tabMod = controllerWorkCenter.wrkModel.getProperty(oEvent.oSource.oParent.oBindingContexts.undefined.sPath);
                    tabMod.EDIT = "true";
                }

                var index = oEvent.oSource.oParent.oBindingContexts.undefined.sPath.split("/")[2];

                for (var i = 0; i < model.length; i++) {
                    if (model[i].POSITION === valueParam && i != index) {
                        valueParam = oEvent.oSource.mProperties.value;
                        model[oEvent.oSource.oParent.oBindingContexts.undefined.sPath.split("/")[2]]["POSITION"] = modelBkc[oEvent.oSource.oParent.oBindingContexts.undefined.sPath.split("/")[2]]["POSITION"]; //oEvent.oSource.mProperties.value;
                        controllerWorkCenter.getView().byId("tabWrkSyn").getModel().refresh(true);
                        return MessageToast.show(controller.oBundle.getText("contrWRK.errPosAlreadyExists"))
                    }
                }

            } else {
                var tabMod = controllerWorkCenter.wrkModel.getProperty(oEvent.oSource.oParent.oBindingContexts.undefined.sPath);
                tabMod.EDIT = "true";
            }
			controllerWorkCenter.enabledSynopticBtn();
        },

        closeDialog: function () {
            controllerWorkCenter._oValueHelpDialog = undefined;
        },

        /*Working Hours*/
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
                    name: "master_data.view.popup.listwrkHours",
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
            controllerWorkCenter.byId("rowSynopticSel").setText(oEvent.oSource.getBindingContext().sPath);
        },

        confirmWkcHelpHours: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var modelRowSel = controllerWorkCenter.wrkModel.getProperty(controllerWorkCenter.byId("rowSynopticSel").getText());
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
        },

        openUserHelpHours: function (oEvent) {

            var input = {};
            input.SITE_ID = controller.model.getProperty("/user")[0]["SiteId"];
            controllerWorkCenter.getDataSync("GET_LIST_USER", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerWorkCenter.getUserListsuccess, controllerWorkCenter.transactionError);

            if (!controllerWorkCenter._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.listUsrHours",
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
            controllerWorkCenter.byId("rowSynopticSel").setText(oEvent.oSource.getBindingContext().sPath);
        },

        getUserListsuccess: function (data, response) {
            try {
                var jsonArrStr = jQuery(data).find("Row").text();
                var jsonArr = JSON.parse(jsonArrStr);
                controllerWorkCenter.wrkModel.setProperty("/tabUserlist", jsonArr.Rows, false);
                controllerWorkCenter.getView().setModel(controllerWorkCenter.wrkModel);
            } catch (e) {}
        },

        confirmUserHelpHours: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var modelRowSel = controllerWorkCenter.wrkModel.getProperty(controllerWorkCenter.byId("rowSynopticSel").getText());
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
        },

        handleUserSearchHours: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
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

            var result = controllerSite.sendData("SAVE_WORKING_HOURS", "WORKCENTER/TRANSACTION", Input);
            if (result[0].RC != "0") {
                MessageBox.warning(controller.oBundle.getText("contrWRK.insertKO") + " " + result[0].MESSAGE, {
                    onClose: function () {}
                });
            } else {
                MessageToast.show(controller.oBundle.getText("contrWRK.insertOK"));
				//Buttons
				controllerWorkCenter.byId("btnCloseNewHours").setEnabled(false);
                controllerWorkCenter.byId("saveNewHours").setEnabled(false);
                controllerWorkCenter.rowSelTabWrkHours = "";
            }
            controllerWorkCenter.getHoursList();
        },

        getHoursList: function () {
            var Input = {
                "SITE_ID": controller.SiteId
                //,"LANGUAGE": controller.language
            };
            var result = controllerSite.sendData("GET_HOURS_LIST", "WORKCENTER/TRANSACTION", Input);
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

        }

    });
});
