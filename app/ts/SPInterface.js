var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SPListsController } from "./SPListsController.js";
export class SPInterface {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const serverName = this.getServerName(location.href);
            const spLists = new SPListsController();
            spLists.targetElement = this.targetElement;
            spLists.appAPI = '/sites/TeamSite/DevOps/_api';
            spLists.devAPI = 'http://localhost:3000';
            spLists.serverName = serverName;
            spLists.init();
            console.log('serverName: ', serverName);
            switch (serverName) {
                case 'traxxisdev.sharepoint.com':
                    spLists.mode = 'app';
                    break;
                default:
                    spLists.mode = 'dev';
                    break;
            }
            const db = yield spLists.getDB();
            spLists.db = db;
            const BravoList = yield spLists.getListByEntityTypeName('BravoList');
            if (BravoList) {
                const bravoListForm = this.getBravoListForm(BravoList);
                const items = yield BravoList.GET('?$OrderBy=Modified desc&$Top=15');
                console.log('BravoList items: ', items);
                this.targetElement.prepend(bravoListForm);
                const listid = BravoList.Id;
                const targetLI = $('li[listid="' + listid + '"]');
                const htmlTable = spLists.getHTMLTable("BravoList", items.d.results);
                $(targetLI).append(htmlTable);
                console.log('BravoList.Id: ', listid);
            }
        });
    }
    getBravoListForm(BravoList) {
        const bravoListForm = $('<div>', { 'data-role': 'BravoListForm' });
        const inputTitle = $('<input type="text" name="Title" placeholder="Title">');
        const inputSubmit = $('<input type="button" value="Submit">', {});
        const inputDelete = $('<input type="button" value="Delete">', {});
        bravoListForm.append(inputTitle);
        bravoListForm.append(inputSubmit);
        bravoListForm.append(inputDelete);
        $(inputDelete).on('click', (evt) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const dataIdString = (_a = $(bravoListForm).attr('data-id')) === null || _a === void 0 ? void 0 : _a.toString(); // Get the attribute value as a string or undefined
            // Check if dataIdString is not undefined before using parseInt
            const dataId = dataIdString ? parseInt(dataIdString) : 0;
            if (dataId && dataId > 0) {
                console.log('dataId: ', dataId);
                const currentTarget = evt.currentTarget;
                const title = ((_b = $(currentTarget).parent().find('input[name="Title"]').val()) === null || _b === void 0 ? void 0 : _b.toString()) || 'No Data';
                $(currentTarget).val() === 'Delete' ? $(currentTarget).val('Deleting...') : $(currentTarget).val('Submit');
                const returnvalue = yield BravoList.DELETE(dataId);
                $(currentTarget).val() === 'Delete';
                $(currentTarget).attr('returnvalue', JSON.stringify(returnvalue));
            }
        }));
        $(inputSubmit).on('click', (evt) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d, _e;
            const dataIdString = (_c = $(bravoListForm).attr('data-id')) === null || _c === void 0 ? void 0 : _c.toString(); // Get the attribute value as a string or undefined
            // Check if dataIdString is not undefined before using parseInt
            const dataId = dataIdString ? parseInt(dataIdString) : 0;
            if (dataId && dataId > 0) {
                console.log('dataId: ', dataId);
                const currentTarget = evt.currentTarget;
                const title = ((_d = $(currentTarget).parent().find('input[name="Title"]').val()) === null || _d === void 0 ? void 0 : _d.toString()) || 'No Data';
                $(currentTarget).val() === 'Submit' ? $(currentTarget).val('Submitting...') : $(currentTarget).val('Submit');
                const returnvalue = yield BravoList.PATCH(dataId, {
                    Title: title
                });
                $(currentTarget).val() === 'Submit';
                $(currentTarget).attr('returnvalue', JSON.stringify(returnvalue));
            }
            else {
                console.log('getBravoListForm.dataId: ', dataId);
                const currentTarget = evt.currentTarget;
                const title = ((_e = $(currentTarget).parent().find('input[name="Title"]').val()) === null || _e === void 0 ? void 0 : _e.toString()) || 'No Data';
                $(currentTarget).val() === 'Submit' ? $(currentTarget).val('Submitting...') : $(currentTarget).val('Submit');
                BravoList.POST({
                    Title: title
                });
            }
        }));
        return bravoListForm;
    }
    getServerName(href) {
        let serverName = '';
        const aryHREF = href.split('/');
        if (aryHREF.length > 1) {
            serverName = aryHREF[2];
        }
        this.serverName = serverName;
        return serverName;
    }
}
$(document).ready(() => {
    const spInterface = new SPInterface();
    spInterface.targetElement = $('#spInterface');
    spInterface.init();
});
