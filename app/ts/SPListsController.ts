import { Webs } from '../../QuickType';

interface ServerSettings {
	method: string;
	timeout: number;
	url?: string;
	headers?: {
		Accept: string;
	};
}

export class SPListsController {

	serverName!: string;
	targetElement!: JQuery<HTMLElement>;
	appAPI!: string;
	devAPI!: string;
	lists: any = false;
	mode: 'dev' | 'app' = 'dev';
	db!: { [key: string]: any; };

	settings: ServerSettings = {
		method: "GET",
		timeout: 0,
	};

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

	async getSPLists(callingMethod: string): Promise<Webs[]> {
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

	async init() {
		$(this.targetElement).html(`init on ${this.serverName}`);
		try {
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

			await this.getSPLists('init');

		} catch (error) {
			console.error('Error in initialization: ', error);
		}
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

	getSettings(): ServerSettings {
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

	addGetContentTypes(list: any) {
		list.getContentTypes = async () => {
			const settings = this.getSettings();
			const url = `${list.__metadata.uri}/ContentTypes`;
			settings.url = url;
			const contentTypes = await $.ajax(settings);
			return contentTypes;
		};
	}

	addGET(list: any) {
		list.GET = async (queryString?: string) => {

			let url = '';
			switch (this.mode) {
				case 'app':
					url = `${list.Items.__deferred.uri}${queryString}`;
					break;
				case 'dev':
					url = `http://localhost:3000/${list.Title}Items`;
					break;
			}

			try {
				const data = await $.ajax({
					url,
					method: 'GET',
					headers: { 'Accept': 'application/json; odata=verbose' },
				});
				list.data = data;
				return data;
			} catch (error) {
				console.error('SPListsController.addGET Error while getting data: ', error);
				console.log('%cget.url', 'color:red;', url);
				return error;
			}
		};
	}

	updatePATCH(list: any) {
		let returnvalue: any = {};
		const url = `${list.Items.__deferred.uri}`;
		const ListItemEntityTypeFullName = `${list.ListItemEntityTypeFullName}`;
		list.PATCH = async (Id: number, data: any) => {

			data['__metadata'] = { 'type': ListItemEntityTypeFullName };	//	SP.Data.AlphaListItem
			if (!Id) {
				console.error('No Id provided for PATCH');
				return;
			}
			const url = `${list.Items.__deferred.uri}(${Id})`;

			try {
				returnvalue = await $.ajax({
					url,
					method: 'PATCH',
					headers: {
						'Accept': 'application/json; odata=verbose',
						'X-RequestDigest': $('#__REQUESTDIGEST').val() as string,
						'Content-Type': 'application/json;odata=verbose',
						'IF-MATCH': '*',
					},
					data: JSON.stringify(data),
				});
			} catch (error) {
				returnvalue = error;
				console.error(`Error while updating item with Id: ${Id}. Error: `, error);
				throw error;
			}
		};
		return returnvalue;
	}

	addDELETE(list: any) {
		list.DELETE = async (Id: number) => {
			if (!Id) {
				console.error('No Id provided for DELETE');
				return;
			}

			const url = `${list.Items.__deferred.uri}(${Id})`;

			try {
				await $.ajax({
					url,
					method: 'DELETE',
					headers: {
						'Accept': 'application/json; odata=verbose',
						'X-RequestDigest': $('#__REQUESTDIGEST').val() as string, // SharePoint requires a valid request digest
						'IF-MATCH': '*', // Use '*' to match any eTag and delete the item or use item's eTag value
					},
				});
			} catch (error) {
				console.error(`Error while deleting item with Id: ${Id}. Error: `, error);
				throw error; // Re-throwing error after logging it
			}
		};
	}

	addPOST(list: any) {
		const url = `${list.Items.__deferred.uri}`;
		list.POST = async (data: any) => {
			const ListItemEntityTypeFullName = `${list.ListItemEntityTypeFullName}`;
			const requestDigest = $("#__REQUESTDIGEST").val();

			// Add a check to ensure requestDigest is a string
			if (typeof requestDigest !== 'string') {
				console.error("X-RequestDigest value is not a string.");
				return;
			}

			data['__metadata'] = { 'type': ListItemEntityTypeFullName };	//	SP.Data.AlphaListItem

			var settings = {
				url: url,	//	https://traxxisdev.sharepoint.com/sites/TeamSite/DevOps/_api/Web/Lists(guid'55edd9d4-ba1e-4e16-aa56-33c4df2425da')/Items
				type: "POST",
				contentType: "application/json;odata=verbose",
				data: JSON.stringify(data),
				headers: {
					"Accept": "application/json;odata=verbose",
					"X-RequestDigest": requestDigest
				}
			};

			try {
				const insertedRecord = await $.ajax(settings);

			} catch (error) {
				console.error('Error while inserting record: ', error);
			}
		};
	}
}