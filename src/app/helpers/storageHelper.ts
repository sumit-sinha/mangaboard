import {AppHelper} from "app/helpers/applicationHelper";

export class StorageHelper {

	private static instance: StorageHelper;

	/**
	 * function to get an instance of this class
	 * @return {StorageHelper}
	 */
	static getInstance(): StorageHelper {
		StorageHelper.instance = StorageHelper.instance || new StorageHelper();
		return StorageHelper.instance;
	}

	/**
	 * function to get all bookmarked manga
	 * @return {Array}
	 */
	getPinnedMangaList(): Array {
		return this.readFromStorage({key: "pinned_list"});
	}

	/**
	 * function to check if manga is already in list
	 * @param args {Object}
	 * @return {boolean}
	 */
	isMangaPinned(args): boolean {
		let pinnedList = this.getPinnedMangaList();
		if (pinnedList == null) {
			pinnedList = [];
		}

		for (let i = 0; i < pinnedList.length; i++) {
			if (pinnedList[i] === args.name) {
				return true;
			}
		}

		return false;
	}

	/**
	 * function to remove manga from list
	 * @param args {Object}
	 */
	removeFromPinnedMangaList(args: Object) {
		let pinnedList = this.getPinnedMangaList();
		if (pinnedList == null) {
			pinnedList = [];
		}

		for (let i = 0; i < pinnedList.length; i++) {
			if (pinnedList[i] === args.name) {
				pinnedList.remove(args.name);
			}
		}

		this.writeToStorage({
			pinned_list: pinnedList
		});
	}

	/**
	 * function to add manga to list
	 * @param args {Object}
	 */
	addToPinnedMangaList(args: Object): Array {

		if (!this.isMangaPinned(args)) {
			let pinnedList = this.getPinnedMangaList();
			if (pinnedList == null) {
				pinnedList = [];
			}

			pinnedList.push(args.name);
			this.writeToStorage({
				pinned_list: pinnedList
			});
		}
		
	}

	/**
	 * function to return a list of all manga
	 * @return {Array}
	 */
	getMangaList(): Object {
		return this.readFromStorage({key: "manga_list"});
	}

	/**
	 * function to set a list of all manga
	 * @param mangaList {Array}
	 */
	setMangaList(mangaList: Array) {
		this.writeToStorage({ 
			"manga_list": mangaList 
		});
	}

	/**
	 * function to get manga object from Array
	 * @param name {String}
	 * @param mangaList {Array}
	 * @return {Object}
	 */
	getMangaFromList(name: string, mangaList: Array) {

		name = name || null;
		mangaList = mangaList || this.getMangaList();

		for (let i = 0; i < mangaList.length; i++) {
			let manga = mangaList[i];
			if (name === AppHelper.getInstance().encodeMangaName(manga.name)) {
				return manga;
			}
		}

		return null;
	}

	/**
	 * function to set information about manga in storage
	 * @param args {Object}
	 */
	updateMangaInformation(args: Object) {

		let manga = args.manga;
		let mangaList = this.getMangaList();

		for (let i = 0; i < mangaList.length; i++) {
			let codedMangaName = manga.name.replace(/ /gi, "-").replace(/:/gi, "").toLowerCase();
			let codedMangaFromListName = mangaList[i].name.replace(/ /gi, "-").replace(/:/gi, "").toLowerCase();

			if (codedMangaName === codedMangaFromListName) {
				mangaList[i] = manga;
			}
		}

		this.setMangaList(mangaList);
	}

	/**
	 * function to read data from local storage
	 * @param args {Object}
	 * @return {Object}
	 */
	private readFromStorage(args: Object): Object {

		let data = localStorage.getItem(args.key);
		if (data != null) {
			return JSON.parse(data);
		}

		return null;
	}

	/**
	 * function to write data in local storage
	 * @param args {Object}
	 */
	private writeToStorage(args: Object) {
		for (var key in args) {
			localStorage.setItem(key, JSON.stringify(args[key]));
		}
	}
}