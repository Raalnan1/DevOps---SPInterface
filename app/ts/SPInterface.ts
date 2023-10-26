import { Webs } from "../../QuickType.js";
import {SPListsController} from "./SPListsController.js";

export class SPInterface {
	targetElement!: JQuery<HTMLElement>;
	serverName!: string;

	async init() {
		const serverName: string = this.getServerName(location.href);
		const spLists: SPListsController = new SPListsController();
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

		const db: any = await spLists.getDB();
		spLists.db = db;
		const BravoList = await spLists.getListByEntityTypeName('BravoList');

		if (BravoList) {
			const bravoListForm: JQuery<HTMLElement> = this.getBravoListForm(BravoList);
			const items: any = await BravoList.GET('?$OrderBy=Modified desc&$Top=15');
			console.log('BravoList items: ', items);
			this.targetElement.prepend(bravoListForm);

			const listid = BravoList.Id;
			const targetLI = $('li[listid="' + listid + '"]');
			const htmlTable = spLists.getHTMLTable("BravoList", items.d.results);
			$(targetLI).append(htmlTable);
			console.log('BravoList.Id: ', listid);
		}
	}

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
	const spInterface: SPInterface = new SPInterface();
	spInterface.targetElement = $('#spInterface');
	spInterface.init();
});