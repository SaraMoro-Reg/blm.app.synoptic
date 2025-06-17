var controller;
sap.ui.define([
        'sap/ui/core/mvc/Controller',
        'sap/m/MessageToast',
        'sap/m/MessageBox',
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
        'sap/ui/util/XMLHelper',
        'sap/base/util/UriParameters'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator, XMLHelper, UriParameters) {
    "use strict";

    return Controller.extend("main.controller.Main", {
        model: new sap.ui.model.json.JSONModel(),
        siteId: "",
        site: "ADIGE",
        oBundle: undefined,
        _popup: undefined,
        lang: "",
        UriParameters: new UriParameters(window.location.href),

        onInit: function () {
            controller = this;

            //Default Site da NetWeaver
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", "/XMII/PropertyAccessServlet?Mode=Retrieve&PropName=DEFAULT_SITE&Content-Type=text/xml", false);
            xmlHttp.send();
            var xmlResponse = XMLHelper.parse(xmlHttp.responseText);

            if (controller.UriParameters.get("SITE") !== null) {
                controller.site = controller.UriParameters.get("SITE");
            } else {
                controller.site = jQuery(xmlResponse).find("Value").text();
            }

            controller.getUserID();

            try {
                //Imposto la lingua del browser in base all'utente
                controller.lang = controller.model.getProperty("/user")[0].Language;
            } catch (err) {
                controller.lang = "IT";
            }
            sap.ui.getCore().getConfiguration().setLanguage(controller.lang.toLowerCase());
        },

        onAfterRendering: function () {
            controller.oBundle = controller.getView().getModel("i18n").getResourceBundle();

            //Genero tile
            var modelTile = controller.sendData("GET_TILE_INFO", "TRANSACTION", {
                "SITE": controller.site
            });

            controller.model.setProperty("/tileModel", modelTile[0]["TILE_MODEL"]);
            controller.model.setProperty("/OriginalTileModel", JSON.parse(JSON.stringify(modelTile[0]["TILE_MODEL"])));

            var modFilter = modelTile[0]["FILTER_LIST"];

            for (var i = 0; i < modFilter.length; i++) {
                try {
                    modFilter[i]["SEARCH_FIELD"] = controller.oBundle.getText(modFilter[i]["TILE_NAME"]);
                } catch (err) {
                    modFilter[i]["SEARCH_FIELD"] = modFilter[i]["TILE_NAME"];
                }
            }

            controller.model.setProperty("/filterList", modFilter);
        },

        /*Filtro Tile*/
        onSuggest: function (oEvent) {
            var sValue = oEvent.getParameter("suggestValue"),
            aFilters = [];
            if (sValue) {
                aFilters = [
                    new Filter([
                            new Filter("SEARCH_FIELD", function (sText) {
                                return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                            })], false)
                ];
            }

            controller.byId("searchField").getBinding("suggestionItems").filter(aFilters);
            controller.byId("searchField").suggest();
        },

        onSearch: function (oEvent) {
            var searchString = oEvent.mParameters.query;

            if (searchString != "") {
                var modTile = controller.model.getProperty("/filterList");
                var launchApp = false;
                var launchString = "";
                var ArrTileListModel = [];
                var tmpObj = {};

                for (var i = 0; i < modTile.length; i++) {
                    if (controller.oBundle.getText(modTile[i]["TILE_NAME"]) === searchString) {
                        launchApp = true;
                        launchString = "controller." + modTile[i]["TILE_PRESS"] + "();";
                        break;
                    } else {
                        if (controller.oBundle.getText(modTile[i]["TILE_NAME"]).toUpperCase().includes(searchString.toUpperCase())) {
                            //Creo la lista di eventuali Tile da usare come filtro
                            tmpObj.HEADER = modTile[i]["TILE_NAME"];
                            tmpObj.SUBTITLE = modTile[i]["TILE_NAME"];
                            tmpObj.TILE_ICON = modTile[i]["TILE_ICON"];
                            tmpObj.TILE_PRESS = modTile[i]["TILE_PRESS"];
                            ArrTileListModel.push(tmpObj);
                            tmpObj = new Object;
                        }
                    }
                }

                if (launchApp) {
                    //Lancio la relativa App
                    eval(launchString);
                } else {
                    //Filtro le Tile creando un nuovo modello
                    var ArrFinalModel = [];
                    tmpObj = new Object;

                    tmpObj.SECTION_TITLE = controller.oBundle.getText("result") + " (" + ArrTileListModel.length + ")";
                    tmpObj.tiles = ArrTileListModel;

                    ArrFinalModel.push(tmpObj);
                    controller.model.setProperty("/tileModel", ArrFinalModel);
                }
            } else {
                //Ripristino il modello originale
                controller.model.setProperty("/tileModel", JSON.parse(JSON.stringify(controller.model.getProperty("/OriginalTileModel"))));
            }
        },

        /*---*/

        onSelectSite: function () {
            var modelMenuSite = controller.sendData("GET_ALL_SITE", "TRANSACTION", {
                "LANGUAGE": controller.lang
            });
            controller.model.setProperty("/SelectionSite", modelMenuSite);

            controller._popup = sap.ui.xmlfragment("main.view.siteList", controller);
            controller.getView().addDependent(controller._popup);
            controller._popup.open();
        },

        handleSearchSite: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("SITE", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        onChangeSite: function (oEvent) {
            var selRow = oEvent.getParameter("selectedItem").getBindingContext().getObject();
            controller.site = selRow["SITE"];
            controller.siteId = selRow["SITE_ID"];

            controller.getUserID();

            //Genero tile
            var modelTile = controller.sendData("GET_TILE_INFO", "TRANSACTION", {
                "SITE": controller.site
            });
            controller.model.setProperty("/tileModel", modelTile[0]["TILE_MODEL"]);
            controller.model.setProperty("/OriginalTileModel", JSON.parse(JSON.stringify(modelTile[0]["TILE_MODEL"])));

            var modFilter = modelTile[0]["FILTER_LIST"];

            for (var i = 0; i < modFilter.length; i++) {
                try {
                    modFilter[i]["SEARCH_FIELD"] = controller.oBundle.getText(modFilter[i]["TILE_NAME"]);
                } catch (err) {
                    modFilter[i]["SEARCH_FIELD"] = modFilter[i]["TILE_NAME"];
                }
            }
            controller.model.setProperty("/filterList", modFilter);
        },

        onAvatarPressed: function (oEvent) {
            controller._popup = sap.ui.xmlfragment("main.view.avatarPopup", controller);
            controller.getView().addDependent(controller._popup);
            controller._popup.openBy(oEvent.getSource());
        },

        handleLogOff: function () {
            var params = {
                "Service": "Logout",
                "Session": "false",
                "content-Type": "text/xml"
            };
            $.ajax({
                type: 'POST',
                data: params,
                async: false,
                url: "/XMII/Illuminator",
                success: function (data) {
                    try {
                        var urll = window.location.pathname + window.location.search;
                        history.pushState({}, null, urll)
                        location.reload(true);
                    } catch (err) {}
                },
                error: function searchError(xhr, err) {
                    console.error("Error on ajax call: " + err);
                    console.log(JSON.stringify(xhr));
                }
            });
        },

        sendData: function (Transaction, route, Input) {
            var results;
            var transactionCall = "ADIGE7/MAIN/" + route + "/" + Transaction;
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

        //Da modificare
        getUserID: function () {
            var Input = {
                "SITE": controller.site
            };
            var result = controller.sendData("GET_USER_INFORMATIONS", "TRANSACTION", Input);

            try {
                var arrAvatar = result[0]["Name"].split(",");
                result[0].AVATAR = arrAvatar[0].charAt(0) + arrAvatar[1].trim().charAt(0);
            } catch (err) {}

            controller.model.setProperty("/user", result);
            //Ottengo il SiteId
            controller.siteId = result[0]["SiteId"];

            controller.getView().setModel(controller.model);
        },

        //Formatter Tile
        setTileName: function (tileName) {
            if (tileName != undefined) {
                try {
                    if (tileName.includes(" ")) {
                        return tileName
                    } else {
                        return controller.oBundle.getText(tileName)
                    }
                } catch (err) {
                    return tileName
                }
            } else {
                return ""
            }
        },

        onTilePress: function (oEvent) {
            if (oEvent != undefined) {
                eval("controller." + controller.model.getProperty(oEvent.oSource.getBindingContext().sPath)["TILE_PRESS"] + "();");
            }
        },

        //Metodi Tile

        closePopup: function () {
            controller._popup.close();
            controller._popup.destroy();
            controller._popup = undefined;
        },

        openPiazzoleDialog: function () {
            var input = {};
            input.SITE_ID = controller.siteId;
            input.LANGUAGE = controller.lang;

            var result = controller.sendData("GET_WKC_LIST", "TRANSACTION", input);
            controller.model.setProperty("/linkInfo", [{
                        "URL": "/XMII/CM/ADIGE7/POD/main.html?",
                        "PARAM": "LINK=0&SITE=%%&PIAZZOLA=",
                        "EXT_POD": false
                    }
                ]);

            controller._popup = sap.ui.xmlfragment("main.view.chooseSlotPopup", controller);
            controller.getView().addDependent(controller._popup);

            controller.model.setProperty("/tabPiazzola", result);
            controller.getView().setModel(controller.model);

            sap.ui.getCore().byId("toolbarSelResrce").setVisible(false);
            sap.ui.getCore().byId("colSlotPop").setVisible(true);
            sap.ui.getCore().byId("colSlotDescrPop").setVisible(true);

            controller._popup.open();
        },

        openProductionProgressDialog: function () {
            var input = {};
            input.SITE_ID = controller.siteId;
            input.LANGUAGE = controller.lang;

            var result = controller.sendData("GET_WKC_LIST", "TRANSACTION", input);
            controller.model.setProperty("/linkInfo", [{
                        "URL": "/XMII/CM/ADIGE7/PRODUCTION_PROGRESS/main.html?",
                        "PARAM": "SITE=%%&POD=0&PIAZZOLA=",
                        "EXT_POD": false
                    }
                ]);

            controller._popup = sap.ui.xmlfragment("main.view.chooseSlotPopup", controller);
            controller.getView().addDependent(controller._popup);

            controller.model.setProperty("/tabPiazzola", result);
            controller.getView().setModel(controller.model);

            sap.ui.getCore().byId("toolbarSelResrce").setVisible(false);
            sap.ui.getCore().byId("colSlotPop").setVisible(true);
            sap.ui.getCore().byId("colSlotDescrPop").setVisible(true);

            controller._popup.open();
        },

        openPod2Dialog: function () {
            var input = {};
            input.SITE_ID = controller.siteId;
            input.LANGUAGE = controller.lang;

            var resource = controller.sendData("GET_RESRCE", "TRANSACTION", input);
            controller.model.setProperty("/resrce", resource);

            controller.getChecklistByResrce();

            controller.model.setProperty("/linkInfo", [{
                        "URL": "/XMII/CM/ADIGE7/POD_2/main.html?",
                        "PARAM": "LINK=0&SITE=%1&PIAZZOLA=%2&CHECKLIST=",
                        "EXT_POD": true
                    }
                ]);

            controller._popup = sap.ui.xmlfragment("main.view.chooseSlotPopup", controller);
            controller.getView().addDependent(controller._popup);

            sap.ui.getCore().byId("toolbarSelResrce").setVisible(true);
            sap.ui.getCore().byId("colSlotPop").setVisible(false);
            sap.ui.getCore().byId("colSlotDescrPop").setVisible(false);
            //sap.ui.getCore().byId("tableChooseSlotPop").setVisibleRowCount(12);

            sap.ui.getCore().byId("segBtnResrce").setSelectedKey(resource[0]["Workcenter"]);

            controller._popup.open();
        },

        getChecklistByResrce: function (oEvent) {
            var input = {};
            if (!!oEvent) {
                input.SITE_ID = controller.siteId;
                input.WKC = oEvent.oSource.getSelectedKey();
            } else {
                input.SITE_ID = controller.siteId;
                input.WKC = controller.model.getProperty("/resrce")[0]["Workcenter"];
            }
            var checklist = controller.sendData("GET_ALL_PARK_CHECKLIST", "TRANSACTION", input);

            controller.model.setProperty("/tabPiazzola", checklist);
        },

        openLinkApp: function (oEvent) {
            if (oEvent != undefined) {
                var rowSel = controller.model.getProperty(oEvent.mParameters.rowContext.sPath);
                var linkInfo = controller.model.getProperty("/linkInfo")[0];
                //Vado alla Piazzola selezionata
                if (linkInfo["EXT_POD"]) {
                    window.location = linkInfo.URL + linkInfo.PARAM.replace("%1", controller.site).replace("%2", sap.ui.getCore().byId("segBtnResrce").getSelectedKey()) + rowSel["Checklist"];
                } else {
                    window.location = linkInfo.URL + linkInfo.PARAM.replace("%%", controller.site) + rowSel["Workcenter"];
                }
            }
        },

        openWHApp: function (oEvent) {
            if (oEvent != undefined) {
                var selRow = oEvent.getParameter("selectedItem").getBindingContext().getObject();
                //Vado al magazzino selezionato
                window.location = "/XMII/CM/ADIGE7/POD_WAREHOUSE/index.html?SITE=" + controller.site + "&WH=" + selRow["Warehouse"].replace(" ", "%20");
            }
        },

        handleSearchWH: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Warehouse", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        openSynoptic: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_V3/main.html?SITE=" + controller.site;
        },

        openSynopticSawingMachine: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_STR1/main.html?SITE=" + controller.site;
        },

        openSynopticBGS1: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_BGS1/main.html?SITE=" + controller.site;
        },

        openSynopticBGS2: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_BGS2/main.html?SITE=" + controller.site;
        },

        openSynopticADYSYS1: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_ADIGESYS1/main.html?SITE=" + controller.site;
        },

        openSynopticADYSYS2: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_ADIGESYS2/main.html?SITE=" + controller.site;
        },

        openSynopticADYSYS3: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_ADIGESYS3/main.html?SITE=" + controller.site;
        },

        openMasterData: function () {
            window.location = "/XMII/CM/ADIGE7/MASTER_DATA/main.html?SITE=" + controller.site;
        },

        openEditHours: function () {
            window.location = "/XMII/CM/ADIGE7/EDIT_HOURS/main.html?SITE=" + controller.site;
        },

        openExportData: function () {
            window.location = "/XMII/CM/ADIGE7/EXPORT/main.html?SITE=" + controller.site;
        },

        openExternalPod: function () {
            window.location = "/XMII/CM/ADIGE7/PODEXT/main.html?SITE=" + controller.site;
        },

        openPreassData: function () {
            window.location = "/XMII/CM/ADIGE7/PLANNER_DASHBOARD/main.html?SITE=" + controller.site;
        },

        openWHDialog: function () {
            var input = {};
            input.SITE_ID = controller.siteId;
            /*input.LANGUAGE = controller.model.getProperty("/user")[0].Language;*/

            var result = controller.sendData("GET_WH_LIST", "TRANSACTION", input);

            controller._popup = sap.ui.xmlfragment("main.view.chooseWHPopup", controller);
            controller.getView().addDependent(controller._popup);

            controller.model.setProperty("/tabAllWarehouse", result);
            controller.getView().setModel(controller.model);

            controller._popup.open();
        },

        openLogisticAssgn: function () {
            window.location = "/XMII/CM/ADIGE7/PODLOGISTICS/main.html?SITE=" + controller.site;
        },

        openReportTime: function () {
            window.location = "/XMII/CM/ADIGE7/REPORT_TIME/main.html?SITE=" + controller.site;
        },

        openReportUserTime: function () {
            window.location = "/XMII/CM/ADIGE7/REPORT_USER_TIME/main.html?SITE=" + controller.site;
        },

        openReportUserTimeTrend: function () {
            window.location = "/XMII/CM/ADIGE7/REPORT_USER_TIME_TREND/main.html?SITE=" + controller.site;
        },

        openReportParametersTrack: function () {
            window.location = "/XMII/CM/ADIGE7/REPORT_PARAMETERS_TRACK/main.html?SITE=" + controller.site;
        },

        openReportParametersTrend: function () {
            window.location = "/XMII/CM/ADIGE7/REPORT_PARAMETERS_TREND/main.html?SITE=" + controller.site;
        },

        openReportElapsedTimePhase: function () {
            window.location = "/XMII/CM/ADIGE7/REPORT_ELAPSED_TIME_PHASE/main.html?SITE=" + controller.site;
        },
		
		openManageLogisticAuction: function () {
            window.location = "/XMII/CM/ADIGE7/LOGISTICAUCTION/main.html?SITE=" + controller.site;
        },
		
		openAuctionManagement: function () {
            window.location = "/XMII/CM/ADIGE7/AUCTION_MANAGEMENT/main.html?SITE=" + controller.site;
        },
		
		openBgusaDashboard: function () {
            window.location = "/XMII/CM/ADIGE7/BGUSA_DASHBOARD/main.html?SITE=" + controller.site;
        },
		
		openBgusaSynoptic: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_BGUSA/main.html?SITE=" + controller.site;
        },
		
		openSynopticOfflinePod: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_OFFLINE_POD/main.html?SITE=" + controller.site;
        },

        openAutomhaServiceLog: function () {
            window.location = "/XMII/CM/ADIGE7/AUTOMHA_SERVICE_LOG/main.html?SITE=" + controller.site;
        },
		
		openSynopticBLM1: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_BLM1/main.html?SITE=" + controller.site;
        },

        openSynopticBLM2: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_BLM2/main.html?SITE=" + controller.site;
        },

        openSynopticBLM3: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_BLM3/main.html?SITE=" + controller.site;
        },

        openSynopticBLM4: function () {
            window.location = "/XMII/CM/ADIGE7/SYNOPTIC_BLM4/main.html?SITE=" + controller.site;
        }

    });
});