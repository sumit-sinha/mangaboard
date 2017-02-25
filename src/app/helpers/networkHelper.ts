export class NetworkHelper {

	private static instance: NetworkHelper;

	/**
	 * function to get an instance of this class
	 * @return {NetworkHelper}
	 */
	static getInstance(): NetworkHelper {
		NetworkHelper.instance = NetworkHelper.instance || new NetworkHelper();
		return NetworkHelper.instance;
	}

	/**
	 * function to get home page html of a manga
	 * @param args {Object}
	 * @return {Promise}
	 */
	getPageHTML(args: Object): Promise {

		let prefix = args.prefix || "";

		return this.request({
			input: args,
			method: "GET",
			url: "https://cors-anywhere.herokuapp.com/" + args.site + prefix
		});
	}

	/**
	 * function to make a request to server
	 * @param args {Object}
	 */
	private request(args: Object) {
		
		return new Promise((resolve, reject) => {

			let xhr = this.createXHR();

			xhr.open(args.method, args.url, true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve({
						text: xhr.response,
						input: args.input
					});
				} else {
					reject({
						input: args.input,
						status: xhr.status,
						statusText: xhr.statusText
					});
				}
			};

			xhr.onerror = () => {
				reject({
					input: args.input,
					status: xhr.status,
					statusText: xhr.statusText
				});
			};

			
			xhr.send();
		});
	}

	/**
	 * function to create an XHR object for ajax call
	 * @return {ActiveXObject} or {XMLHttpRequest}
	 */
	private createXHR(): Object {

		let xhr;
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {
				xhr = null;
			}
		} else {
			xhr = new XMLHttpRequest();
		}

		return xhr;
	}
}
