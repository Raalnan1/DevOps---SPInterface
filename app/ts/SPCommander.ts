import { Webs } from '../../QuickType';

interface ServerSettings {
    method: string;
    timeout: number;
    url?: string;
    headers?: {
        Accept: string;
    };
}

export class SPCommander {

    serverName!: string;
    targetElement!: JQuery<HTMLElement>;
    appAPI!: string;
    devAPI!: string;
    lists: any = false;
    mode: 'dev' | 'app' = 'dev';
    db!: { [key: string]: any };

    async getListByEntityTypeName(entityTypeName: string): Promise<Webs | null> {

        const db = this.db;
        const lists = db.lists;
        const d = lists.d;
        const results = d.results;

        const list = results.find((list: { EntityTypeName: string; }) => list.EntityTypeName === entityTypeName);

        if (!list) {
            console.error(`No list found with EntityTypeName: ${entityTypeName}`);
            return null;
        }

        return list;
    }
    
    settings: ServerSettings = {
        method: "GET",
        timeout: 0,
    };

    constructor(targetElement: JQuery<HTMLElement>, serverName: string) {
        this.targetElement = targetElement;
        this.serverName = serverName;
    }

    async init() {
        $(this.targetElement).html(`init on ${this.serverName}`);
        try {
            this.determineMode();
            await this.getSPLists('init');
        } catch (error) {
            console.error('Error in initialization: ', error);
        }
    }

    private determineMode() {
        switch (this.serverName) {
            case '127.0.0.1:5500':
            case '127.0.0.1:5501':
            case 'localhost:5500':
            case 'localhost:5501':
                this.mode = 'dev';
                break;
            default:
                this.mode = 'app';
                break;
        }
    }

    private async getSPLists(callingMethod: string): Promise<Webs[]> {
        const div = $('<div>', { html: `<h1>getSPLists (${this.mode}) ${callingMethod}</h1>` });
        const ol = $('<ol>');

        let lists: any = {};
        const settings = this.getSettings();

        switch (this.mode) {
            case 'app':
                settings.url = `${settings.url}/Lists`;
                break;
            case 'dev':
                settings.url = `http://localhost:3000/Lists`;
                break;
        }

        try {
            if (!this.lists) {
                lists = await $.ajax(settings);
                const results = lists.d.results;
                for (const list of results) {
                    list.d = { results: [] };
                    this.addGET(list);
                    this.addDELETE(list);
                    this.addPOST(list);
                    this.updatePATCH(list);
                    this.addGetContentTypes(list);

                    const li = $('<li>', { listId: list.Id, html: list.Title });
                    ol.append(li);
                }
                div.append(ol);
                this.lists = lists;
            }
        } catch (error) {
            console.error('SPListsController.getSPLists Error while getting lists: ', error);
        }

        $(this.targetElement).append(div);
        return lists;
    }

    private getSettings(): ServerSettings {
        const baseSettings: ServerSettings = { ...this.settings };

        switch (this.serverName) {
            case 'localhost:5501':
            case '127.0.0.1:5500':
            case '127.0.0.1:5501':
            case 'localhost:5500':
                return { ...baseSettings, url: this.devAPI };

            case 'traxxisdev.sharepoint.com':
                return {
                    ...baseSettings,
                    url: this.appAPI,
                    headers: {
                        Accept: "application/json; odata=verbose"
                    }
                };
            default:
                alert(`SPListsController got an invalid ServerName(${this.serverName})`);
                return baseSettings;
        }
    }

    private addGET(list: any) {
        // Implementation of addGET method
        // Example:
        list.GET = async (queryString?: string) => {
            // Implementation of GET method
        };
    }

    private updatePATCH(list: any) {
        // Implementation of updatePATCH method
        // Example:
        list.PATCH = async (Id: number, data: any) => {
            // Implementation of PATCH method
        };
    }

    private addDELETE(list: any) {
        // Implementation of addDELETE method
        // Example:
        list.DELETE = async (Id: number) => {
            // Implementation of DELETE method
        };
    }

    private addPOST(list: any) {
        // Implementation of addPOST method
        // Example:
        list.POST = async (data: any) => {
            // Implementation of POST method
        };
    }

    private addGetContentTypes(list: any) {
        // Implementation of addGetContentTypes method
        // Example:
        list.getContentTypes = async () => {
            // Implementation of getContentTypes method
        };
    }

    async getCurrentUser(settings: any): Promise<any> {
        switch (this.mode) {
            case 'app':
                settings.url = `${this.appAPI}/web/currentUser`;
                break;
            case 'dev':
                settings.url = `http://localhost:3000/CurrentUser`;
                break;
        }

        const currentUser = await $.ajax(settings);
        console.log('getCurrentUser.currentUser: ', currentUser);
        return currentUser;
    }

    async getDB(): Promise<any> {
        let lists: any;

        if (this.lists === false) {
            lists = await this.getSPLists('getDB');
        } else {
            lists = this.lists;
        }

        const settings = this.getSettings();
        this.settings = settings;
        const db: { [key: string]: any } = {};

        if (this.mode === 'app') {
            for (const list of lists.d.results) {
                const { EntityTypeName, Items } = list;
                const uri = Items.__deferred.uri;

                settings.url = `${uri}?$Top=10`;
                const ajax = await $.ajax(settings);

                db[`${EntityTypeName}Items`] = ajax.d.results;
            }
        }

        db["CurrentUser"] = await this.getCurrentUser(settings);
        db["Webs"] = await this.getWebs(settings);

        db.lists = lists;
        console.log('%cdb: ', "color: blue; font-size: 20px;", db);
        console.log("%cHello, %cWorld!", "color: blue; font-size: 20px;", "color: green; font-weight: bold;");

        return db;
    }

    async getWebs(settings: any): Promise<any> {
        switch (this.mode) {
            case 'app':
                settings.url = `${this.appAPI}/Web/Webs`;
                break;
            case 'dev':
                settings.url = `${this.devAPI}/Webs`;
                break;
        }
        console.log('getWebs.settings: ', settings);
        const webs = await $.ajax(settings);
        console.log('getWebs.webs: ', webs);
        return webs;
    }

    getHTMLTable(EntityTypeName: string, items: any[]): JQuery<HTMLElement> {
        // Create the table element
        const table = $('<table>', { EntityTypeName: EntityTypeName });
        const tbody = $('<tbody>');

        // Create the header row
        const headerRow = $('<tr>');

        // Create the footer row
        const footerRow = $('<tr>');

        // Iterate through the array items to extract the names
        if (items.length > 0) {
            const listForm = $(this.targetElement).find(`div[data-role="${EntityTypeName}Form"]`);
            let item = items[0];

            for (const property in item) {
                const data = item[property];
                const dataType = typeof data;

                switch (dataType) {
                    case 'object':

                        break;
                    default:
                        // Extract the name from the item (adjust this depending on your item structure)

                        // Create table header cell
                        const headerCell = $('<th>').text(property);

                        // Create table footer cell
                        const footerCell = $('<th>').text(property);

                        // Append the header and footer cells to their respective rows
                        headerRow.append(headerCell);
                        footerRow.append(footerCell);
                        break;
                }


            }

            items.forEach(element => {
                const row = $('<tr>', { EntityTypeName: `${EntityTypeName}`, 'data-id': `${element.Id}` });
                for (const property in element) {
                    const data = element[property];
                    const dataType = typeof data;

                    switch (dataType) {
                        case 'object':

                            break;
                        default:
                            const cell = $('<td>').text(element[property]);
                            row.append(cell);
                            break;
                    }
                }

                tbody.append(row);

                $(row).find('td').on('click', (evt) => {
                    if (listForm.length > 0) {
                        const EntityTypeName = $(row).attr('EntityTypeName')?.toString() || 'No Data';
                        const dataId = $(row).attr('data-id')?.toString() || 'No Data';
                        $(listForm).attr('data-id', dataId);
                        $(listForm).attr('EntityTypeName', EntityTypeName);

                        for (const property in element) {
                            $(listForm).find('input[name="' + property + '"]').hide();
                            $(listForm).find('input[name="' + property + '"]').val(element[property]);
                            $(listForm).find('input[name="' + property + '"]').fadeIn();
                        }

                        console.log($(row).attr('data-id'));
                    } else {
                        console.log('No listForm was detected.');
                    }
                });

            });
        }

        // Append the header and footer rows to the table
        table.append(headerRow);
        table.append(tbody);
        table.append(footerRow);

        return table;
    }
}

export class SPInterface {
    targetElement!: JQuery<HTMLElement>;
    serverName!: string;
    db: any;

    constructor(targetElement: JQuery<HTMLElement>) {
        this.targetElement = targetElement;
    }




    async init() {
        const serverName: string = this.getServerName(location.href);
        const spCommander: SPCommander = new SPCommander(this.targetElement, serverName);
        spCommander.appAPI = '/sites/TeamSite/DevOps/_api';
        spCommander.devAPI = 'http://localhost:3000';
        await spCommander.init();
        console.log('serverName: ', serverName);

        const db: any = await spCommander.getDB();
        spCommander.db = db;
        const BravoList = await spCommander.getListByEntityTypeName('BravoList');

        if (BravoList) {
            const bravoListForm: JQuery<HTMLElement> = this.getBravoListForm(BravoList);
            const items: any = await BravoList.GET('?$OrderBy=Modified desc&$Top=15');
            console.log('BravoList items: ', items);
            this.targetElement.prepend(bravoListForm);

            const listid = BravoList.Id;
            const targetLI = $('li[listid="' + listid + '"]');
            const htmlTable = spCommander.getHTMLTable("BravoList", items.d.results);
            $(targetLI).append(htmlTable);
            console.log('BravoList.Id: ', listid);
        }
    }

    // ... other methods, if any

    getBravoListForm(BravoList: Webs): JQuery<HTMLElement> {
        const bravoListForm = $('<div>', { 'data-role': 'BravoListForm' });
        const inputTitle = $('<input type="text" name="Title" placeholder="Title">');
        const inputSubmit = $('<input type="button" value="Submit">', {});
        const inputDelete = $('<input type="button" value="Delete">', {});
        bravoListForm.append(inputTitle);
        bravoListForm.append(inputSubmit);
        bravoListForm.append(inputDelete);

        $(inputDelete).on('click', async (evt) => {
            const dataIdString = $(bravoListForm).attr('data-id')?.toString(); // Get the attribute value as a string or undefined

            // Check if dataIdString is not undefined before using parseInt
            const dataId = dataIdString ? parseInt(dataIdString) : 0;

            if (dataId && dataId > 0) {
                console.log('dataId: ', dataId);
                const currentTarget = evt.currentTarget;
                const title = $(currentTarget).parent().find('input[name="Title"]').val()?.toString() || 'No Data';
                $(currentTarget).val() === 'Delete' ? $(currentTarget).val('Deleting...') : $(currentTarget).val('Submit');
                const returnvalue = await BravoList.DELETE(dataId);
                $(currentTarget).val() === 'Delete';
                $(currentTarget).attr('returnvalue', JSON.stringify(returnvalue));
            }
        });

        $(inputSubmit).on('click', async (evt) => {
            const dataIdString = $(bravoListForm).attr('data-id')?.toString(); // Get the attribute value as a string or undefined

            // Check if dataIdString is not undefined before using parseInt
            const dataId = dataIdString ? parseInt(dataIdString) : 0;

            if (dataId && dataId > 0) {
                console.log('dataId: ', dataId);
                const currentTarget = evt.currentTarget;
                const title = $(currentTarget).parent().find('input[name="Title"]').val()?.toString() || 'No Data';
                $(currentTarget).val() === 'Submit' ? $(currentTarget).val('Submitting...') : $(currentTarget).val('Submit');
                const returnvalue = await BravoList.PATCH(dataId, {
                    Title: title
                });
                $(currentTarget).val() === 'Submit';
                $(currentTarget).attr('returnvalue', JSON.stringify(returnvalue));
            } else {
                console.log('getBravoListForm.dataId: ', dataId);
                const currentTarget = evt.currentTarget;
                const title = $(currentTarget).parent().find('input[name="Title"]').val()?.toString() || 'No Data';
                $(currentTarget).val() === 'Submit' ? $(currentTarget).val('Submitting...') : $(currentTarget).val('Submit');
                BravoList.POST({
                    Title: title
                });
            }
        });

        return bravoListForm;
    }

    getServerName(href: string): string {
        let serverName: string = '';
        const aryHREF = href.split('/');
        if (aryHREF.length > 1) {
            serverName = aryHREF[2];
        }
        this.serverName = serverName;
        return serverName;
    }
}

$(document).ready(() => {
    const spInterface: SPInterface = new SPInterface($('#spInterface'));
    spInterface.init();
});
