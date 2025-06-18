var controllerSite;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
    ], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("master_data.controller.Site", {
        siteModel: new sap.ui.model.json.JSONModel(),
        _popup: undefined,

        onInit: function () {
            controllerSite = this;
			controllerSite.getSite();
        },

        getSite: function () {
            sap.ui.core.BusyIndicator.show();

            var params = {
                "TRANSACTION": "ADIGE7/MASTER_DATA/SITE/TRANSACTION/GET_SITE",
                "LANGUAGE": controller.language,
                "OutputParameter": "JSON"
            };

            try {
                var req = jQuery.ajax({
                    url: "/XMII/Runner",
                    data: params,
                    method: "POST",
                    dataType: "xml",
                    async: true
                });
                req.done(jQuery.proxy(controllerSite.getSiteSuccess, controllerSite));
                req.fail(jQuery.proxy(controllerSite.getSiteError, controllerSite));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },

        getSiteSuccess: function (data) {
            sap.ui.core.BusyIndicator.hide();
            try {
				//Enabled Save/Undo Button
				controllerSite.byId("undoNewSite").setEnabled(false);
				controllerSite.byId("btnSaveSite").setEnabled(false);
				
                var model = JSON.parse(jQuery(data).find("Row").text());
                controllerSite.siteModel.setProperty("/tabSite", model);
                controllerSite.getView().setModel(controllerSite.siteModel);
            } catch (e) {
                MessageBox.warning("TRANSACTION ERROR: GET_SITE. Main Controller line: 43", {
                    onClose: function () {}
                });
            }
        },

        getSiteError: function (error) {
            console.log(error);
            sap.ui.core.BusyIndicator.hide();
        },
		
		//Abilito la modifica del Sito
		editSite: function (oEvent) {
            var oRowSel = controllerSite.siteModel.getProperty(oEvent.oSource.getBindingContext().sPath);   
			oRowSel["EDIT"] = "true";
			oRowSel["NEW_SITE"] = "false";
			controllerSite.siteModel.refresh();
			
			//Enabled Save/Undo Button
			controllerSite.byId("undoNewSite").setEnabled(true);
			controllerSite.byId("btnSaveSite").setEnabled(true);
        },		

        editSiteDescr: function (evt) {
            var lineSel = controllerSite.siteModel.getProperty(evt.oSource.getBindingContext().sPath);

            if (!controllerSite._popup) {
                controllerSite._popup = sap.ui.xmlfragment("master_data.view.popup.modSite", controllerSite);
                controllerSite.getView().addDependent(controllerSite._popup);
            }
            sap.ui.getCore().byId("inputSite").setValue(lineSel.SITE);

            //Estraggo le varie lingue del site
            var Input = {
                "SITE_ID": lineSel.SITE_ID
            };
            var result = controllerSite.sendData("GET_SITE_DESCR", "SITE/TRANSACTION", Input);

            controllerSite.siteModel.setProperty("/tabDescrSite", result);
            controllerSite.getView().setModel(controllerSite.siteModel);

            controllerSite._popup.open();			
        },

        confirmEditSiteDescr: function () {
            var model = controllerSite.siteModel.getProperty("/tabDescrSite");
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

            var jsonInput = JSON.stringify(arrInput);

            var Input = {
                "DATA": jsonInput
            };
            var result = controllerSite.sendData("EDIT_SITE_DESCR", "SITE/TRANSACTION", Input);

            if (result[0].RC == "0") {
                controllerSite.closePopup();
                controllerSite.getSite();
            } else {
                MessageBox.warning(result[0].MESSAGE, {
                    styleClass: bCompact ? "sapUiSizeCompact" : ""
                });
            }
        },

        deleteDescrSite: function (evt) {
            var lineSel = controllerSite.siteModel.getProperty(evt.oSource.getBindingContext().sPath);
            lineSel.DEL = true;
			lineSel.NEW_SITE = "false";
            controllerSite.siteModel.refresh();
        },

        newDescrSite: function () {
            var addRowModel = controllerSite.siteModel.getProperty("/tabDescrSite");
            var row = {
                "SITE_ID": controllerSite.siteModel.getProperty("/tabDescrSite")[0]["SITE_ID"],
                "LANG": "",
                "SITE_DESCR": "",
                "DEL": "false",
            };
            addRowModel.push(row);
            controllerSite.siteModel.setProperty("/tabDescrSite", addRowModel);
			
			//Enabled Save/Undo Button
			controllerSite.byId("undoNewSite").setEnabled(true);
			controllerSite.byId("btnSaveSite").setEnabled(true);
        },

        deleteSite: function (evt) {
            var lineSel = controllerSite.siteModel.getProperty(evt.oSource.getBindingContext().sPath);
            var siteId = {
                "SITE_ID": lineSel.SITE_ID
            };

            var bCompact = !!controllerSite.getView().$().closest(".sapUiSizeCompact").length;
            MessageBox.confirm((controller.oBundle.getText("contrSite.confirmDeleteSite") + " " + lineSel.SITE + "?"), {
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (evt) {
                    if (evt == "OK") {
                        var resp = controllerSite.sendData("DELETE_SITE", "SITE/TRANSACTION", siteId);
                        if (resp[0].RC == "0") {
                            controllerSite.getSite();
                        } else {
                            MessageBox.warning(controller.oBundle.getText(resp[0].MESSAGE), {
                                styleClass: bCompact ? "sapUiSizeCompact" : ""
                            });

                        }
                    }
                }
            });
        },

        newSite: function () {
            var addRowModel = controllerSite.siteModel.getProperty("/tabSite");
            var row = {
                "SITE_ID": "",
                "SITE": "",
                "SITE_DESCR": "",
				"WERKS": "",
                "EDIT": "true",				
				"NEW_SITE": "true"
            };
            if (addRowModel.length === 0) {
                var newArr = [];
                newArr.push(row);
                controllerSite.siteModel.setProperty("/tabSite", newArr);
            } else {
                var addArr = controllerSite.siteModel.getProperty("/tabSite");
                addArr.push(row);
                controllerSite.siteModel.setProperty("/tabSite", addArr);
            }
			
			//Enabled Save/Undo Button			
			controllerSite.byId("undoNewSite").setEnabled(true);
			controllerSite.byId("btnSaveSite").setEnabled(true);
        },

        saveNewSite: function () {
            var Input = {};
            var model = controllerSite.siteModel.getProperty("/tabSite");

            //Verifico e costruisco il modello per salvare i dati del site
            var modInput = [];
            var obj = {};

            for (var i = 0; i < model.length; i++) {
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

            Input = {
                "DATA": JSON.stringify(modInput)
            };

            var result = controllerSite.sendData("SAVE_SITE", "SITE/TRANSACTION", Input);
            if (result[0].RC != "0") {
                MessageBox.warning(controller.oBundle.getText("contrSite.insertSiteKO") + " " + result[0].MESSAGE, {
                    onClose: function () {}
                });
            } else {
                MessageToast.show(controller.oBundle.getText("contrSite.insertSiteOK"));
            }
            controllerSite.getSite();
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

        closePopup: function () {
            controllerSite.byId("tabSite").setSelectedIndex(-1);
            controllerSite._popup.close();
            controllerSite._popup.destroy();
            controllerSite._popup = undefined;
        },
    });
});
