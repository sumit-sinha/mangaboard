import {Injectable} from "@angular/core";

@Injectable()
export class LocalStorageService {

	/**
	 * function to read data from local storage
	 * @param args {Object}
	 * @return {Object}
	 */
	readFromStorage(args: Object): Object {
		let data = localStorage.getItem(args.key);
		return JSON.parse(data);
	}

	/**
	 * function to write data in local storage
	 * @param args {Object}
	 */
	writeToStorage(args: Object) {
		for (var key in args) {
			localStorage.setItem(key, JSON.stringify(args[key]));
		}
	}

	/**
	 * function to return a list of all manga
	 * @return {Object}
	 */
	getMangaList(): Object {
		return this.readFromStorage({key: "manga_list"});
	}

	/**
	 * function to return a list of manga as pinned by our user
	 * @param args {Object}
	 * @return {Array}
	 */
	getPopularMangaList(args: Object): Array {
		
		let list = [];
		let maximum = args && args.max;
		let popularMangaList = this.readFromStorage({key: "popular_manga_list"});
		
		if (maximum == null || maximum > popularMangaList.length) {
			maximum = popularMangaList.length;
		}

		for (let i = 0; i < maximum; i++) {
			let popularManga = popularMangaList[i];
			let name = popularManga.name;

			list.push({
				name: name,
				cover: name + ".jpg"
			});
		}

		return list;
	}

	/**
	 * function to get information about manga based on name
	 * @param name {String}
	 * @return {Object}
	 */
	getMangaInformation(name: string): Object {
		let mangaList = this.readFromStorage({key: "manga_list"});
		return mangaList[name];
	}

	/**
	 * function to set information about manga in storage
	 * @param args {Object}
	 */
	updateMangaInformation(args: Object) {
		let mangaList = this.readFromStorage({key: "manga_list"});
		mangaList[args.key] = args.manga;

		this.writeToStorage({"manga_list": mangaList});
	}
}