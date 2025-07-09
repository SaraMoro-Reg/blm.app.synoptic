var controllerSite;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
		"sap/ui/core/Fragment"
    ], function (Controller, MessageToast, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("master_data.controller.Site", {
        siteModel: new sap.ui.model.json.JSONModel({
			"viewSiteElements": {
				"editMode": false
			},
			"tabDescrSite": [],
			"tabSite": []
		}),
        _popup: undefined,

        onInit: function () {
            controllerSite = this;
			controllerSite.siteModel.setSizeLimit(10000);
			controllerSite.getView().setModel(controllerSite.siteModel);
			controllerSite.getSite();			
        },

        getSite: function () {
            controller.getDataSync("GET_SITE", "ADIGE7/MASTER_DATA/SITE/TRANSACTION", {"LANGUAGE": controller.language}, controllerSite.getSiteSuccess, controllerSite.getSiteError,  controllerSite, true);
        },

        getSiteSuccess: function (data) {
            sap.ui.core.BusyIndicator.hide();
            try {
				//Enabled Save/Undo Button
				controllerSite.siteModel.setProperty("/viewSiteElements/editMode", false);
				
                controllerSite.siteModel.setProperty("/tabSite", JSON.parse(jQuery(data).find("Row").text()));
                
            } catch (e) {
                MessageBox.warning("TRANSACTION ERROR: GET_SITE. Main Controller line: 34", {
                    onClose: function () {}
                });
            }
        },

        getSiteError: function (error) {
			sap.ui.core.BusyIndicator.hide();
            console.log(error);            
        },
		
		//Abilito la modifica del Sito
		editSite: function (oEvent) {
            let oRowSel = controllerSite.siteModel.getProperty(oEvent.oSource.getBindingContext().sPath);   
			
			oRowSel["EDIT"] = "true";			
			oRowSel["NEW_SITE"] = "false";
			
			controllerSite.siteModel.refresh();
			
			//Enabled Save/Undo Button
			controllerSite.siteModel.setProperty("/viewSiteElements/editMode", true);
        },		

        editSiteDescr: function (evt) {
            let oRowSel = controllerSite.siteModel.getProperty(evt.oSource.getBindingContext().sPath);
			
			Fragment.load({
                name: "master_data.view.popup.site.modSite",
                controller: controllerSite
            }).then(function (oValueHelpDialog) {
                controllerSite._popup = oValueHelpDialog;
                controllerSite.getView().addDependent(controllerSite._popup);
				
                sap.ui.getCore().byId("inputSite").setValue(oRowSel.SITE);
				
				//Estraggo le varie descrizioni in lingua del site
				let oInput = {
					"SITE_ID": oRowSel.SITE_ID
				}, aResult = controller.sendData("GET_SITE_DESCR", "SITE/TRANSACTION", oInput);

				controllerSite.siteModel.setProperty("/tabDescrSite", aResult);
			
                controllerSite._popup.open();
            });			
        },

        confirmEditSiteDescr: function () {
            let model = controllerSite.siteModel.getProperty("/tabDescrSite"),
				arrInput = [];

            for (var i = 0; i < model.length; i++) {
                if (model[i].DEL == "false" || model[i].LANG != "") {
                    for (var j = i + 1; j < model.length; j++) {
                        if (i != j & model[i].LANG == model[j].LANG & model[j].DEL == "false") {
                            return MessageBox.warning(controller.oBundle.getText("contrSite.errSiteMod"), {
                                styleClass: "sapUiSizeCompact"
                            });
                        }
                    }
                    arrInput.push(model[i]);
                }
            }

            let oInput = {
                "DATA": JSON.stringify(arrInput)
            }, result = controller.sendData("EDIT_SITE_DESCR", "SITE/TRANSACTION", oInput);

            if (result[0].RC == "0") {
                controllerSite.closePopup();
                controllerSite.getSite();
            } else {
                MessageBox.warning(result[0].MESSAGE, {
                    styleClass: "sapUiSizeCompact"
                });
            }
        },

        deleteDescrSite: function (evt) {
            let oRowSel = controllerSite.siteModel.getProperty(evt.oSource.getBindingContext().sPath);
            
			oRowSel.DEL = true;
			oRowSel.NEW_SITE = "false";
            controllerSite.siteModel.refresh();
        },

        newDescrSite: function () {
            let addRowModel = controllerSite.siteModel.getProperty("/tabDescrSite"),
				row = {
					"SITE_ID": controllerSite.siteModel.getProperty("/tabDescrSite")[0]["SITE_ID"],
					"LANG": "",
					"SITE_DESCR": "",
					"DEL": "false",
				};
           
			addRowModel.push(row);
            controllerSite.siteModel.setProperty("/tabDescrSite", addRowModel);
			
			//Enabled Save/Undo Button
			controllerSite.siteModel.setProperty("/viewSiteElements/editMode", true);
        },

        deleteSite: function (evt) {
            let oRowSel = controllerSite.siteModel.getProperty(evt.oSource.getBindingContext().sPath),
				oInput = {
					"SITE_ID": oRowSel.SITE_ID
				};
            MessageBox.confirm((controller.oBundle.getText("contrSite.confirmDeleteSite") + " " + oRowSel.SITE + "?"), {
                styleClass: "sapUiSizeCompact",
                onClose: function (evt) {
                    if (evt == "OK") {
                        let aResult = controller.sendData("DELETE_SITE", "SITE/TRANSACTION", oInput);
                        if (aResult[0].RC == "0") {
                            controllerSite.getSite();
                        } else {
                            MessageBox.warning(controller.oBundle.getText(aResult[0].MESSAGE), {
                                styleClass: "sapUiSizeCompact"
                            });
                        }
                    }
                }
            });
        },

        newSite: function () {
            let addRowModel = controllerSite.siteModel.getProperty("/tabSite"),
				row = {
					"SITE_ID": "",
					"SITE": "",
					"SITE_DESCR": "",
					"WERKS": "",
					"EDIT": "true",				
					"NEW_SITE": "true"
				};
				
            if (addRowModel.length === 0) {
                let newArr = [];
                newArr.push(row);
                controllerSite.siteModel.setProperty("/tabSite", newArr);
            } else {
                let addArr = controllerSite.siteModel.getProperty("/tabSite");
                addArr.push(row);
                controllerSite.siteModel.setProperty("/tabSite", addArr);
            }
			
			//Enabled Save/Undo Button			
			controllerSite.siteModel.setProperty("/viewSiteElements/editMode", true);
        },

        saveNewSite: function () {
            let oInput = {},
				model = controllerSite.siteModel.getProperty("/tabSite"),
				//Verifico e costruisco il modello per salvare i dati del site
				modInput = [],
				obj = {};

            for (let i = 0; i < model.length; i++) {
                if (model[i].SITE === "") {
                    return MessageBox.warning(controller.oBundle.getText("contrSite.errMissSite"), {
                        onClose: function () {}
                    });
                }
                if (model[i].SITE_DESCR === "") {
                    return MessageBox.warning(controller.oBundle.getText("contrSite.errMissSiteDescr"), {
                        onClose: function () {}
                    });
                }
                if (model[i].EDIT === "true") {
					obj.SITE_ID = model[i].SITE_ID;
                    obj.SITE = model[i].SITE;
                    obj.LANGUAGE = controller.language;
                    obj.SITE_DESCR = model[i].SITE_DESCR;
					obj.WERKS = model[i].WERKS;
                    modInput.push(obj);
                    obj = new Object;
                }
            }

            if (modInput.length === 0)
                return MessageToast.show(controller.oBundle.getText("contrSite.insertSite"));

            oInput = {
                "DATA": JSON.stringify(modInput)
            };

            let aResult = controller.sendData("SAVE_SITE", "SITE/TRANSACTION", oInput);
            if (aResult[0].RC != "0") {
                MessageBox.warning(controller.oBundle.getText("contrSite.insertSiteKO") + " " + aResult[0].MESSAGE, {
                    onClose: function () {}
                });
            } else {
                MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
            }
            controllerSite.getSite();
        },       

        closePopup: function () {
            controllerSite.byId("tabSite").setSelectedIndex(-1);
            controllerSite._popup.close();
            controllerSite._popup.destroy();
            controllerSite._popup = undefined;
        },
    });
});
