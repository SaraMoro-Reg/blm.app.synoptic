var controllerUSR;
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

    return Controller.extend("master_data.controller.User", {
        usrModel: new sap.ui.model.json.JSONModel(),        
        _popup: undefined,
        _newIdUsr: "",
        _ruleLvl: 0,
        rulesPath: "",
		userUserGrpSelPath: "",
		isNewRole: false,

        onInit: function () {
            controllerUSR = this;
			controller.enableElement(controllerUSR.usrModel);
            controllerUSR.getView().setModel(controllerUSR.usrModel);
        },
		
		downloadModel: function () {
            try {
				controllerUSR.getListExcUsr();
                var date = new Date(),
                day = date.getDate() + "",
                month = (date.getMonth() + 1) + "",
                oSettings = {
                    workbook: {
                        columns: controllerUSR.createColumnUserListModel(),
                        context: {
                            sheetName: controller.oBundle.getText("viewUser.listUSer")
                        }
                    },
                    dataSource: controllerUSR.usrModel.getProperty("/userlistexc"),
                    fileName: controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewUser.listUSer") + "_" + (day.length == 1 ? "0" + day : day) + (month.length == 1 ? "0" + month : month) + date.getFullYear().toString().substr(-2)

                },oSheet = new Spreadsheet(oSettings);
				
                oSheet.build()
                .then(function () {})
                .finally(function () {
                    oSheet.destroy();
                });
            } catch (err) {}
        },
		
		createColumnUserListModel: function(){
			return [{
                    label: controller.oBundle.getText("viewUsr.table.usr"),
                    property: 'USERID',
                    type: exportLibrary.EdmType.String,
                    width: '20',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.table.Name"),
                    property: 'NAME',
                    type: exportLibrary.EdmType.String,
                    width: '30',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.mail"),
                    property: 'MAILADDRESS',
                    type: exportLibrary.EdmType.String,
                    width: '40',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.language"),
                    property: 'LANGUAGE',
                    type: exportLibrary.EdmType.String,
                    width: '10',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.Rule"),
                    property: 'RULES',
                    type: exportLibrary.EdmType.String,
                    width: '40',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.RuleDescr"),
                    property: 'RULE_DESCR',
                    type: exportLibrary.EdmType.String,
                    width: '50',
                    textAlign: 'begin',
					wrap: true
                }]
		},
		
		downloadModelRules: function () {
            try {
				controllerUSR.getListExcRule();
                var date = new Date(),
                day = date.getDate() + "",
                month = (date.getMonth() + 1) + "",
                oSettings = {
                    workbook: {
                        columns: controllerUSR.createColumnRolesListModel(),
                        context: {
                            sheetName: controller.oBundle.getText("viewUsr.ruleList")
                        }
                    },
                    dataSource: controllerUSR.usrModel.getProperty("/Ruleslistexc"),
                    fileName: controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewUser.Roles") + "_" + (day.length == 1 ? "0" + day : day) + (month.length == 1 ? "0" + month : month) + date.getFullYear().toString().substr(-2)

                },oSheet = new Spreadsheet(oSettings);
				
                oSheet.build()
                .then(function () {})
                .finally(function () {
                    oSheet.destroy();
                });
            } catch (err) {}
        },
		
		createColumnRolesListModel: function(){
			return [{
                    label: controller.oBundle.getText("viewUsr.Table.rule"),
                    property: 'RULES',
                    type: exportLibrary.EdmType.String,
                    width: '30',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.Table.ruledescr"),
                    property: 'RULE_DESCR',
                    type: exportLibrary.EdmType.String,
                    width: '50',
                    textAlign: 'begin',
					wrap: true
                }, {
                    label: controller.oBundle.getText("viewUsr.Activity"),
                    property: 'ACTIVITY_ATTACHED',
                    type: exportLibrary.EdmType.String,
                    width: '40',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.table.activityDescr"),
                    property: 'ACTIVITY_DESCR',
                    type: exportLibrary.EdmType.String,
                    width: '50',
                    textAlign: 'begin',
					wrap: true
                }]
		},
		
		downloadModelActivities: function () {
            try {
				controllerUSR.getListExcAct();
                var date = new Date(),
                day = date.getDate() + "",
                month = (date.getMonth() + 1) + "",
                oSettings = {
                    workbook: {
                        columns: controllerUSR.createColumnActivitiesListModel(),
                        context: {
                            sheetName: controller.oBundle.getText("viewUsr.activityList")
                        }
                    },
                    dataSource: controllerUSR.usrModel.getProperty("/actlistexc"),
                    fileName: controller.oBundle.getText("exportttle") + "_" + controller.oBundle.getText("viewUsr.table.activity") + "_" + (day.length == 1 ? "0" + day : day) + (month.length == 1 ? "0" + month : month) + date.getFullYear().toString().substr(-2)

                },oSheet = new Spreadsheet(oSettings);
				
                oSheet.build()
                .then(function () {})
                .finally(function () {
                    oSheet.destroy();
                });
            } catch (err) {}
        },
		
		createColumnActivitiesListModel: function(){
			return [ {
                    label: controller.oBundle.getText("viewUsr.Activity"),
                    property: 'ACTIVITY',
                    type: exportLibrary.EdmType.String,
                    width: '40',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.table.activityDescr"),
                    property: 'ACTIVITY_DESCR',
                    type: exportLibrary.EdmType.String,
                    width: '50',
                    textAlign: 'begin',
					wrap: true
                }, {
                    label: controller.oBundle.getText("viewUsr.Table.rule"),
                    property: 'RULES_ATTACHED',
                    type: exportLibrary.EdmType.String,
                    width: '30',
                    textAlign: 'begin'
                }, {
                    label: controller.oBundle.getText("viewUsr.Table.ruledescr"),
                    property: 'RULES_DESCR',
                    type: exportLibrary.EdmType.String,
                    width: '50',
                    textAlign: 'begin',
					wrap: true
                }]
		},

        getListExcUsr: function () {
            var input = {};
            input.SITE_ID = controller.SiteId
            input.LANGUAGE = controller.language;
            controllerUSR.getDataSync("GET_USER_RULES_LIST", "ADIGE7/MASTER_DATA/USER/TRANS/TRANSDWN", input, controllerUSR.getListExcUsrSuccess, controllerUSR.transactionError);
        },

        getListExcUsrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerUSR.usrModel.setProperty("/userlistexc", jsonArr.Rows, false);
        },

        getListExcRule: function () {
            var input = {};
            input.LANGUAGE = controller.language;
            controllerUSR.getDataSync("GET_RULES_ACTIVTIES_LIST", "ADIGE7/MASTER_DATA/USER/TRANS/TRANSDWN", input, controllerUSR.getListExcRuleSuccess, controllerUSR.transactionError);
        },

        getListExcRuleSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerUSR.usrModel.setProperty("/Ruleslistexc", jsonArr.Rows, false);
        },

        getListExcAct: function () {
            var input = {};
            input.LANGUAGE = controller.language;
            controllerUSR.getDataSync("GET_ACTIVTIES_RULES_LIST", "ADIGE7/MASTER_DATA/USER/TRANS/TRANSDWN", input, controllerUSR.getListExcActSuccess, controllerUSR.transactionError);
        },

        getListExcActSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerUSR.usrModel.setProperty("/actlistexc", jsonArr.Rows, false);
        },

        getSiteID: function () {
            var input = {};
            input.SITE = controller.site;
            controllerUSR.getDataSync("GET_ID_SITE", "ADIGE7/MASTER_DATA/WORKCENTER/TRANSACTION/WRK", input, controllerUSR.getSiteIDSuccess, controllerUSR.transactionError);
        },

        getSiteIDSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controller.SiteId = jsonArr.Rows[0].SITE_ID;
        },

        getUsrLang: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerUSR.getDataSync("GET_USR_LANG", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getUsrLangSuccess, controllerUSR.transactionError);
        },

        getUsrLangSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            try {
                //Prendo dall'utente
                controller.language = jsonArr.Rows[0].LANGUAGE;
            } catch (err) {
                //Se non esiste l'utente nel sito metto di default IT
                controller.language = "IT";
            }
        },

        manageColor: function (DEL) {
            var color = 'None';
            if (!DEL) {
                color = 'None';
            } else {
                color = 'Error';
            }
            if (DEL == "false") {
                color = 'Warning';
            }
            return color;
        },

        //DEFINIZIONE COSTANTI UTENTE SITE
        //FUNZIONI DASHBORD
        checkmail: function () {
            if (controllerUSR.byId("mailUSR").getValue().indexOf(".") < 0 || controllerUSR.byId("mailUSR").getValue().indexOf("@") < 0) {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.erromail"));
            }
        },

        getListUsr: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerUSR.getDataSync("GET_LIST_USER", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getListUsrSuccess, controllerUSR.transactionError);
        },

        getListUsrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerUSR.usrModel.setProperty("/userlist", jsonArr.Rows, false);
            controllerUSR.getComboSupplier();
        },

        getUsrInfo: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            input.USR = controllerUSR.byId("inputUSR").getValue();
            controllerUSR.getDataSync("GET_USR_INFO", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getUsrInfoSuccess, controllerUSR.transactionError);
        },

        getUsrInfoSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            
			//Input Field
			controllerUSR.byId("userInputList").setEditable(false);
			controllerUSR.byId("inputUSR").setEditable(false);            
			controllerUSR.byId("nameUSR").setEditable(true);
			controllerUSR.byId("surnameUSR").setEditable(true);
			controllerUSR.byId("languageUSR").setEditable(true);
			controllerUSR.byId("mailUSR").setEditable(true);
			
			//Button
			controllerUSR.byId("newUser").setEnabled(false);
			controllerUSR.byId("closeUsr").setEnabled(true);
			controllerUSR.byId("saveUser").setEnabled(true);
			controllerUSR.byId("delUser").setEnabled(true);
			controllerUSR.byId("addRule").setEnabled(true);
			controllerUSR.byId("saveRule").setEnabled(false);		
			
            controllerUSR.byId("nameUSR").setValue(jsonArr.Rows[0].NAME);
            controllerUSR.byId("surnameUSR").setValue(jsonArr.Rows[0].SURNAME);
            controllerUSR.byId("languageUSR").setSelectedKey(jsonArr.Rows[0].LANGUAGE);
           
		    if (jsonArr.Rows[0].SUPPLIER_ID == "0") {
                controllerUSR.byId("supplierUSR").setValue("");
                controllerUSR.byId("supplierUSR").setEditable(true);
            } else {
                controllerUSR.byId("supplierUSR").setEditable(true);
            }
			
            controllerUSR.byId("supplierUSR").setSelectedKey(jsonArr.Rows[0].SUPPLIER_ID);
            controllerUSR.byId("supplierUSR").setVisible(jsonArr.Rows[0].IS_SUPP);
            controllerUSR.byId("lblSupp").setVisible(jsonArr.Rows[0].IS_SUPP);
            controllerUSR._newIdUsr = jsonArr.Rows[0].USERID;
            controllerUSR.byId("mailUSR").setValue(jsonArr.Rows[0].MAIL)
            controllerUSR.getRuleList();
        },
		
        getRuleList: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            input.USR = controllerUSR.byId("inputUSR").getValue();
            input.LANGUAGE = controller.language;
            controllerUSR.getDataSync("GET_RULES_BY_USER", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getRuleListSuccess, controllerUSR.transactionError);
        },

        getRuleListSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerUSR.usrModel.setProperty("/tabUsrRules", jsonArr.Rows, false);
            //controllerUSR.getAllRues()
        },

        getAllRues: function () {
            var input = {};
            input.LANGUAGE = controller.language;
            controllerUSR.getDataSync("GET_RULES_BY_LANG", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getAllRuesSuccess, controllerUSR.transactionError);
        },

        getAllRuesSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerUSR.usrModel.setProperty("/ruleslist", jsonArr.Rows, false);
        },

        getSpecificRues: function (ruledesc) {
            var input = {};
            input.LANGUAGE = controller.language;
            input.RULE = ruledesc;
            controllerUSR.getDataSync("GET_RULES_BY_LANG_BY_RULE", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getSpecificRuesSuccess, controllerUSR.transactionError);
        },

        getSpecificRuesSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            switch (controllerUSR._ruleLvl) {
            case 0:
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["ROLE"] = jsonArr.Rows[0].RULES;
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["DESCRIPTION"] = jsonArr.Rows[0].RULEDESCR;
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["RULEID"] = jsonArr.Rows[0].RULEID;
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["USERID"] = controllerUSR._newIdUsr;
	    controllerUSR.rulesPath = ""; 
                controllerUSR.usrModel.refresh();
                break;
            case 1:
	   controllerUSR.rulesPath = ""; 
                break;
            default:
	   controllerUSR.rulesPath = ""; 
                break;
            }
        },
		
        getComboSupplier: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            controllerUSR.getDataSync("GET_SUPPLIER_COMBO", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getComboSupplierSuccess, controllerUSR.transactionError);
        },
		
        getComboSupplierSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            controllerUSR.usrModel.setProperty("/supplierlist", jsonArr, false);
        },
		
        saveUsrSupp: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            input.USR = controllerUSR.byId("inputUSR").getValue();
            input.SUPP_ID = controllerUSR.byId("supplierUSR").getSelectedKey()
                controllerUSR.getDataSync("UPD_SUPP_USR", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveUsrSuppSuccess, controllerUSR.transactionError);
        },
		
        saveUsrSuppSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerUSR.getUsrInfo();
                MessageToast.show(controller.oBundle.getText("viewUsr.userSupp"));
            }
            controllerUSR.byId("supplierUSR").clearSelection();
        },
		
        cleanNewUsr: function (isNewUser) {
			//Input Field
			controllerUSR.byId("userInputList").setValue("");
			controllerUSR.byId("userInputList").setEditable(!isNewUser);
            controllerUSR.byId("inputUSR").setValue("");
			controllerUSR.byId("inputUSR").setEditable(isNewUser);
            controllerUSR.byId("nameUSR").setValue("");
			controllerUSR.byId("nameUSR").setEditable(isNewUser);
            controllerUSR.byId("surnameUSR").setValue("");
			controllerUSR.byId("surnameUSR").setEditable(isNewUser);
            controllerUSR.byId("languageUSR").setSelectedKey("");
			controllerUSR.byId("languageUSR").setEditable(isNewUser);
            controllerUSR.byId("mailUSR").setValue("");
			controllerUSR.byId("mailUSR").setEditable(isNewUser);
			
			if(controllerUSR.byId("supplierUSR").getVisible()){
				if(isNewUser)
					controllerUSR.byId("supplierUSR").clearSelection();
				
				controllerUSR.byId("supplierUSR").setEditable(false);
			}
			
			//Button
			controllerUSR.byId("newUser").setEnabled(!isNewUser);
			controllerUSR.byId("closeUsr").setEnabled(isNewUser);
			controllerUSR.byId("saveUser").setEnabled(isNewUser);
			controllerUSR.byId("delUser").setEnabled(isNewUser);
			controllerUSR.byId("addRule").setEnabled(false);
			controllerUSR.byId("saveRule").setEnabled(false);			
			
			
            controllerUSR.byId("supplierUSR").setVisible(false);
            controllerUSR.byId("lblSupp").setVisible(false);            
            
			//Model
            controllerUSR.usrModel.setProperty("/tabUsrRules", []);
        },

        addNewUsr: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;
            if (controllerUSR.byId("inputUSR").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.missusr"))
            }
            if (controllerUSR.byId("nameUSR").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.missname"))
            }
            if (controllerUSR.byId("surnameUSR").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.misssurname"))
            }
            if (controllerUSR.byId("languageUSR").getSelectedKey() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.misslang"))
            }
            input.USR = controllerUSR.byId("inputUSR").getValue().toUpperCase();
            input.NAME = controllerUSR.byId("nameUSR").getValue() + ", " + controllerUSR.byId("surnameUSR").getValue();
            input.LANGUAGE = controllerUSR.byId("languageUSR").getSelectedKey();
            input.MAIL = controllerUSR.byId("mailUSR").getValue();
            controllerUSR.getDataSync("INSERT_NEW_USR", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.addNewUsrSuccess, controllerUSR.transactionError);
        },

        addNewUsrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0]["RC"] != "0") {
                MessageBox.error(jsonArr[0]["MESSAGE"]);
            } else {
                controllerUSR._newIdUsr = jsonArr[0]["MESSAGE"];                
                controllerUSR.cleanNewUsr(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.userAdd"));
            }
        },

        deleteUsr: function () {
            var input = {};
            input.LANGUAGE = controller.language;
            input.USERID = controllerUSR._newIdUsr;
            var bCompact = !!controllerUSR.getView().$().closest(".sapUiSizeCompact").length;
            MessageBox.confirm((controller.oBundle.getText("viewUsr.confirmDelusr") + " " + controllerUSR.byId("inputUSR").getValue() + "?"), {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (evt) {
                    if (evt == "OK") {
                        controllerUSR.getDataSync("DELETE_USER", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.deleteUsrSuccess, controllerUSR.transactionError);
                    }
                }
            });
        },

        deleteUsrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0]["RC"] != "0") {
                MessageBox.error(jsonArr[0]["MESSAGE"]);
            } else {
                controllerUSR.cleanNewUsr(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.userDel"));
            }
        },

        deleteRulefromlist: function (evt) {
            var lineSel = controllerUSR.usrModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.EDIT = "false";
            lineSel.DEL = "true";
            controllerUSR.usrModel.refresh();
			
			//Input Field
			controllerUSR.byId("userInputList").setEditable(false);
			controllerUSR.byId("inputUSR").setEditable(false);            
			controllerUSR.byId("nameUSR").setEditable(false);
			controllerUSR.byId("surnameUSR").setEditable(false);
			controllerUSR.byId("languageUSR").setEditable(false);
			controllerUSR.byId("mailUSR").setEditable(false);
			
			if(controllerUSR.byId("supplierUSR").getVisible()){
				controllerUSR.byId("supplierUSR").setEditable(false);
			}
			
			//Button
			controllerUSR.byId("newUser").setEnabled(false);
			controllerUSR.byId("closeUsr").setEnabled(true);
			controllerUSR.byId("saveUser").setEnabled(false);
			controllerUSR.byId("delUser").setEnabled(false);
			controllerUSR.byId("addRule").setEnabled(true);
			controllerUSR.byId("saveRule").setEnabled(true);
        },

        addRule: function () {
            var addRowModel = controllerUSR.usrModel.getProperty("/tabUsrRules");
            var row = {
                "USERID": "",
                "RULEID": "",
                "USR": "",
                "ROLE": "",
                "DESCRIPTION": "",
                "EDIT": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerUSR.usrModel.setProperty("/tabUsrRules", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerUSR.usrModel.setProperty("/tabUsrRules", newArr);
                } else {
                    var addArr = controllerUSR.usrModel.getProperty("/tabUsrRules");
                    addArr.push(row);
                    controllerUSR.usrModel.setProperty("/tabUsrRules", addArr);
                }
            }
			
			//Input Field
			controllerUSR.byId("userInputList").setEditable(false);
			controllerUSR.byId("inputUSR").setEditable(false);            
			controllerUSR.byId("nameUSR").setEditable(false);
			controllerUSR.byId("surnameUSR").setEditable(false);
			controllerUSR.byId("languageUSR").setEditable(false);
			controllerUSR.byId("mailUSR").setEditable(false);
			
			if(controllerUSR.byId("supplierUSR").getVisible()){
				controllerUSR.byId("supplierUSR").setEditable(false);
			}
			
			//Button
			controllerUSR.byId("newUser").setEnabled(false);
			controllerUSR.byId("closeUsr").setEnabled(true);
			controllerUSR.byId("saveUser").setEnabled(false);
			controllerUSR.byId("delUser").setEnabled(false);
			controllerUSR.byId("addRule").setEnabled(true);
			controllerUSR.byId("saveRule").setEnabled(true);
			
			//Scroll to last table Element
			controllerUSR.byId("tabUsrRules").setFirstVisibleRow(addRowModel.length); 	
        },

        updateRules: function () {
            var model = controllerUSR.usrModel.getProperty("/tabUsrRules");
            var modInput = [];
            var obj = {};
            var input = {};
            for (var i = 0; i < model.length; i++) {
                if (model[i].RULEID != "NA") {
                    obj.RULEID = model[i].RULEID;
                    obj.USERID = controllerUSR._newIdUsr;
                    obj.DEL = model[i].DEL;
                    modInput.push(obj);
                    obj = new Object;
                }
            }
            input = {
                "DATA": JSON.stringify(modInput)
            };
            controllerUSR.getDataSync("UPDATE_USR_RULES", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.updateRulesSuccess, controllerUSR.transactionError);
        },

        updateRulesSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerUSR.getUsrInfo();
                MessageToast.show(controller.oBundle.getText("viewUsr.userRule"));
            }
            controllerUSR.byId("supplierUSR").clearSelection();
        },

        //FUNZIONI DASHBORD

        //Funzioni Ricerca
        handleValueHelp: function () {
            if (!controllerUSR._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.listusr",
                    controller: controllerUSR
                }).then(function (oValueHelpDialog) {
                    controllerUSR._oValueHelpDialog = oValueHelpDialog;
                    controllerUSR.getView().addDependent(controllerUSR._oValueHelpDialog);
                    controllerUSR._configValueHelpDialog();
                    controllerUSR._oValueHelpDialog.open();
                });
            } else {
                controllerUSR._configValueHelpDialog();
                controllerUSR._oValueHelpDialog.open();
            }
        },

        _configValueHelpDialog: function () {
            //var sInputValue = controllerUSR.byId("userInputList").getValue(),
			controllerUSR.getListUsr();
            var oModel = controllerUSR.getView().getModel(),
            aProducts = oModel.getProperty("/userlist");
            oModel.setProperty("/userlist", aProducts);
        },

        handleValueHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            try {
                controllerUSR.byId("userInputList").setValue(oSelectedItem.mProperties.title);
                controllerUSR.byId("inputUSR").setValue(oSelectedItem.mProperties.title);
                controllerUSR._oValueHelpDialog = undefined;
                controllerUSR.getUsrInfo();
            } catch (err) {
                controllerUSR._oValueHelpDialog = undefined;
            }
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
        },

        handleSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Usr", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        handleValueHelpRuleUsr: function (oEvent) {
	controllerUSR.rulesPath = oEvent.getSource().getBindingContext().sPath;
            if (!controllerUSR._oValueHelpDialogRules) {
                Fragment.load({
                    name: "master_data.view.popup.listusrrules",
                    controller: controllerUSR
                }).then(function (oValueHelpDialogRules) {
                    controllerUSR._oValueHelpDialogRules = oValueHelpDialogRules;
                    controllerUSR.getView().addDependent(controllerUSR._oValueHelpDialogRules);
                    controllerUSR._configValueHelpDialogRuleUsr();
                    controllerUSR._oValueHelpDialogRules.open();
                });
            } else {
                controllerUSR._configValueHelpDialogRuleUsr();
                controllerUSR._oValueHelpDialogRules.open();
            }
        },

        _configValueHelpDialogRuleUsr: function () {
			controllerUSR.getAllRues();
            var sInputValue = controllerUSR.byId("userInputList").getValue(),
            oModel = controllerUSR.getView().getModel(),
            aProducts = oModel.getProperty("/ruleslist");

            aProducts.forEach(function (oProduct) {
                oProduct.selected = (oProduct.Name === sInputValue);
            });
            oModel.setProperty("/ruleslist", aProducts);
        },

        handleValueHelpCloseRuleUsr: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            controllerUSR._ruleLvl = 0;
            controllerUSR.getSpecificRues(oSelectedItem.mProperties.title);
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
        },

        handleSearchRuleUsr: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("RULES", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        //Funzioni Ricerca
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
                req.done(jQuery.proxy(successFunc, controllerUSR));
                req.fail(jQuery.proxy(errorFunc, controllerUSR));
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
                req.done(jQuery.proxy(suss, controllerUSR));
                req.fail(jQuery.proxy(errf, controllerUSR));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },

        //FUNZIONI PER ESECUZIONI TRANSAZIONI

        /*Tab Ruoli*/
        closeDialog: function () {
	controllerUSR.rulesPath = ""; 
            controllerUSR._oValueHelpDialogRules = undefined;
        },

        /*Selezione Ruolo*/
        handleSearchRule: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("RULES", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        ruleValueHelp: function () {
            var input = {};

            input.LANGUAGE = controller.language;

            controllerUSR.getDataSync("GET_RULES_BY_LANG", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getRuleListSuccessHelpValue, controllerUSR.transactionError);

            if (!controllerUSR._oValueHelpDialogRules) {
                Fragment.load({
                    name: "master_data.view.popup.ruleList",
                    controller: controllerUSR
                }).then(function (oValueHelpDialogRules) {
                    controllerUSR._oValueHelpDialogRules = oValueHelpDialogRules;
                    controllerUSR.getView().addDependent(controllerUSR._oValueHelpDialogRules);
                    controllerUSR._oValueHelpDialogRules.open();
                });
            } else {
                this._oValueHelpDialogRules.open();
            }
        },

        getRuleListSuccessHelpValue: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            controllerUSR.usrModel.setProperty("/tabRuleList", JSON.parse(jsonArrStr)["Rows"]);
        },

        valueHelpRuleConfirm: function (oEvent) {
            try {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                controllerUSR.byId("ruleInputList").setValue(oSelectedItem.mProperties.title);
				controllerUSR.byId("ruleInputList").setEditable(false);
                controllerUSR.byId("inputRule").setValue(oSelectedItem.mProperties.title);
                controllerUSR.byId("inputRule").setEditable(false);
                controllerUSR.byId("inputRuleDescr").setValue(oSelectedItem.mProperties.description);
				controllerUSR.byId("inputRuleDescr").setEditable(true);
                controllerUSR.byId("ruleId").setText(oSelectedItem.mProperties.highlightText);
                controllerUSR._oValueHelpDialogRules = undefined;
				
				//Buttons
				controllerUSR.byId("btnNewRule").setEnabled(false);
				controllerUSR.byId("closeRule").setEnabled(true);
				controllerUSR.byId("btnDelRule").setEnabled(true);
				controllerUSR.byId("addActivityRule").setEnabled(true);
				controllerUSR.byId("saveRuleActivity").setEnabled(true);
				controllerUSR.isNewRole = false;				

                var Input = {
                    "RULE_ID": oSelectedItem.mProperties.highlightText,
                    "LANG": controller.language
                };

                var result = controllerUSR.sendData("GET_ACTIVITY_BY_RULE_ID", "USER/TRANS", Input);

                controllerUSR.usrModel.setProperty("/tabActivityRules", result);

            } catch (err) {}
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
        },

        cleanNewRule: function (isNewRule) {
			//Input Fields
			controllerUSR.byId("ruleId").setText("");
            controllerUSR.byId("ruleInputList").setValue("");
			controllerUSR.byId("ruleInputList").setEditable(!isNewRule);
            controllerUSR.byId("inputRule").setValue("");
			controllerUSR.byId("inputRule").setEditable(isNewRule);
			controllerUSR.byId("inputRuleDescr").setValue("");
			controllerUSR.byId("inputRuleDescr").setEditable(isNewRule);
			
			//Buttons
			controllerUSR.byId("btnNewRule").setEnabled(!isNewRule);
			controllerUSR.byId("closeRule").setEnabled(isNewRule);
			controllerUSR.byId("btnSaveRule").setEnabled(isNewRule);
			controllerUSR.byId("btnDelRule").setEnabled(isNewRule);
			controllerUSR.byId("addActivityRule").setEnabled(isNewRule);
			controllerUSR.byId("saveRuleActivity").setEnabled(false);
			
			//Models
			controllerUSR.isNewRole = isNewRule;
			controllerUSR.usrModel.setProperty("/tabDescrRule", []);
            controllerUSR.usrModel.setProperty("/tabActivityRules", []);
        },

        /*Salva le modifiche fatte al ruolo o il nuovo ruolo*/
        saveNewRule: function () {

            if (controllerUSR.byId("inputRule").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.missRule"))
            }

            var mod = controllerUSR.usrModel.getProperty("/tabDescrRule");

            if (mod.length === 0 && controllerUSR.byId("inputRuleDescr").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.misslang"));
            } else if (mod.length === 1 && controllerUSR.usrModel.getProperty("/tabDescrRule")[0]["LANG"] == controller.language) {
                var mod = [];
                var obj = {
                    ROLE_ID: controllerUSR.byId("ruleId").getText(),
                    DESCRIPTION: controllerUSR.byId("inputRuleDescr").getValue(),
                    LANG: controller.language,
                    DEL: "false"
                };
                mod.push(obj);
            }

            var input = {};

            input.RULE_ID = controllerUSR.byId("ruleId").getText();
            input.RULE = controllerUSR.byId("inputRule").getValue();
            input.DESCR = JSON.stringify(mod);

            controllerUSR.getDataSync("SAVE_RULE", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveNewRuleSuccess, controllerUSR.transactionError);
        },

        saveNewRuleSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText(jsonArr[0].MESSAGE));
            } else {
                controllerUSR.byId("ruleId").setText(jsonArr[0].MESSAGE);
                controllerUSR.updateRulesActivity(true);
                controllerUSR.cleanNewRule(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.ruleAdd"));
            }
        },

        deleteRule: function () {
            var input = {};
            input.RULE_ID = controllerUSR.byId("ruleId").getText();

            var bCompact = !!controllerUSR.getView().$().closest(".sapUiSizeCompact").length;
            MessageBox.confirm((controller.oBundle.getText("viewUsr.confirmDelRule") + " " + controllerUSR.byId("inputRule").getValue() + "?"), {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (evt) {
                    if (evt == "OK") {
                        controllerUSR.getDataSync("DELETE_RULE", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.deleteRuleSuccess, controllerUSR.transactionError);
                    }
                }
            });
        },

        deleteRuleSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText(jsonArr[0].MESSAGE));
            } else {
                controllerUSR.cleanNewRule(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.ruleDelete"));
            }
        },

        popRuleDescr: function () {

            if (!controllerUSR._popup) {
                controllerUSR._popup = sap.ui.xmlfragment("master_data.view.popup.modRule", controllerUSR);
                controllerUSR.getView().addDependent(controllerUSR._popup);
            }

            sap.ui.getCore().byId("inputRulePop").setValue(controllerUSR.byId("inputRule").getValue());

            //Estraggo le varie lingue del site
            var mod = controllerUSR.usrModel.getProperty("/tabDescrRule");

            if (mod.length === 0) {
                var Input = {
                    "RULE_ID": controllerUSR.byId("ruleId").getText()
                };
                var result = controllerUSR.sendData("GET_RULE_DESCRIPTION", "USER/TRANS", Input);

                controllerUSR.usrModel.setProperty("/tabDescrRule", result);
                controllerUSR.getView().setModel(controllerUSR.usrModel);
            }
            controllerUSR._popup.open();

        },

        sendData: function (Transaction, route, Input) {
            var results;
            var transactionCall = "ADIGE7/MASTER_DATA/" + route + "/" + Transaction;
            Input.TRANSACTION = transactionCall;
            Input.OutputParameter = "JSON";
            $.ajax({
                type: 'POST',
                data: Input,
                dataType: 'xml',
                async: false,
                url: "/XMII/Runner",
                success: function (data) {
                    results = JSON.parse(data.documentElement.textContent);
                },
                error: function searchError(xhr, err) {
                    console.error("Error on ajax call: " + err);
                    console.log(JSON.stringify(xhr));
                }
            });
            return results;
        },

        deleteDescrRule: function (oEvent) {
            var lineSel = controllerUSR.usrModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
            controllerUSR.usrModel.refresh();
        },

        newDescrRule: function () {
            var addRowModel = controllerUSR.usrModel.getProperty("/tabDescrRule");
            var row = {
                "RULE_ID": controllerUSR.byId("ruleId").getText(),
                "LANG": "",
                "DESCRIPTION": "",
                "DEL": "false"
            };
            addRowModel.push(row);
            controllerUSR.usrModel.setProperty("/tabDescrRule", addRowModel);
        },

        confirmEditRule: function () {
            var model = controllerUSR.usrModel.getProperty("/tabDescrRule");
            var arrInput = [];
            var bCompact = !!controllerSite.getView().$().closest(".sapUiSizeCompact").length;

            for (var i = 0; i < model.length; i++) {
                if (model[i].DEL == "false" || model[i].LANG != "") {
                    for (var j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANG == model[j].LANG & model[j].DEL == "false") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errRuleMod"), {
                                styleClass: bCompact ? "sapUiSizeCompact" : ""
                            });
                        }
                    }
                    if (model[i].LANG === controller.language && model[i].DEL === "false") {
                        controllerUSR.byId("inputRuleDescr").setValue(model[i]["DESCRIPTION"]);
                    }

                    arrInput.push(model[i]);
                }
            }
            //Controllo se arrInput == 0 non chiudo pop e do messaggio d'errore
            controllerUSR.usrModel.setProperty("/tabDescrRule", arrInput);
            controllerUSR.closePopup();
			
			//Enabled Buttons
			controllerUSR.byId("btnSaveRule").setEnabled(true);
			controllerUSR.byId("addActivityRule").setEnabled(false);
			controllerUSR.byId("saveRuleActivity").setEnabled(false);
        },

        closePopup: function () {
            controllerUSR._popup.close();
            controllerUSR._popup.destroy();
            controllerUSR._popup = undefined;
        },

        /*Aggiunta Attività al Ruolo*/
        addActivityRule: function () {
            var addRowModel = controllerUSR.usrModel.getProperty("/tabActivityRules");
            var newArr = [];
            var row = {
                "ACTIVITY_ID": "",
                "ACTIVITY": "",
                "DESCRIPTION": "",
                "EDITABLE": "true",
                "EDIT": "true",
                "DEL": "false"
            };
            if (!addRowModel) {

                newArr.push(row);
                controllerUSR.usrModel.setProperty("/tabActivityRules", newArr);
            } else {
                if (addRowModel.length === 0) {
                    newArr.push(row);
                    controllerUSR.usrModel.setProperty("/tabActivityRules", newArr);
                } else {
                    var addArr = controllerUSR.usrModel.getProperty("/tabActivityRules");
                    addArr.push(row);
                    controllerUSR.usrModel.setProperty("/tabActivityRules", addArr);
                }
            }
			
			//Input Field
			controllerUSR.byId("inputRule").setEditable(controllerUSR.isNewRole);
			controllerUSR.byId("inputRuleDescr").setEditable(controllerUSR.isNewRole);
			
			//Buttons			
			controllerUSR.byId("saveRuleActivity").setEnabled(!controllerUSR.isNewRole);	
			
			//Scroll to last table Element
			controllerUSR.byId("tabActivityRules").setFirstVisibleRow(addRowModel.length); 			
        },

        /*Salvo le Attività al ruolo tabUsrRules*/
        updateRulesActivity: function (newRole) {

            var mod = controllerUSR.usrModel.getProperty("/tabActivityRules");

            if (mod.length === 0) {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.missActivity"));
            }

            var Arr = [];
            var obj = {};

            for (var i = 0; i < mod.length; i++) {
                if (mod[i]["EDIT"] === "true") {
                    obj.ACTIVITY_ID = mod[i]["ACTIVITY_ID"];
                    obj.DEL = mod[i]["DEL"];
                    Arr.push(obj);
                    obj = new Object;
                }
            }

            var input = {};
            input.RULE_ID = controllerUSR.byId("ruleId").getText();
            input.ACTIVITY = JSON.stringify(Arr);
            if (!newRole) {
                controllerUSR.getDataSync("SAVE_ACTIVITY_ROLE", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveActivityRoleSuccess, controllerUSR.transactionError);
            } else {
                controllerUSR.getDataSync("SAVE_ACTIVITY_ROLE", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveActivityRoleSuccessNewRole, controllerUSR.transactionError);
            }
        },

        saveActivityRoleSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);

            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText(jsonArr[0].MESSAGE));
            } else {
                controllerUSR.cleanNewRule(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.activityRule"));
            }
        },

        saveActivityRoleSuccessNewRole: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);

            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText(jsonArr[0].MESSAGE));
            } else {
                controllerUSR.cleanNewRule(false);
            }
        },

        /*Selezione attività da associare ai ruoli*/
        handleSearchActivity: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("ACTIVITY", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        valueHelpActivityRule: function (oEvent) {

            controllerUSR.rulesPath = oEvent.oSource.oParent.oBindingContexts["undefined"].sPath;

            var input = {};
            input.LANGUAGE = controller.language;

            controllerUSR.getDataSync("GET_ACTIVITY_LIST", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getActivityListSuccess, controllerUSR.transactionError);

            if (!controllerUSR._oValueHelpDialogRules) {
                Fragment.load({
                    name: "master_data.view.popup.listActivities",
                    controller: controllerUSR
                }).then(function (oValueHelpDialogRules) {
                    controllerUSR._oValueHelpDialogRules = oValueHelpDialogRules;
                    controllerUSR.getView().addDependent(controllerUSR._oValueHelpDialogRules);
                    controllerUSR._oValueHelpDialogRules.open();
                });
            } else {
                controllerUSR._oValueHelpDialogRules.open();
            }
        },

        getActivityListSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            controllerUSR.usrModel.setProperty("/tabActivityList", JSON.parse(jsonArrStr));
        },

        valueHelpActivityConfirm: function (oEvent) {
            try {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["ACTIVITY"] = oSelectedItem.mProperties.title;
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["ACTIVITY_ID"] = oSelectedItem.mProperties.highlightText;
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["DESCRIPTION"] = oSelectedItem.mProperties.description;
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["EDIT"] = "true";
                controllerUSR.usrModel.getProperty(controllerUSR.rulesPath)["DEL"] = "false";
                controllerUSR.rulesPath = "";
                controllerUSR._oValueHelpDialogRules = undefined;
                controllerUSR.usrModel.refresh();
            } catch (err) {}
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
        },

        deleteActivityRule: function (oEvent) {
            var lineSel = controllerUSR.usrModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.EDIT = "true";
            lineSel.EDITABLE = "false";
            controllerUSR.usrModel.refresh();
			
			//Input Field
			controllerUSR.byId("inputRule").setEditable(controllerUSR.isNewRole);
			controllerUSR.byId("inputRuleDescr").setEditable(controllerUSR.isNewRole);
			
			//Buttons			
			controllerUSR.byId("saveRuleActivity").setEnabled(!controllerUSR.isNewRole);
        },
        /*-------*/

        /*Activity*/

        activityValueHelp: function () {

            var input = {};
            input.LANGUAGE = controller.language;

            controllerUSR.getDataSync("GET_ACTIVITY_LIST", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getActivityListSuccess, controllerUSR.transactionError);

            if (!controllerUSR._oValueHelpDialogRules) {
                Fragment.load({
                    name: "master_data.view.popup.listActivitiesMatchCode",
                    controller: controllerUSR
                }).then(function (oValueHelpDialogRules) {
                    controllerUSR._oValueHelpDialogRules = oValueHelpDialogRules;
                    controllerUSR.getView().addDependent(controllerUSR._oValueHelpDialogRules);
                    controllerUSR._oValueHelpDialogRules.open();
                });
            } else {
                controllerUSR._oValueHelpDialogRules.open();
            }
        },

        valueHelpActivityConfirmMatchCode: function (oEvent) {
            try {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var rowSel = controllerUSR.usrModel.getProperty(oEvent.oSource._oSelectedItem.oBindingContexts.undefined.sPath);
				//Input Fields
                controllerUSR.byId("actuvityInputList").setValue(oSelectedItem.mProperties.title);
                controllerUSR.byId("inputActivity").setValue(oSelectedItem.mProperties.title);
                controllerUSR.byId("activityId").setText(oSelectedItem.mProperties.highlightText);
                controllerUSR.byId("inputActivityDescr").setValue(oSelectedItem.mProperties.description);
                controllerUSR.byId("inputActivity").setEditable(false);
                controllerUSR.byId("inputActivityDescr").setEditable(false);                
                controllerUSR._oValueHelpDialogRules = undefined;
				
				//Buttons
				controllerUSR.byId("btnNewActivity").setEnabled(false);
				controllerUSR.byId("btnCloseActivity").setEnabled(true);
				controllerUSR.byId("saveNewActivity").setEnabled(false);
				controllerUSR.byId("btnDelActivity").setEnabled(true);
				controllerUSR.byId("btnAddDescr").setEnabled(true);
				controllerUSR.byId("btnSaveDescr").setEnabled(false);
                controllerUSR.getAllActivityDescription(oSelectedItem.mProperties.highlightText);
            } catch (err) {}
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
        },

        getAllActivityDescription: function (activityId) {
            var Input = {
                "ACTIVITY_ID": activityId
            };
            var result = controllerUSR.sendData("GET_ACTIVITY_DESCRIPTION", "USER/TRANS", Input);

            controllerUSR.usrModel.setProperty("/tabActivityDesc", result);
            controllerUSR.getView().setModel(controllerUSR.usrModel);
        },

        cleanNewActivity: function (isNewActivity) {
			//Input Fields
            controllerUSR.byId("actuvityInputList").setValue("");
			controllerUSR.byId("actuvityInputList").setEditable(!isNewActivity);
            controllerUSR.byId("inputActivity").setValue("");
            controllerUSR.byId("inputActivity").setEditable(isNewActivity);
            controllerUSR.byId("activityId").setText("");
            controllerUSR.byId("inputActivityDescr").setValue("");
            controllerUSR.byId("inputActivityDescr").setEditable(isNewActivity);
			
			//Buttons
			controllerUSR.byId("btnNewActivity").setEnabled(!isNewActivity);
			controllerUSR.byId("btnCloseActivity").setEnabled(isNewActivity);
			controllerUSR.byId("saveNewActivity").setEnabled(isNewActivity);
			controllerUSR.byId("btnDelActivity").setEnabled(isNewActivity);
			controllerUSR.byId("btnAddDescr").setEnabled(false);
            controllerUSR.byId("btnSaveDescr").setEnabled(false);
			
			//Models
            controllerUSR.usrModel.setProperty("/tabActivityList", []);
            controllerUSR.usrModel.setProperty("/tabActivityDesc", []);			
        },

        saveNewActivity: function () {
            if (controllerUSR.byId("inputActivity").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.missActivity"))
            }

            var input = {};

            input.ACTIVITY = controllerUSR.byId("inputActivity").getValue();
            input.DESCRIPTION = controllerUSR.byId("inputActivityDescr").getValue();
            input.LANGUAGE = controller.language;

            controllerUSR.getDataSync("SAVE_ACTIVITY", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveNewActivitySuccess, controllerUSR.transactionError);
        },

        saveNewActivitySuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText(jsonArr[0].MESSAGE));
            } else {
                controllerUSR.cleanNewActivity(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.activityAdd"));
            }
        },

        deleteActivity: function () {
            var input = {};
            input.ACTIVITY_ID = controllerUSR.byId("activityId").getText();

            controllerUSR.getDataSync("DELETE_ACTIVITY", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.deleteActivitySuccess, controllerUSR.transactionError);
        },

        deleteActivitySuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText(jsonArr[0].MESSAGE));
            } else {
                controllerUSR.cleanNewActivity(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.activityDelete"));
            }
        },

        addActivityDescription: function () {
            var addRowModel = controllerUSR.usrModel.getProperty("/tabActivityDesc");
            var row = {
                "LANGUAGE": "",
                "ACTIVITY_DESC": "",
                "EDIT": "true",
                "EDITABLE": "true",
                "DEL": "false"
            };
            addRowModel.push(row);
            controllerUSR.usrModel.setProperty("/tabActivityDesc", addRowModel);
			
			//Buttons
			controllerUSR.byId("btnSaveDescr").setEnabled(true);
        },

        deleteActivityDescr: function (oEvent) {
            var lineSel = controllerUSR.usrModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.EDIT = "true";
            lineSel.EDITABLE = "false";
            controllerUSR.usrModel.refresh();
			
			//Buttons
			controllerUSR.byId("btnSaveDescr").setEnabled(true);
        },

        saveActivityDescr: function () {
            var mod = controllerUSR.usrModel.getProperty("/tabActivityDesc");

            var Arr = [];
            var obj = {};

            for (var i = 0; i < mod.length; i++) {
                if (mod[i]["EDIT"] === "true") {
                    obj.LANG = mod[i]["LANGUAGE"];
                    obj.ACTIVITY_DESC = mod[i]["ACTIVITY_DESC"];
                    obj.DEL = mod[i]["DEL"];
                    Arr.push(obj);
                    obj = new Object;
                }
            }

            var c = 0;
            for (var i in Arr) {
                if (Arr[i].DEL != undefined) {
                    c++;
                }
            }

            if (mod.length - c === 0) {
                return MessageBox.warning(controller.oBundle.getText("viewUsr.missActivityDescr"));
            }

            var input = {};
            input.ACTIVITY_ID = controllerUSR.byId("activityId").getText();
            input.DATA = JSON.stringify(Arr);

            controllerUSR.getDataSync("SAVE_ACTIVITY_DESCR", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveActivityDescrSuccess, controllerUSR.transactionError);
        },

        saveActivityDescrSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);

            if (jsonArr[0].RC != "0") {
                MessageBox.error(controller.oBundle.getText(jsonArr[0].MESSAGE));
            } else {
                controllerUSR.cleanNewActivity(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.activityDescr"));
            }
        },

        setActivityDescriptioEditable: function(oEvent) {
            var lineSel = controllerUSR.usrModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
			
			//Buttons
			controllerUSR.byId("btnSaveDescr").setEnabled(true);
        },
		/*--------*/
		
		/*USER GRP*/
		newUsrGrp: function(isNewUserGrp){
			//Input Field
			controllerUSR.byId("usrGrpInputList").setValue("");
			controllerUSR.byId("usrGrpId").setText("");
			controllerUSR.byId("inputUsrGrp").setValue("");
			controllerUSR.byId("inputUsrGrpDescr").setValue("");
			controllerUSR.byId("usrGrpInputList").setEditable(!isNewUserGrp);			
			controllerUSR.byId("inputUsrGrp").setEditable(isNewUserGrp);
			controllerUSR.byId("inputUsrGrpDescr").setEditable(isNewUserGrp);
			//Button
			controllerUSR.byId("closeUsrGrp").setEnabled(isNewUserGrp);
			controllerUSR.byId("saveUsrGrp").setEnabled(isNewUserGrp);
			controllerUSR.byId("deleteUsrGrp").setEnabled(isNewUserGrp);
			controllerUSR.byId("addUser").setEnabled(false);
			controllerUSR.byId("saveUsrUsrGrp").setEnabled(false);
			//Model
			controllerUSR.usrModel.setProperty("/tabDescrUsrGrp", []);
			controllerUSR.usrModel.setProperty("/tabUsrUserGrp", []);
		},
		
		//Retrieve User Group
		usrGrpValueHelp: function () {
            var input = {};
			
			input.SITE_ID = controller.SiteId;
            input.LANGUAGE = controller.language;

            controllerUSR.getDataSync("GET_USER_GROUP_BY_LANG", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getUsrGroupListSuccess, controllerUSR.transactionError);
            
			controllerUSR._popup = Fragment.load({
				name: "master_data.view.popup.userGroupList",
				controller: controllerUSR
			}).then(function (oDialog) {				 
				controllerUSR.getView().addDependent(oDialog);
				oDialog.open();
				return oDialog
			});           
        },

        getUsrGroupListSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            controllerUSR.usrModel.setProperty("/tabUserGroupList", JSON.parse(jsonArrStr)["Rows"]);
        },
		
		handleSearchUserGrp: function(oEvent){
			var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("USER_GROUP", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
		},

        usrGrpValueHelpConfirm: function (oEvent) {
            try {
                var oSelectedItem = oEvent.getParameter("selectedItem");
				
				//Set Input Field values
                controllerUSR.byId("usrGrpInputList").setValue(oSelectedItem.mProperties.title);				
                controllerUSR.byId("usrGrpId").setText(oSelectedItem.mProperties.highlightText);
                controllerUSR.byId("inputUsrGrp").setValue(oSelectedItem.mProperties.title);                
                controllerUSR.byId("inputUsrGrpDescr").setValue(oSelectedItem.mProperties.description);
				controllerUSR.byId("inputUsrGrpDescr").setEditable(true);				
				controllerUSR.byId("inputUsrGrp").setEditable(false);
				
				//Button
				controllerUSR.byId("closeUsrGrp").setEnabled(true);
				controllerUSR.byId("saveUsrGrp").setEnabled(true);
				controllerUSR.byId("deleteUsrGrp").setEnabled(true);
				controllerUSR.byId("addUser").setEnabled(true);
				controllerUSR.byId("saveUsrUsrGrp").setEnabled(false);
				
                controllerUSR._popup = undefined;

                var Input = {
                    "USER_GROUP_ID": oSelectedItem.mProperties.highlightText
                };
				
				//Estraggo la lista utenti
                var result = controllerUSR.sendData("GET_USER_BY_USER_GROUP_ID", "USER/TRANS", Input)["Rows"];

                controllerUSR.usrModel.setProperty("/tabUsrUserGrp", result);
				
				//Estraggo le descrizioni
				var result = controllerUSR.sendData("GET_USER_GRP_DESCRIPTION", "USER/TRANS", Input)["Rows"];
				
				controllerUSR.usrModel.setProperty("/tabDescrUsrGrp", result);
            } catch (err) {}
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
        },
		
		usrGrpValueHelpCancel: function(){
			controllerUSR.newUsrGrp(false);
			controllerUSR._popup = undefined;
		},
		
		//Set Description
		popUsrGrpDescr: function () {
            controllerUSR._popup = sap.ui.xmlfragment("master_data.view.popup.modUsrGrpDescr", controllerUSR);
            controllerUSR.getView().addDependent(controllerUSR._popup);            

            sap.ui.getCore().byId("inputUsrGrpPop").setValue(controllerUSR.byId("inputUsrGrp").getValue());

            var mod = controllerUSR.usrModel.getProperty("/tabDescrUsrGrp");

            if (mod.length === 0) {
                var Input = {
                    "USER_GROUP_ID": controllerUSR.byId("usrGrpId").getText() === "" ? "0" : controllerUSR.byId("usrGrpId").getText()
                };
                var result = controllerUSR.sendData("GET_USER_GRP_DESCRIPTION", "USER/TRANS", Input);				
				controllerUSR.usrModel.setProperty("/tabDescrUsrGrp", result["Rows"]);				
            }
            controllerUSR._popup.open();
		},		
		
        newDescrUsrGrp: function () {
            var addRowModel = controllerUSR.usrModel.getProperty("/tabDescrUsrGrp");
            var row = {
                "USER_GROUP_ID": controllerUSR.byId("usrGrpId").getText(),
                "LANG": "",
                "DESCRIPTION": "",
                "DEL": "false"
            };
            addRowModel.push(row);
            controllerUSR.usrModel.setProperty("/tabDescrUsrGrp", addRowModel);
        },

        confirmEditUsrGrpDescr: function () {
            var model = controllerUSR.usrModel.getProperty("/tabDescrUsrGrp");
            var arrInput = [];

            for (var i = 0; i < model.length; i++) {
                if (model[i].DEL == "false" || model[i].LANG != "") {
                    for (var j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANG == model[j].LANG & model[j].DEL == "false") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errRuleMod"), {
                                styleClass: "sapUiSizeCompact"
                            });
                        }
                    }
                    if (model[i].LANG === controller.language && model[i].DEL === "false") {
                        controllerUSR.byId("inputUsrGrpDescr").setValue(model[i]["DESCRIPTION"]);
                    }

                    arrInput.push(model[i]);
                }
            }
            //Controllo se arrInput == 0 non chiudo pop e do messaggio d'errore
            controllerUSR.usrModel.setProperty("/tabDescrUsrGrp", arrInput);
			controllerUSR.byId("saveUsrGrp").setEnabled(true);
            controllerUSR.closePopup();
        },
		
		deleteDescrUsrGrp: function (oEvent) {
            var lineSel = controllerUSR.usrModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            controllerUSR.usrModel.refresh();
        },
		
		//Save User Group
		saveUsrGrp: function(){

            if (controllerUSR.byId("inputUsrGrp").getValue() == "") {
                return MessageBox.warning(controller.oBundle.getText("controllerUsr.missUserGroup"))
            }

            var mod = controllerUSR.usrModel.getProperty("/tabDescrUsrGrp");

            if (mod.length === 0 && controllerUSR.byId("inputUsrGrpDescr").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("controllerUsr.missDescription"));
            } else if (mod.length === 1 && controllerUSR.usrModel.getProperty("/tabDescrUsrGrp")[0]["LANG"] == controller.language) {
                var mod = [];
                var obj = {
                    DESCRIPTION: controllerUSR.byId("inputUsrGrpDescr").getValue(),
                    LANG: controller.language,
                    DEL: "false"
                };
                mod.push(obj);
            }

            var input = {};

            input.USER_GROUP_ID = controllerUSR.byId("usrGrpId").getText();
			input.SITE_ID = controller.SiteId;
            input.USER_GROUP = controllerUSR.byId("inputUsrGrp").getValue();
            input.DESCR = JSON.stringify(mod);

            controllerUSR.getDataSync("SAVE_USER_GROUP", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveNewUsrGrpSuccess, controllerUSR.transactionError);
        },

        saveNewUsrGrpSuccess: function (data, response) {            
            var jsonArr = JSON.parse(jQuery(data).find("Row").text());
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerUSR.byId("usrGrpId").setText(jsonArr[0].MESSAGE);                
                MessageToast.show(controller.oBundle.getText("controllerUsr.userGroupAdd"));
				controllerUSR.byId("inputUsrGrp").setEditable(false);
				
				//Button
				controllerUSR.byId("closeUsrGrp").setEnabled(true);
				controllerUSR.byId("saveUsrGrp").setEnabled(false);
				controllerUSR.byId("deleteUsrGrp").setEnabled(true);
				controllerUSR.byId("addUser").setEnabled(true);
				controllerUSR.byId("saveUsrUsrGrp").setEnabled(false);
            }
        },
		
		//Delete User Group
		deleteUsrGrp: function () {			
			MessageBox.confirm((controller.oBundle.getText("controllerUsr.confirmUserGrp") + " " + controllerUSR.byId("inputUsrGrp").getValue() + "?"), {
                styleClass: "sapUiSizeCompact",
                onClose: function (evt) {
                    if (evt == "OK") {
                        var input = {};
						input.USER_GROUP_ID = controllerUSR.byId("usrGrpId").getText();

						controllerUSR.getDataSync("DELETE_USER_GROUP", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.deleteUsrGrpSuccess, controllerUSR.transactionError);
                    }
                }
            });
        },

        deleteUsrGrpSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerUSR.newUsrGrp(false);
                MessageToast.show(controller.oBundle.getText("viewUsr.usrGrpDeleteSucc"));
            }
        },
		
		//Add User to User Group		
		addUsrUsrGrp: function(){
			var addUsrUsrGrpModel = controllerUSR.usrModel.getProperty("/tabUsrUserGrp");
            var newArr = [];
            var row = {
                "USER_ID": "",
                "USR": "",
                "NAME": "",
                "EDITABLE": "true",
                "EDIT": "true",
                "DEL": "false"
            };
			
            if (!addUsrUsrGrpModel) {
                newArr.push(row);
                controllerUSR.usrModel.setProperty("/tabUsrUserGrp", newArr);
            } else {
                if (addUsrUsrGrpModel.length === 0) {
                    newArr.push(row);
                    controllerUSR.usrModel.setProperty("/tabUsrUserGrp", newArr);
                } else {
                    var addArr = controllerUSR.usrModel.getProperty("/tabUsrUserGrp");
                    addArr.push(row);
                    controllerUSR.usrModel.setProperty("/tabUsrUserGrp", addArr);
                }
            }
			//Enabled Save
			controllerUSR.byId("saveUsrUsrGrp").setEnabled(true);
			controllerUSR.byId("saveUsrGrp").setEnabled(false);
			controllerUSR.byId("inputUsrGrpDescr").setEditable(false);
			
			//Scroll to last table Element
			controllerUSR.byId("tabUsrUsrGrp").setFirstVisibleRow(addUsrUsrGrpModel.length); 
		},	
		
		valueHelpUsr: function(oEvent){
			var input = {};
			controllerUSR.userUserGrpSelPath = oEvent.oSource.oParent.oBindingContexts["undefined"].sPath;
			
            input.SITE_ID = controller.SiteId;

            controllerUSR.getDataSync("GET_LIST_USER", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.getAllUserListForMatchcode, controllerUSR.transactionError);
            
			controllerUSR._popup = Fragment.load({
				name: "master_data.view.popup.userListForUsrGroup",
				controller: controllerUSR
			}).then(function (oDialog) {				 
				controllerUSR.getView().addDependent(oDialog);
				oDialog.open();
				return oDialog
			}); 
		},
		
		getAllUserListForMatchcode: function (data, response) {            
            controllerUSR.usrModel.setProperty("/userList", JSON.parse(jQuery(data).find("Row").text())["Rows"]);
        },	
		
		valueHelpUsrConfirm: function(oEvent){
			try {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                controllerUSR.usrModel.getProperty(controllerUSR.userUserGrpSelPath)["USR"] = oSelectedItem.mProperties.title;
                controllerUSR.usrModel.getProperty(controllerUSR.userUserGrpSelPath)["USER_ID"] = oSelectedItem.mProperties.highlightText;
                controllerUSR.usrModel.getProperty(controllerUSR.userUserGrpSelPath)["NAME"] = oSelectedItem.mProperties.description;
				controllerUSR.usrModel.getProperty(controllerUSR.userUserGrpSelPath)["EDITABLE"] = "true";
                controllerUSR.usrModel.getProperty(controllerUSR.userUserGrpSelPath)["EDIT"] = "true";
                controllerUSR.usrModel.getProperty(controllerUSR.userUserGrpSelPath)["DEL"] = "false";
                controllerUSR.userUserGrpSelPath = "";
                controllerUSR._popup = undefined;
                controllerUSR.usrModel.refresh();
            } catch (err) {}
			
			//Remove Filter Value
            oEvent.getSource().getBinding("items").filter([]);
		},
		
		valueHelpUsrCancel: function(){
			controllerUSR._popup = undefined;
		},		
		
		//Delete User to User Group
		deleteUsrUsrGrp: function(oEvent){
			var lineSel = controllerUSR.usrModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.EDIT = "true";
            lineSel.EDITABLE = "false";
            controllerUSR.usrModel.refresh();
			
			//Enabled Save
			controllerUSR.byId("saveUsrUsrGrp").setEnabled(true);
			controllerUSR.byId("saveUsrGrp").setEnabled(false);
			controllerUSR.byId("inputUsrGrpDescr").setEditable(false);
		},
		
		//Save User to User Group
		saveUserUserGrp: function(){
			var modUserList = controllerUSR.usrModel.getProperty("/tabUsrUserGrp"), arrUserList = [], obj = {};
			
            if (modUserList.length === 0) {
                return MessageBox.warning(controller.oBundle.getText("controllerUsr.addUserToUserGroup"));
            } 
			
			for(var i = 0; i < modUserList.length; i++){
				if(modUserList[i]["EDIT"] === "true"){
					obj = {
						USER_ID: modUserList[i]["USER_ID"],
						DEL: modUserList[i]["DEL"]
					};
					arrUserList.push(obj);
					obj = new Object;
				}
            }

            var input = {};

            input.USER_GROUP_ID = controllerUSR.byId("usrGrpId").getText();
            input.DATA = JSON.stringify(arrUserList);

            controllerUSR.getDataSync("SAVE_USER_TO_USER_GROUP", "ADIGE7/MASTER_DATA/USER/TRANS", input, controllerUSR.saveUserUserGrpSuccess, controllerUSR.transactionError);
        },

        saveUserUserGrpSuccess: function (data, response) {            
            var jsonArr = JSON.parse(jQuery(data).find("Row").text());
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {                
                MessageToast.show(controller.oBundle.getText("controllerUsr.userGroupAdd"));
				controllerUSR.newUsrGrp(false);
            }
        },
		
        /*--------*/
        /*Press User tab bar*/

        pressUserTabBar: function (oEvent) {
            var selKey = oEvent.getSource().getSelectedKey();
            switch (selKey) {
			 case "USR_GRP":
                controllerUSR.newUsrGrp(false);
                break;
            case "USER":
                controllerUSR.cleanNewUsr(false);
                break;
            case "RULE":
				controllerUSR.cleanNewRule(false);
                break;
            case "ACTIVITY":
				controllerUSR.cleanNewActivity(false);
                break;
            default:
                //No Action
            }
        }
        /*-------------------*/
    });
});
