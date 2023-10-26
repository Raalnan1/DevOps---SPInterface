(() => {
    "use strict";
    var __webpack_exports__ = {};
    var __awaiter = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P ? value : new P((function(resolve) {
                resolve(value);
            }));
        }
        return new (P || (P = Promise))((function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        }));
    };
    class SPListsController {
        constructor() {
            this.lists = false;
            this.mode = "dev";
            this.settings = {
                method: "GET",
                timeout: 0
            };
        }
        getListByEntityTypeName(entityTypeName) {
            return __awaiter(this, void 0, void 0, (function*() {
                const db = this.db;
                const lists = db.lists;
                const d = lists.d;
                const results = d.results;
                const list = results.find((list => list.EntityTypeName === entityTypeName));
                if (!list) {
                    console.error(`No list found with EntityTypeName: ${entityTypeName}`);
                    return null;
                }
                return list;
            }));
        }
        getSPLists(callingMethod) {
            return __awaiter(this, void 0, void 0, (function*() {
                const div = $("<div>", {
                    html: `<h1>getSPLists (${this.mode}) ${callingMethod}</h1>`
                });
                const ol = $("<ol>");
                let lists = {};
                const settings = this.getSettings();
                switch (this.mode) {
                  case "app":
                    settings.url = `${settings.url}/Lists`;
                    break;

                  case "dev":
                    settings.url = `http://localhost:3000/Lists`;
                    break;
                }
                try {
                    if (!this.lists) {
                        lists = yield $.ajax(settings);
                        const results = lists.d.results;
                        for (const list of results) {
                            list.d = {
                                results: []
                            };
                            this.addGET(list);
                            this.addDELETE(list);
                            this.addPOST(list);
                            this.updatePATCH(list);
                            this.addGetContentTypes(list);
                            const li = $("<li>", {
                                listId: list.Id,
                                html: list.Title
                            });
                            ol.append(li);
                        }
                        div.append(ol);
                        this.lists = lists;
                    }
                } catch (error) {
                    console.error("SPListsController.getSPLists Error while getting lists: ", error);
                }
                $(this.targetElement).append(div);
                return lists;
            }));
        }
        init() {
            return __awaiter(this, void 0, void 0, (function*() {
                $(this.targetElement).html(`init on ${this.serverName}`);
                try {
                    switch (this.serverName) {
                      case "127.0.0.1:5500":
                      case "127.0.0.1:5501":
                      case "localhost:5500":
                      case "localhost:5501":
                        this.mode = "dev";
                        break;

                      default:
                        this.mode = "app";
                        break;
                    }
                    yield this.getSPLists("init");
                } catch (error) {
                    console.error("Error in initialization: ", error);
                }
            }));
        }
        getWebs(settings) {
            return __awaiter(this, void 0, void 0, (function*() {
                switch (this.mode) {
                  case "app":
                    settings.url = `${this.appAPI}/Web/Webs`;
                    break;

                  case "dev":
                    settings.url = `${this.devAPI}/Webs`;
                    break;
                }
                console.log("getWebs.settings: ", settings);
                const webs = yield $.ajax(settings);
                console.log("getWebs.webs: ", webs);
                return webs;
            }));
        }
        getCurrentUser(settings) {
            return __awaiter(this, void 0, void 0, (function*() {
                switch (this.mode) {
                  case "app":
                    settings.url = `${this.appAPI}/web/currentUser`;
                    break;

                  case "dev":
                    settings.url = `http://localhost:3000/CurrentUser`;
                    break;
                }
                const currentUser = yield $.ajax(settings);
                console.log("getCurrentUser.currentUser: ", currentUser);
                return currentUser;
            }));
        }
        getDB() {
            return __awaiter(this, void 0, void 0, (function*() {
                let lists;
                if (this.lists === false) {
                    lists = yield this.getSPLists("getDB");
                } else {
                    lists = this.lists;
                }
                const settings = this.getSettings();
                this.settings = settings;
                const db = {};
                if (this.mode === "app") {
                    for (const list of lists.d.results) {
                        const {EntityTypeName, Items} = list;
                        const uri = Items.__deferred.uri;
                        settings.url = `${uri}?$Top=10`;
                        const ajax = yield $.ajax(settings);
                        db[`${EntityTypeName}Items`] = ajax.d.results;
                    }
                }
                db["CurrentUser"] = yield this.getCurrentUser(settings);
                db["Webs"] = yield this.getWebs(settings);
                db.lists = lists;
                console.log("%cdb: ", "color: blue; font-size: 20px;", db);
                console.log("%cHello, %cWorld!", "color: blue; font-size: 20px;", "color: green; font-weight: bold;");
                return db;
            }));
        }
        getHTMLTable(EntityTypeName, items) {
            const table = $("<table>", {
                EntityTypeName
            });
            const tbody = $("<tbody>");
            const headerRow = $("<tr>");
            const footerRow = $("<tr>");
            if (items.length > 0) {
                const listForm = $(this.targetElement).find(`div[data-role="${EntityTypeName}Form"]`);
                let item = items[0];
                for (const property in item) {
                    const data = item[property];
                    const dataType = typeof data;
                    switch (dataType) {
                      case "object":
                        break;

                      default:
                        const headerCell = $("<th>").text(property);
                        const footerCell = $("<th>").text(property);
                        headerRow.append(headerCell);
                        footerRow.append(footerCell);
                        break;
                    }
                }
                items.forEach((element => {
                    const row = $("<tr>", {
                        EntityTypeName: `${EntityTypeName}`,
                        "data-id": `${element.Id}`
                    });
                    for (const property in element) {
                        const data = element[property];
                        const dataType = typeof data;
                        switch (dataType) {
                          case "object":
                            break;

                          default:
                            const cell = $("<td>").text(element[property]);
                            row.append(cell);
                            break;
                        }
                    }
                    tbody.append(row);
                    $(row).find("td").on("click", (evt => {
                        var _a, _b;
                        if (listForm.length > 0) {
                            const EntityTypeName = ((_a = $(row).attr("EntityTypeName")) === null || _a === void 0 ? void 0 : _a.toString()) || "No Data";
                            const dataId = ((_b = $(row).attr("data-id")) === null || _b === void 0 ? void 0 : _b.toString()) || "No Data";
                            $(listForm).attr("data-id", dataId);
                            $(listForm).attr("EntityTypeName", EntityTypeName);
                            for (const property in element) {
                                $(listForm).find('input[name="' + property + '"]').hide();
                                $(listForm).find('input[name="' + property + '"]').val(element[property]);
                                $(listForm).find('input[name="' + property + '"]').fadeIn();
                            }
                            console.log($(row).attr("data-id"));
                        } else {
                            console.log("No listForm was detected.");
                        }
                    }));
                }));
            }
            table.append(headerRow);
            table.append(tbody);
            table.append(footerRow);
            return table;
        }
        getSettings() {
            const baseSettings = Object.assign({}, this.settings);
            switch (this.serverName) {
              case "localhost:5501":
              case "127.0.0.1:5500":
              case "127.0.0.1:5501":
              case "localhost:5500":
                return Object.assign(Object.assign({}, baseSettings), {
                    url: this.devAPI
                });

              case "traxxisdev.sharepoint.com":
                return Object.assign(Object.assign({}, baseSettings), {
                    url: this.appAPI,
                    headers: {
                        Accept: "application/json; odata=verbose"
                    }
                });

              default:
                alert(`SPListsController got an invalid ServerName(${this.serverName})`);
                return baseSettings;
            }
        }
        addGetContentTypes(list) {
            list.getContentTypes = () => __awaiter(this, void 0, void 0, (function*() {
                const settings = this.getSettings();
                const url = `${list.__metadata.uri}/ContentTypes`;
                settings.url = url;
                const contentTypes = yield $.ajax(settings);
                return contentTypes;
            }));
        }
        addGET(list) {
            list.GET = queryString => __awaiter(this, void 0, void 0, (function*() {
                let url = "";
                switch (this.mode) {
                  case "app":
                    url = `${list.Items.__deferred.uri}${queryString}`;
                    break;

                  case "dev":
                    url = `http://localhost:3000/${list.Title}Items`;
                    break;
                }
                try {
                    const data = yield $.ajax({
                        url,
                        method: "GET",
                        headers: {
                            Accept: "application/json; odata=verbose"
                        }
                    });
                    list.data = data;
                    return data;
                } catch (error) {
                    console.error("SPListsController.addGET Error while getting data: ", error);
                    console.log("%cget.url", "color:red;", url);
                    return error;
                }
            }));
        }
        updatePATCH(list) {
            let returnvalue = {};
            const url = `${list.Items.__deferred.uri}`;
            const ListItemEntityTypeFullName = `${list.ListItemEntityTypeFullName}`;
            list.PATCH = (Id, data) => __awaiter(this, void 0, void 0, (function*() {
                data["__metadata"] = {
                    type: ListItemEntityTypeFullName
                };
                if (!Id) {
                    console.error("No Id provided for PATCH");
                    return;
                }
                const url = `${list.Items.__deferred.uri}(${Id})`;
                try {
                    returnvalue = yield $.ajax({
                        url,
                        method: "PATCH",
                        headers: {
                            Accept: "application/json; odata=verbose",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                            "Content-Type": "application/json;odata=verbose",
                            "IF-MATCH": "*"
                        },
                        data: JSON.stringify(data)
                    });
                } catch (error) {
                    returnvalue = error;
                    console.error(`Error while updating item with Id: ${Id}. Error: `, error);
                    throw error;
                }
            }));
            return returnvalue;
        }
        addDELETE(list) {
            list.DELETE = Id => __awaiter(this, void 0, void 0, (function*() {
                if (!Id) {
                    console.error("No Id provided for DELETE");
                    return;
                }
                const url = `${list.Items.__deferred.uri}(${Id})`;
                try {
                    yield $.ajax({
                        url,
                        method: "DELETE",
                        headers: {
                            Accept: "application/json; odata=verbose",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                            "IF-MATCH": "*"
                        }
                    });
                } catch (error) {
                    console.error(`Error while deleting item with Id: ${Id}. Error: `, error);
                    throw error;
                }
            }));
        }
        addPOST(list) {
            const url = `${list.Items.__deferred.uri}`;
            list.POST = data => __awaiter(this, void 0, void 0, (function*() {
                const ListItemEntityTypeFullName = `${list.ListItemEntityTypeFullName}`;
                const requestDigest = $("#__REQUESTDIGEST").val();
                if (typeof requestDigest !== "string") {
                    console.error("X-RequestDigest value is not a string.");
                    return;
                }
                data["__metadata"] = {
                    type: ListItemEntityTypeFullName
                };
                var settings = {
                    url,
                    type: "POST",
                    contentType: "application/json;odata=verbose",
                    data: JSON.stringify(data),
                    headers: {
                        Accept: "application/json;odata=verbose",
                        "X-RequestDigest": requestDigest
                    }
                };
                try {
                    const insertedRecord = yield $.ajax(settings);
                } catch (error) {
                    console.error("Error while inserting record: ", error);
                }
            }));
        }
    }
    var SPInterface_awaiter = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P ? value : new P((function(resolve) {
                resolve(value);
            }));
        }
        return new (P || (P = Promise))((function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        }));
    };
    class SPInterface {
        init() {
            return SPInterface_awaiter(this, void 0, void 0, (function*() {
                const serverName = this.getServerName(location.href);
                const spLists = new SPListsController;
                spLists.targetElement = this.targetElement;
                spLists.appAPI = "/sites/TeamSite/DevOps/_api";
                spLists.devAPI = "http://localhost:3000";
                spLists.serverName = serverName;
                spLists.init();
                console.log("serverName: ", serverName);
                switch (serverName) {
                  case "traxxisdev.sharepoint.com":
                    spLists.mode = "app";
                    break;

                  default:
                    spLists.mode = "dev";
                    break;
                }
                const db = yield spLists.getDB();
                spLists.db = db;
                const BravoList = yield spLists.getListByEntityTypeName("BravoList");
                if (BravoList) {
                    const bravoListForm = this.getBravoListForm(BravoList);
                    const items = yield BravoList.GET("?$OrderBy=Modified desc&$Top=5");
                    console.log("BravoList items: ", items);
                    this.targetElement.prepend(bravoListForm);
                    const listid = BravoList.Id;
                    const targetLI = $('li[listid="' + listid + '"]');
                    const htmlTable = spLists.getHTMLTable("BravoList", items.d.results);
                    $(targetLI).append(htmlTable);
                    console.log("BravoList.Id: ", listid);
                }
            }));
        }
        getBravoListForm(BravoList) {
            const bravoListForm = $("<div>", {
                "data-role": "BravoListForm"
            });
            const inputTitle = $('<input type="text" name="Title" placeholder="Title">');
            const inputSubmit = $('<input type="button" value="Submit">', {});
            bravoListForm.append(inputTitle);
            bravoListForm.append(inputSubmit);
            $(inputSubmit).on("click", (evt => SPInterface_awaiter(this, void 0, void 0, (function*() {
                var _a, _b, _c;
                const dataIdString = (_a = $(bravoListForm).attr("data-id")) === null || _a === void 0 ? void 0 : _a.toString();
                const dataId = dataIdString ? parseInt(dataIdString) : 0;
                if (dataId && dataId > 0) {
                    console.log("dataId: ", dataId);
                    const currentTarget = evt.currentTarget;
                    const title = ((_b = $(currentTarget).parent().find('input[name="Title"]').val()) === null || _b === void 0 ? void 0 : _b.toString()) || "No Data";
                    $(currentTarget).val() === "Submit" ? $(currentTarget).val("Submitting...") : $(currentTarget).val("Submit");
                    const returnvalue = yield BravoList.PATCH(dataId, {
                        Title: title
                    });
                    $(currentTarget).val() === "Submit";
                    $(currentTarget).attr("returnvalue", JSON.stringify(returnvalue));
                } else {
                    console.log("getBravoListForm.dataId: ", dataId);
                    const currentTarget = evt.currentTarget;
                    const title = ((_c = $(currentTarget).parent().find('input[name="Title"]').val()) === null || _c === void 0 ? void 0 : _c.toString()) || "No Data";
                    $(currentTarget).val() === "Submit" ? $(currentTarget).val("Submitting...") : $(currentTarget).val("Submit");
                    BravoList.POST({
                        Title: title
                    });
                }
            }))));
            return bravoListForm;
        }
        getServerName(href) {
            let serverName = "";
            const aryHREF = href.split("/");
            if (aryHREF.length > 1) {
                serverName = aryHREF[2];
            }
            this.serverName = serverName;
            return serverName;
        }
    }
    $(document).ready((() => {
        const spInterface = new SPInterface;
        spInterface.targetElement = $("#spInterface");
        spInterface.init();
    }));
})();