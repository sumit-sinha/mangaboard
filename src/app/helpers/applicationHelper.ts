import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MangaBoardModule }  from 'app/module';

export class AppHelper {
	
	private isCordova: boolean;

	private static instance: AppHelper;

	constructor(isCordova: boolean) {
		this.isCordova = isCordova;
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
	 * method to add a script tag to page if apps
	 */
	addCordovaScript() {
		let cordova = document.createElement("script");
		cordova.src = "cordova.js";

		document.body.appendChild(cordova);
	}

	/**
	 * method to setup events for app
	 */
	addAppEventListeners() {
		document.addEventListener("deviceready", function() {

			cordova.plugins.notification.local.schedule({
				id: 1,
				text: "This is the text.",
				at: new Date(new Date().getTime() + 100000)
			});

			cordova.plugins.notification.local.on("pretrigger", function (notification) {
    			alert("test");
			});

		}, false);
	}

	/**
	 * method to set base tag in HTML<br/>
	 * this will be used by Router to load components
	 */
	setBaseHref() {
		let href = document.location.href;
		let base = document.createElement("base");

		base.href = href.substring(0, href.lastIndexOf("/") + 1);
		document.head.appendChild(base);
	}

	/**
	 * global prototype declaration in Array<br/>
	 * this will allow to remove content from array by value
	 */
	setArrayRemoveFunction() {
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
}