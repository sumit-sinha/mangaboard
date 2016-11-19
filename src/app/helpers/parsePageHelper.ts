class HtmlHelper {
	
	private imgRegex: RegExp;
	private linkRegex: RegExp;
	private htmlContentRegex: RegExp;
	private optionRegex: RegExp;

	private static instance: HtmlHelper;

	constructor() {
		this.imgRegex = /src=\"(?:.|\n)*?\"/gm;
		this.linkRegex = /href=\"(?:.|\n)*?\"/gm;
		this.htmlContentRegex = />(?:.|\n)*?</gm;
		this.optionRegex = /value=\"(?:.|\n)*?\"/gm;
	}

	/**
	 * function to select all hyperlinks in a given HTML string<br/>
	 * this function can be considered as an equivalent of getElementsByTagName("a")
	 * @param element {String}
	 * @return {String}
	 */
	getHyperLinks(element: string): string {
		return element.match(/(<a[^>]*>(?:.|\n)*?<\/a>)/gm);
	}

	/**
	 * function to select all images in a given HTML string<br/>
	 * this function can be considered as an equivalent of getElementsByTagName("img")
	 * @param element {String}
	 * @return {String}
	 */
	getImages(element: string): string {
		return element.match(/(<img[^>]*>)/gm);
	}

	/**
	 * function to get value attribute of an option tag
	 * @param option {String}
	 * @return {String}
	 */
	getOptionValue(option: string): string {
		let matched = option.match(this.optionRegex)[0];
		return matched.substring(7, matched.length - 1);
	}

	/**
	 * function to get src value of an image tag
	 * @param image {String}
	 * @return {String}
	 */
	getImageURL(image: string): string {
		let matched = image.match(this.imgRegex)[0];
		return matched.substring(5, matched.length - 1);
	}

	/**
	 * function to get href value of a hyperlink
	 * @param element {String}
	 * @return {String}
	 */
	getLinkURL(link: string): string {
		let matched = link.match(this.linkRegex)[0];
		return matched.substring(6, matched.length - 1);
	}

	/**
	 * function to get innerHTML from a HTML tag
	 * @param element {String}
	 * @return {String}
	 */
	getInnerHTML(element: string): string {
		let matched = element.match(this.htmlContentRegex)[0];
		return matched.substring(1, matched.length - 1);
	}

	/**
	 * method to process HTML string before method can start execution
	 * @param html {String}
	 * @return {String}
	 */
	processHTML(html: string): string {
		return html.replace(/(?:\r\n|\r|\n)/g, '<br />');
	}

	/**
	 * function to get an instance of this class
	 * @return {HtmlHelper}
	 */
	static getInstance(): HtmlHelper {
		HtmlHelper.instance = HtmlHelper.instance || new HtmlHelper();
		return HtmlHelper.instance;
	}

}

export class ParsePageHelper {
	
	private htmlHelper: HtmlHelper;

	private static instance: ParsePageHelper;

	constructor() {
		this.htmlHelper = HtmlHelper.getInstance();
	}

	/**
	 * function to get an instance of this class
	 * @return {ParsePageHelper}
	 */
	static getInstance(): ParsePageHelper {
		ParsePageHelper.instance = ParsePageHelper.instance || new ParsePageHelper();
		return ParsePageHelper.instance;
	}

	/**
	 * method to parse description page of the manga
	 * @param args {Object}
	 * @return {Object}
	 */
	parseDescriptionPage(args: Object): Object {

		args.html = this.htmlHelper.processHTML(args.html);

		let listings = [];
		let listingsRow = args.html.match(/(<table[^>]*id=\"listing\"[^>]*>(?:.|\n)*?<\/table>)/gm)[0]
								.match(/<tr>(?:.|\n)*?<\/tr>/gm);

		for (let i = 0; i < listingsRow.length; i++) {

			let tdArray = listingsRow[i].match(/<td>(?:.|\n)*?<\/td>/gm);
			let chapterMatch = this.htmlHelper.getHyperLinks(tdArray[0])[0];

			listings.push({
				link: this.htmlHelper.getLinkURL(chapterMatch),
				chapter: {
					name: this.htmlHelper.getInnerHTML(chapterMatch),
					title: this.htmlHelper.getInnerHTML(tdArray[0].match(/<\/a>(?:.|\n)*?<\/td>/gm)[0])
				},
				releaseDate: this.getDateObject(this.htmlHelper.getInnerHTML(tdArray[1]))
			});
		}

		let descriptionDiv = args.html.match(/(<div[^>]*id=\"readmangasum\"[^>]*>(?:.|\n)*?<\/div>)/gm)[0];
		let description = this.htmlHelper.getInnerHTML(descriptionDiv.match(/(<p[^>]*>(?:.|\n)*?<\/p>)/gm)[0]);
		if (description == null || description.trim() === "") {
			description = "There is no description available for this manga series. Please enjoy reading chapters while we try to find some details about it.";
		}

		let mangaImageDiv = args.html.match(/(<div[^>]*id=\"mangaimg\"[^>]*>(?:.|\n)*?<\/div>)/gm)[0];
		let mangaImage = this.htmlHelper.getImageURL(this.htmlHelper.getImages(mangaImageDiv)[0]);

		return {
			cover: mangaImage,
			listings: listings,
			description: description
		};
	}

	/**
	 * method to parse manga list page
	 * @param args {Object}
	 * @return {Object}
	 */
	parseMangaListPage(args: Object): Object {

		args.html = this.htmlHelper.processHTML(args.html);

		let mangaList = {};
		let alphabeticalList = args.html.match(/(<ul class=\"series_alpha\">(?:.|\n)*?<\/ul>)/gm);
		for (let i = 0; i < alphabeticalList.length; i++) {
			let mangaInfoList = this.htmlHelper.getHyperLinks(alphabeticalList[i]);
			for (let j = 0; j < mangaInfoList.length; j++) {
				let mangaInfo = mangaInfoList[j];

				let name = this.htmlHelper.getInnerHTML(mangaInfo);
				mangaList[name.replace(/ /gi, "-").replace(/:/gi, "").toLowerCase()] = {
					name: name,
					link: this.htmlHelper.getLinkURL(mangaInfo)
				};
			}
		}

		return mangaList;
	}

	/**
	 * method to parse all popular mangas from home page
	 * @param args {Object}
	 * @return {Array}
	 */
	parsePopularManga(args: Object): Array {

		args.html = this.htmlHelper.processHTML(args.html);

		let popularMangaList = [];
		let allPopularMangaList = args.html.match(/(<ol>(?:.|\n)*?<\/ol>)/gm)[0].match(/(<li>(?:.|\n)*?<\/li>)/gm);

		let maximum = args.maximum;
		if (maximum == null || maximum > allPopularMangaList.length) {
			maximum = allPopularMangaList.length;
		}

		for (let i = 0; i < maximum; i++) {
			let link = this.htmlHelper.getHyperLinks(allPopularMangaList[i])[0];
			popularMangaList.push({
				link: this.htmlHelper.getLinkURL(link),
				name: this.htmlHelper.getInnerHTML(link)
			});
		}

		return popularMangaList;
	}

	/**
	 * method to parse the page where manga images are loaded
	 * @param args {Object}
	 * @return {Object}
	 */
	parseReaderPage(args: Object): Object {

		let pages = [];

		args.html = this.htmlHelper.processHTML(args.html);

		if (args.fetch_pages) {
			let pagesSelect = args.html.match(/(<select[^>]*id=\"pageMenu\"[^>]*>(?:.|\n)*?<\/select>)/gm)[0];
			let pagesOptions = pagesSelect.match(/(<option[^>]*>(?:.|\n)*?<\/option>)/gm);

			for (let i = 0; i < pagesOptions.length; i++) {
				let pageOption = pagesOptions[i];
				pages.push({
					number: this.htmlHelper.getInnerHTML(pageOption),
					link: this.htmlHelper.getOptionValue(pageOption)
				});
			}
		}

		let imageHolderRegex = /(<div[^>]*id=\"imgholder\"[^>]*>(?:.|\n)*?<img(?:.|\n)*?<\/div>)/gm;
		let imageTag = this.htmlHelper.getImages(args.html.match(imageHolderRegex)[0])[0];

		return {
			pages: pages,
			image: this.htmlHelper.getImageURL(imageTag)
		}
	}

	/**
	 * method to convert a string to {Date} object
	 * @param value {String}
	 * @return {Date}
	 */
	private getDateObject(value: string): Date {
		let params = value.split("/");
		return new Date(parseInt(params[2]), parseInt(params[1]) - 1, parseInt(params[0]), 0, 0, 0);
	}
}