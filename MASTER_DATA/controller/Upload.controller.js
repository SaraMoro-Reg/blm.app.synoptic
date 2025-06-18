var controllerUpdate;
sap.ui.define([
        'sap/ui/core/mvc/Controller',
        'sap/m/MessageToast',
		'sap/ui/export/Spreadsheet',
		'sap/m/MessageBox',
    ], function (Controller, MessageToast, Spreadsheet, MessageBox) {
    "use strict";

    return Controller.extend("master_data.controller.Upload", {
        tableModel: new sap.ui.model.json.JSONModel({
			"viewFooter": {
				"visChecklistFooter": true,
			}
		}),	
		oJSON: undefined,
		dialogBusy: new sap.m.BusyDialog(),
		
        onInit: function () {
			controllerUpdate = this;
			controllerUpdate.getView().setModel(controllerUpdate.tableModel);
			controllerUpdate.tableModel.setSizeLimit(50000);
			
			//create fileUploader
			var inputf = "<div id='drop'></div><input type='file' name='xlfile' id='fileUploader' />";
			var fileUploader = new sap.ui.core.HTML();
			fileUploader.setContent(inputf);
			controllerUpdate.byId("HBoxUpload").addItem(fileUploader);	
        },
		
		onAfterRendering: function(){			
			$('#fileUploader').ready(function () {$('#fileUploader').change(controllerUpdate.handleFile);});
		},

		setModelProperty: function(sPath, oValue){
			controllerUpdate.tableModel.setProperty(sPath, oValue);
		},

		pressTabBar: function (oEvent) { 
			let sPage = oEvent.getParameter("section").sId.split("--")[1];
			if (sPage === "CHECKLIST") {
				controllerUpdate.setModelProperty("/viewFooter/visChecklistFooter", true);
			} else {
				controllerUpdate.setModelProperty("/viewFooter/visChecklistFooter", false);
			}
		},
		
		handleFile: function(e) {
			controllerUpdate.dialogBusy.open();
			//Get the files from Upload control
			var files = e.target.files;
			var i,
			f;
			//Loop through files
			for (i = 0, f = files[i]; i != files.length; ++i) {
				var reader = new FileReader();
				var name = f.name;
				reader.onload = function (e) {
					var data = e.target.result;

					var result = {};
					var workbook = XLSX.read(data, {
							type: 'array'
						});

					var sheet_name_list = workbook.SheetNames;
					sheet_name_list.forEach(function (y) { /* iterate through sheets */
						//Convert the cell value to Json

						var roa = XLSX.utils.sheet_to_json(workbook.Sheets[y], {defval:""});
						if (roa.length > 0) {
							result[y] = roa;
						}
					});
					controllerUpdate.oJSON = result;
					//Upload completato
					controllerUpdate.uploadPress();
				};
				reader.readAsArrayBuffer(f);
			}
		},
			
		sendData: function(Transaction, route, Input) {
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
                success: function(data) {
                    results = JSON.parse(data.documentElement.textContent);
                },
                error: function searchError(xhr, err) {
                    console.error("Error on ajax call: " + err);
                    console.log(JSON.stringify(xhr));
                }
            });
            return results;
        },
		
		excelDateToJSDate: function (date) {
		 // Adeguamento del Timezone
		  var timeZoneOffset =  -(new Date(0).getTimezoneOffset()/60),
		        localDate = new Date(Math.round((date - (timeZoneOffset > -1 ? 25569 : 25568))*86400*1000)); 
		  return localDate.getDate() + "/" + (localDate.getMonth()+1) + "/" + localDate.getFullYear()
		},
		
		uploadPress: function () {			
			if(controllerUpdate.oJSON != undefined){
				var Checklist = controllerUpdate.oJSON[Object.keys(controllerUpdate.oJSON)[0]];
				
				//Prima formattazione della data
				for(var i = 0; i < Checklist.length; i++){
					/*if (Checklist[i].DATA_INIZIO != "") {
						Checklist[i].DATA_INIZIO = controllerUpdate.excelDateToJSDate(Checklist[i].DATA_INIZIO);
					}*/
					if (Checklist[i].DATA_SPEDIZIONE != "") {
						Checklist[i].DATA_SPEDIZIONE = controllerUpdate.excelDateToJSDate(Checklist[i].DATA_SPEDIZIONE);
					}
					if (Checklist[i].DATE_NON_LAVORATIVE != "") {
						Checklist[i].DATE_NON_LAVORATIVE = controllerUpdate.excelDateToJSDate(Checklist[i].DATE_NON_LAVORATIVE);
					}
				}
				
				var DettaglioFasi = controllerUpdate.oJSON[Object.keys(controllerUpdate.oJSON)[1]];
				controllerUpdate.tableModel.setProperty("/tabCheckList", Checklist);
				controllerUpdate.tableModel.setProperty("/tabFaseDetails", DettaglioFasi);
				controllerUpdate.tableModel.setProperty("/tabChecklistAttachment", controllerUpdate.oJSON["ALLEGATI_CHECKLIST"]!= undefined ? controllerUpdate.oJSON["ALLEGATI_CHECKLIST"]:[]);
				controllerUpdate.tableModel.setProperty("/tabPhaseAttachment", controllerUpdate.oJSON["ALLEGATI_FASE"]!= undefined ? controllerUpdate.oJSON["ALLEGATI_FASE"]:[]);
				controllerUpdate.getView().setModel(controllerUpdate.tableModel);
				
				//Buttons
				controllerUpdate.byId("btnCloseUpload").setEnabled(true);
				controllerUpdate.byId("btnSaveUpload").setEnabled(true);
			}
			
			controllerUpdate.dialogBusy.close();
		},
		
		clearupload: function () {
			document.getElementById("fileUploader").value = "";
			controllerUpdate.tableModel.setProperty("/tabCheckList", []);
			controllerUpdate.tableModel.setProperty("/tabFaseDetails", []);
			controllerUpdate.getView().setModel(controllerUpdate.tableModel);
			controllerUpdate.oJSON = undefined;
			
			//Buttons
			controllerUpdate.byId("btnCloseUpload").setEnabled(false);
			controllerUpdate.byId("btnSaveUpload").setEnabled(false);
		},
		
		uploadSave: function () {
			var bCompact = !!controllerSite.getView().$().closest(".sapUiSizeCompact").length;
			
			//Verifica che tutti i campi obbligatori non siano vuoti 
			//Modello Checklist
			var machine = controllerUpdate.tableModel.getProperty("/tabCheckList");				
		
			for(var i=0; i < machine.length; i++){
				if(machine[i].LINGUA === "" || machine[i].LINGUA === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissLang") + " " + (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(machine[i].KMAT === "" || machine[i].KMAT === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissKmat") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(machine[i].MATRICOLA_MACCHINA === "" || machine[i].MATRICOLA_MACCHINA === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissMatr") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(machine[i].PIAZZOLA_PARTENZA === "" || machine[i].PIAZZOLA_PARTENZA === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissPiaz") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				/*if(machine[i].DATA_INIZIO === "" || machine[i].DATA_INIZIO === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissStartDate") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}*/
				if(machine[i].DATA_SPEDIZIONE === "" || machine[i].DATA_SPEDIZIONE === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissEndDate") + " " + (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}				
			}
			
			//Modello Dettaglio Fasi
			var DettaglioFasi = controllerUpdate.tableModel.getProperty("/tabFaseDetails");
			var arrLength = DettaglioFasi.length;

			for(var i=0; i < arrLength; i++){
				if(DettaglioFasi[i].FASE === "" || DettaglioFasi[i].FASE === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissFase") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].DESCRIZIONE_FASE === "" || DettaglioFasi[i].DESCRIZIONE_FASE === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissDescFase") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].CODICE === "" || DettaglioFasi[i].CODICE === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissCodFase") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].MACROFASE === "" || DettaglioFasi[i].MACROFASE === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissMacroFase") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].CODICE_LISTINO === "" || DettaglioFasi[i].CODICE_LISTINO === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissCodList") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].STD_TIME === "" || DettaglioFasi[i].STD_TIME === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissStdTime") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].RILEVANTE_PER_TEMPI === "" || DettaglioFasi[i].RILEVANTE_PER_TEMPI === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissReltime") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].STD_OPERATORS === "" || DettaglioFasi[i].STD_OPERATORS === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissStdOper") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}
				if(DettaglioFasi[i].SEQUENZA === "" || DettaglioFasi[i].SEQUENZA === undefined){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissSequence") + " " +  (i+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}				
			}
			
			//Controllo se la sequenza è diversa a parità di fase
			let aPhaseElement = _.groupBy(DettaglioFasi, "FASE");
			
			for(let i in aPhaseElement){
				if(Object.keys(_.groupBy(aPhaseElement[i], "SEQUENZA")).length > 1)
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.DuplicateSequenceAtSamePhase") + " " + i, {styleClass: bCompact ? "sapUiSizeCompact" : ""});
			}
			
			//Controllo se la sequenza è ripetuta in Fasi Differenti
			let aSequencePhase = _.groupBy(_.filter(DettaglioFasi, function(o) { return o.SEQUENZA != 0 }), "SEQUENZA");
			
			for(let i in aSequencePhase){
				if(Object.keys(_.groupBy(aSequencePhase[i], "FASE")).length > 1)
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.DuplicateSequenceOnDifferentPhases") + " " + Object.keys(_.groupBy(aSequencePhase[i], "FASE")).join(", "), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
			}
			
			//Controllo sulla corrispondenza TIPO_FASE == 3 e TIPO_RACCOLTA_DATI == 5 e rilevanza tempi diversa da non rilevante
			for(var i = 0; i < arrLength; i++){
				if((DettaglioFasi[i].TIPO_FASE == 3 && DettaglioFasi[i].TIPO_RACCOLTA_DATI != 5) || (DettaglioFasi[i].TIPO_FASE != 3 && DettaglioFasi[i].TIPO_RACCOLTA_DATI == 5)){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.phaseTypeAndDCMismatch"))
				}
				if(DettaglioFasi[i].TIPO_FASE == 3 && DettaglioFasi[i].RILEVANTE_PER_TEMPI != 0 )
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.phaseType3TimeRelevance"))
			}

			//Controllo sull'unicità del nome raccolta dati in caso di TIPO_RACCOLTA_DATI == 5
			/*for(var i = 0; i < arrLength; i++){
				if(DettaglioFasi[i].TIPO_RACCOLTA_DATI == 5){
					var nomeRaccoltaDati = DettaglioFasi[i].NOME_RACCOLTA_DATI;
					for(var j = 0; j< arrLength; j++){
						if(DettaglioFasi[j].NOME_RACCOLTA_DATI != nomeRaccoltaDati && DettaglioFasi[j].TIPO_RACCOLTA_DATI == 5){
							return MessageBox.warning(controller.oBundle.getText("controllerUpdate.typeAndNameMismatch"))
						}
					}
				}
			}*/		

			//Controllo sull'unicità della fase con TIPO_FASE == 3
			for(var i = 0; i < arrLength; i++){
				if(DettaglioFasi[i].TIPO_FASE == 3){
					var fase = DettaglioFasi[i].FASE;
					for(var j = 0; j< arrLength; j++){
						if(DettaglioFasi[j].FASE != fase && DettaglioFasi[j].TIPO_FASE == 3){
							return MessageBox.warning(controller.oBundle.getText("controllerUpdate.phaseTypeAndNameMismatch"))
						}
					}
				}
				if(DettaglioFasi[i].TIPO_FASE == 1){
					var fase = DettaglioFasi[i].FASE;
					for(var j = 0; j< arrLength; j++){
						if(DettaglioFasi[j].FASE != fase && DettaglioFasi[j].TIPO_FASE == 1){
							return MessageBox.warning(controller.oBundle.getText("controllerUpdate.phaseTypeAndNameMismatch1"))
						}
					}
				}
			}
			
			// check phases exist
			let	phaseDetails = controllerUpdate.tableModel.getProperty("/tabFaseDetails"),
				phaseCheck = [];

			phaseDetails.forEach(function(phase) {
				phaseCheck.push({
					"FASE": phase.FASE,
					"COD_FASE": phase.CODICE
				});
			});

			let oInput = { 
				"DATA": JSON.stringify(phaseCheck),
				"SITE_ID": controller.SiteId
			};

			let result = controllerUpdate.sendData("CHECK_PHASE_EXIST", "UPLOAD/TRANSACTION", oInput);	

			if(result[0].RC === "4") { 
				return MessageBox.error(controller.oBundle.getText("controllerUpdate.errPhaseNotExist") + ": " + result[0]["MESSAGE"].substring(0, result[0]["MESSAGE"].length - 2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
			}else if(result[0].RC == "1") {
				return MessageBox.error(result[0].MESSAGE, {styleClass: bCompact ? "sapUiSizeCompact" : ""})
			};

			//Modello per creare la matricola macchina e popolare il calendario macchina	
			var inputArrMatrMacch = [];
			var obj = {};
			var inputArrDateNonLav = [];
			var obj1 = {};			
			var DATE_NON_LAV, DATA_SPEDIZIONE, date = "";
			var tempDate = [];

			for(var i=0; i < machine.length; i++){
				if(i == 0){
					obj.LINGUA = machine[i].LINGUA		
					//obj.SITE_ID = site_id;
					obj.KMAT = machine[i].KMAT;
					obj.MACHINE = machine[i].MATRICOLA_MACCHINA;
					obj.ODV = machine[i].ODV === "" ? "---" : machine[i].ODV ;
					obj.PIAZZOLA_PARTENZA = machine[i].PIAZZOLA_PARTENZA;
					
					//Mantengo sempre la corretta formattazione della data
					/*date = new Date(machine[i].DATA_INIZIO);
					
					if(date.getDate() == NaN){
						DATA_INIZIO = machine[i].DATA_INIZIO;
					}else{
						if(machine[i].DATA_INIZIO != ""){
							tempDate = machine[i].DATA_INIZIO.split("/");
							if(tempDate.length === 1){
								return MessageBox.warning(controller.oBundle.getText("controllerUpdate.InvalidStartDate"), {styleClass: bCompact ? "sapUiSizeCompact" : ""}) 
							}
							DATA_INIZIO = tempDate[1] + "/" + tempDate[0] + "/" + tempDate[2];
						}else{
							DATA_INIZIO = "---";
						}
					}		

					obj.DATA_INIZIO = DATA_INIZIO;*/
					
					//Mantengo sempre la corretta formattazione della data
					date = new Date(machine[i].DATA_SPEDIZIONE);
					
					if(date.getDate() == NaN){
						DATA_SPEDIZIONE = machine[i].DATA_SPEDIZIONE;
					}else{
						if(machine[i].DATA_SPEDIZIONE != ""){
							tempDate = machine[i].DATA_SPEDIZIONE.split("/");
							if(tempDate.length === 1){
								return MessageBox.warning(controller.oBundle.getText("controllerUpdate.InvalidShipDate"), {styleClass: bCompact ? "sapUiSizeCompact" : ""}) 
							}
							DATA_SPEDIZIONE = tempDate[1] + "/" + tempDate[0] + "/" + tempDate[2];
						}else{
							DATA_SPEDIZIONE = "---";
						}
					}			

					obj.DATA_SPEDIZIONE = DATA_SPEDIZIONE;
					obj.FATTORE_CORREZIONE = machine[i].FATTORE_CORREZIONE === "" ? 0 : machine[i].FATTORE_CORREZIONE;
					//obj.LASER = machine[i].LASER.toUpperCase() === "X" ? 'true' : 'false';
					obj.GIORNI_TOTALI = machine[i].GIORNI_TOTALI;
					//Aggiunta campi nome documento e revisione documento
					obj.NOME_DOC = machine[i].NOME_DOC;
					obj.REV_DOC = machine[i].REV_DOC;
					inputArrMatrMacch.push(obj);
					obj = new Object;
				}
				
				//Mantengo sempre la corretta formattazione della data
				date = new Date(machine[i].DATE_NON_LAVORATIVE);
				
				if(date.getDate() == NaN){
					DATE_NON_LAV = machine[i].DATE_NON_LAVORATIVE;
				}else{
					if(machine[i].DATE_NON_LAVORATIVE != ""){
						tempDate = machine[i].DATE_NON_LAVORATIVE.split("/");
						if(tempDate.length === 1){
								return MessageBox.warning(controller.oBundle.getText("controllerUpdate.InvalidNotWorkingDate"), {styleClass: bCompact ? "sapUiSizeCompact" : ""}) 
						}
						DATE_NON_LAV = tempDate[1] + "/" + tempDate[0] + "/" + tempDate[2];
					}else{
						DATE_NON_LAV = "---";
					}
				}
				
				obj1.DATE_NON_LAVORATIVE = DATE_NON_LAV;
				inputArrDateNonLav .push(obj1);
				obj1 = new Object;
			}
			
			inputArrMatrMacch = JSON.stringify(inputArrMatrMacch);
			inputArrDateNonLav = JSON.stringify(inputArrDateNonLav);
			
			
			//Creazione Modello Dettaglio Fasi
			var inputArrDetFasi = [];
			var arrDetFaseLength = DettaglioFasi.length;
			var objDetFas = {};

			var inputArrDC = [];
			var objDCFas = {}
			
			objDetFas.SEQUENZA = DettaglioFasi[0].SEQUENZA;
			objDetFas.FASE = DettaglioFasi[0].FASE;
			// objDetFas.DESCRIZIONE_FASE = DettaglioFasi[0].DESCRIZIONE_FASE;
			objDetFas.COD_FASE = DettaglioFasi[0].CODICE;
			objDetFas.MACROFASE = DettaglioFasi[0].MACROFASE;
			// objDetFas.PARALLELO = DettaglioFasi[0].PARALLELO == "X" ? "1" : "0";
			// objDetFas.TIPO_FASE = DettaglioFasi[0].TIPO_FASE == "" ? "0" : DettaglioFasi[0].TIPO_FASE;
			// objDetFas.CODICE_LISTINO = DettaglioFasi[0].CODICE_LISTINO;
			// objDetFas.STD_TIME = DettaglioFasi[0].STD_TIME ;
			// objDetFas.RILEVANTE_PER_TEMPI = DettaglioFasi[0].RILEVANTE_PER_TEMPI;
			// objDetFas.STD_OPERATORS = DettaglioFasi[0].STD_OPERATORS;			
			// objDetFas.STRUMENTI = DettaglioFasi[0].STRUMENTI === "" ? "---" : DettaglioFasi[0].STRUMENTI;			
			objDetFas.FATT_CORREZIONE = (DettaglioFasi[0].FATTORE_CORREZIONE === "" || DettaglioFasi[0].FATTORE_CORREZIONE === "0" ) ? 1 : DettaglioFasi[0].FATTORE_CORREZIONE;
			objDetFas.VALIDITA_FASE = '0'; //Sempre valide			
			inputArrDetFasi.push(objDetFas);
			objDetFas = new Object;
			
			var insert = true;
						
			for(var i = 1; i < arrDetFaseLength; i++){
				for(var j = 0; j < inputArrDetFasi.length; j++){
					if(DettaglioFasi[i].FASE != inputArrDetFasi[j].FASE){
						insert= true;						
					}else{
						insert = false;
						break;
					}
				}
				if(insert){
					objDetFas.SEQUENZA = DettaglioFasi[i].SEQUENZA;
					objDetFas.FASE = DettaglioFasi[i].FASE;
					// objDetFas.DESCRIZIONE_FASE = DettaglioFasi[i].DESCRIZIONE_FASE;
					objDetFas.COD_FASE = DettaglioFasi[i].CODICE;
					objDetFas.MACROFASE = DettaglioFasi[i].MACROFASE;
					// objDetFas.PARALLELO = DettaglioFasi[i].PARALLELO == "X" ? "1" : "0";
					// objDetFas.TIPO_FASE = DettaglioFasi[i].TIPO_FASE == "" ? "0" : DettaglioFasi[i].TIPO_FASE;
					// objDetFas.CODICE_LISTINO = DettaglioFasi[i].CODICE_LISTINO;
					// objDetFas.STD_TIME = DettaglioFasi[i].STD_TIME ;
					// objDetFas.RILEVANTE_PER_TEMPI = DettaglioFasi[i].RILEVANTE_PER_TEMPI;
					// objDetFas.STD_OPERATORS = DettaglioFasi[i].STD_OPERATORS;
					//objDetFas.STRUMENTI = DettaglioFasi[i].STRUMENTI === "" ? "---" : DettaglioFasi[i].STRUMENTI;
					objDetFas.FATT_CORREZIONE = (DettaglioFasi[i].FATTORE_CORREZIONE === "" || DettaglioFasi[i].FATTORE_CORREZIONE === "0") ? 1 : DettaglioFasi[i].FATTORE_CORREZIONE;
					objDetFas.VALIDITA_FASE = '0'; //Sempre valide					
					inputArrDetFasi.push(objDetFas);
					objDetFas = new Object;					
				}
			}

			//Creazione Modello per la DataCollection
			for(var count = 0; count < DettaglioFasi.length; count++){
				objDCFas.FASE = DettaglioFasi[count].FASE;
				// objDCFas.DC_NAME = DettaglioFasi[count].NOME_RACCOLTA_DATI;
				// objDCFas.TIPO_RACCOLTA_DATI = DettaglioFasi[count].TIPO_RACCOLTA_DATI === "A" ? "0" : DettaglioFasi[count].TIPO_RACCOLTA_DATI;
				objDCFas.PARAMETRO = DettaglioFasi[count].PARAMETRO === "" ? "---" : DettaglioFasi[count].PARAMETRO;
				// objDCFas.DESCRIZIONE_PARAMETRO = DettaglioFasi[count].DESCRIZIONE_PARAMETRO === "" ? "---" : DettaglioFasi[count].DESCRIZIONE_PARAMETRO;
				// objDCFas.UM = DettaglioFasi[count].UM === "" ? "---" : DettaglioFasi[count].UM;
				//objDCFas.MINIMO = DettaglioFasi[count].MINIMO === "" ? "---" : DettaglioFasi[count].MINIMO;
				// objDCFas.MASSIMO = DettaglioFasi[count].MASSIMO === "" ? "---" : DettaglioFasi[count].MASSIMO;
				// objDCFas.VALORE_STANDARD = DettaglioFasi[count].VALORE_STANDARD === "" ? "---" : DettaglioFasi[count].VALORE_STANDARD;
				objDCFas.ORDINAMENTO_PARAMETRI = DettaglioFasi[count].ORDINAMENTO_PARAMETRI === "" ? "0" : DettaglioFasi[count].ORDINAMENTO_PARAMETRI;
				// objDCFas.RAGGRUPPAMENTO_PARAMETRI = DettaglioFasi[count].RAGGRUPPAMENTO_PARAMETRI === "" ? "DEFAULT" : DettaglioFasi[count].RAGGRUPPAMENTO_PARAMETRI;
				inputArrDC.push(objDCFas);		
				objDCFas = new Object;					
			}

			for(var count = 0; count < inputArrDC.length; count++){
				if(inputArrDC[count].TIPO_RACCOLTA_DATI != "0"  ){
					if(inputArrDC[count].DC_NAME === ""){
						return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissDCNAME") + " " +  (count+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
					}
					if(inputArrDC[count].PARAMETRO === ""){
						return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissPar") + " " +  (count+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
					}
					if(inputArrDC[count].DESCRIZIONE_PARAMETRO === ""){
						return MessageBox.warning(controller.oBundle.getText("controllerUpdate.MissPardDescr") + " " +  (count+2), {styleClass: bCompact ? "sapUiSizeCompact" : ""});
					}
				}
			}
			
			inputArrDetFasi = JSON.stringify(inputArrDetFasi);
			inputArrDC = JSON.stringify(inputArrDC);
			
			//Allegati Checklist
			var modChecklistAttachment = controllerUpdate.tableModel.getProperty("/tabChecklistAttachment");
			var arrCheckAtt = [];
			var objCheckAtt = {};
			for(var count = 0; count < modChecklistAttachment.length; count++){
				objCheckAtt.NOME_ALLEGATO = modChecklistAttachment[count]["NOME_ALLEGATO"];
				objCheckAtt.URL = modChecklistAttachment[count]["URL"].replace(/\s/g,'%20');
				arrCheckAtt.push(objCheckAtt);
				objCheckAtt = new Object;
			}
			
			arrCheckAtt = JSON.stringify(arrCheckAtt);
			
			//Allegati Fasi Checklist
			var modChecklistPhaseAttachment = controllerUpdate.tableModel.getProperty("/tabPhaseAttachment");
			var arrCheckPhaseAtt = [];
			var objCheckPhaseAtt = {};
			for(var count = 0; count < modChecklistPhaseAttachment.length; count++){
				objCheckPhaseAtt.ID_FASE = modChecklistPhaseAttachment[count]["ID_FASE"].replace(/\s/g,'');
				objCheckPhaseAtt.NOME_ALLEGATO = modChecklistPhaseAttachment[count]["NOME_ALLEGATO"];
				objCheckPhaseAtt.URL = modChecklistPhaseAttachment[count]["URL"].replace(/\s/g,'%20');
				arrCheckPhaseAtt.push(objCheckPhaseAtt);
				objCheckPhaseAtt = new Object;
			}
			
			arrCheckPhaseAtt = JSON.stringify(arrCheckPhaseAtt);
			
			//Costruzione input per la transazione e chiamata alla transazione di creazione anagrafica		
						
			controllerUpdate.dialogBusy.open();
			
			var Input = {
					"DATA_MATR_MACC": inputArrMatrMacch,
					"DATE_NON_LAV": inputArrDateNonLav,
					"DATA_FASE_DESCR": inputArrDetFasi, 
					"DC_DATA": inputArrDC, 
					"USER_ID": controller.model.getProperty("/user")[0]["UserId"], 
					"ALLEGATI_CHECKLIST": arrCheckAtt, 
					"ALLEGATI_FASE": arrCheckPhaseAtt, 
					"SITE_ID": controller.SiteId,
					"USR_LANGUAGE": controller.model.getProperty("/user")[0]["Language"]};
			
			jQuery.sap.delayedCall(150, this, function () {
				var result = controllerUpdate.sendData( "CREATE_CHECKLIST" , "UPLOAD/TRANSACTION", Input);
				controllerUpdate.dialogBusy.close();
				
				if(result[0].RC === "4"){
					return MessageBox.warning(controller.oBundle.getText("controllerUpdate.err") + " " + result[0].MESSAGE, {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}else if(result[0].RC == "1"){
					return MessageBox.warning(result[0].MESSAGE, {styleClass: bCompact ? "sapUiSizeCompact" : ""});
				}else{
					controllerUpdate.clearupload();
					return MessageToast.show(controller.oBundle.getText("controllerUpdate.uploadComplete"));
				}
			});
		},
		
		downloadModel: function(){
			var oModel = JSON.parse('{"CHECKLIST":[{"LINGUA":"", "KMAT":"", "MATRICOLA_MACCHINA":"", "ODV":"","PIAZZOLA_PARTENZA":"","DATA_SPEDIZIONE":"","DATE_NON_LAVORATIVE":"","FATTORE_CORREZIONE":"", "NOME_DOC":"" , "REV_DOC": ""}],"DETTAGLIO_FASI":[{"SEQUENZA":"", "FASE":"","DESCRIZIONE_FASE":"","CODICE":"","MACROFASE":"","PARALLELO":"","TIPO_FASE":"","CODICE_LISTINO":"","STD_TIME":"","RILEVANTE_PER_TEMPI":"","STD_OPERATORS":"","FATTORE_CORREZIONE":"","TIPO_RACCOLTA_DATI":"","PARAMETRO":"","DESCRIZIONE_PARAMETRO":"","UM":"","MINIMO":"","MASSIMO":"","VALORE_STANDARD":"","ORDINAMENTO_PARAMETRI":"","RAGGRUPPAMENTO_PARAMETRI":""}],"ALLEGATI_CHECKLIST":[{"NOME_ALLEGATO":"","URL":""}],"ALLEGATI_FASE":[{"ID_FASE":"","NOME_ALLEGATO":"","URL":""}]}');
			
			var ws_data = oModel["CHECKLIST"];
			var ws_data1 = oModel["DETTAGLIO_FASI"];
			var ws_data2 = oModel["ALLEGATI_CHECKLIST"];
			var ws_data3 = oModel["ALLEGATI_FASE"];
			if(typeof XLSX == 'undefined') XLSX = require('xlsx');
			var ws = XLSX.utils.json_to_sheet(ws_data);
			var ws1 = XLSX.utils.json_to_sheet(ws_data1);
			var ws2 = XLSX.utils.json_to_sheet(ws_data2);
			var ws3 = XLSX.utils.json_to_sheet(ws_data3);
			var wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "CHECKLIST");
			XLSX.utils.book_append_sheet(wb, ws1, "DETTAGLIO_FASI");
			XLSX.utils.book_append_sheet(wb, ws2, "ALLEGATI_CHECKLIST");
			XLSX.utils.book_append_sheet(wb, ws3, "ALLEGATI_FASE");
			XLSX.writeFile(wb, "MODELLO_DATI.xlsx");
			
		}		
    });
});
