var controllerMail;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/m/MessageToast',
        "sap/m/MessageBox",
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.Mailing", {
        mailModel: new sap.ui.model.json.JSONModel(),
        mail_ID: "0",
        template_ID: "0",
        _popup: undefined,
        OPERATIONMAIL_ID: "0",
        OPERATIONMAIL: "",
        pathRowSel: null,
        obj: null,
        allowDelete: true,
		
        onInit: function () {
            controllerMail = this;
            controllerMail.getView().setModel(controllerMail.mailModel);
            controllerMail.mailModel.setSizeLimit(50000);
			controller.enableElement(controllerMail.mailModel);
        },

        onAfterRendering: function () {
            controllerMail.addVariableList();
        },

        //FUNZIONI GENERICHE
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
            controllerMail.getListExcMAil();
            var ws_data = controllerMail.mailModel.getProperty("/maillistexc");
            if (typeof XLSX == 'undefined')
                XLSX = require('xlsx');
            var ws = XLSX.utils.json_to_sheet(ws_data);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, controller.oBundle.getText("viewMail.maillist"));
            XLSX.writeFile(wb, controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewMail.maillist") + dateExportStr + ".xlsx");
        },
		
        dwnlxecltemp: function () {
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
            controllerMail.getListExcTemp();
            var ws_data = controllerMail.mailModel.getProperty("/templistexc");
            if (typeof XLSX == 'undefined')
                XLSX = require('xlsx');
            var ws = XLSX.utils.json_to_sheet(ws_data);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, controller.oBundle.getText("viewMail.template"));
            XLSX.writeFile(wb, controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewMail.template") + dateExportStr + ".xlsx");
        },
		
        dwnlxeclAssign: function () {
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
            controllerMail.getListExcAttach();
            var ws_data = controllerMail.mailModel.getProperty("/attachlistexc");
            if (typeof XLSX == 'undefined')
                XLSX = require('xlsx');
            var ws = XLSX.utils.json_to_sheet(ws_data);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, controller.oBundle.getText("viewMai.opmail"));
            XLSX.writeFile(wb, controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewMai.opmail") + dateExportStr + ".xlsx");
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
		
        deleteUsrfromlist: function (evt) {
            var lineSel = controllerMail.mailModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            lineSel.EDIT = true;
            controllerMail.mailModel.refresh();
            
			//Buttons
			controllerMail.byId("closeMailingList").setEnabled(true);
            controllerMail.byId("saveUserToMail").setEnabled(true);
			controllerMail.byId("saveMailingList").setEnabled(false);
			
			//Input Field
			controllerMail.byId("inputMail").setEditable(false);
			
			//Setup Mailing List di Sistema
			if(controllerMail.mailModel.getProperty("/VisibleAdmin/VISIBLE"))
				controllerMail.byId("switchSystemMailingList").setEnabled(false);
        },	
		
        addMail: function () {
            var addRowModel = controllerMail.mailModel.getProperty("/tablemail");
            var row = {
                "USERID": "",
                "USR": "",
                "NAME": "",
                "EMAILADDRESS": "",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerMail.mailModel.setProperty("/tablemail", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerMail.mailModel.setProperty("/tablemail", newArr);
                } else {
                    var addArr = controllerMail.mailModel.getProperty("/tablemail");
                    addArr.push(row);
                    controllerMail.mailModel.setProperty("/tablemail", addArr);
                }
            }
						
			//Buttons
			controllerMail.byId("closeMailingList").setEnabled(true);
            controllerMail.byId("saveUserToMail").setEnabled(true);
			controllerMail.byId("saveMailingList").setEnabled(false);
			
			//Input Field
			controllerMail.byId("inputMail").setEditable(false);
			
			//Setup Mailing List di Sistema
			if(controllerMail.mailModel.getProperty("/VisibleAdmin/VISIBLE")){
				controllerMail.byId("switchSystemMailingList").setEnabled(false);
			}
			
			//Scroll to last table Element
			controllerMail.byId("tablemail").setFirstVisibleRow(addRowModel.length);
        },
		
		onChangeSystemMailingList: function(oEvent){
			controllerMail.mailModel.setProperty("/rowSelMailingList/SystemMailingList", oEvent.getParameters().state ? "1" : "0");
		},
		
        updateMail: function () {
            var model = controllerMail.mailModel.getProperty("/tablemail");
            var modInput = [];
            var obj = {};
            var input = {};
            for (var i = 0; i < model.length; i++) {
                if (model[i].USERID != "NA") {
                    obj.MAILID = controllerMail.mail_ID;
                    obj.USERID = model[i].USERID;
                    obj.DEL = model[i].DEL;
                    modInput.push(obj);
                    obj = new Object;
                }
            }
            input = {
                "DATA": JSON.stringify(modInput)
            };
            controllerMail.getDataSync("INS_DEL_MAIL_MAILLIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.updateMailSuccess, controllerMail.transactionError);
        },
		
        updateMailSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerMail.mail_ID = "0";                
                controllerMail.refreshNewMail(false);
                MessageToast.show(controller.oBundle.getText("viewMail.addUsrsuccess"));
            }
        },
		
        refreshNewMail: function (isNewMail) {
            controllerMail.mail_ID = "0";
            //Input Fields
            controllerMail.byId("mailInputList").setValue("");
			controllerMail.byId("mailInputList").setEditable(!isNewMail);
            controllerMail.byId("inputMail").setValue("");
            controllerMail.byId("inputMail").setEditable(isNewMail);
			
			//Setup Mailing List di Sistema
			if(controllerMail.mailModel.getProperty("/VisibleAdmin/VISIBLE")){
				controllerMail.byId("switchSystemMailingList").setState(false);
				controllerMail.byId("switchSystemMailingList").setEnabled(isNewMail);
			}
			
			//Buttons
			controllerMail.byId("newMailingList").setEnabled(!isNewMail);
			controllerMail.byId("closeMailingList").setEnabled(isNewMail);
			controllerMail.byId("saveMailingList").setEnabled(isNewMail);
			controllerMail.byId("delMailingList").setEnabled(isNewMail);
			controllerMail.byId("addMail").setEnabled(false);
			controllerMail.byId("saveUserToMail").setEnabled(false);
			
			//Model
			controllerMail.mailModel.setProperty("/tablemail", []);
			controllerMail.mailModel.setProperty("/rowSelMailingList", []);
        },
		
        checkifmaillistexist: function () {
            var input = {};
            input.MAIL_LIST = controllerMail.byId("inputMail").getValue();
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("CHECK_IF_MAILLIST_EXIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.checkifmaillistexistSuccess, controllerMail.transactionError);
        },
		
        checkifmaillistexistSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                controllerMail.byId("inputMail").setValue("");
                MessageBox.error(controller.oBundle.getText("viewMail.alreadyExist"));
            }
        },
		
        getListExcMAil: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_ALL_MAIL_LIST_EXCEL", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION/TRANSDWN", input, controllerMail.getListExcMAilSuccess, controllerMail.transactionError)
        },
		
        getListExcMAilSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/maillistexc", jsonArr.Rows, false);
        },
		
        getListExcTemp: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_ALL_TEMPLATE_LIST_EXCEL", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION/TRANSDWN", input, controllerMail.getListExcTempSuccess, controllerMail.transactionError)
        },
		
        getListExcTempSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/templistexc", jsonArr.Rows, false);
        },
		
        getListExcAttach: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_ALL_ASSIGNMENT_LIST_EXCEL", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION/TRANSDWN", input, controllerMail.getListExcAttachSuccess, controllerMail.transactionError)
        },
		
        getListExcAttachSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/attachlistexc", jsonArr.Rows, false);
        },
		
        addVariableList: function () {            
            controllerMail.obj = {
                "root": [{
                        "descr": controller.oBundle.getText("controllerMail.Phase"),
                        "value": '%OPERATION%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.Checklist"),
                        "value": '%CHECKLIST%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.Slot"),
                        "value": '%SLOT%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.User"),
                        "value": '%USER%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.Date"),
                        "value": '%DATE%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.TimeEff"),
                        "value": '%EFF_TIME%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.timeStd"),
                        "value": '%STD_TIME%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.ChecklistDescr"),
                        "value": '%CHECKLIST_DESCR%'
                    }, {
                        "descr": controller.oBundle.getText("controllerMail.Odv"),
                        "value": '%ODV%'
                    }
                ]
            };
			
			//Tag disponibile solo per ADIGE - Flusso Automha invio KIT
			if(controller.site === "ADIGE")
				controllerMail["obj"]["root"].push({
                        "descr": controller.oBundle.getText("viewPhase.opNetwork"),
                        "value": '%OP_NETWORK%'
                    });
					
            controllerMail.mailModel.setProperty("/variablelist", controllerMail.obj.root);
        },
		
        getValueCombo: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_VALUE_FOR_COMBO", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getValueComboSuccess, controllerMail.transactionError);
        },
		
        getValueComboSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/mailistcombo", jsonArr.Rows[0].MAILINGLIST.Rows, false);
            controllerMail.mailModel.setProperty("/tempistcombo", jsonArr.Rows[0].TEMPLATELIST.Rows, false);
            controllerMail.mailModel.setProperty("/attlistcombo", jsonArr.Rows[0].OPERATIONLIST.Rows, false);
        },
		
        addAssignment: function () {		
			
            var addRowModel = controllerMail.mailModel.getProperty("/tableAttach");
            var row = {
                "DEL": false,
                "EDIT": true,
                "MAILLIST": "",
                "MAILLIST_ID": "",
                "OPERATION": "",
                "OPERATION_ID": "",
                "OPERATIONMAIL": "",
                "OPERATIONMAIL_ID": "",
                "TEMPLATE": "",
                "TEMPLATE_ID": "",
                "SEND_TRIGGER": ""
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerMail.mailModel.setProperty("/tableAttach", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerMail.mailModel.setProperty("/tableAttach", newArr);
                } else {
                    var addArr = controllerMail.mailModel.getProperty("/tableAttach");
                    addArr.push(row);
                    controllerMail.mailModel.setProperty("/tableAttach", addArr);
                }
            }
			
			//Setup Mailing List di Sistema
			if(controllerMail.mailModel.getProperty("/VisibleAdmin/VISIBLE")){
				controllerMail.byId("switchSystemMailingList").setEnabled(false);
			}
			
			//Scroll to last table Element
			controllerMail.byId("tableAttach").setFirstVisibleRow(addRowModel.length);
        },
		
		onChangeSystemMessageTemplate: function(oEvent){
			controllerMail.mailModel.setProperty("/rowSelSystemMessageTemplate/SystemMessageTemplate", oEvent.getParameters().state ? "1" : "0");
		},
		
        sendMaitest: function () {
            if (!controllerMail._popup) {
                controllerMail._popup = sap.ui.xmlfragment("master_data.view.popup.sendMail", controllerMail);
                controllerMail.getView().addDependent(controllerMail._popup);
            }
            controllerMail.getListUsr();
            controllerMail._popup.open();
        },
		
        sendMaitestClose: function () {
            controllerMail._popup.close();
            controllerMail._popup.destroy();
            controllerMail._popup = undefined;
        },
		
        sendMailtestSend: function (oEvent) {
            var input = {};
            input.SITE_ID = controller.SiteId;
            input.TEMPLATE_ID = controllerMail.template_ID
            input.OPERATION = sap.ui.getCore().byId("fase").getValue();
            input.CHECKLIST = sap.ui.getCore().byId("checklist").getValue();
            input.TOADDRESS = sap.ui.getCore().byId("email").getSelectedKey();
            input.USER = sap.ui.getCore().byId("user").getValue();
            input.SLOT = sap.ui.getCore().byId("slot").getValue();
            controllerMail.getDataSync("TEST_MAIL", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.sendMailtestSendSuccess, controllerMail.transactionError);
        },
		
        sendMailtestSendSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                MessageToast.show(controller.oBundle.getText("viewMail.template.test.send"));
            }
            controllerMail.sendMaitestClose()
        },
        //FUNZIONI GENERICHE
        //FUNZIONI DASHBOARD
        //-----------Mailling----------//
        getListMail: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_MAIL_LIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getListMailSuccess, controllerMail.transactionError);
        },
		
        getListMailSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/mailist", jsonArr["Rows"]);
        },
		
        getListUsr: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_USR_LIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getListUsrSuccess, controllerMail.transactionError);
        },
		
        getListUsrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/usrlist", jsonArr["Rows"]);
        },
		
        getListMailusr: function () {
            var input = {};
            input.MAIL_ID = controllerMail.mail_ID;
            controllerMail.getDataSync("GET_MAIL_USR_LIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getListMailusrSuccess, controllerMail.transactionError);
        },
		
        getListMailusrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/tablemail", jsonArr["Rows"]);
        },
		
        getusrspecific: function (usr) {
            var input = {};
            input.USR = usr;
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_USR_SPECIFIC", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getusrspecificSuccess, controllerMail.transactionError);
        },
		
        getusrspecificSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.getProperty(controllerMail.pathRowSel)["USERID"] = jsonArr.Rows[0].UserId;
            controllerMail.mailModel.getProperty(controllerMail.pathRowSel)["NAME"] = jsonArr.Rows[0].Name;
            controllerMail.mailModel.getProperty(controllerMail.pathRowSel)["USR"] = jsonArr.Rows[0].Usr;
            controllerMail.mailModel.getProperty(controllerMail.pathRowSel)["EMAILADDRESS"] = jsonArr.Rows[0].EmailAddress;
            controllerMail.pathRowSel = "";
            controllerMail.mailModel.refresh();
        },
		
        saveNewMaillist: function (lvl) {
            var bCompact = !!controllerUSR.getView().$().closest(".sapUiSizeCompact").length;
            var input = {}
            input.LVL = lvl;
            input.MAIL_ID = controllerMail.mail_ID;
            input.SITE_ID = controller.SiteId;
			input.IS_SYSTEM_MAILING_LIST = controllerMail.mailModel.getProperty("/rowSelMailingList/SystemMailingList");
            if (lvl == "1") {
                MessageBox.confirm((controller.oBundle.getText("viewMail.delMail") + " " + controllerMail.byId("mailInputList").getValue() + "?"), {
                    styleClass: bCompact ? "sapUiSizeCompact" : "",
                    onClose: function (evt) {
                        if (evt == "OK") {
                            controllerMail.byId("mailInputList").setValue("");
                            controllerMail.getDataSync("INS_UPD_NEW_MAILIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.saveNewMaillistSuccess, controllerMail.transactionError);
                        }
                    }
                });
            }
            if (lvl == "0") {
                if (controllerMail.byId("inputMail").getValue() == "") {
                    return MessageBox.warning(controller.oBundle.getText("viewMail.missname"))
                }
                input.MAILINGLIST = controllerMail.byId("inputMail").getValue();
                controllerMail.getDataSync("INS_UPD_NEW_MAILIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.saveNewMaillistSuccess, controllerMail.transactionError);
            }
        },
		
        saveNewMaillistSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerMail.byId("inputMail").setValue("");
                controllerMail.mail_ID = jsonArr[0].MESSAGE;
                controllerMail.refreshNewMail(false);
                MessageToast.show(controller.oBundle.getText("viewMail.addUsrsuccess"));
            }
        },
		
        //-----------Mailling----------//
        //-----------Template----------//
        addTagObject: function () {
            if (controllerMail.byId("comboTag1").getSelectedKey() != "") {
                controllerMail.byId("templateObject").setValue(controllerMail.byId("templateObject").getValue() + " " + controllerMail.byId("comboTag1").getSelectedKey());
            }
        },
		
        addTagBody: function () {
            if (controllerMail.byId("comboTag2").getSelectedKey() != "") {
                controllerMail.byId("templateBody").setValue(controllerMail.byId("templateBody").getValue() + " " + controllerMail.byId("comboTag2").getSelectedKey());
            }
        },
		
        removeTagObject: function () {
            if (controllerMail.byId("comboTag1").getSelectedKey() != "") {
                controllerMail.byId("templateObject").setValue(controllerMail.byId("templateObject").getValue().replace(" " + controllerMail.byId("comboTag1").getSelectedKey(), ""));
            }
        },
		
        removeTagBody: function () {
            if (controllerMail.byId("comboTag2").getSelectedKey() != "") {
                controllerMail.byId("templateBody").setValue(controllerMail.byId("templateBody").getValue().replace(" " + controllerMail.byId("comboTag2").getSelectedKey(), ""));
            }
        },
		
        getAlltemplate: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_ALL_MSGG_TEMPLATE", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getAlltemplateSuccess, controllerMail.transactionError);
        },
		
        getAlltemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            var i = 0;
            for (i; i < jsonArr.Rows.length; i++) {
                jsonArr.Rows[i].MessageBody = jsonArr.Rows[i].MessageBody.replace(/_rn_/gm, '\r\n')
            }
            controllerMail.mailModel.setProperty("/templatelist", jsonArr.Rows, false);
            i = 0;
        },
		
        checkIfExistTemplate: function () {
            var input = {};
            input.TEMPLATE = controllerMail.byId("templateName").getValue();
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_IF_TEMPLATE_EXIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.checkIfExistTemplateSuccess, controllerMail.transactionError);
        },
		
        checkIfExistTemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                controllerMail.byId("templateName").setValue("");
                MessageBox.error(controller.oBundle.getText("viewMail.template.alreadyExist"));
            }
        },
		
        newTemplate: function (isNewTemplate) {
			//Input Fields
			controllerMail.byId("templateInputList").setValue("");
			controllerMail.byId("templateInputList").setEditable(!isNewTemplate);
			controllerMail.byId("templateName").setValue("");
            controllerMail.byId("templateName").setEditable(isNewTemplate);            
            controllerMail.byId("templateObject").setValue("");
			controllerMail.byId("templateObject").setEditable(isNewTemplate);
            controllerMail.byId("templateBody").setValue("");
            controllerMail.byId("templateBody").setEditable(isNewTemplate);
			controllerMail.template_ID = "0";
            controllerMail.byId("comboTag1").setSelectedKey("");
			controllerMail.byId("comboTag1").setValue("");
			controllerMail.byId("comboTag1").setEditable(isNewTemplate);
            controllerMail.byId("comboTag2").setSelectedKey("");            
            controllerMail.byId("comboTag2").setValue("");
			controllerMail.byId("comboTag2").setEditable(isNewTemplate);
			
			
			//Buttons
			controllerMail.byId("newTemplate").setEnabled(!isNewTemplate);			
            controllerMail.byId("closeTemplate").setEnabled(isNewTemplate);
			controllerMail.byId("saveTemplate").setEnabled(isNewTemplate);			
            controllerMail.byId("delTemplate").setEnabled(isNewTemplate);
            controllerMail.byId("testMail").setEnabled(isNewTemplate);			
            controllerMail.byId("addTagObj").setEnabled(isNewTemplate);
			controllerMail.byId("removeTagObj").setEnabled(isNewTemplate);
			controllerMail.byId("addTagBody").setEnabled(isNewTemplate);
			controllerMail.byId("removeTagBody").setEnabled(isNewTemplate);	

			//Setup //Setup Template di Sistema
			if(controllerMail.mailModel.getProperty("/VisibleAdmin/VISIBLE")){
				controllerMail.byId("switchSystemMessageTemplate").setState(false);
				controllerMail.byId("switchSystemMessageTemplate").setEnabled(isNewTemplate);
			}
			
			//Models
			controllerMail.mailModel.setProperty("/rowSelSystemMessageTemplate", []);			
        },
		
        addTemplate: function (lvl) {
            var bCompact = !!controllerUSR.getView().$().closest(".sapUiSizeCompact").length;
            if (controllerMail.byId("templateName").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewMail.template.misstemplatename"))
            }
            if (controllerMail.byId("templateObject").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewMail.template.misstemplateobject"))
            }
            if (controllerMail.byId("templateBody").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewMail.template.misstemplatebody"))
            }
            var xmlRequest = "<root>";
            xmlRequest = xmlRequest + "<id>" + controllerMail.template_ID + "</id>";
            xmlRequest = xmlRequest + "<template>" + controllerMail.byId("templateName").getValue() + "</template>";
            xmlRequest = xmlRequest + "<objectTemp>" + controllerMail.byId("templateObject").getValue() + "</objectTemp>";
            xmlRequest = xmlRequest + "<body>" + controllerMail.byId("templateBody").getValue().replace(/(\r\n|\n|\r)/gm, "\\r\\n") + "</body>"
			xmlRequest = xmlRequest + "<siteid>" + controller.SiteId + "</siteid>"
			xmlRequest = xmlRequest + "<lvl>" + lvl + "</lvl>"
			xmlRequest = xmlRequest + "<SystemMessageTemplate>" + (controllerMail.mailModel.getProperty("/rowSelSystemMessageTemplate/SystemMessageTemplate") === "1") + "</SystemMessageTemplate>"
			xmlRequest = xmlRequest + "</root>"
			var input = {};
            input.TEMPLATEXML = xmlRequest;
			
            if (lvl == "1") {
                MessageBox.confirm((controller.oBundle.getText("viewMail.template.deltemplate") + " " + controllerMail.byId("templateInputList").getValue() + "?"), {
                    styleClass: bCompact ? "sapUiSizeCompact" : "",
                    onClose: function (evt) {
                        if (evt == "OK") {
                            controllerMail.byId("templateInputList").setValue("");
                            controllerMail.getDataSync("INS_UPD_NEW_TEMPLATE", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.addTemplateSuccess, controllerMail.transactionError);
                        }
                    }
                });
            }
            if (lvl == "0") {
                controllerMail.getDataSync("INS_UPD_NEW_TEMPLATE", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.addTemplateSuccess, controllerMail.transactionError);
            }
        },
		
        addTemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {                
                controllerMail.newTemplate(false);
                MessageToast.show(controller.oBundle.getText("viewMail.template.result"));
            }
        },
        //-----------Template----------//
        //----------Attach--------------//
        getAllAttach: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("GET_ALL_ASSIGNMENT", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getAllAttachSuccess, controllerMail.transactionError);
        },
		
        getAllAttachSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/attachlist", jsonArr["Rows"]);
        },
		
        getListElementAttached: function () {
            var input = {};
            input.OPERATIONMAIL = controllerMail.OPERATIONMAIL;
            controllerMail.getDataSync("GET_SPECIFIC_ASSIGNMENT", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getListElementAttachedSuccess, controllerMail.transactionError);
        },
		
        getListElementAttachedSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerMail.mailModel.setProperty("/tableAttach", jsonArr["Rows"]);
        },
		
        newAssignment: function (isNewAssignment) {
			//Input Fields
            controllerMail.byId("attachInputList").setValue("");
			controllerMail.byId("attachInputList").setEditable(!isNewAssignment);
            controllerMail.byId("inputAttach").setValue("");
            controllerMail.byId("inputAttach").setEditable(isNewAssignment);
            controllerMail.OPERATIONMAIL = "";
						
			//Buttons
			controllerMail.byId("newAttach").setEnabled(!isNewAssignment);
			controllerMail.byId("closeMailToPhase").setEnabled(isNewAssignment);
			controllerMail.byId("saveAttachtbl").setEnabled(isNewAssignment);			
			controllerMail.byId("addAttach").setEnabled(isNewAssignment);
			
			//Models
            controllerMail.mailModel.setProperty("/tableAttach", []);
			
			if(isNewAssignment){
				controllerMail.getValueCombo();
			}
        },
		
		deleteMailToPhase: function (evt) {
            var lineSel = controllerMail.mailModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            lineSel.EDIT = true;
			
            controllerMail.mailModel.refresh();
            if (evt.oSource.oParent.oParent.mBindingInfos.rows.path == "/tableAttach") {
                controllerMail.countDel();
            }
			
			//Buttons
			controllerMail.byId("newAttach").setEnabled(false);
			controllerMail.byId("closeMailToPhase").setEnabled(true);
			controllerMail.byId("saveAttachtbl").setEnabled(true);			
			controllerMail.byId("addAttach").setEnabled(true);			
        },
				
        countDel: function () {           
            var model = controllerMail.mailModel.getProperty("/tableAttach");
            var numDel = 0;
            for (var y = 0; y < model.length; y++) {
                if (model[y].DEL) {
                    numDel = numDel + 1
                }
            }
            if (numDel >= model.length) {
                MessageBox.confirm((controller.oBundle.getText("viewMail.attach.delete")), {
                    styleClass: "sapUiSizeCompact",
                    onClose: function (evt) {
                        if (evt == "OK") {
                            controllerMail.allowDelete = true
                        } else {
                            controllerMail.allowDelete = false;
                            controllerMail.getListElementAttached();
                        }
                    }
				});
            } else {
                controllerMail.allowDelete = true;
            };
        },
		
		checkIfMailToPhaseExist: function () {
            var input = {};
            input.OPERATION_MAIL = controllerMail.byId("inputAttach").getValue();
            input.SITE_ID = controller.SiteId;
            controllerMail.getDataSync("CHECK_IF_OPERATION_MAIL_EXIST", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.checkIfMailToPhaseExistSuccess, controllerMail.transactionError);
        },
		
        checkIfMailToPhaseExistSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                controllerMail.newAssignment(true);
                MessageBox.error(controller.oBundle.getText("controllerMail.mailToPhaseAlreadyExist"));
            }
        },
		
        saveMailToPhase: function () {
            var model = controllerMail.mailModel.getProperty("/tableAttach");
            var modInput = [];
            var obj = {};
            var input = {};
            if (controllerMail.allowDelete) {
                if (controllerMail.byId("inputAttach").getValue() == "") {
                    return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingassigname"));
                }
                for (var i = 0; i < model.length; i++) {
                    if (model[i].MAILLIST_ID == "") {
                        return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingmailinglist"))
                    }
                    if (model[i].TEMPLATE_ID == "") {
                        return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingtemplate"))
                    }
                    if (model[i].OPERATION_ID == "") {
                        return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingoperation"))
                    }
                    if (model[i].SEND_TRIGGER == "") {
                        return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingSendingTrigger"))
                    }
                    if (model[i].EDIT) {
                        obj.MAILLIST_ID = model[i].MAILLIST_ID;
                        obj.TEMPLATE_ID = model[i].TEMPLATE_ID;
                        obj.OPERATION_ID = model[i].OPERATION_ID;
                        obj.SEND_TRIGGER = model[i].SEND_TRIGGER;
                        obj.OPERATIONMAIL = controllerMail.byId("inputAttach").getValue();
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
                input = {
                    "DATA": JSON.stringify(modInput)
                };
                input.SITE_ID = controller.SiteId;
                controllerMail.allowDelete = true;
                i = 0;
                controllerMail.getDataSync("INS_DEL_ASSEGNMENT", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getAttachedTablevaluesSuccess, controllerMail.transactionError);
            }
        },
		
        getAttachedTablevaluesSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {                
                controllerMail.newAssignment(false);
                //controllerMail.byId("inputAttach").setEnabled(false);
                MessageToast.show(controller.oBundle.getText("viewMail.attach.result"));
            }
        },
		
        getMailListSelect: function () {
            controllerMail.mailModel.refresh()
        },
        //----------Attach--------------//
        //FUNZIONI DASHBOARD
        //FUNZIONI RICERCA
        //-----------Mailling----------//
        handleValueHelpMail: function () {
            controllerMail.getListMail();
            
            if (!controllerMail._oValueHelpDialogMail) {
                Fragment.load({
                    name: "master_data.view.popup.listmail_tbl",
                    controller: controllerMail
                }).then(function (oValueHelpDialogMail) {
                    controllerMail._oValueHelpDialogMail = oValueHelpDialogMail;
                    controllerMail.getView().addDependent(controllerMail._oValueHelpDialogMail);
                    controllerMail._configValueHelpDialogMail();
                    controllerMail._oValueHelpDialogMail.open();
                });
            } else {
                controllerMail._configValueHelpDialogMail();
                controllerMail._oValueHelpDialogMail.open();
            }
        },

        _configValueHelpDialogMail: function () {
            var sInputValue = controllerMail.byId("mailInputList").getValue(),
            oModel = controllerMail.getView().getModel(),
            aProducts = oModel.getProperty("/mailist");
            oModel.setProperty("/mailist", aProducts);
        },

        handleValueHelpCloseMail: function (oEvent) {			
            try {
				let oModelRowSel = controllerMail.mailModel.getProperty(oEvent.getParameter("selectedContexts")[0].sPath);
				controllerMail.mailModel.setProperty("/rowSelMailingList", oModelRowSel);
				
                controllerMail.byId("mailInputList").setValue(oModelRowSel["MailingList"]);
				controllerMail.byId("mailInputList").setEditable(false);
                controllerMail.mail_ID = oModelRowSel["MailingListId"];
                controllerMail.byId("inputMail").setValue(oModelRowSel["MailingList"]);
				//Setup Mailing List di Sistema
				if(controllerMail.mailModel.getProperty("/VisibleAdmin/VISIBLE")){
					controllerMail.byId("switchSystemMailingList").setEnabled(true);
					controllerMail.byId("switchSystemMailingList").setState(oModelRowSel["SystemMailingList"] === "1");
				}
								
				controllerMail.byId("delMailingList").setEnabled(oModelRowSel["DEL"]);
				controllerMail.byId("inputMail").setEditable(oModelRowSel["DEL"]);						
				
                controllerMail.getListMailusr();
                controllerMail._oValueHelpDialogMail = undefined;
		
				//Buttons
				controllerMail.byId("newMailingList").setEnabled(false);
				controllerMail.byId("closeMailingList").setEnabled(true);
				controllerMail.byId("saveMailingList").setEnabled(true);
				controllerMail.byId("addMail").setEnabled(true);
				controllerMail.byId("saveUserToMail").setEnabled(false);
            } catch (err) {
				controllerMail.mailModel.setProperty("/rowSelMailingList", []);
			}
        },
		
        handleSearchMail: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("MailingList", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
		
        handleValueHelpMailUsr: function (oEvent) {
            //Riga selezione matchcode
            controllerMail.getListUsr();
            controllerMail.pathRowSel = oEvent.oSource.oParent.oBindingContexts["undefined"].sPath;
            if (!controllerMail._oValueHelpDialogMailUsr) {
                Fragment.load({
                    name: "master_data.view.popup.listmailusr",
                    controller: controllerMail
                }).then(function (oValueHelpDialogMailUsr) {
                    controllerMail._oValueHelpDialogMailUsr = oValueHelpDialogMailUsr;
                    controllerMail.getView().addDependent(controllerMail._oValueHelpDialogMailUsr);
                    controllerMail._configValueHelpDialogMailUsr();
                    controllerMail._oValueHelpDialogMailUsr.open();
                });
            } else {
                controllerMail._configValueHelpDialogMailUsr();
                controllerMail._oValueHelpDialogMailUsr.open();
            }
        },

        _configValueHelpDialogMailUsr: function () {
            var sInputValue = controllerMail.byId("usrList").getValue(),
            oModel = controllerMail.getView().getModel(),
            aProducts = oModel.getProperty("/usrlist");
            oModel.setProperty("/usrlist", aProducts);
        },

        handleValueHelpCloseMailUsr: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            try {
                controllerMail.getusrspecific(oSelectedItem.mProperties.title);
                //controllerMail.mail_ID=oSelectedItem.mProperties.description;
                //controllerMail.getListMailusr();
                controllerMail._oValueHelpDialogMailUsr = undefined;
            } catch (err) {}
        },
		
        handleSearchMailUsr: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("USR", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
        //-----------Mailling----------//
        //-----------Template----------//
        handleValueHelpTmp: function () {
            controllerMail.getAlltemplate();
            
			if (!controllerMail._oValueHelpDialogTmp) {
                Fragment.load({
                    name: "master_data.view.popup.listtemplate_tbl",
                    controller: controllerMail
                }).then(function (oValueHelpDialogTmp) {
                    controllerMail._oValueHelpDialogTmp = oValueHelpDialogTmp;
                    controllerMail.getView().addDependent(controllerMail._oValueHelpDialogTmp);
                    controllerMail._configValueHelpDialogTmp();
                    controllerMail._oValueHelpDialogTmp.open();
                });
            } else {
                controllerMail._configValueHelpDialogTmp();
                controllerMail._oValueHelpDialogTmp.open();
            }
        },

        _configValueHelpDialogTmp: function () {
            var sInputValue = controllerMail.byId("templateInputList").getValue(),
            oModel = controllerMail.getView().getModel(),
            aProducts = oModel.getProperty("/templatelist");
            oModel.setProperty("/templatelist", aProducts);
        },

        handleValueHelpCloseTmp: function (oEvent) {           
            try {
				let oModelRowSel = controllerMail.mailModel.getProperty(oEvent.getParameter("selectedContexts")[0].sPath);
				controllerMail.mailModel.setProperty("/rowSelSystemMessageTemplate", oModelRowSel);
				
				//Input Fields
                controllerMail.byId("templateInputList").setValue(oModelRowSel["MessageTemplate"]);
                controllerMail.byId("templateName").setValue(oModelRowSel["MessageTemplate"]);
				controllerMail.byId("templateName").setEditable(true);
                controllerMail.byId("templateObject").setValue(oModelRowSel["MessageObject"]);
				controllerMail.byId("templateObject").setEditable(true);
                controllerMail.byId("templateBody").setValue(oModelRowSel["MessageBody"]);
				controllerMail.byId("templateBody").setEditable(true);
                controllerMail.template_ID = oModelRowSel["MessageTemplateId"];                
				controllerMail.byId("comboTag1").setEditable(true);
				controllerMail.byId("comboTag2").setEditable(true);
				
				controllerMail.byId("templateName").setEditable(oModelRowSel["DEL"]);
				controllerMail.byId("delTemplate").setEnabled(oModelRowSel["DEL"]);                    
                
				//Setup Template di Sistema
				if(controllerMail.mailModel.getProperty("/VisibleAdmin/VISIBLE")){
					controllerMail.byId("switchSystemMessageTemplate").setState(oModelRowSel["SystemMessageTemplate"] === "1");
					controllerMail.byId("switchSystemMessageTemplate").setEnabled(true);
				}	
				
				//Buttons
				controllerMail.byId("newTemplate").setEnabled(false);			
				controllerMail.byId("closeTemplate").setEnabled(true);
				controllerMail.byId("saveTemplate").setEnabled(true);
				controllerMail.byId("testMail").setEnabled(true);			
				controllerMail.byId("addTagObj").setEnabled(true);
				controllerMail.byId("removeTagObj").setEnabled(true);
				controllerMail.byId("addTagBody").setEnabled(true);
				controllerMail.byId("removeTagBody").setEnabled(true);	
                controllerMail._oValueHelpDialogTmp = undefined;
            } catch (err) {
				controllerMail.mailModel.setProperty("/rowSelSystemMessageTemplate", []);
			}
        },
		
        handleSearchTmp: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("MessageTemplate", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
		
        //-----------Template----------//
        //----------Attach--------------//
        handleValueHelpAtt: function () {
            controllerMail.getAllAttach();
           // controllerMail.byId("inputAttach").setEnabled(false);
            if (!controllerMail._oValueHelpDialogAtt) {
                Fragment.load({
                    name: "master_data.view.popup.listatt_tbl",
                    controller: controllerMail
                }).then(function (oValueHelpDialogAtt) {
                    controllerMail._oValueHelpDialogAtt = oValueHelpDialogAtt;
                    controllerMail.getView().addDependent(controllerMail._oValueHelpDialogAtt);
                    controllerMail._configValueHelpDialogAtt();
                    controllerMail._oValueHelpDialogAtt.open();
                });
            } else {
                controllerMail._configValueHelpDialogAtt();
                controllerMail._oValueHelpDialogAtt.open();
            }
        },

        _configValueHelpDialogAtt: function () {
            var sInputValue = controllerMail.byId("attachInputList").getValue(),
            oModel = controllerMail.getView().getModel(),
            aProducts = oModel.getProperty("/attachlist");
            oModel.setProperty("/attachlist", aProducts);
        },

        handleValueHelpCloseAtt: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            try {
				//Input Fields
                controllerMail.byId("attachInputList").setValue(oSelectedItem.mAggregations.cells[0].getText());
                controllerMail.byId("inputAttach").setValue(oSelectedItem.mAggregations.cells[0].getText());
                controllerMail.OPERATIONMAIL_ID = oSelectedItem.mAggregations.cells[1].getText();
                controllerMail.OPERATIONMAIL = oSelectedItem.mAggregations.cells[0].getText();                
                controllerMail._oValueHelpDialogTmp = undefined;
				
				controllerMail.byId("attachInputList").setEditable(false);				
				controllerMail.byId("inputAttach").setEditable(false);
				
				//Buttons
				controllerMail.byId("newAttach").setEnabled(false);
				controllerMail.byId("closeMailToPhase").setEnabled(true);
				controllerMail.byId("saveAttachtbl").setEnabled(true);				
				controllerMail.byId("addAttach").setEnabled(true);
				
				//Models
				controllerMail.getListElementAttached();
				controllerMail.getValueCombo();
            } catch (err) {}
        },
		
        handleSearchAtt: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("OPERATIONMAIL", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        //----------Attach--------------//

        /*Threshold*/
        newMailThreshold: function () {
            var addRowModel = controllerMail.mailModel.getProperty("/tableMailThreshold");
            var row = {
                "DEL": "false",
                "EDIT": true,
                "SITE_ID": controller.SiteId,
                "LOWER_THRESHOLD": "",
                "UPPER_THRESHOLD": "",
                "DISCARD_THRESHOLD": ""
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerMail.mailModel.setProperty("/tableMailThreshold", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerMail.mailModel.setProperty("/tableMailThreshold", newArr);
                } else {
                    var addArr = controllerMail.mailModel.getProperty("/tableMailThreshold");
                    addArr.push(row);
                    controllerMail.mailModel.setProperty("/tableMailThreshold", addArr);
                }
            }
            controllerMail.byId("newMailThreshold").setEnabled(false);
        },

        changeThreshold: function (oEvent) {
            if (oEvent.oSource.getValue() < 0) {
				controllerMail.byId("btnCloseMailThreshold").setEnabled(false);
                controllerMail.byId("saveMailThreshold").setEnabled(false);
                MessageToast.show(controller.oBundle.getText("viewMail.attach.table.insertNegative"));
                oEvent.oSource.setValue("");
            } else if (oEvent.oSource.getValue() % 1 !== 0) {
				controllerMail.byId("btnCloseMailThreshold").setEnabled(false);
                controllerMail.byId("saveMailThreshold").setEnabled(false);
                MessageToast.show(controller.oBundle.getText("viewMail.attach.table.insertInteger"));
                oEvent.oSource.setValue("");
            } else {
                var model = controllerMail.mailModel.getProperty(oEvent.getSource().getBindingContext().sPath);
                model.EDIT = true;
                model.DEL = "false";
				controllerMail.byId("btnCloseMailThreshold").setEnabled(true);
                controllerMail.byId("saveMailThreshold").setEnabled(true);
            }
        },

        refreshThresholdModel: function () {
            var input = {
                "SITE_ID": controller.SiteId
            };
            controllerMail.getDataSync("GET_THRESHOLD", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.getThresholdSuccess, controllerMail.transactionError);
        },

        getThresholdSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr.length === 0) {				
                controllerMail.byId("newMailThreshold").setEnabled(true);
            } else {
                controllerMail.byId("newMailThreshold").setEnabled(false);
            }
			controllerMail.byId("btnCloseMailThreshold").setEnabled(false);
            controllerMail.byId("saveMailThreshold").setEnabled(false);
            controllerMail.mailModel.setProperty("/tableMailThreshold", jsonArr);
        },

        saveMailThreshold: function () {
            var model = controllerMail.mailModel.getProperty("/tableMailThreshold");
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
                if (model[i].LOWER_THRESHOLD == "") {
                    return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingLowerThreshold"))
                }
                if (model[i].UPPER_THRESHOLD == "") {
                    return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingUpperThreshold"))
                }
                if (model[i].DISCARD_THRESHOLD == "") {
                    return MessageBox.warning(controller.oBundle.getText("viewMail.attach.table.missingDiscardThreshold"))
                }
                if (model[i].EDIT) {
                    obj.SITE_ID = model[i].SITE_ID;
                    obj.LOWER_THRESHOLD = model[i].LOWER_THRESHOLD;
                    obj.UPPER_THRESHOLD = model[i].UPPER_THRESHOLD;
                    obj.DISCARD_THRESHOLD = model[i].DISCARD_THRESHOLD;
                    obj.DEL = model[i].DEL;
                    modInput.push(obj);
                    obj = new Object;
                }
            }

            var input = {
                "DATA": JSON.stringify(modInput)
            };

            controllerMail.getDataSync("SAVE_THRESHOLD", "ADIGE7/MASTER_DATA/MAILING/TRANSACTION", input, controllerMail.saveThresholdSuccess, controllerMail.transactionError);
        },

        saveThresholdSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerMail.byId("newMailThreshold").setEnabled(false);
                controllerMail.byId("saveMailThreshold").setEnabled(false);
                MessageToast.show(controller.oBundle.getText("viewMail.attach.saveOk"));
                controllerMail.refreshThresholdModel();
            }
        },

        pressMailTabBar: function (oEvent) {
            switch (oEvent.getSource().getSelectedKey()) {
            case "ML":
                controllerMail.refreshNewMail(false);
                break;
            case "TP":
                controllerMail.newTemplate(false);
                break;
            case "MOT":
                controllerMail.newAssignment(false);                
                break;
            case "MTH":
                controllerMail.refreshThresholdModel();
                break;
            default: //No Action
            }
        },
        /*----------*/

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
                req.done(jQuery.proxy(successFunc, controllerMail));
                req.fail(jQuery.proxy(errorFunc, controllerMail));
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
                req.done(jQuery.proxy(suss, controllerMail));
                req.fail(jQuery.proxy(errf, controllerMail));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },

        //FUNZIONI PER ESECUZIONI TRANSAZIONI
    });
});
