var controller;
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/base/util/UriParameters"
], function (Controller, JSONModel, MessageBox, UriParameters) {
    "use strict";

    return Controller.extend("master_data.controller.Main", {

        model: new sap.ui.model.json.JSONModel(),
        _popup: undefined,
        toDate: "",
        oBundle: undefined,
        SiteId: "",
        site: "",
        language: "",
        UriParameters: new UriParameters(window.location.href),

        onInit: function () {
            controller = this;
            controller.model.setSizeLimit(50000);

            controller.getUserID();

            try {
                //Imposto la lingua del browser in base all'utente
                controller.language = controller.model.getProperty("/user")[0]["Language"];
                controller.SiteId = controller.model.getProperty("/user")[0]["SiteId"];
                controller.site = controller.UriParameters.get("SITE");

            } catch (err) {
                controller.language = "IT";
                controller.SiteId = "";
                controller.site = "";
            }

            controller.enableElement(controller.model);
            sap.ui.getCore().getConfiguration().setLanguage(controller.language.toLowerCase());
        },

        onAfterRendering: function () {
            controller.oBundle = controller.getView().getModel("i18n").getResourceBundle();
            controller.time();
            setInterval(function () {
                controller.time();
            }, 1000);
        },

        selectedIcontab: function (oEvent) {
            /*Sbianco il contenuto delle tab al passaggio dall'una all'altra*/
            var selKey = oEvent.getSource().getSelectedKey();
            switch (selKey) {
                case "SITE":
                    controllerSite.getSite();
                    break;
                case "USR":
                    controllerUSR.newUsrGrp(false);
                    break;
                case "WKC":
	        controllerWorkCenter.byId("wkcObjectPage").setSelectedSection(controllerWorkCenter.byId("WKC").sId);
                    controllerWorkCenter.newSlot(false);
	        controllerWorkCenter.pressWkcTabBar();
                    /*controllerWorkCenter.wrkModel.setProperty("/tabSynoptic", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS1", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS2", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticStr1", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBgusa", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBkc", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS1Bkc", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBGS2Bkc", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticStr1Bkc", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBgusaBkc", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm1", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm1Bkc", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm2", []);
                    controllerWorkCenter.wrkModel.setProperty("/tabSynopticBlm2Bkc", []);
                    controllerWorkCenter.getSynopticList();
                    controllerWorkCenter.getWrkStatus();

                    if (controller.site === "ADIGE") {
                        controllerWorkCenter.byId("SynopticAdige").setVisible(true);
                        controllerWorkCenter.byId("SynopticBgs1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs2").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys1").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys2").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys3").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeStr1").setVisible(true);
                        controllerWorkCenter.byId("SynopticBgusa").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm2").setVisible(false);
                    }

                    if (controller.site === "BGS") {
                        controllerWorkCenter.byId("SynopticAdige").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs1").setVisible(true);
                        controllerWorkCenter.byId("SynopticBgs2").setVisible(true);
                        controllerWorkCenter.byId("SynopticAdigeSys1").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys2").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys3").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeStr1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgusa").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm2").setVisible(false);
                    }

                    if (controller.site === "ADIGE-SYS") {
                        controllerWorkCenter.byId("SynopticAdige").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs2").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys1").setVisible(true);
                        //controllerWorkCenter.byId("SynopticAdigeSys2").setVisible(true);
                        controllerWorkCenter.byId("SynopticAdigeSys3").setVisible(true);
                        controllerWorkCenter.byId("SynopticAdigeStr1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgusa").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm2").setVisible(false);
                    }

                    if (controller.site === "BGUSA") {
                        controllerWorkCenter.byId("SynopticAdige").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs2").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys1").setVisible(false);
                        //controllerWorkCenter.byId("SynopticAdigeSys2").setVisible(true);
                        controllerWorkCenter.byId("SynopticAdigeSys3").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeStr1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgusa").setVisible(true);
                        controllerWorkCenter.byId("SynopticBlm1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm2").setVisible(false);
                    }

                    if (controller.site === "BLM") {
                        controllerWorkCenter.byId("SynopticAdige").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgs2").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeSys1").setVisible(false);
                        //controllerWorkCenter.byId("SynopticAdigeSys2").setVisible(true);
                        controllerWorkCenter.byId("SynopticAdigeSys3").setVisible(false);
                        controllerWorkCenter.byId("SynopticAdigeStr1").setVisible(false);
                        controllerWorkCenter.byId("SynopticBgusa").setVisible(false);
                        controllerWorkCenter.byId("SynopticBlm1").setVisible(true);
                        controllerWorkCenter.byId("SynopticBlm2").setVisible(true);
                    }*/

                    break;

                case "MAIN":
                    controllerMainTile.getData();
                    break;

                case "DC":
                    controllerDC.setModelProperty("/isPopupMode", false);
                    controllerDC.byId("phaseObjectPage").setSelectedSection(controllerDC.byId("PARAM").sId);
                    controllerDC.newParam(false);
                    break;

                case "OP_OLD":
                    controllerPhaseOld.byId("OpTabBar").setSelectedKey("OP2");
                    controllerPhaseOld.newPhase(false);
                    break;

                case "OP":
                    controllerPhase.byId("phaseObjectPage").setSelectedSection(controllerPhase.byId("OP_PHASE"));
                    controllerPhase.newPhase(false);
                    break;

                case "UPLOAD":
                    document.getElementById("fileUploader").value = "";
                    controllerUpdate.tableModel.setProperty("/tabCheckList", []);
                    controllerUpdate.tableModel.setProperty("/tabFaseDetails", []);
                    controllerUpdate.getView().setModel(controllerUpdate.tableModel);
                    controllerUpdate.oJSON = undefined;
                    break;
                case "ITEM":
                    controllerMat.disabledField();
                    break;
                case "EM":
                    controllerMail.byId("mailTabBar").setSelectedKey("ML");
                    controllerMail.refreshNewMail(false);
                    break;
                case "DOC":
                    controllerAtt.byId("attachedTabBar").setSelectedKey("chkatt");
                    controllerAtt.closeChecklistAttachments();
                    break;
                case "SW":
                    controllerSupplierWarehouse.byId("idIconTabSuppWarehouse").setSelectedKey("SUPPLIER");
                    controllerSupplierWarehouse.getSupplierList();
                    break;
                case "LOGISTIC":
                    controllerLogistic.byId("logisticITB").setSelectedKey("LTYPE");
                    controllerLogistic.getLogisticType();
                    break;
                case "BGUSA":
                    controllerBgusa.byId("bgusaITB").setSelectedKey("KAT");
                    controllerBgusa.getKmat();
                    break;
                default:
                //No Action
            }
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

        getUserID: function () {
            var Input = {
                "SITE": controller.UriParameters.get("SITE")
            };
            var result = controller.sendData("GET_USER_INFORMATIONS", "SERVICE/TRANSACTION", Input);

            try {
                var arrAvatar = result[0]["UserInfo"][0]["Name"].split(",");
                result[0]["UserInfo"][0].AVATAR = arrAvatar[0].charAt(0) + arrAvatar[1].trim().charAt(0);
            } catch (err) { }

            controller.model.setProperty("/user", result[0]["UserInfo"]);
            controller.model.setProperty("/activityList", result[0]["UserActivities"]);
            controller.getView().setModel(controller.model);
        },

        time: function () {
            var date = new Date();
            var day = date.getDate() + "";
            var month = (date.getMonth() + 1) + "";
            var hh = date.getHours() + "";
            var min = date.getMinutes() + "";
            controller.toDate = (day.length == 1 ? "0" + day : day) + "/" + (month.length == 1 ? "0" + month : month) + "/" + date.getFullYear();
            var strDate = controller.oBundle.getText("main.title") + " " + (day.length == 1 ? "0" + day : day) + "/" + (month.length == 1 ? "0" + month : month) + "/" + date.getFullYear() + "  " + (hh.length == 1 ? "0" + hh : hh) + ":" + (min.length == 1 ? "0" + min : min);
            controller.byId("labelTime").setText(strDate);
        },

        checkUserActivity: function (inputActivity) {
            return controller.model.getProperty("/activityList").find(({
                Activity
            }) => Activity === inputActivity) !== undefined
        },

        enableElement: function (model) {
            model.setProperty("/VisibleAdmin", {
                "VISIBLE": controller.checkUserActivity("ALL_ADMIN"),
                "FULL_EDIT_MODE": controller.checkUserActivity("FULL_EDIT_MASTER_DATA")
            });
        },

        handleBackPress: function () {
            window.location.href = "/XMII/CM/ADIGE7/MAIN/main.html?SITE=" + controller.UriParameters.get("SITE");
        },

        onAvatarPressed: function (oEvent) {
            controller._popup = sap.ui.xmlfragment("master_data.view.popup.avatarPopup", controller);
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
                        history.pushState({}, null, urll);
                        location.reload(true);
                    } catch (err) { }
                },
                error: function searchError(xhr, err) {
                    console.error("Error on ajax call: " + err);
                    console.log(JSON.stringify(xhr));
                }
            });
        }
    });
});
