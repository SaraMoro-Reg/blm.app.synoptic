var controller;
sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/m/MessageBox"
    ], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("synoptic.controller.Main", {
        model: new sap.ui.model.json.JSONModel({
			"automaticScroll": true,
			"ActulPage": "ELECT-LN",
			"selectedCriticalMaterials": [],
			"currentPageNavContainer": 1	
		}),
        oBundle: undefined,
        siteId: "",
        intervalAlarm: undefined,
        setupAlarm: true,
        lastUpdate: "",
        usr: jQuery.sap.getUriParameters().get("j_user"),
        pwd: jQuery.sap.getUriParameters().get("j_password"),
        _popup: undefined, 
		
		onInit: function () {
            controller = this;
            controller.getUserID();
            controller.sessionKeepAlive();
            //Imposto la lingua del browser in base all'utente
            sap.ui.getCore().getConfiguration().setLanguage(controller.model.getProperty("/user")[0].Language.toLowerCase());
        },

        onAfterRendering: function(){
			controller.oBundle = controller.getView().getModel("i18n").getResourceBundle();
            // Imposto il titolo iniziale con ELECT-L
            controller.byId("labelTime").setText(controller.oBundle.getText("title") + controller.model.getProperty("/ActulPage") + " - " + controller.time() + " - " + controller.oBundle.getText("lastUpd") + " " + controller.lastUpdate);
            
			//Chiamo la funzione per aggiornare le info presenti nella pagina ogni 10 secondi
            controller.getAllWkcAndChecklistInfo();
            setInterval(function () {
                controller.getAllWkcAndChecklistInfo();
            }, 10000);

            //Chiamo la funzione per visualizzare le info dalla tabella di cache ogni 30 secondi
            controller.resfreshViewSynoptic(true);
            setInterval(function () {
                controller.resfreshViewSynoptic(false);
            }, 30000);

            controller.getSynopticSetup();			
        },

        handleNav: function () {            
            let sTarget = "",
				sCurrentPage = "ELECT-LN";
			
            if (controller.model.getProperty("/currentPageNavContainer") == 1) {
                sTarget = "p2";
                controller.model.setProperty("/currentPageNavContainer", 2);
                controller.getView().byId("carouselId2").setActivePage(controller.byId("-ELECT-LN"));
                controller.byId("labelTime2").setText(controller.oBundle.getText("title") + sCurrentPage + " - " + controller.time() + " - " + controller.oBundle.getText("lastUpd") + " " + controller.lastUpdate);
            } else {
                sTarget = "p1";
                controller.model.setProperty("/currentPageNavContainer", 1);
                controller.getView().byId("carouselId").setActivePage(controller.byId("ELECT-LN"));
                 controller.byId("labelTime2").setText(controller.oBundle.getText("title") + sCurrentPage + " - " + controller.time() + " - " + controller.oBundle.getText("lastUpd") + " " + controller.lastUpdate);
            }
			
			controller.model.setProperty("/ActivePage", sCurrentPage);

            if (sTarget) {
                controller.byId("navContainerId").to(controller.byId(sTarget), "flip");
            } else {
                controller.byId("navContainerId").back();
            }

            controller.resfreshViewSynoptic(true);
        },

        time: function () {
            var date = new Date();
            var day = date.getDate() + "";
            var month = (date.getMonth() + 1) + "";
            var hh = date.getHours() + "";
            var min = date.getMinutes() + "";
            return (day.length == 1 ? "0" + day : day) + "/" + (month.length == 1 ? "0" + month : month) + "/" + date.getFullYear() + "  " + (hh.length == 1 ? "0" + hh : hh) + ":" + (min.length == 1 ? "0" + min : min);
        },

        onOpenSettings: function(){
           if (!controller._oSettingsDialog) {
                controller._oSettingsDialog = sap.ui.xmlfragment("synoptic.view.popup.settings", controller);
                controller.getView().addDependent(controller._oSettingsDialog);
                controller._oSettingsDialog.open();
            }else {
                controller._oSettingsDialog.open();
            }
            controller.getView().setModel(controller.model);
        },

        onOpenFilter: function () {
            if (!controller._oFilterDialog) { 
                controller._oFilterDialog = sap.ui.xmlfragment("synoptic.view.popup.filters", controller); 
                controller.getView().addDependent(controller._oFilterDialog);
                controller._oFilterDialog.open();
            } else {
                controller._oFilterDialog.open();
            }
            controller.getView().setModel(controller.model);
        },

        getSynopticSetup: function(){
            var result = controller.callBackend("GET_SYNOPTIC_SETUP", "TRANSACTION", {
                "USERID": controller.model.getProperty("/user")[0].UserId,
                "SYNOPTIC": "SynopticBLM1"
            });
            
            var automaticScroll;
            var scrollTime;
            var automaticScrollTile;
            var scrollTimeTile;
            if (result.length > 0) {
                if (result[0].AutomaticScrollingPage == '1') {
                    automaticScroll = true;
                } else {
                    automaticScroll = false;
                }

                if (result[0].AutomaticScrollingTile == '1') {
                    automaticScrollTile = true;
                } else {
                    automaticScrollTile = false;
                }

                scrollTime = parseInt(result[0].ScrollingTimePage);
                scrollTimeTile = parseInt(result[0].ScrollingTimeTile);
            } else {
                automaticScroll = false;
                scrollTime = 1;
                automaticScrollTile = false;
                scrollTimeTile = 10;
            }

            //condizione: se la pagina corrente è 1 allora lo scroll automatico è del carosello 1, altrimenti è del carosello 2
            if((controller.model.getProperty("/currentPageNavContainer")) == 1){ 
                if(automaticScroll){
                    clearInterval(controller.intervalPageScroll);
                    controller.intervalPageScroll = setInterval(function(){controller.byId("carouselId").next()}, (60000*scrollTime));
                }else{
                    clearInterval(controller.intervalPageScroll);
                }
            } else {
                if(automaticScroll){
                    clearInterval(controller.intervalPageScroll);
                    controller.intervalPageScroll = setInterval(function(){controller.byId("carouselId2").next()}, (60000*scrollTime));
                }else{
                    clearInterval(controller.intervalPageScroll);
                }
            }

            if (automaticScrollTile) {
				clearInterval(controller.setIntervalCriticalItems);
                controller.setIntervalCriticalItems = setInterval(function () {
                    for (var i = 0; i < 40; i++) {
                        controller.byId("carousel-" + i.toString()).next();
                    }

                }, 1000 * scrollTimeTile);
            } else {
                clearInterval(controller.setIntervalCriticalItems);
            }

            controller.model.setProperty("/autoScrolling", automaticScroll);
            controller.model.setProperty("/scrollingTime", scrollTime);
            controller.model.setProperty("/autoScrollingTile", automaticScrollTile);
            controller.model.setProperty("/scrollingTimeTile", scrollTimeTile);
        },

        onChangeStepInput: function (oEvent) {
            if(oEvent.getSource().getValue() < oEvent.getSource().getMin()){
				oEvent.getSource().setValue(oEvent.getSource().getMin());
			}else if(oEvent.getSource().getValue() > oEvent.getSource().getMax()){
				oEvent.getSource().setValue(oEvent.getSource().getMax());
			}
        },

        onCloseSettingsPopup: function(){
            controller._oSettingsDialog.close();
        },

        onCloseFilterPopup: function () {
            controller._oFilterDialog.close();
            controller.resfreshViewSynoptic(false);
        },

        onSaveSettings: function () {
            var automaticScroll = controller.model.getProperty("/autoScrolling");
            var scrollTime = controller.model.getProperty("/scrollingTime");
            var autoScroll;
            var automaticScrollTile = controller.model.getProperty("/autoScrollingTile");
            var scrollTimeTile = controller.model.getProperty("/scrollingTimeTile");
            var autoScrollTile;
            if (automaticScroll) {
                autoScroll = 1;
            } else {
                autoScroll = 0;
                scrollTime = 1;
            }

            if (automaticScrollTile) {
                autoScrollTile = 1;
            } else {
                autoScrollTile = 0;
                scrollTimeTile = 10;
            }

            var result = controller.callBackend("UPDATE_SYNOPTIC_SETUP", "TRANSACTION", {
                "USERID": controller.model.getProperty("/user")[0].UserId,
                "SYNOPTIC": "SynopticBLM1",
                "AUTOMATIC_SCROLLING_PAGE": autoScroll,
                "SCROLLING_TIME_PAGE": scrollTime,
                "AUTOMATIC_SCROLLING_TILE": autoScrollTile,
                "SCROLLING_TIME_TILE": scrollTimeTile
            });

            // controller.getSynopticSetup();
            // controller._oSettingsDialog.close();

            if (!controller._oSettingsDialog) {
                controller.getSynopticSetup();
            } else {
                controller.getSynopticSetup();
                controller._oSettingsDialog.close();
            }
        },

        onSaveFilterPopup: function () {
            controller._oFilterDialog.close();
            controller.resfreshViewSynoptic(false);
        },
        
        sendData: function (Transaction, route, Input) {
            var results;
            var transactionCall = "ADIGE7/SYNOPTIC_BLM1/" + route + "/" + Transaction;
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

        /*-----*/

        /*Pre calcolo i dati per la tabella SynopticCache*/

        //Verifico quali Checklist devo aggiornare
        getAllWkcAndChecklistInfo: function () {
            let result = controller.sendData("GET_ALL_WKC_AND_CHECKLIST", "TRANSACTION", {
                "SITE_ID": controller.siteId,
                "SYNOPTIC_TYPE": 1
            }), aResult = [{"RC": "0"}];
            controller.model.setProperty("/getAllWkcAndChecklistInfo", result);

            //Chiamo la funzione di aggiornamento. Interrompo l'aggiornamento quando lo stato di avanzamento arriva al 100%
            for (let i = 0; i < result.length; i++) {
                if (result[i].REFRESH === 'true') {
                    aResult = controller.refreshCheklistInfo(result[i]);
                    i = result.length;
                }
            }
			
			if (aResult[0].RC != 0) {
                MessageToast.show(controller.oBundle.getText("err.saveData"));
            } else {
                
                //Sbianco tutte le proprietà d'appoggio
                controller.model.setProperty("/getAllWkcAndChecklistInfo", []);
                controller.model.setProperty("/getChecklistData", []);
                controller.model.setProperty("/calendar", []);
                controller.model.setProperty("/teoricCalendarEndDate", []);
				
				let oInput = {},
					aInput = [],
					sChecklistList = "",
					oElement = {};

				for (let i = 0; i < result.length; i++) {
					if (result[i]["IS_STARTED"] === 'false' && result[i]["REFRESH_NOT_STARTED"] === 'true') {
						if(sChecklistList === ""){
							sChecklistList = result[i]["Checklist"];
						}else{
							sChecklistList = sChecklistList + ";" + result[i]["Checklist"];
						}
					}
				}
				
				if(sChecklistList !== ""){
					let aAppStrongData = controller.sendData("GET_APPSTRONG_INFO", "TRANSACTION", {
						"CHECKLIST_LIST": sChecklistList,
					});
					
					for(let i in result){
						if (result[i]["IS_STARTED"] === 'false' && result[i]["REFRESH_NOT_STARTED"] === 'true') {
							oElement = aAppStrongData.find((element) => element.EQUIPMENT === result[i]["Checklist"]);
							
							oInput.CHECKLIST_ID = result[i]["ChecklistId"];						
							oInput.WKC_ID = result[i]["WorkcenterId"];
							oInput.PROGRESS = "0";
							oInput.CHECKLIST_DURATION = "0";
							oInput.EXPECTED_CHECKLIST_DURATION = "0";
							oInput.TARGET_DATE = "1900-01-01";
							oInput.EXPECTED_END_DATE = "1900-01-01";
							oInput.OVERALL_PROGRESS_STATUS = "gray";
							oInput.APP_STRONG = oElement === undefined ? "" : oElement["APP_STRONG"];
							aInput.push(oInput);
							oInput = new Object;
						}
					}
					
					
					if(aInput.length > 0)
						controller.sendData("SAVE_DATA", "TRANSACTION", { "DATA": JSON.stringify(aInput)});
				}
				controller.resfreshViewSynoptic(false);
            }
        },

       callBackend: function (Transaction, route, Input) {
            var results;
            var transactionCall = "ADIGE7/SYNOPTIC_BLM1/" + route + "/" + Transaction;
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

        refreshCheklistInfo: function (checklistInfo) {
            var result = controller.sendData("GET_CHECKLIST_DATA", "TRANSACTION", {
				"CHECKLIST": checklistInfo["Checklist"],
                "CHECKLIST_ID": checklistInfo.ChecklistId
            });
            controller.model.setProperty("/getChecklistData", result);

            //Chiamo la funzione per la generazione del calendario per ottenere la data obiettivo
            controller.createCalendar(result, checklistInfo.DATA_INIZIO);

            //Chiamo la funzione per la generazione della data prevista fine
            controller.getPrevEndDate(result);

            //Chiamo la funzione per il calcolo del colore dello Stato
            var colore = controller.generateResrceColor(checklistInfo);

            var input = {};
            var arrInput = [];

            input.CHECKLIST_ID = checklistInfo.ChecklistId;
            input.WKC_ID = checklistInfo.WorkcenterId;
            input.PROGRESS = result["synopticDet"][0].TOTAL_PROGRESS;
            input.CHECKLIST_DURATION = result["synopticDet"][0].GIORNI_TOTALI;
            input.EXPECTED_CHECKLIST_DURATION = result["synopticDet"][0].GIORNI_TOTALI_PREVISTI;
            input.TARGET_DATE = controller.model.getProperty("/calendar")[controller.model.getProperty("/calendar").length - 1]["DATE_TIME"];
            input.EXPECTED_END_DATE = checklistInfo["OveralProgress"] !== '100' ? controller.model.getProperty("/teoricCalendarEndDate")[controller.model.getProperty("/teoricCalendarEndDate").length - 1]["DATE_TIME"] : checklistInfo["ExpectedEndDate"];
            input.OVERALL_PROGRESS_STATUS = colore;			
            input.APP_STRONG = result["appStrong"][0]["APP_STRONG"];

            arrInput.push(input);

            return controller.sendData("SAVE_DATA", "TRANSACTION", {
                "DATA": JSON.stringify(arrInput)
            })            
        },

        /*------*/

        /*Generazione calendario, data Prevista fine e colore Stato avanzamento Checklist*/
        createCalendar: function (result, dataInizio) {
            var notWorkingDays = result["notWorkingDays"];
            var giorniTotali = parseFloat(result["synopticDet"][0]["GIORNI_TOTALI"]).toFixed(0);
            var ArrayDate = [];
            var objTemp = {};
            var ggSucc = dataInizio.split("T")[0] + "T10:00:00";
            var ggSuccNotWokDaysWeek = true;

            if (giorniTotali == "0") {
                objTemp.DATE_TIME = ggSucc.split("T")[0] + "T00:00:00";
                ArrayDate.push(objTemp);
                objTemp = new Object;
            } else {
                for (var i = 0; i < giorniTotali; i++) {
                    if (i === 0) {
                        objTemp.DATE_TIME = ggSucc.split("T")[0] + "T00:00:00";
                        ArrayDate.push(objTemp);
                        objTemp = new Object;
                    } else {
                        for (var count = 0; count < 50; count++) {
                            //Verifico se sono nel Weekend
                            if (ggSucc.getDay() === 6 || ggSucc.getDay() === 0) {
                                ggSucc = controller.addDays(ggSucc, 1);
                                ggSuccNotWokDaysWeek = true;
                            } else if (ggSuccNotWokDaysWeek) {
                                if (notWorkingDays.length != 0) {
                                    for (var j = 0; j < notWorkingDays.length; j++) {
                                        //Verifico che non sia una giorna non lavorativa
                                        if (ggSucc.toISOString().split("T")[0] + "T00:00:00" === notWorkingDays[j]["NotWorkingDay"]) {
                                            ggSucc = controller.addDays(ggSucc, 1);
                                            ggSuccNotWokDaysWeek = true;
                                            break;
                                        } else {
                                            ggSuccNotWokDaysWeek = false;
                                        }
                                    }
                                } else {
                                    objTemp.DATE_TIME = ggSucc.toISOString().split("T")[0] + "T00:00:00";
                                    ArrayDate.push(objTemp);
                                    objTemp = new Object;
                                    ggSuccNotWokDaysWeek = false;
                                    break;
                                }
                            } else {
                                //Aggiungo la giornata al mio calendario
                                objTemp.DATE_TIME = ggSucc.toISOString().split("T")[0] + "T00:00:00";
                                ArrayDate.push(objTemp);
                                objTemp = new Object;
                                count = 51;
                                ggSuccNotWokDaysWeek = true;
                            }

                        }
                    }
                    ggSucc = controller.addDays(ggSucc, 1);
                }
            }
            //Setto il calendario appena creato nel modello
            controller.model.setProperty("/calendar", ArrayDate);
        },

        getPrevEndDate: function (result) {
            var notWorkingDays = result["notWorkingDays"];
            var giorniTotali = Math.ceil(result["synopticDet"][0]["GIORNI_TOT_MANCANTI"]);
            var dataDiOggi = new Date();
            var dataInizio = dataDiOggi.toISOString().split("T")[0] + "T00:00:00";
            var ArrayDate = [];
            var objTemp = {};
            var ggSucc = dataInizio.split("T")[0] + "T10:00:00";
            var ggSuccNotWokDaysWeek = true;

            if (giorniTotali == "0") {
                objTemp.DATE_TIME = ggSucc.split("T")[0] + "T00:00:00";
                ArrayDate.push(objTemp);
                objTemp = new Object;
            } else {
                for (var i = 0; i < giorniTotali; i++) {
                    if (i === 0) {
                        objTemp.DATE_TIME = ggSucc.split("T")[0] + "T00:00:00";
                        ArrayDate.push(objTemp);
                        objTemp = new Object;
                    } else {
                        for (var count = 0; count < 50; count++) {
                            //Verifico se sono nel Weekend
                            if (ggSucc.getDay() === 6 || ggSucc.getDay() === 0) {
                                ggSucc = controller.addDays(ggSucc, 1);
                                ggSuccNotWokDaysWeek = true;
                            } else if (ggSuccNotWokDaysWeek) {
                                if (notWorkingDays.length != 0) {
                                    for (var j = 0; j < notWorkingDays.length; j++) {
                                        //Verifico che non sia una giorna non lavorativa
                                        if (ggSucc.toISOString().split("T")[0] + "T00:00:00" === notWorkingDays[j]["NotWorkingDay"]) {
                                            ggSucc = controller.addDays(ggSucc, 1);
                                            ggSuccNotWokDaysWeek = true;
                                            break;
                                        } else {
                                            ggSuccNotWokDaysWeek = false;
                                        }
                                    }
                                } else {
                                    objTemp.DATE_TIME = ggSucc.toISOString().split("T")[0] + "T00:00:00";
                                    ArrayDate.push(objTemp);
                                    objTemp = new Object;
                                    ggSuccNotWokDaysWeek = false;
                                    break;
                                }
                            } else {
                                //Aggiungo la giornata al mio calendario
                                objTemp.DATE_TIME = ggSucc.toISOString().split("T")[0] + "T00:00:00";
                                ArrayDate.push(objTemp);
                                objTemp = new Object;
                                count = 51;
                                ggSuccNotWokDaysWeek = true;
                            }

                        }
                    }
                    ggSucc = controller.addDays(ggSucc, 1);
                }
            }
            //Setto il calendario appena creato nel modello
            controller.model.setProperty("/teoricCalendarEndDate", ArrayDate);
        },

        addDays: function (date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },

        //Setto il colore della barra in base all'avanzamento
        generateResrceColor: function (checklistInfo) {
            try {
                //Il valore indexData è stato inserito come richiesta da parte di BLM in quanto non si vuole una logica ad inseguimento ma per la colorazione viene aggiunta una giornata di tolleranza
                var indexData = controller.model.getProperty("/teoricCalendarEndDate").length === 1 ? 1 : 2;
                var indexDataFinePrevista = controller.model.getProperty("/teoricCalendarEndDate").length /*- controller.model.getProperty("/getChecklistData")["synopticDet"][0]["FATT_CORREZIONE"]*/ - indexData;
                var dataFinePrevista = new Date(controller.model.getProperty("/teoricCalendarEndDate")[indexDataFinePrevista < 0 ? 0 : indexDataFinePrevista]["DATE_TIME"]);
                //var dataFinePrevista = new Date (controller.model.getProperty("/teoricCalendarEndDate")[controller.model.getProperty("/teoricCalendarEndDate").length - controller.model.getProperty("/getChecklistData")["synopticDet"][0]["FATT_CORREZIONE"] - indexData]["DATE_TIME"]);
                var dataSpedizione = new Date(checklistInfo.DATA_SPEDIZIONE);
                //var dataFineTeorica = new Date(controller.model.getProperty("/calendar")[controller.model.getProperty("/calendar").length - 1]["DATE_TIME"]);
				var dataFineTeorica = controller.addDaysToCalendar(controller.model.getProperty("/calendar")[controller.model.getProperty("/calendar").length - 1]["DATE_TIME"], parseInt(controller.model.getProperty("/getChecklistData")["synopticDet"][0]["FATT_CORREZIONE"]) + 1);

                if (dataFinePrevista <= dataFineTeorica) {
                    if (dataFinePrevista >= dataSpedizione) {
                        //Rosso
                        return "red";
                    } else {
                        //Verde
                        return "green";
                    }
                } else if (dataFinePrevista > dataFineTeorica && dataFinePrevista < dataSpedizione) {
                    //Giallo
                    return "yellow";
                } else if (dataFinePrevista >= dataSpedizione) {
                    //Rosso
                    return "red";
                } else {
                    //Colore Standard di default
                    return "white";
                }

            } catch (err) {
                return "white"
            }
        },
		
		addDaysToCalendar: function (dataInizio, giorniTotali) {
            var notWorkingDays = controller.model.getProperty("/getChecklistData")["notWorkingDays"];             
            var ArrayDate = [];
            var objTemp = {};
            var ggSucc = dataInizio.split("T")[0] + "T10:00:00";
            var ggSuccNotWokDaysWeek = true;

            for (var i = 0; i <= giorniTotali; i++) {
                if (i === 0) {
                    objTemp.DATE_TIME = ggSucc.split("T")[0] + "T00:00:00";
                    ArrayDate.push(objTemp);
                    objTemp = new Object;
                } else {
                    for (var count = 0; count < 50; count++) {
                        //Verifico se sono nel Weekend
                        if (ggSucc.getDay() === 6 || ggSucc.getDay() === 0) {
                            ggSucc = controller.addDays(ggSucc, 1);
                            ggSuccNotWokDaysWeek = true;
                        } else if (ggSuccNotWokDaysWeek) {
                            if (notWorkingDays.length != 0) {
                                for (var j = 0; j < notWorkingDays.length; j++) {
                                    //Verifico che non sia una giorna non lavorativa
                                    if (ggSucc.toISOString().split("T")[0] + "T00:00:00" === notWorkingDays[j]["NotWorkingDay"]) {
                                        ggSucc = controller.addDays(ggSucc, 1);
                                        ggSuccNotWokDaysWeek = true;
                                        break;
                                    } else {
                                        ggSuccNotWokDaysWeek = false;
                                    }
                                }
                            } else {
                                objTemp.DATE_TIME = ggSucc.toISOString().split("T")[0] + "T00:00:00";
                                ArrayDate.push(objTemp);
                                objTemp = new Object;
                                ggSuccNotWokDaysWeek = false;
                                break;
                            }
                        } else {
                            //Aggiungo la giornata al mio calendario
                            objTemp.DATE_TIME = ggSucc.toISOString().split("T")[0] + "T00:00:00";
                            ArrayDate.push(objTemp);
                            objTemp = new Object;
                            count = 51;
                            ggSuccNotWokDaysWeek = true;
                        }

                    }
                }
                ggSucc = controller.addDays(ggSucc, 1);
			}
			return new Date(ArrayDate[ArrayDate.length - 1]["DATE_TIME"])
		},

        /*------------------*/

        /*Formatter*/

        setFormatTime: function (dateTime) {
            if (dateTime === '' || dateTime === undefined || dateTime === 'TimeUnavailable') {
                return " "
            } else {
                var date = new Date(dateTime);
                return date.getDate() + "/" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) //+ "/" + date.getFullYear()
            }
        },

        setUpdateTitleTime: function (date) {
            var day = date.getDate() + "";
            var month = (date.getMonth() + 1) + "";
            var hh = date.getHours() + "";
            var min = date.getMinutes() + "";
            return (day.length == 1 ? "0" + day : day) + "/" + (month.length == 1 ? "0" + month : month) + "/" + date.getFullYear() + "  " + (hh.length == 1 ? "0" + hh : hh) + ":" + (min.length == 1 ? "0" + min : min);
        },

        progressFormat: function (progress) {
            if (progress != null && progress != undefined) {
                return parseFloat(parseFloat(progress).toFixed(2))
            } else {
                return 0
            }
        },

        progressColour: function (colourStatus, faseTwoCompleted) {
            if (faseTwoCompleted == "true") {
                return "None";
            }
            if (colourStatus != null && colourStatus != undefined) {
                if (colourStatus === "green") {
                    return "Success"
                } else if (colourStatus === "yellow") {
                    return "Warning"
                } else {
                    return "Error"
                }
            } else {
                return "None"
            }
        },

		setResourceColor: function (wkc_id, strStatus) {
            if (strStatus != undefined || strStatus != "") {
                if (strStatus === "ERROR") {
                    return "colorRed"
                } else if (strStatus === "WARNING") {
                    return "colorYellow"
                } else if (wkc_id === "1") {
                    return "colorWhite"
                } else if (wkc_id === "2") {
					return "colorLightGrey"
				} else if (wkc_id === "3") {
					return "colorWhite"
				} else {
					return "colorWhite"
				}  
            } else {
                return "colorWhite"
            }
        },

        setIconColor: function (colour) {
            if (colour === "red") {
                return "red"
            } else if (colour === "gray") {
                return "gray"
            } else if (colour === "yellow") {
                return "#e7d607"
            } else if (colour === "green") {
                return "#2b7c2b"
            } else {
                return "black"
            }
        },

        /*-------------*/
				
        resfreshViewSynoptic: function (bInstantOpen) {
			if(bInstantOpen){
				sap.ui.core.BusyIndicator.show(0);
			}else{
				sap.ui.core.BusyIndicator.show();
			}
			
            var params = {
                "SITE_ID": controller.siteId,
                "SYNOPTIC_TYPE": 1,
				"PAGE": controller.model.getProperty("/ActulPage"),
				"LANGUAGE": controller.model.getProperty("/user")[0]["Language"],
                "TRANSACTION": "ADIGE7/SYNOPTIC_BLM1/TRANSACTION/GET_DATA",
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
                req.done(jQuery.proxy(controller.getDataSuccess, controller));
                req.fail(jQuery.proxy(controller.getDataError, controller));
            } catch (err) {
                jQuery.sap.log.debug(err.stack);
            }
        },

        getDataSuccess: function (data) {            
            try {
                var dividingParameter = 2; //parametro per dividere gli elementi del carosello all'interno della tile

                var dataModel = JSON.parse(jQuery(data).find("Row").text());

                //controller.model.setProperty("/res", dataModel);

                //selezione dati multicombobox
                var criticalParamsModelCombo = [];
                for (var i = 0; i < dataModel.length; i++) {
                    if (dataModel[i].ParameterDescription != "---") {
                        var criticalParams = dataModel[i].ParameterDescription.split(",");
                        for (var j = 0; j < criticalParams.length; j++) {
                            if (criticalParamsModelCombo.length == 0) {
                                criticalParamsModelCombo.push(criticalParams[j]);
                            } else {
                                var itemFound = false;
                                for (var n = 0; n < criticalParamsModelCombo.length; n++) {
                                    if (criticalParamsModelCombo[n] == criticalParams[j]) {
                                        itemFound = true;
                                    }
                                }
                                if (!itemFound) {
                                    criticalParamsModelCombo.push(criticalParams[j])
                                }
                            }

                        }
                    }
                }

                var filterData = [];
                for (var t = 0; t < criticalParamsModelCombo.length; t++) {
                    var elem = {};
                    elem.NAME = criticalParamsModelCombo[t];
                    filterData.push(elem);
                }

                controller.model.setProperty("/criticalItemsFilterData", filterData);
                controller.getView().setModel(controller.model);

                for (var i = 0; i < dataModel.length; i++) {
                    if (dataModel[i].ParameterDescription != "---" && dataModel[i].ParameterValue != "---") {
                        var criticalParamsAll = dataModel[i].ParameterDescription.split(",");
                        var criticalParamsValuesAll = dataModel[i].ParameterValue.split(",");
                        var criticalParams = [];
                        var criticalParamsValues = [];
                        var selectedCriticalMaterials = controller.model.getProperty("/selectedCriticalMaterials");
                        if (selectedCriticalMaterials.length > 0) {
                            for (var p = 0; p < selectedCriticalMaterials.length; p++) {
                                for (var r = 0; r < criticalParamsAll.length; r++) {
                                    if (selectedCriticalMaterials[p] == criticalParamsAll[r]) {
                                        criticalParams.push(criticalParamsAll[r]);
                                        criticalParamsValues.push(criticalParamsValuesAll[r]);
                                    }
                                }
                            }
                        } else {
                            criticalParams = criticalParamsAll;
                            criticalParamsValues = criticalParamsValuesAll;
                        }

                        for (var x = 0; x < criticalParamsValues.length; x++) {
                            if (criticalParamsValues[x] == "true") {
                                criticalParamsValues[x] = "Success";
                            } else if (criticalParamsValues[x] == "false") {
                                criticalParamsValues[x] = "Error";
                            } else if (criticalParamsValues[x] == 0) {
                                criticalParamsValues[x] = "None";
                            } else {
                                criticalParamsValues[x] = "None";
                            }
                        }
                        var objNumbersPerArray = Math.ceil(criticalParamsValues.length / dividingParameter);
                        var criticalItems = [];

                        for (var t = 0; t < objNumbersPerArray; t++) {
                            var elem = {}
                            for (var n = 1; n <= dividingParameter; n++) {

                                elem["CriticalItemText" + n.toString()] = "";
                                elem["CriticalItemStatus" + n.toString()] = "";

                            }
                            criticalItems.push(elem);
                        }
                        //dataModel[i].CriticalItems = criticalItems;
                        //fine costruzione array criticalItems
                        //inizio valorizzazione

                        var criticalItemIndex = 0;
                        for (var m = 1; m <= criticalItems.length; m++) {
                            for (var o = 0; o < dividingParameter; o++) {

                                criticalItems[m - 1]["CriticalItemText" + (o + 1).toString()] = criticalParams[criticalItemIndex];
                                criticalItems[m - 1]["CriticalItemStatus" + (o + 1).toString()] = criticalParamsValues[criticalItemIndex];

                                criticalItemIndex = criticalItemIndex + 1;

                            }
                        }
                        dataModel[i].CriticalItems = criticalItems;

                    } else {
                        dataModel[i].CriticalItems = [{
                                "CriticalItemText1": "",
                                "CriticalItemStatus1": "None",
                                "CriticalItemText2": "",
                                "CriticalItemStatus2": "None"
                            }
                        ];
                    }
                }
                controller.model.setProperty("/res", dataModel);

                //Per settare gli allarmi lo rimuovo e lo riassegno

                try {
                    clearInterval(controller.intervalAlarm);
                } catch (err) {
                    controller.intervalAlarm = undefined;
                }

                let obj = {},
					arrBlank = [],
					arrStatus = [],
					lastUpdate = "";

                for (var i = 0; i < dataModel.length; i++) {
                    obj.STATO_MACCHINA = dataModel[i].STATO_MACCHINA;
                    arrStatus.push(obj);
                    obj = new Object;
                    obj.STATO_MACCHINA = "";
                    arrBlank.push(obj);
                    obj = new Object;
                    if (dataModel[i]["DATA_ULTIMO_AGGIORNAMENTO"] != "TimeUnavailable") {
                        if (lastUpdate > new Date(dataModel[i]["DATA_ULTIMO_AGGIORNAMENTO"] + ".000Z") || lastUpdate === "") {
                            lastUpdate = new Date(dataModel[i]["DATA_ULTIMO_AGGIORNAMENTO"] + ".000Z");
                        }
                    }
                }

                controller.lastUpdate = controller.setUpdateTitleTime(lastUpdate);

                controller.model.setProperty("/resStatus", arrStatus);
                controller.model.setProperty("/resStatusBlank", arrBlank);
				
				clearInterval(controller.intervalAlarm);
				
                controller.intervalAlarm = setInterval(function () {
                    controller.setModelAlarm();
                }, 1500);

            } catch (e) {}
			sap.ui.core.BusyIndicator.hide();
        },

        setModelAlarm: function () {
            if (controller.setupAlarm) {
                controller.model.setProperty("/resMachineStatus", controller.model.getProperty("/resStatus"));
                controller.setupAlarm = false;
            } else {
                controller.model.setProperty("/resMachineStatus", controller.model.getProperty("/resStatusBlank"));
                controller.setupAlarm = true;
            }
            controller.model.refresh();
        },

        openPageDetail: function (oEvent) {
            try {
                // Recupero lo STATO_MACCHINA dal modello
                var statoMacchina = oEvent.getSource().getContent().getModel().getProperty("/res")[oEvent.getSource().sId.replace("__tile", "")]["STATO_MACCHINA"];
                
                // Se lo stato è 'NEW', esco dalla funzione senza fare nulla
                if (statoMacchina === 'NEW') {
                    return;
                }

                var piazzola = oEvent.getSource().getContent().getModel().getProperty("/res")[oEvent.getSource().sId.replace("__tile", "")]["PIAZZOLA"];
                var odv = oEvent.getSource().getContent().getModel().getProperty("/res")[oEvent.getSource().sId.replace("__tile", "")]["ODV"];
                
                if (piazzola == "" || odv == "") {
                    return
                }
                var detailPage = "/XMII/CM/ADIGE7/PRODUCTION_PROGRESS/main.html?SITE=" + jQuery.sap.getUriParameters().get("SITE") + "&POD=0&PIAZZOLA=" + piazzola;
                window.open(detailPage, "_self");
            } catch (e) {}
        },
		
		handleSelectionFinish: function (oEvent) {
            var selectedItems = oEvent.getParameter("selectedItems"); //getText()
            var selectedCriticalMaterials = [];
            if (selectedItems.length > 0) {
                for (var i = 0; i < selectedItems.length; i++) {
                    selectedCriticalMaterials.push(selectedItems[i].getText());
                }
            } else {
                selectedCriticalMaterials = [];
            }

            controller.model.setProperty("/selectedCriticalMaterials", selectedCriticalMaterials);
        },
		
        openCriticalItemDC: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().sPath.split("/"),
            oModel = controller.model.getProperty(sPath[0] + "/" + sPath[1] + "/" + sPath[2]),
            input = {
					"CheckListOperationID": oModel["ChecklistOperationId"],
					"Language": controller.model.getProperty("/user")[0].Language,
					"UserID": controller.model.getProperty("/user")[0].UserId
			},
            result = controller.sendData("GET_DC_BY_CHECKLIST_AND_OPERATION", "TRANSACTION", input);

            controller.model.setProperty("/selectedOperation", oModel["ChecklistOperationId"]);

            for (var i = 0; i < result.length; i++) {
                result[i].EDITABLE = "true";
				//Decode Note URL for Critical Material
				if(result[i]["DC_TYPE"] === "5")
					result[i]["NOTE"] = decodeURIComponent(result[i]["NOTE"]);
            }

            if (!controller._dcPopup) {
                controller._dcPopup = sap.ui.xmlfragment("synoptic.view.popup.dcPopup", controller);
                controller.getView().addDependent(controller._dcPopup);
            }

            controller.model.setProperty("/dcPop", result);
            controller.getView().setModel(controller.model);

            controller._dcPopup.open();
        },

        setVisibleRadiobutton: function (dcType) {
            if (dcType == "4" || dcType == "1" || dcType == "5") {
                return true
            } else {
                return false
            }
        },

        setVisibleInput: function (dcType) {
            if (dcType == "4" || dcType == "1" || dcType == "5") {
                return false
            } else {
                return true
            }
        },

        setTypeInput: function (dcType) {
            if (dcType == "2") {
                return "Number"
            } else {
                return "Text"
            }
        },

        getRadiobuttonToBeSelected: function (dcValue) {
            if (dcValue == "false") {
                return 1
            } else if (dcValue == "true") {
                return 0
            } else {
                return -1
            }
        },

        closeDCPopup: function () {
            controller._dcPopup.close();
            controller._dcPopup.destroy();
            controller._dcPopup = undefined;
        },

        undo: function () {
            controller.closeDCPopup();
            controller.resfreshViewSynoptic(false);
        },

        undoDCPopup: function () {
            var dcModel = controller.model.getData().dcPop;
            var isEdited = false;
            for (var i = 0; i < dcModel.length; i++) {
                if (dcModel[i]["EDITED"] === "true") {
                    isEdited = true;
                    break
                }
            }
            if (isEdited) {
                var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                MessageBox.confirm(controller.oBundle.getText("dcError.confirmNotSaveInsertValue"), {
                    styleClass: bCompact ? "sapUiSizeCompact" : "",
                    onClose: function (evt) {
                        if (evt === "OK") {
                            controller.undo();
                        }
                    }
                });
            } else {
                controller.undo();
            }
        },

        setTypeNotesButton: function (noteExists) {
            if (noteExists != undefined & noteExists != "") {
                return "Emphasized"
            } else {
                return "Default"
            }
        },

        radiobuttonselect: function (evt) {
            var modelrow = evt.getSource().getBindingContext().sPath;
            var index = evt.getParameters().selectedIndex;
            if (index == "0") {
                controller.model.getProperty(modelrow).DC_VALUE = "true";
                controller.model.getProperty(modelrow).EDITED = "true";
            } else if (index == "1") {
                controller.model.getProperty(modelrow).DC_VALUE = "false";
                controller.model.getProperty(modelrow).EDITED = "true";
            }
        },

        dcValueChange: function (evt) {
            var modelrow = evt.getSource().getBindingContext().sPath;
            controller.model.getProperty(modelrow).EDITED = "true";

        },

        onPressConfirmDc: function () {
            var items = controller.model.getProperty("/dcPop");
            var DATA = [];
            var obj = {};
            var errSoglia = false;
            var minDiff,
            maxDiff = "";

            for (var i = 0; i < items.length; i++) {
                if (items[i].DC_VALUE != "" && items[i].EDITED == "true") {

                    //controlli per valore con soglia
                    if (items[i].DC_TYPE === "2") {
                        if (items[i].MIN_VALUE != "" && items[i].MAX_VALUE != "") {

                            if (parseFloat(items[i].DC_VALUE.replace(",", ".")) < parseFloat(items[i].MIN_VALUE) || parseFloat(items[i].DC_VALUE.replace(",", ".")) > parseFloat(items[i].MAX_VALUE)) {
                                errSoglia = true;
                                if (controller.outThresholdRules) {
                                    //Ricavo i valori approssimati
                                    minDiff = Math.abs(items[i].MIN_VALUE - parseFloat(items[i].DC_VALUE.replace(",", ".")));
                                    maxDiff = Math.abs(items[i].MAX_VALUE - parseFloat(items[i].DC_VALUE.replace(",", ".")));

                                    if (minDiff < maxDiff) {
                                        items[i]["VALUE_REL"] = items[i].DC_VALUE.replace(",", ".");
                                        items[i]["DC_VALUE"] = items[i].MIN_VALUE;
                                    } else {
                                        items[i]["VALUE_REL"] = items[i].DC_VALUE.replace(",", ".");
                                        items[i]["DC_VALUE"] = items[i].MAX_VALUE;
                                    }
                                } else {
                                    items[i].VALUE_REL = "";
                                    items[i].DC_VALUE = "";
                                }
                                //Aggiorno la riga selezionata per l'apertura automatica della nota
                                controller.rowSelNoteDC = "/dcPop/" + i;
                                break;
                            } else {
                                obj.PARAMETER_ID = items[i].DCOL_PARAM_ID;
                                obj.VALUE = items[i].DC_VALUE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n').replace(",", ".");
                                obj.VALUE_REL = items[i].VALUE_REL.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.NOTE = items[i].NOTE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.DELETE = items[i].DEL;
                            }

                        } else if (items[i].MIN_VALUE != "") {
                            if (parseFloat(items[i].DC_VALUE.replace(",", ".")) < parseFloat(items[i].MIN_VALUE)) {
                                errSoglia = true;
                                if (controller.outThresholdRules) {
                                    items[i]["VALUE_REL"] = items[i].DC_VALUE.replace(",", ".");
                                    items[i]["DC_VALUE"] = items[i].MIN_VALUE;
                                } else {
                                    items[i].VALUE_REL = "";
                                    items[i].DC_VALUE = "";
                                }
                                //Aggiorno la riga selezionata per l'apertura automatica della nota
                                controller.rowSelNoteDC = "/dcPop/" + i;
                                break;
                            } else {
                                obj.PARAMETER_ID = items[i].DCOL_PARAM_ID;
                                obj.VALUE = items[i].DC_VALUE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n').replace(",", ".");
                                obj.VALUE_REL = items[i].VALUE_REL.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.NOTE = items[i].NOTE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.DELETE = items[i].DEL;
                            }

                        } else if (items[i].MAX_VALUE != "") {
                            if (parseFloat(items[i].DC_VALUE) > parseFloat(items[i].MAX_VALUE)) {
                                errSoglia = true;
                                if (controller.outThresholdRules) {
                                    items[i]["VALUE_REL"] = items[i].DC_VALUE.replace(",", ".");
                                    items[i]["DC_VALUE"] = items[i].MAX_VALUE;
                                } else {
                                    items[i].VALUE_REL = "";
                                    items[i].DC_VALUE = "";
                                }
                                //Aggiorno la riga selezionata per l'apertura automatica della nota
                                controller.rowSelNoteDC = "/dcPop/" + i;
                                break;
                            } else {
                                obj.PARAMETER_ID = items[i].DCOL_PARAM_ID;
                                obj.VALUE = items[i].DC_VALUE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n').replace(",", ".");
                                obj.VALUE_REL = items[i].VALUE_REL.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.NOTE = items[i].NOTE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.DELETE = items[i].DEL;
                            }
                        }

                        //Caso di valore Atteso
                        else if (items[i].STANDARD_VALUE != "") {
                            if (parseFloat(items[i].DC_VALUE.replace(",", ".")) != parseFloat(items[i].STANDARD_VALUE)) {
                                errSoglia = true;
                                if (controller.outThresholdRules) {
                                    items[i]["VALUE_REL"] = items[i].DC_VALUE.replace(",", ".");
                                    items[i]["DC_VALUE"] = items[i].STANDARD_VALUE.replace(",", ".");
                                } else {
                                    items[i].VALUE_REL = "";
                                    items[i].DC_VALUE = "";
                                }
                                //Aggiorno la riga selezionata per l'apertura automatica della nota
                                controller.rowSelNoteDC = "/dcPop/" + i;
                                break;
                            } else {
                                obj.PARAMETER_ID = items[i].DCOL_PARAM_ID;
                                obj.VALUE = items[i].DC_VALUE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n').replace(",", ".");
                                obj.VALUE_REL = items[i].VALUE_REL.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.NOTE = items[i].NOTE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                                obj.DELETE = items[i].DEL;
                            }
                        } else {
                            obj.PARAMETER_ID = items[i].DCOL_PARAM_ID;
                            obj.VALUE = items[i].DC_VALUE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n').replace(",", ".");
                            obj.VALUE_REL = items[i].VALUE_REL.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                            obj.NOTE = items[i].NOTE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                            obj.DELETE = items[i].DEL;
                        }
                    }

                    //controlli per booleano con e senza soglia
                    else if (items[i].DC_TYPE === "1" || items[i].DC_TYPE === "4") {
                        if (items[i].DC_VALUE === "false") {
                            errSoglia = true;
                            if (controller.outThresholdRules) {
                                items[i]["VALUE_REL"] = items[i].DC_VALUE.replace(",", ".");
                                items[i]["DC_VALUE"] = "true";
                            } else {
                                items[i].VALUE_REL = "";
                                items[i].DC_VALUE = "";
                            }
                            //Aggiorno la riga selezionata per l'apertura automatica della nota
                            controller.rowSelNoteDC = "/dcPop/" + i;
                            break;
                        } else {
                            obj.PARAMETER_ID = items[i].DCOL_PARAM_ID;
                            obj.VALUE = items[i].DC_VALUE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n').replace(",", ".");
                            obj.VALUE_REL = items[i].VALUE_REL.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                            obj.NOTE = items[i].NOTE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
                            obj.DELETE = items[i].DEL;
                        }
                    }

                    //Per tipo stringa
                    else {
                        obj.PARAMETER_ID = items[i].DCOL_PARAM_ID;
                        obj.VALUE = items[i].DC_VALUE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n').replace(",", ".");
                        //Encode Note URL for Critical Material
						if (items[i].DC_TYPE === "5"){
							obj.NOTE = encodeURIComponent(items[i].NOTE);
						}else{
							obj.NOTE = items[i].NOTE.replace(/("|&|\\|')/g, ' ').replace(/\n|\r/g, '\\n');
						}
                        obj.DELETE = items[i].DEL;
                    }
                    DATA.push(obj);
                    obj = new Object;
                }
            }

            //Per ogni valore della DC fuori soglia apro una Nota
            if (errSoglia) {

                //check se user ha attività adeguata
                if (controller.outThresholdRules) {
                    var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                    MessageBox.confirm(controller.oBundle.getText("dcError.confirmInsertValue"), {
                        styleClass: bCompact ? "sapUiSizeCompact" : "",
                        onClose: function (evt) {
                            if (evt === "OK") {
                                controller.openPopupNotesDC();
                            } else {
                                //Ripristino i valori originali
                                for (var i = 0; i < items.length; i++) {
                                    if (items[i].VALUE_REL != "" && items[i].EDITED == "true") {
                                        items[i].DC_VALUE = items[i].VALUE_REL;
                                    }
                                }
                            }
                        }
                    });
                } else {
                    var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                    MessageBox.error(controller.oBundle.getText("dcError.permissionError"), {
                        styleClass: bCompact ? "sapUiSizeCompact" : "",
                        actions: [controller.oBundle.getText("dcError.permissionErrorBtn")],
                        onClose: function (sAction) {
                            controller.model.refresh();
                        }
                    });
                }
            } else {
                DATA = JSON.stringify(DATA);
                var input = {
                    "SITE": "",
                    "USER_ID": controller.model.getProperty("/user")[0].UserId,
                    "OPERATION_ID": controller.model.getProperty("/selectedOperation"),
                    "DATA": DATA
                };

                var result = controller.sendData("SAVE_DATA_COLLECTION", "TRANSACTION", input);

                if (result[0].RC == "4") {
                    var message;
                    try {
                        message = controller.oBundle.getText(result[0].MESSAGE);
                    } catch (e) {
                        message = result[0].MESSAGE;
                    }
                    MessageBox.error(message);
                };

                controller.closeDCPopup();
                controller.resfreshViewSynoptic(true);
            }
        },

        pressDeleteParam: function (oEvent) {
            var modelrow = controller.model.getProperty(oEvent.getSource().getBindingContext().sPath);
            MessageBox.confirm(controller.oBundle.getText("confirmDeleteDCParam"), {
                styleClass: "sapUiSizeCompact",
                onClose: function (evt) {
                    if (evt === "OK") {
                        modelrow.EDITED = "true";
                        modelrow.DEL = "true";
                        modelrow.EDITABLE = "false";
                        controller.model.refresh();
                    }
                }
            });
        },

        //Apertura note nella per valori fuori soglia nella DC

        openPopupNotesDC: function (oSource) {
            if (!controller._NoteDCPopup) {
                controller._NoteDCPopup = sap.ui.xmlfragment("synoptic.view.popup.notesPopupDC", controller);
                controller.getView().addDependent(controller._NoteDCPopup);
            }

            var rowData,
            ParString = "";

            //Apro la nota
            if (!!oSource) {
                //Da evento press del tasto per la visualizzazione delle note esistenti
                controller.rowSelNoteDC = oSource.getSource().getBindingContext().sPath;
                rowData = controller.model.getProperty(controller.rowSelNoteDC);
            } else {
                //Da chiamata al press del baffo verde. Qui aggiungo un testo più il valore inserito

                rowData = controller.model.getProperty(controller.rowSelNoteDC);
                //var ParString = controller.oBundle.getText("dcError.StandardTxt") +"\"" + controller.model.getProperty("/popDCValErr")[0]["DC_PARAMETER_DESC"].split(";")[0] + "\" " + controller.oBundle.getText("dcError.StandardTxt1") + ": " + controller.model.getProperty("/popDCValErr")[0]["EFF_DC_VALUE"];

                if (rowData["DC_TYPE"] === "4" || rowData["DC_TYPE"] === "1") {
                    //Per eventuali richieste per messaggi automatici di tipo Booleano
                    ParString = controller.oBundle.getText("dcError.StandardTxtBoolean");
                    rowData["NOTE"] = rowData["NOTE"] === "" ? ParString : (rowData["NOTE"] + "\n\n" + ParString);
                } else {
                    ParString = controller.oBundle.getText("dcError.StandardTxt2") + " " + rowData["VALUE_REL"];
                    rowData["NOTE"] = rowData["NOTE"] === "" ? ParString : (rowData["NOTE"] + "\n\n" + ParString);
                }
            }

            controller.model.setProperty("/notesPop", rowData);
            controller.getView().setModel(controller.model);

            controller._NoteDCPopup.setContentWidth("45rem");
            controller._NoteDCPopup.open();
        },

        onPressConfirmNoteDC: function () {
            //In automatico viene già bindato il nuovo valore devo solo chiudere la popup
            controller.rowSelNoteDC = "";
            controller._NoteDCPopup.close();
            controller._NoteDCPopup.destroy();
            controller._NoteDCPopup = undefined;
        },

        setEditNotesParDC: function () {
            controller.model.getProperty(controller.rowSelNoteDC)["EDITED"] = "true";
        },

        handleBackPress: function () {
            window.location.href = "/XMII/CM/ADIGE7/MAIN/main.html?SITE=" + jQuery.sap.getUriParameters().get("SITE");
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
					} catch (err) {}
				},
				error: function searchError(xhr, err) {
					console.error("Error on ajax call: " + err);
					console.log(JSON.stringify(xhr));
				}
			});
        },

        onAvatarPressed: function (oEvent) {
            controller._popup = sap.ui.xmlfragment("synoptic.view.popup.avatarPopup", controller);
            controller.getView().addDependent(controller._popup);
            controller._popup.openBy(oEvent.getSource());
        },

        getUserID: function () {
            var Input = {
                "SITE": jQuery.sap.getUriParameters().get("SITE")
            };
            var result = controller.sendData("GET_USER_INFORMATIONS", "TRANSACTION", {});
			
            try {
                var arrAvatar = result[0]["Name"].split(",");
                result[0].AVATAR = arrAvatar[0].charAt(0) + arrAvatar[1].trim().charAt(0);
            } catch (err) {}
			
            controller.model.setProperty("/user", result);
            //Ottengo il SiteId
            controller.siteId = controller.sendData("GET_SITE_ID", "TRANSACTION", Input)[0]["SiteId"];
            controller.getView().setModel(controller.model);
        },

        checkUserActivity: function (inputActivity) {
            return controller.model.getProperty("/activities").find(({
                    Activity
                }) => Activity === inputActivity) !== undefined
        },

        //-------------------Session keep Alive------------------//
        sessionKeepAlive: function () {
            var input = {};
            input.SESSION = "Session";
            controller.getDataSync("SEESSIONKEEPALIVE", "ADIGE7/SYNOPTIC_BLM1/TRANSACTION", input, controller.sessionKeepAliveSuccess, controller.sessionKeepAliveSuccess);
        },
        sessionKeepAliveSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            try {
                var jsonArr = JSON.parse(jsonArrStr);
                if (jsonArr[0].RC != "OK") {
                    window.location.href = "main.html?SITE=ADIGE&j_user=" + controller.usr + "&j_password=" + controller.pwd;
                    location.reload();
                }
            } catch (e) {
                window.location.href = "main.html?SITE=ADIGE&j_user=" + controller.usr + "&j_password=" + controller.pwd
                    location.reload();
            }
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
                req.done(jQuery.proxy(suss, controller));
                req.fail(jQuery.proxy(errf, controller));
            } catch (e) {}
        },

        onPageChanged: function(oEvent) {
            let currentPage = oEvent.getParameter("newActivePageId").split("--")[1];
            controller.model.setProperty("/ActulPage", currentPage);
            controller.resfreshViewSynoptic(true);
			 
            // Aggiorno il titolo
            controller.byId("labelTime").setText(controller.oBundle.getText("title") + currentPage + " - " + controller.time() + " - " + controller.oBundle.getText("lastUpd") + " " + controller.lastUpdate);
        },
		
		onPageCriticalMaterialChanged: function(oEvent) {
            let currentPage = oEvent.getParameter("newActivePageId").split("---")[1];
            controller.model.setProperty("/ActulPage", currentPage);
			controller.resfreshViewSynoptic(true);
            
            // Aggiorno il titolo
            controller.byId("labelTime2").setText(controller.oBundle.getText("title") + currentPage + " - " + controller.time() + " - " + controller.oBundle.getText("lastUpd") + " " + controller.lastUpdate);
        },
    });
});