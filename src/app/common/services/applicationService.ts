import {Injectable} from "@angular/core";

@Injectable()
export class ApplicationService {
	
	loading: any;

	constructor() {
		this.loading = document.getElementsByClassName("loading");
	}

	/**
	 * method to show a overlay over page
	 */
	showOverlay() {
		for (let i = 0; i < this.loading.length; i++) {
			let loading = this.loading[i];
			if (loading.className.indexOf("show") === -1) {
				loading.className += " show";
			}
		}
	}

	/**
	 * method to hide the overlay from page
	 */
	hideOverlay() {
		for (let i = 0; i < this.loading.length; i++) {
			var loading = this.loading[i];
			loading.className = loading.className.replace(new RegExp('(?:^|\\s)'+ 'show' + '(?:\\s|$)'), '');
		}
	}

	/**
	 * method to parse name of Manga to code format
	 * @param name {String}
	 * @return {String}
	 */
	parseMangaName(name: string): string {
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
}