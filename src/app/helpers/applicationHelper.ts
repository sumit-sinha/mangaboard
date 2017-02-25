import { MangaBoardModule }  from 'app/module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { StorageHelper } from "app/helpers/storageHelper";
import { NetworkHelper } from "app/helpers/networkHelper";
import { ParsePageHelper } from "app/helpers/parsePageHelper";

export class AppHelper {

	private loading: any;
	
	private isCordova: boolean;

	private isNotificationAdded: boolean;

	private static instance: AppHelper;

	constructor(isCordova: boolean) {
		this.isCordova = isCordova;
		this.loadings = document.getElementsByClassName("loading");
	}

	/**
	 * function to get an instance of this class
	 * @return {AppHelper}
	 */
	static getInstance(isCordova: boolean): AppHelper {
		AppHelper.instance = AppHelper.instance || new AppHelper(isCordova);
		return AppHelper.instance;
	}

	/**
	 * function to set dependency and start application
	 */
	start() {

		if (this.isCordova) {
			this.addCordovaScript();
			this.addAppEventListeners();
		}

		this.setBaseHref();
		this.setArrayRemoveFunction();
		platformBrowserDynamic().bootstrapModule(MangaBoardModule);
	}

	/**
	 * method to show a overlay over page
	 */
	showOverlay() {
		for (let i = 0; i < this.loadings.length; i++) {
			let loading = this.loadings[i];
			if (loading.className.indexOf("show") === -1) {
				loading.className += " show";
			}
		}
	}

	/**
	 * method to hide the overlay from page
	 */
	hideOverlay() {
		for (let i = 0; i < this.loadings.length; i++) {
			let loading = this.loadings[i];
			loading.className = loading.className.replace(new RegExp('(?:^|\\s)'+ 'show' + '(?:\\s|$)'), '');
		}
	}

	/**
	 * method to remove any text message shown while loading
	 */
	removeOverlayText() {
		for (let i = 0; i < this.loadings.length; i++) {
			this.loadings[i].innerHTML = "";
		}
	}

	/**
	 * method to add text message while loading
	 * @param message {String}
	 */
	addOverlayText(message: string) {
		for (let i = 0; i < this.loadings.length; i++) {
			this.loadings[i].innerHTML = message;
		}
	}

	/**
	 * method to parse name of Manga to code format
	 * @param name {String}
	 * @return {String}
	 */
	encodeMangaName(name: string): string {
		return name && name.replace(/ /gi, "-").replace(/:/gi, "").toLowerCase();
	}

	/**
	 * method to get name of manga after trimming<br/>
	 * usually helpful for manga with really long name
	 * @param name {String}
	 * @return {String}
	 */
	getTrimmedMangaName(name: string, length: number): string{
		
		if (name.length > length) {
			name = name.substring(0, length - 3) + "...";
		}

		return name;
	}

	/**
	 * method to add a script tag to page if apps
	 */
	private addCordovaScript() {
		let cordova = document.createElement("script");
		cordova.src = "cordova.js";

		document.body.appendChild(cordova);
	}

	/**
	 * method to setup events for app
	 */
	private addAppEventListeners() {

		document.addEventListener("deviceready", () => {

			let current = new Date();

			if (!this.isNotificationAdded) {

				cordova.plugins.notification.local.schedule([{
					id: 2,
					text: "Adding new notification",
					at: new Date(current.getTime() + 1000)
				}]);

				cordova.plugins.notification.local.schedule([{
					id: 1,
					text: "This is the text.",
					every: "day",
					at: new Date(current.getTime() + 3600 * 1000)
				}]);

				this.isNotificationAdded = true;
			}

			cordova.plugins.notification.local.on("pretrigger", (id) => {

				let ajax = NetworkHelper.getInstance();
				let storageHelper = StorageHelper.getInstance();
				let mangaList = storageHelper.getMangaList();

				this.checkMangaUpdates(storageHelper, ajax, mangaList).then(changes => {

					if (changes.length === 0) {

						cordova.plugins.notification.local.schedule([{
							id: 2,
							text: "Cancelling Notification: " + id,
							at: new Date(current.getTime() + 1000)
						}]);

						cordova.plugins.notification.local.cancel(id, () => {});
						return;
					}

					let changeMessage = "new chapters available: ";
					for (let i = 0; i < changes.length; i++) {
						let manga = storageHelper.getMangaFromList(changes[i], mangaList);
						changeMessage += manga.name;

						if (i !== changes.length - 1) {
							changeMessage += ", ";
						}
					}

					cordova.plugins.notification.local.schedule([{
						id: 2,
						text: "Updating Notification: " + id,
						at: new Date(current.getTime() + 1000)
					}]);

					cordova.plugins.notification.local.update({
						id: id,
						text: changeMessage
					});

				});
			});

		}, false);
	}

	/**
	 * function to look for updates in any favourite manga
	 * @param storageHelper {StorageHelper}
	 * @param ajax {NetworkHelper}
	 * @param mangaList {Array}
	 * @return {Promise}
	 */
	private checkMangaUpdates(storageHelper: StorageHelper, ajax: NetworkHelper, mangaList: Array): Promise {

		return new Promise((resolve, reject) => {

			let count = 0;
			let changes = [];
			let favourites = storageHelper.getPinnedMangaList();

			resolve(favourites);

			if (favourites == null || favourites.length === 0) {
				resolve(changes);
			}

			for (let i = 0; i < favourites.length; i++) {
				ajax.getPageHTML({
					site: "http://mangareader.net/",
					prefix: favourites[i]
				}).then(data => {
					
					let mangaFromLocal = storageHelper.getMangaFromList(data.input.prefix, mangaList);
					let mangaFromServer = ParsePageHelper.getInstance().parseDescriptionPage({html: data.text});

					if (mangaFromLocal && mangaFromServer && 
						mangaFromLocal.listings.length < mangaFromServer.listings.length) {

						changes.push(data.input.prefix);
					}

					if (++count === favourites.length) {
						resolve(changes);
					}
				}).catch(data => {
					if (++count === favourites.length) {
						resolve(changes);
					}
				})
			}
		});
	}

	/**
	 * method to set base tag in HTML<br/>
	 * this will be used by Router to load components
	 */
	private setBaseHref() {
		let href = document.location.href;
		let base = document.createElement("base");

		base.href = href.substring(0, href.lastIndexOf("/") + 1);
		document.head.appendChild(base);
	}

	/**
	 * global prototype declaration in Array<br/>
	 * this will allow to remove content from array by value
	 */
	private setArrayRemoveFunction() {
		Array.prototype.remove = function() {
			let what, a = arguments, L = a.length, ax;
			while (L && this.length) {
				what = a[--L];
				while ((ax = this.indexOf(what)) !== -1) {
					this.splice(ax, 1);
				}
			}
			return this;
		};
	}
}