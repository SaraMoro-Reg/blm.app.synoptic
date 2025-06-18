var controllerSupplierWarehouse;
sap.ui.define([
        'sap/ui/core/mvc/Controller',
        'sap/m/MessageToast',
        'sap/m/MessageBox',
        'sap/ui/core/Fragment',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator'
    ], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("master_data.controller.SupplierWarehouse", {
        supplierWarehouseModel: new sap.ui.model.json.JSONModel(),
        _popup: undefined,
        popupMessage: undefined,

        onInit: function () {
            controllerSupplierWarehouse = this;
            controller.enableElement(controllerSupplierWarehouse.supplierWarehouseModel);
        },

        //pressSupplierWarehouse
        pressSupplierWarehouse: function (oSource) {
            var selKey = oSource.getSource().getSelectedKey();
            switch (selKey) {
            case "SUPPLIER":
                controllerSupplierWarehouse.getSupplierList();
                break;
            case "WAREHOUSE":
                controllerSupplierWarehouse.getWarehouseList();
                break;
            case "SUPPLIER_WAREHOUSE":
                controllerSupplierWarehouse.getSupplierWarehouseList();
                break;
            case "SYSTEM":
                controllerSupplierWarehouse.getSystemList();
                break;
            case "ARCHETYPE":
                controllerSupplierWarehouse.removeArchetypeConfigurationListFilters();
                break;
            case "PMA_MGS_TEMPLATE":
                controllerSupplierWarehouse.closePmaTemplate();
                controllerSupplierWarehouse.createPmaTagList();
                break;
            default:
                //No Action
            }
        },

        /*Supplier*/
        getSupplierList: function () {
            var Input = {
                "SITE_ID": controller.SiteId
            };
            var result = controllerSite.sendData("GET_SUPPLIER_LIST", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSupplier", result);
            controllerSupplierWarehouse.getView().setModel(controllerSupplierWarehouse.supplierWarehouseModel);

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSupplier").setEnabled(false);
            controllerSupplierWarehouse.byId("saveNewSupplier").setEnabled(false);
        },

        newSupplier: function () {
            var addRowModel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSupplier");

            var row = {
                "SUPPLIER_ID": "",
                "SUPPLIER": "",
                "EDIT": "true",
                "VIS": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSupplier", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSupplier", newArr);
                } else {
                    var addArr = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSupplier");
                    addArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSupplier", addArr);
                }
            }

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSupplier").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSupplier").setEnabled(true);

            //Scroll to last table Element
            controllerSupplierWarehouse.byId("tabSupplier").setFirstVisibleRow(addRowModel.length);
        },

        editSupplier: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.VIS = "true";
            lineSel.DEL = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSupplier").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSupplier").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        deleteSupplier: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.VIS = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSupplier").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSupplier").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        saveNewSupplier: function () {
            var modInput = [];
            var obj = {};
            var model = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSupplier");

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].DEL === "true" && model[i].SUPPLIER_ID === "") || model[i].SUPPLIER.trim() === "") {}
                    else {
                        obj.SUPPLIER_ID = model[i].SUPPLIER_ID;
                        obj.SUPPLIER = model[i].SUPPLIER;
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }

            if (modInput.length === 0) {
                controllerSupplierWarehouse.getSupplierList();
            } else {
                var Input = {
                    "DATA": JSON.stringify(modInput),
                    "SITE_ID": controller.SiteId
                };

                var result = controllerSite.sendData("SAVE_SUPPLIER", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
                if (result[0].RC != "0") {
                    MessageBox.warning(controller.oBundle.getText("contrSupWh.insertKO") + " " + result[0].MESSAGE, {
                        onClose: function () {}
                    });
                } else {
                    MessageToast.show(controller.oBundle.getText("contrSupWh.insertOK"));
                    controllerSupplierWarehouse.getSupplierList();
                }
            }
        },

        /*Warehouse*/
        getWarehouseList: function () {
            var result = controllerSite.sendData("GET_WAREHOUSE_LIST", "SUPPLIER_WAREHOUSE/TRANSACTION", {});
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabWarehouse", result);

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseWarehouse").setEnabled(false);
            controllerSupplierWarehouse.byId("saveNewWarehouse").setEnabled(false);
        },

        newWarehouse: function () {
            var addRowModel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabWarehouse");
            var row = {
                "WAREHOUSE_ID": "",
                "WAREHOUSE": "",
                "SAP_DEPOSIT": "",
                "EDIT": "true",
                "VIS": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabWarehouse", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabWarehouse", newArr);
                } else {
                    var addArr = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabWarehouse");
                    addArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabWarehouse", addArr);
                }
            }

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseWarehouse").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewWarehouse").setEnabled(true);

            //Scroll to last table Element
            controllerSupplierWarehouse.byId("tabWarehouse").setFirstVisibleRow(addRowModel.length);
        },

        editWarehouse: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.VIS = "true";
            lineSel.DEL = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseWarehouse").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewWarehouse").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        deleteWarehouse: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.VIS = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseWarehouse").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewWarehouse").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        checkUniqueSAPDeposit: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath),
            aModelWarehouse = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabWarehouse"),
            countUniqueEntry = 0;

            for (var i in aModelWarehouse) {
                if (aModelWarehouse[i]["SAP_DEPOSIT"] === oEvent.oSource.getValue() && oEvent.oSource.getValue().trim() !== "")
                    countUniqueEntry = countUniqueEntry + 1;
            }
            if (countUniqueEntry > 1) {
                lineSel["SAP_DEPOSIT"] = "";
                controller.model.refresh();
                MessageToast.show(controller.oBundle.getText("contrSupWh.errDupInsert"));
            }
        },

        saveNewWarehouse: function () {
            var modInput = [];
            var obj = {};
            var model = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabWarehouse");

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].DEL === "true" && model[i].WAREHOUSE_ID === "") || model[i].WAREHOUSE.trim() === "") {}
                    else {
                        obj.WAREHOUSE_ID = model[i].WAREHOUSE_ID;
                        obj.WAREHOUSE = model[i].WAREHOUSE;
                        obj.SAP_DEPOSIT = model[i].SAP_DEPOSIT;
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }

            if (modInput.length === 0) {
                controllerSupplierWarehouse.getWarehouseList();
            } else {

                var Input = {
                    "DATA": JSON.stringify(modInput),
                    "SITE_ID": controller.SiteId
                };

                var result = controllerSite.sendData("SAVE_WAREHOUSE", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
                if (result[0].RC != "0") {
                    MessageBox.warning(controller.oBundle.getText("contrSupWh.insertKO") + " " + result[0].MESSAGE, {
                        onClose: function () {}
                    });
                } else {
                    MessageToast.show(controller.oBundle.getText("contrSupWh.insertOK"));
                    controllerSupplierWarehouse.getWarehouseList();
                }
            }
        },

        /*Supplier-Warehouse*/
        getSupplierWarehouseList: function () {
            //Filtro Fornitore
            var selSuppKey = controllerSupplierWarehouse.byId("filterSupplier").getSelectedKeys();
            var supplierFilter = "";
            if (selSuppKey.length !== 0) {
                supplierFilter = "(";
                for (var i in selSuppKey) {
                    supplierFilter = supplierFilter + "'" + selSuppKey[i] + "',";
                }
                supplierFilter = supplierFilter.substring(0, supplierFilter.length - 1);
                supplierFilter = supplierFilter + ")";
            }

            //Filtro Magazzino
            var selWarKey = controllerSupplierWarehouse.byId("filterWarehouse").getSelectedKeys();
            var warehouseFilter = "";
            if (selWarKey.length !== 0) {
                warehouseFilter = "(";
                for (var i in selWarKey) {
                    warehouseFilter = warehouseFilter + "'" + selWarKey[i] + "',";
                }
                warehouseFilter = warehouseFilter.substring(0, warehouseFilter.length - 1);
                warehouseFilter = warehouseFilter + ")";
            }

            var Input = {
                "SITE_ID": controller.SiteId,
                "SUPPLIER_ID": supplierFilter,
                "WAREHOUSE_ID": warehouseFilter
            };
            var result = controllerSite.sendData("GET_PICKUP_ON_DEMAND", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSuppWarehouse", result);

            //Modello Filtro Fornitore
            var tmpObj = {};
            var modSuppArr = [];
            var check = true;
            for (var i in result) {
                if (i == 0) {
                    tmpObj.SUPPLIER_ID = result[i]["SUPPLIER_ID"];
                    tmpObj.SUPPLIER = result[i]["SUPPLIER"];
                    modSuppArr.push(tmpObj);
                    tmpObj = new Object;
                } else {
                    for (var j in modSuppArr) {
                        if (result[i]["SUPPLIER"] === modSuppArr[j]["SUPPLIER"]) {
                            check = false;
                            break;
                        }
                    }
                    if (check) {
                        tmpObj.SUPPLIER_ID = result[i]["SUPPLIER_ID"];
                        tmpObj.SUPPLIER = result[i]["SUPPLIER"];
                        modSuppArr.push(tmpObj);
                        tmpObj = new Object;
                    }
                    check = true;
                }
            }

            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/filterSupplier", modSuppArr);

            //Modello Filtro Magazzino
            var tmpObj = {};
            var modWareArr = [];
            var check = true;
            for (var i in result) {
                if (i == 0) {
                    tmpObj.WAREHOUSE_ID = result[i]["WAREHOUSE_ID"];
                    tmpObj.WAREHOUSE = result[i]["WAREHOUSE"];
                    modWareArr.push(tmpObj);
                    tmpObj = new Object;
                } else {
                    for (var j in modWareArr) {
                        if (result[i]["WAREHOUSE"] === modWareArr[j]["WAREHOUSE"]) {
                            check = false;
                            break;
                        }
                    }
                    if (check) {
                        tmpObj.WAREHOUSE_ID = result[i]["WAREHOUSE_ID"];
                        tmpObj.WAREHOUSE = result[i]["WAREHOUSE"];
                        modWareArr.push(tmpObj);
                        tmpObj = new Object;
                    }
                    check = true;
                }
            }

            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/filterWharehouse", modWareArr);

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSuppWarehouse").setEnabled(false);
            controllerSupplierWarehouse.byId("saveNewSuppWarehouse").setEnabled(false);
        },

        removeFilters: function () {
            controllerSupplierWarehouse.byId("filterSupplier").setSelectedKeys();
            controllerSupplierWarehouse.byId("filterWarehouse").setSelectedKeys();
            controllerSupplierWarehouse.getSupplierWarehouseList();
        },

        newSuppWarehouse: function () {
            var addRowModel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSuppWarehouse");
            var row = {
                "SUPPLIER_ID": "",
                "SUPPLIER": "",
                "WAREHOUSE_ID": "",
                "WAREHOUSE": "",
                "PICKUP_ON_DEMAND": "0",
                "EDIT": "true",
                "VIS": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSuppWarehouse", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSuppWarehouse", newArr);
                } else {
                    var addArr = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSuppWarehouse");
                    addArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSuppWarehouse", addArr);
                }
            }

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSuppWarehouse").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSuppWarehouse").setEnabled(true);

            //Scroll to last table Element
            controllerSupplierWarehouse.byId("idTabSuppWarehouse").setFirstVisibleRow(addRowModel.length);
        },

        editPickupOndemand: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.DEL = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSuppWarehouse").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSuppWarehouse").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        deleteSupplierWarehouse: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.VIS = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSuppWarehouse").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSuppWarehouse").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        saveSuppWarehouse: function () {
            var modInput = [];
            var obj = {};
            var model = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSuppWarehouse");

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if (model[i].DEL === "true" && (model[i].WAREHOUSE_ID === "" || model[i].SUPPLIER_ID === "")) {}
                    else {
                        obj.SUPPLIER_ID = model[i].SUPPLIER_ID;
                        obj.WAREHOUSE_ID = model[i].WAREHOUSE_ID;
                        obj.PICKUP_ON_DEMAND = model[i].PICKUP_ON_DEMAND;
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }

            if (modInput.length === 0) {
                controllerSupplierWarehouse.getSupplierWarehouseList();
            } else {

                var Input = {
                    "DATA": JSON.stringify(modInput)
                };

                var result = controllerSite.sendData("SAVE_PICKUP_ON_DEMAND", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
                if (result[0].RC != "0") {
                    MessageBox.warning(controller.oBundle.getText("contrSupWh.insertKO") + " " + result[0].MESSAGE, {
                        onClose: function () {}
                    });
                } else {
                    MessageToast.show(controller.oBundle.getText("contrSupWh.insertOK"));
                    controllerSupplierWarehouse.getSupplierWarehouseList();
                }
            }
        },

        changePickUpCombo: function (oEvent) {
            var modelRowSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSuppWarehouse/" + oEvent.oSource.oParent.getIndex());
            modelRowSel.PICKUP_ON_DEMAND = oEvent.oSource.getSelectedKey();
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        //FUNZIONI PER RICERCA SUPPLIER
        openSupplierHelp: function (oEvent) {
            //Salvo il percorso di binding del modello della tabella sottostante
            controllerSupplierWarehouse.byId("selTabSuppWarehouseRow").setText(oEvent.oSource.getBindingContext().sPath);

            var Input = {
                "SITE_ID": controller.SiteId
            };
            var result = controllerSite.sendData("GET_SUPPLIER_LIST", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSupplierList", result);

            if (!controllerSupplierWarehouse._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.listSupplier",
                    controller: controllerSupplierWarehouse
                }).then(function (oValueHelpDialog) {
                    controllerSupplierWarehouse._oValueHelpDialog = oValueHelpDialog;
                    controllerSupplierWarehouse.getView().addDependent(controllerSupplierWarehouse._oValueHelpDialog);
                    controllerSupplierWarehouse._oValueHelpDialog.open();
                });
            } else {
                controllerSupplierWarehouse._oValueHelpDialog.open();
            }
        },

        handleValueHelpSupplierClose: function (oEvent) {
            try {
                var rowSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(controllerSupplierWarehouse.byId("selTabSuppWarehouseRow").getText());
                var oSelectedItem = oEvent.getParameter("selectedItem");

                if (rowSel["WAREHOUSE_ID"] !== "") {
                    var modTabSuppWarehouse = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSuppWarehouse");
                    var check = false;
                    for (var i in modTabSuppWarehouse) {
                        if (modTabSuppWarehouse[i]["SUPPLIER_ID"] === oSelectedItem.mProperties.highlightText && modTabSuppWarehouse[i]["WAREHOUSE_ID"] === rowSel["WAREHOUSE_ID"]) {
                            check = true;
                            break;
                        }
                    }
                    if (check) {
                        MessageToast.show(controller.oBundle.getText("contrSupWh.errDupInsert"));
                    } else {
                        rowSel["SUPPLIER_ID"] = oSelectedItem.mProperties.highlightText;
                        rowSel["SUPPLIER"] = oSelectedItem.mProperties.title;
                        controllerSupplierWarehouse.supplierWarehouseModel.refresh();
                        controllerSupplierWarehouse.byId("newSuppWarehouse").setEnabled(true);
                    }

                } else {
                    rowSel["SUPPLIER_ID"] = oSelectedItem.mProperties.highlightText;
                    rowSel["SUPPLIER"] = oSelectedItem.mProperties.title;
                    controllerSupplierWarehouse.supplierWarehouseModel.refresh();
                }

                //Pulisco il percorso di binding del modello della tabella sottostante
                controllerSupplierWarehouse.byId("selTabSuppWarehouseRow").setText("");
                controllerSupplierWarehouse.closeDialog();
            } catch (err) {
                controllerSupplierWarehouse.closeDialog();
            }
        },

        handleSearchSupplier: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("SUPPLIER", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        //FUNZIONI PER RICERCA WAREHOUSE
        openWarehouseHelp: function (oEvent) {
            //Salvo il percorso di binding del modello della tabella sottostante
            controllerSupplierWarehouse.byId("selTabSuppWarehouseRow").setText(oEvent.oSource.getBindingContext().sPath);

            var result = controllerSite.sendData("GET_WAREHOUSE_LIST", "SUPPLIER_WAREHOUSE/TRANSACTION", {});
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabWarehouseList", result);

            if (!controllerSupplierWarehouse._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.listWarehouse",
                    controller: controllerSupplierWarehouse
                }).then(function (oValueHelpDialog) {
                    controllerSupplierWarehouse._oValueHelpDialog = oValueHelpDialog;
                    controllerSupplierWarehouse.getView().addDependent(controllerSupplierWarehouse._oValueHelpDialog);
                    controllerSupplierWarehouse._oValueHelpDialog.open();
                });
            } else {
                controllerSupplierWarehouse._oValueHelpDialog.open();
            }
        },

        handleValueHelpWarehouseClose: function (oEvent) {
            try {
                var rowSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(controllerSupplierWarehouse.byId("selTabSuppWarehouseRow").getText());
                var oSelectedItem = oEvent.getParameter("selectedItem");

                if (rowSel["SUPPLIER_ID"] !== "") {
                    var modTabSuppWarehouse = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSuppWarehouse");
                    var check = false;
                    for (var i in modTabSuppWarehouse) {
                        if (modTabSuppWarehouse[i]["WAREHOUSE_ID"] === oSelectedItem.mProperties.highlightText && modTabSuppWarehouse[i]["SUPPLIER_ID"] === rowSel["SUPPLIER_ID"]) {
                            check = true;
                            break;
                        }
                    }
                    if (check) {
                        MessageToast.show(controller.oBundle.getText("contrSupWh.errDupInsert"));
                    } else {
                        rowSel["WAREHOUSE_ID"] = oSelectedItem.mProperties.highlightText;
                        rowSel["WAREHOUSE"] = oSelectedItem.mProperties.title;
                        controllerSupplierWarehouse.supplierWarehouseModel.refresh();
                        controllerSupplierWarehouse.byId("newSuppWarehouse").setEnabled(true);
                    }

                } else {
                    rowSel["WAREHOUSE_ID"] = oSelectedItem.mProperties.highlightText;
                    rowSel["WAREHOUSE"] = oSelectedItem.mProperties.title;
                    controllerSupplierWarehouse.supplierWarehouseModel.refresh();
                }

                //Pulisco il percorso di binding del modello della tabella sottostante
                controllerSupplierWarehouse.byId("selTabSuppWarehouseRow").setText("");
                controllerSupplierWarehouse.closeDialog();
            } catch (err) {
                controllerSupplierWarehouse.closeDialog();
            }
        },

        handleSearchWarehouse: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("WAREHOUSE", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        closeDialog: function () {
            controllerSupplierWarehouse._oValueHelpDialog = undefined;
        },

        /*System-Warehouse*/
        getSystemList: function () {
            //Filtro Fornitore
            var selSystemKey = controllerSupplierWarehouse.byId("filterSystem").getSelectedKeys();
            var systemFilter = "";
            if (selSystemKey.length !== 0) {
                systemFilter = "(";
                for (var i in selSystemKey) {
                    systemFilter = systemFilter + "'" + selSystemKey[i] + "',";
                }
                systemFilter = systemFilter.substring(0, systemFilter.length - 1);
                systemFilter = systemFilter + ")";
            }

            var result = controllerSite.sendData("GET_SYSTEM_WAREHOUSE", "SUPPLIER_WAREHOUSE/TRANSACTION", {
                "SYSTEM": systemFilter
            });
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSystem", result);
            //controllerSupplierWarehouse.getView().setModel(controllerSupplierWarehouse.supplierWarehouseModel);

            //Modello Filtro Fornitore
            var tmpObj = {};
            var modSystemArr = [];
            var check = true;
            for (var i in result) {
                if (i == 0) {
                    tmpObj.SYSTEM_ID = result[i]["SYSTEM_ID"];
                    tmpObj.SYSTEM = result[i]["SYSTEM"];
                    modSystemArr.push(tmpObj);
                    tmpObj = new Object;
                } else {
                    for (var j in modSystemArr) {
                        if (result[i]["SYSTEM"] === modSystemArr[j]["SYSTEM"]) {
                            check = false;
                            break;
                        }
                    }
                    if (check) {
                        tmpObj.SYSTEM_ID = result[i]["SYSTEM_ID"];
                        tmpObj.SYSTEM = result[i]["SYSTEM"];
                        modSystemArr.push(tmpObj);
                        tmpObj = new Object;
                    }
                    check = true;
                }
            }

            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/filterSystem", modSystemArr);

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSystem").setEnabled(false);
            controllerSupplierWarehouse.byId("saveNewSystem").setEnabled(false);
        },

        newSystem: function () {
            var addRowModel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSystem");
            controllerSupplierWarehouse.byId("saveNewSystem").setEnabled(true);

            var row = {
                "SYSTEM_ID": "",
                "SYSTEM": "",
                "ACCESSORY": "",
                "WAREHOUSE_ID": "",
                "WAREHOUSE": "",
                "FORCE_SAP_DEPOSIT_UPDATE": "false",
                "DATE_TYPE": "",
                "DELTA": "",
                "EDIT": "true",
                "VIS": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSystem", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSystem", newArr);
                } else {
                    var addArr = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSystem");
                    addArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabSystem", addArr);
                }
            }

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSystem").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSystem").setEnabled(true);

            //Scroll to last table Element
            controllerSupplierWarehouse.byId("tabSystem").setFirstVisibleRow(addRowModel.length);
        },

        onChangeForceSapDeposit: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.FORCE_SAP_DEPOSIT_UPDATE = oEvent.oSource.getState() + "";
            lineSel.EDIT = "true";
            lineSel.VIS = "true";
            lineSel.DEL = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSystem").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSystem").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        editSystem: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.VIS = "true";
            lineSel.DEL = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSystem").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSystem").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        deleteSystem: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.VIS = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseSystem").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewSystem").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        removeSystemFilter: function () {
            controllerSupplierWarehouse.byId("filterSystem").setSelectedKeys();
            controllerSupplierWarehouse.getSystemList();
        },

        onChangeDeltaStep: function (oEvent) {
            var sValue = oEvent.oSource.getValue();
            if (sValue < -60) {
                oEvent.oSource.setValue(-60);
            } else if (sValue > 60) {
                oEvent.oSource.setValue(60);
            }
        },

        changeDateTypeCombo: function (oEvent) {},

        checkSystemAccessory: function (oEvent) {
            var aModTabSystem = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSystem"),
            aRowSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath),
            indexToSkip = oEvent.oSource.getBindingContext().sPath.split("/")[2],
            check = false;
            for (var i = 0; i < aModTabSystem.length - 1; i++) {
                if (i != indexToSkip && aModTabSystem[i]["SYSTEM"] === aRowSel["SYSTEM"] && aModTabSystem[i]["ACCESSORY"] === aRowSel["ACCESSORY"]) {
                    check = true;
                    break;
                }
            }
            if (check) {
                MessageToast.show(controller.oBundle.getText("contrSupWh.errDupInsert"));
                aRowSel["ACCESSORY"] = "";
                controllerSupplierWarehouse.supplierWarehouseModel.refresh();
            }
        },

        saveNewSystem: function () {
            var modInput = [];
            var obj = {};
            var model = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSystem");

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].DEL === "true" && model[i].SYSTEM_ID === "") || model[i].SYSTEM.trim() === "" || model[i].ACCESSORY.trim() === "" || model[i].DATE_TYPE.trim() === "" || model[i].WAREHOUSE_ID === "") {}
                    else {
                        obj.SYSTEM_ID = model[i].SYSTEM_ID;
                        obj.SYSTEM = model[i].SYSTEM;
                        obj.ACCESSORY = model[i].ACCESSORY;
                        obj.WAREHOUSE_ID = model[i].WAREHOUSE_ID;
                        obj.FORCE_SAP_DEPOSIT_UPDATE = model[i].FORCE_SAP_DEPOSIT_UPDATE === "true" ? "1" : "0";
                        obj.DATE_TYPE = model[i].DATE_TYPE;
                        obj.DELTA = model[i].DELTA === "NA" ? "0" : model[i].DELTA;
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }

            if (modInput.length === 0) {
                controllerSupplierWarehouse.getSystemList();
            } else {
                var Input = {
                    "DATA": JSON.stringify(modInput)
                };

                var result = controllerSite.sendData("SAVE_SYSTEM_WAREHOUSE", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
                if (result[0].RC != "0") {
                    MessageBox.warning(controller.oBundle.getText("contrSupWh.insertKO") + " " + result[0].MESSAGE, {
                        onClose: function () {}
                    });
                } else {
                    MessageToast.show(controller.oBundle.getText("contrSupWh.insertOK"));
                    controllerSupplierWarehouse.getSystemList();
                }
            }
        },

        openWarehouseHelpSystem: function (oEvent) {
            //Salvo il percorso di binding del modello della tabella sottostante
            controllerSupplierWarehouse.byId("selTabSystemRow").setText(oEvent.oSource.getBindingContext().sPath + ";" + oEvent.oSource.sId);

            var result = controllerSite.sendData("GET_WAREHOUSE_LIST", "SUPPLIER_WAREHOUSE/TRANSACTION", {});
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabWarehouseList", result);

            if (!controllerSupplierWarehouse._oValueHelpDialog) {
                Fragment.load({
                    name: "master_data.view.popup.listWarehouseSystem",
                    controller: controllerSupplierWarehouse
                }).then(function (oValueHelpDialog) {
                    controllerSupplierWarehouse._oValueHelpDialog = oValueHelpDialog;
                    controllerSupplierWarehouse.getView().addDependent(controllerSupplierWarehouse._oValueHelpDialog);
                    controllerSupplierWarehouse._oValueHelpDialog.open();
                });
            } else {
                controllerSupplierWarehouse._oValueHelpDialog.open();
            }
        },

        handleValueHelpSystemWarehouseClose: function (oEvent) {
            try {
                var aComboInfo = controllerSupplierWarehouse.byId("selTabSystemRow").getText().split(";"),
                rowSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(aComboInfo[0]),
                oSelectedItem = oEvent.getParameter("selectedItem");

                if (rowSel["SYSTEM"] !== "") {
                    var modTabSystem = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabSystem");
                    var check = false;
                    for (var i in modTabSystem) {
                        if (modTabSystem[i]["WAREHOUSE_ID"] === oSelectedItem.mProperties.highlightText && modTabSystem[i]["SYSTEM"] === rowSel["SYSTEM"] && modTabSystem[i]["ACCESSORY"] === rowSel["ACCESSORY"]) {
                            check = true;
                            break;
                        }
                    }
                    if (check) {
                        MessageToast.show(controller.oBundle.getText("contrSupWh.errDupInsert"));
                        sap.ui.getCore().byId(aComboInfo[1]).setSelectedKey(null);
                        sap.ui.getCore().byId(aComboInfo[1]).setValue("");
                        rowSel["WAREHOUSE_ID"] = "";
                        rowSel["WAREHOUSE"] = "";
                    } else {
                        rowSel["WAREHOUSE_ID"] = oSelectedItem.mProperties.highlightText;
                        rowSel["WAREHOUSE"] = oSelectedItem.mProperties.title;
                        controllerSupplierWarehouse.supplierWarehouseModel.refresh();
                        controllerSupplierWarehouse.byId("saveNewSystem").setEnabled(true);
                    }

                } else {
                    rowSel["WAREHOUSE_ID"] = oSelectedItem.mProperties.highlightText;
                    rowSel["WAREHOUSE"] = oSelectedItem.mProperties.title;
                    controllerSupplierWarehouse.supplierWarehouseModel.refresh();
                }

                //Pulisco il percorso di binding del modello della tabella sottostante
                controllerSupplierWarehouse.byId("selTabSystemRow").setText("");
                controllerSupplierWarehouse.closeDialog();
            } catch (err) {
                controllerSupplierWarehouse.closeDialog();
            }
        },

        /*Archetype Configuration*/
        getArchetypeConfigurationList: function () {
            //Filtro Fornitore
            var selArchetypeConfigKey = controllerSupplierWarehouse.byId("filterArchetypeConfiguration").getSelectedKeys(),
            archetypeConfigFilter = "";

            if (selArchetypeConfigKey.length !== 0) {
                archetypeConfigFilter = "(";
                for (var i in selArchetypeConfigKey) {
                    archetypeConfigFilter = archetypeConfigFilter + "'" + selArchetypeConfigKey[i] + "',";
                }
                archetypeConfigFilter = archetypeConfigFilter.substring(0, archetypeConfigFilter.length - 1);
                archetypeConfigFilter = archetypeConfigFilter + ")";
            }

            var result = controllerSite.sendData("GET_ARCHETYPE_CONFIGURATION", "SUPPLIER_WAREHOUSE/TRANSACTION", {
                "ARCHETYPE_CONFIG_ID": archetypeConfigFilter
            });
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabArchetypeConfiguration", result);

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseArchetypeConfiguration").setEnabled(false);
            controllerSupplierWarehouse.byId("saveNewArchetypeConfiguration").setEnabled(false);
        },

        removeArchetypeConfigurationListFilters: function () {
            controllerSupplierWarehouse.byId("filterArchetypeConfiguration").setSelectedKeys();
            controllerSupplierWarehouse.getArchetypeConfigurationList();
        },

        newArchetypeConfiguration: function () {
            var addRowModel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabArchetypeConfiguration");
            controllerSupplierWarehouse.byId("saveNewArchetypeConfiguration").setEnabled(true);

            var row = {
                "ARCHETYPE_CONFIG_ID": "",
                "ARCHETYPE": "",
                "ARCHETYPE_CONFIG": "",
                "EDIT": "true",
                "VIS": "true",
                "DEL": "false"
            };
            if (!addRowModel) {
                var newArr = [];
                newArr.push(row);
                controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabArchetypeConfiguration", newArr);
            } else {
                if (addRowModel.length === 0) {
                    var newArr = [];
                    newArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabArchetypeConfiguration", newArr);
                } else {
                    var addArr = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabArchetypeConfiguration");
                    addArr.push(row);
                    controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/tabArchetypeConfiguration", addArr);
                }
            }

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseArchetypeConfiguration").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewArchetypeConfiguration").setEnabled(true);

            //Scroll to last table Element
            controllerSupplierWarehouse.byId("tabArchetypeConfiguration").setFirstVisibleRow(addRowModel.length);
        },

        editArchetypeConfiguration: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.EDIT = "true";
            lineSel.VIS = "false";
            lineSel.DEL = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseArchetypeConfiguration").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewArchetypeConfiguration").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        deleteArchetypeConfiguration: function (oEvent) {
            var lineSel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.oSource.getBindingContext().sPath);
            lineSel.DEL = "true";
            lineSel.VIS = "false";

            //Buttons
            controllerSupplierWarehouse.byId("btnCloseArchetypeConfiguration").setEnabled(true);
            controllerSupplierWarehouse.byId("saveNewArchetypeConfiguration").setEnabled(true);
            controllerSupplierWarehouse.supplierWarehouseModel.refresh();
        },

        saveArchetypeConfiguration: function () {
            var modInput = [];
            var obj = {};
            var model = controllerSupplierWarehouse.supplierWarehouseModel.getProperty("/tabArchetypeConfiguration");

            for (var i = 0; i < model.length; i++) {
                if (model[i].EDIT === "true" || model[i].DEL === "true") {
                    if ((model[i].DEL === "true" && model[i].ARCHETYPE_CONFIG_ID === "") || model[i].ARCHETYPE_CONFIG.trim() === "") {}
                    else {
                        obj.ARCHETYPE_CONFIG_ID = model[i].ARCHETYPE_CONFIG_ID;
                        obj.ARCHETYPE = model[i].ARCHETYPE;
                        obj.ARCHETYPE_CONFIG = model[i].ARCHETYPE_CONFIG;
                        obj.DEL = model[i].DEL;
                        modInput.push(obj);
                        obj = new Object;
                    }
                }
            }

            if (modInput.length === 0) {
                controllerSupplierWarehouse.getArchetypeConfigurationList();
            } else {
                var Input = {
                    "DATA": JSON.stringify(modInput)
                };

                var result = controllerSite.sendData("SAVE_ARCHETYPE_CONFIGURATION", "SUPPLIER_WAREHOUSE/TRANSACTION", Input);
                if (result[0].RC != "0") {
                    MessageBox.warning(controller.oBundle.getText("contrSupWh.insertKO") + " " + result[0].MESSAGE, {
                        onClose: function () {}
                    });
                } else {
                    MessageToast.show(controller.oBundle.getText("contrSupWh.insertOK"));
                    controllerSupplierWarehouse.getArchetypeConfigurationList();
                }
            }
        },

        /*Pma Message Template*/

        createPmaTagList: function () {
            var arrTag = [{
                    "descr": controller.oBundle.getText("controllerSupplierWarehouse.Serial"),
                    "value": '%SERIAL%'
                }, {
                    "descr": controller.oBundle.getText("controllerSupplierWarehouse.User"),
                    "value": '%USER%'
                }, {
                    "descr": controller.oBundle.getText("controllerSupplierWarehouse.Warehouse"),
                    "value": '%WAREHOUSE%'
                }, {
                    "descr": controller.oBundle.getText("controllerSupplierWarehouse.NotifDate"),
                    "value": '%NOTIF_DATE%'
                }, {
                    "descr": controller.oBundle.getText("controllerSupplierWarehouse.NotifTime"),
                    "value": '%NOTIF_TIME%'
                }, {
                    "descr": controller.oBundle.getText("controllerSupplierWarehouse.DeliveryDate"),
                    "value": '%DELIVERY_DATE%'
                }, {
                    "descr": controller.oBundle.getText("controllerSupplierWarehouse.OldDeliveryDate"),
                    "value": '%OLD_DELIVERY_DATE%'
                }
            ];

            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/pmaTagList", arrTag);

            //Aggiorno modello priorità dei Messaggi
            controllerSupplierWarehouse.createPmaMessagePriority();
        },

        createPmaMessagePriority: function () {
            var arrPriority = [{
                    "STATUS": "Error",
                    "STATUS_DESCRIPTION": controller.oBundle.getText("controllerSupplierWarehouse.stsMessageError"),
                    "ORDER": 0
                }, {
                    "STATUS": "Warning",
                    "STATUS_DESCRIPTION": controller.oBundle.getText("controllerSupplierWarehouse.stsMessageWarning"),
                    "ORDER": 1
                }, {
                    "STATUS": "Success",
                    "STATUS_DESCRIPTION": controller.oBundle.getText("controllerSupplierWarehouse.stsMessageSuccess"),
                    "ORDER": 2
                }
            ];
            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/pmaMessageStatusList", arrPriority);
        },

        addPmaTagObject: function () {
            if (controllerSupplierWarehouse.byId("comboPmaTagObject").getSelectedKey() != "") {
                controllerSupplierWarehouse.byId("templatePmaMessageObject").setValue(controllerSupplierWarehouse.byId("templatePmaMessageObject").getValue() + " " + controllerSupplierWarehouse.byId("comboPmaTagObject").getSelectedKey());
            }
        },

        addPmaTagBody: function () {
            if (controllerSupplierWarehouse.byId("comboPmaTagMessageBody").getSelectedKey() != "") {
                controllerSupplierWarehouse.byId("templatePmaMessageBody").setValue(controllerSupplierWarehouse.byId("templatePmaMessageBody").getValue() + " " + controllerSupplierWarehouse.byId("comboPmaTagMessageBody").getSelectedKey());
            }
        },

        removePmaTagObject: function () {
            if (controllerSupplierWarehouse.byId("comboPmaTagObject").getSelectedKey() != "") {
                controllerSupplierWarehouse.byId("templatePmaMessageObject").setValue(controllerSupplierWarehouse.byId("templatePmaMessageObject").getValue().replace(" " + controllerSupplierWarehouse.byId("comboPmaTagObject").getSelectedKey(), ""));
            }
        },

        removePmaTagBody: function () {
            if (controllerSupplierWarehouse.byId("comboPmaTagMessageBody").getSelectedKey() != "") {
                controllerSupplierWarehouse.byId("templatePmaMessageBody").setValue(controllerSupplierWarehouse.byId("templatePmaMessageBody").getValue().replace(" " + controllerSupplierWarehouse.byId("comboPmaTagMessageBody").getSelectedKey(), ""));
            }
        },

        getAllPmaTemplate: function () {
            var input = {};
            input.SITE_ID = controller.SiteId;

            controllerSupplierWarehouse.getDataSync("GET_ALL_PMA_MESSAGE_TEMPLATE", "ADIGE7/MASTER_DATA/SUPPLIER_WAREHOUSE/TRANSACTION", input, controllerSupplierWarehouse.getAllPmaTemplateSuccess, controllerSupplierWarehouse.transactionError);
        },

        getAllPmaTemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);

            for (var i = 0; i < jsonArr.length; i++) {
                jsonArr[i]["MESSAGE_TEMPLATE_DESCRIPTION"] = jsonArr[i]["MESSAGE_TEMPLATE_DESCRIPTION"]; //.replace(/_rn_/gm, '\r\n');
                jsonArr[i]["MESSAGE_OBJECT"] = jsonArr[i]["MESSAGE_OBJECT"];
                jsonArr[i]["MESSAGE_BODY"] = jsonArr[i]["MESSAGE_BODY"];
            }

            controllerSupplierWarehouse.supplierWarehouseModel.setProperty("/templatePmaMessagelist", jsonArr);
        },

        checkIfExistPmaMessageTemplate: function () {
            var input = {};
            input.TEMPLATE = controllerSupplierWarehouse.byId("messagePmaTemplateName").getValue();
            input.SITE_ID = controller.SiteId;

            controllerSupplierWarehouse.getDataSync("GET_IF_PMA_TEMPLATE_EXIST", "ADIGE7/MASTER_DATA/SUPPLIER_WAREHOUSE/TRANSACTION", input, controllerSupplierWarehouse.checkIfExistPmaMessageTemplateSuccess, controllerSupplierWarehouse.transactionError);
        },

        checkIfExistPmaMessageTemplateSuccess: function (data, response) {
            var jsonArr = JSON.parse(jQuery(data).find("Row").text());
            if (jsonArr[0].RC != "0") {
                controllerSupplierWarehouse.byId("messagePmaTemplateName").setValue("");
                MessageBox.error(controller.oBundle.getText("viewMail.template.alreadyExist"));
            }
        },

        closePmaTemplate: function () {
            controllerSupplierWarehouse.byId("pmaMessageTemplateId").setText("");

            controllerSupplierWarehouse.byId("inputPmaTemplateMessage").setValue("");
            controllerSupplierWarehouse.byId("inputPmaTemplateMessage").setEnabled(true);

            if (controller.checkUserActivity("ALL_ADMIN")) {
                controllerSupplierWarehouse.byId("messagePmaTemplateName").setEnabled(false);
                controllerSupplierWarehouse.byId("messagePmaTemplateName").setValue("");

                controllerSupplierWarehouse.byId("newPmaMessageTemplate").setEnabled(true);
                controllerSupplierWarehouse.byId("delPmaMessageTemplate").setEnabled(false);
            }
            controllerSupplierWarehouse.byId("messagePmaTemplateDescription").setEnabled(false);
            controllerSupplierWarehouse.byId("messagePmaTemplateDescription").setValue("");

            controllerSupplierWarehouse.byId("comboPmaTemplateStatus").setSelectedKey("");
            controllerSupplierWarehouse.byId("comboPmaTemplateStatus").setEnabled(false);

            controllerSupplierWarehouse.byId("comboPmaTagObject").setSelectedKey("");
            controllerSupplierWarehouse.byId("comboPmaTagObject").setValue("");
            controllerSupplierWarehouse.byId("templatePmaMessageObject").setValue("");
            controllerSupplierWarehouse.byId("comboPmaTagMessageBody").setSelectedKey("");
            controllerSupplierWarehouse.byId("comboPmaTagMessageBody").setValue("");
            controllerSupplierWarehouse.byId("templatePmaMessageBody").setValue("");

            controllerSupplierWarehouse.byId("resetPmaMessageTemplate").setEnabled(false);
            controllerSupplierWarehouse.byId("savePmaMessageTemplate").setEnabled(false)
        },

        newPmaTemplate: function () {
            controllerSupplierWarehouse.byId("pmaMessageTemplateId").setText("");

            controllerSupplierWarehouse.byId("inputPmaTemplateMessage").setValue("");
            controllerSupplierWarehouse.byId("inputPmaTemplateMessage").setEnabled(false);

            controllerSupplierWarehouse.byId("messagePmaTemplateName").setEnabled(true);
            controllerSupplierWarehouse.byId("messagePmaTemplateName").setValue("");

            controllerSupplierWarehouse.byId("newPmaMessageTemplate").setEnabled(true);
            controllerSupplierWarehouse.byId("delPmaMessageTemplate").setEnabled(false);

            controllerSupplierWarehouse.byId("messagePmaTemplateDescription").setEnabled(true);
            controllerSupplierWarehouse.byId("messagePmaTemplateDescription").setValue("");

            controllerSupplierWarehouse.byId("comboPmaTemplateStatus").setSelectedKey("");
            controllerSupplierWarehouse.byId("comboPmaTemplateStatus").setEnabled(true);

            controllerSupplierWarehouse.byId("comboPmaTagObject").setSelectedKey("");
            controllerSupplierWarehouse.byId("comboPmaTagObject").setValue("");
            controllerSupplierWarehouse.byId("templatePmaMessageObject").setValue("");
            controllerSupplierWarehouse.byId("comboPmaTagMessageBody").setSelectedKey("");
            controllerSupplierWarehouse.byId("comboPmaTagMessageBody").setValue("");
            controllerSupplierWarehouse.byId("templatePmaMessageBody").setValue("");

            controllerSupplierWarehouse.byId("resetPmaMessageTemplate").setEnabled(true);
            controllerSupplierWarehouse.byId("savePmaMessageTemplate").setEnabled(true);
        },

        savePmaTemplate: function () {
            if (controllerSupplierWarehouse.byId("messagePmaTemplateDescription").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("controllerLogistic.misstemplatdescr"))
            }

            if (controllerSupplierWarehouse.byId("templatePmaMessageObject").getValue() === "") {
                return MessageToast.warning(controller.oBundle.getText("viewMail.template.misstemplateobject"))
            }

            if (controllerSupplierWarehouse.byId("templatePmaMessageBody").getValue() === "") {
                return MessageBox.warning(controller.oBundle.getText("viewMail.template.misstemplatebody"))
            }

            if (controllerSupplierWarehouse.byId("comboPmaTemplateStatus").getSelectedKey() === "") {
                return MessageBox.warning(controller.oBundle.getText("controllerLogistic.misstemplatests"))
            }

            var input = {};
            input.MESSAGE_TEMPLATE_ID = controllerSupplierWarehouse.byId("pmaMessageTemplateId").getText();

            if (controller.checkUserActivity("ALL_ADMIN")) {
                input.MESSAGE_TEMPLATE = controllerSupplierWarehouse.byId("messagePmaTemplateName").getValue("");
            }
            input.MESSAGE_DESCRIPTION = controllerSupplierWarehouse.byId("messagePmaTemplateDescription").getValue("");
            input.MESSAGE_STATUS = controllerSupplierWarehouse.byId("comboPmaTemplateStatus").getSelectedKey("");
            input.MESSAGE_OBJECT = controllerSupplierWarehouse.byId("templatePmaMessageObject").getValue().replace(/(\r\n|\n|\r)/gm, "\\r\\n");
            input.MESSAGE_BODY = controllerSupplierWarehouse.byId("templatePmaMessageBody").getValue().replace(/(\r\n|\n|\r)/gm, "\\r\\n");
            input.SITE_ID = controller.SiteId;

            controllerSupplierWarehouse.getDataSync("SAVE_PMA_TEMPLATE", "ADIGE7/MASTER_DATA/SUPPLIER_WAREHOUSE/TRANSACTION", input, controllerSupplierWarehouse.savePmaTemplateSuccess, controllerSupplierWarehouse.transactionError);
        },

        deleteTemplate: function () {
            var input = {
                "MESSAGE_TEMPLATE_ID": controllerSupplierWarehouse.byId("pmaMessageTemplateId").getText()
            };

            MessageBox.confirm((controller.oBundle.getText("viewMail.template.deltemplate") + " " + controllerSupplierWarehouse.byId("messagePmaTemplateName").getValue() + "?"), {
                styleClass: "sapUiSizeCompact",
                onClose: function (evt) {
                    if (evt == "OK") {
                        controllerSupplierWarehouse.getDataSync("DELETE_PMA_TEMPLATE", "ADIGE7/MASTER_DATA/SUPPLIER_WAREHOUSE/TRANSACTION", input, controllerSupplierWarehouse.savePmaTemplateSuccess, controllerSupplierWarehouse.transactionError);
                    }
                }
            });
        },

        savePmaTemplateSuccess: function (data, response) {
            var jsonArrStr = jQuery(data).find("Row").text();
            var jsonArr = JSON.parse(jsonArrStr);
            if (jsonArr[0].RC != "0") {
                MessageBox.error(jsonArr[0].MESSAGE);
            } else {
                controllerSupplierWarehouse.closePmaTemplate();
                MessageToast.show(controller.oBundle.getText("viewMail.template.result"));
            }
        },

        getPmaMessageTemplate: function () {
            Fragment.load({
                name: "master_data.view.popup.listPmaMessageTemplate",
                controller: controllerSupplierWarehouse
            }).then(function (oValueHelpDialogTmp) {
                controllerSupplierWarehouse.getAllPmaTemplate();
                controllerSupplierWarehouse.popupMessage = oValueHelpDialogTmp;
                controllerSupplierWarehouse.getView().addDependent(controllerSupplierWarehouse.popupMessage);
                controllerSupplierWarehouse.popupMessage.open();
            });
        },

        searchPmaMessageTemplate: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("MESSAGE_TEMPLATE", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        onConfirmPmaMessageTemplate: function (oEvent) {
            var oSelectedRowModel = controllerSupplierWarehouse.supplierWarehouseModel.getProperty(oEvent.getParameter("selectedItem").getBindingContextPath());
            try {
                controllerSupplierWarehouse.byId("pmaMessageTemplateId").setText(oSelectedRowModel["MESSAGE_TEMPLATE_ID"]);
                controllerSupplierWarehouse.byId("inputPmaTemplateMessage").setValue(oSelectedRowModel["MESSAGE_TEMPLATE"]);
                controllerSupplierWarehouse.byId("inputPmaTemplateMessage").setEnabled(false);

                if (controller.checkUserActivity("ALL_ADMIN")) {
                    controllerSupplierWarehouse.byId("messagePmaTemplateName").setEnabled(false);
                    controllerSupplierWarehouse.byId("messagePmaTemplateName").setValue(oSelectedRowModel["MESSAGE_TEMPLATE"]);
                    controllerSupplierWarehouse.byId("newPmaMessageTemplate").setEnabled(false);
                    controllerSupplierWarehouse.byId("delPmaMessageTemplate").setEnabled(true);
                }
                controllerSupplierWarehouse.byId("messagePmaTemplateDescription").setValue(oSelectedRowModel["MESSAGE_TEMPLATE_DESCRIPTION"]);
                controllerSupplierWarehouse.byId("messagePmaTemplateDescription").setEnabled(true);
                controllerSupplierWarehouse.byId("comboPmaTemplateStatus").setSelectedKey(oSelectedRowModel["MESSAGE_STATUS"]);
                controllerSupplierWarehouse.byId("comboPmaTemplateStatus").setEnabled(true);
                controllerSupplierWarehouse.byId("comboPmaTagObject").setSelectedKey("");
                controllerSupplierWarehouse.byId("comboPmaTagObject").setValue("");
                controllerSupplierWarehouse.byId("templatePmaMessageObject").setValue(oSelectedRowModel["MESSAGE_OBJECT"]);
                controllerSupplierWarehouse.byId("comboPmaTagMessageBody").setSelectedKey("");
                controllerSupplierWarehouse.byId("comboPmaTagMessageBody").setValue("");
                controllerSupplierWarehouse.byId("templatePmaMessageBody").setValue(oSelectedRowModel["MESSAGE_BODY"]);

                controllerSupplierWarehouse.byId("resetPmaMessageTemplate").setEnabled(true);
                controllerSupplierWarehouse.byId("savePmaMessageTemplate").setEnabled(true);
                controllerSupplierWarehouse.popupMessage = undefined;
            } catch (err) {}
        },

        /*FUNZIONI PER ESECUZIONI TRANSAZIONI*/
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
        /**/

        /*Formatter*/
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
        }
        /**/

    });
});
