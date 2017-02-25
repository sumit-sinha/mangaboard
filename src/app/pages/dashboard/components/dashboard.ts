import {Component} from "@angular/core";
import {Router} from '@angular/router';

import {NetworkHelper} from "app/helpers/networkHelper";
import {StorageHelper} from "app/helpers/storageHelper";
import {AppHelper} from "app/helpers/applicationHelper";
import {ParsePageHelper} from "app/helpers/parsePageHelper";
import {MangaListHelper} from "app/pages/dashboard/helpers/mangaListHelper";

@Component({
	selector: "dashboard",
	template: `
		<app-header [args]="view.header"></app-header>
		<div class="dashboard {{ view.dashboardClass }}">
			<div class="search-bar">
				<input type="search" class="form-control" placeholder="Search" (keyup)="onSearch($event)">
			</div>
			<infinite-scroll [onBottom]="view.scrollCallback">
				<div class="list-group">
				  <a class="list-group-item list-group-item-action" 
				  	*ngFor="let manga of view.manga.list | arrayLength: view.manga.length" (click)="onCardClick(manga)">

				    <h5 class="list-group-item-heading">{{ manga.name }}</h5>
				    <p class="list-group-item-text" *ngIf="manga.description" [innerHTML]="manga.description | trim: 100"></p>
				    <p class="list-group-item-text" *ngIf="manga.description == null">Description is not yet available. Please continue reading and we will fetch it for you later.</p>
				  </a>
				</div>
			</infinite-scroll>
		</div>
	`,
	styleUrls: ["app/pages/dashboard/components/dashboard.css"]
})

export class Dashboard {

	view: Object;

	private appHelper: AppHelper;

	private originalMangaList: Array;

	private storageHelper: StorageHelper;

	constructor(private router: Router) {
		
		this.view = {
			manga: {
				list: null,
				length: null
			},
			dashboardClass: "",
			scrollCallback: this.onScrollToBottom.bind(this),
			header: {
				page: {
					aligned: "left",
					title: "Manga Board"
				},
				search: {
					onClick: this.onSearchClick.bind(this)
				}
			},
			scrollCallback: this.onScrollToBottom.bind(this)
		};

		this.appHelper = AppHelper.getInstance();
		this.storageHelper = StorageHelper.getInstance();
		this._loadMangaList();
	}

	/**
	 * function called when search button is clicked
	 * @param event {Object}
	 */
	onSearchClick(event: Object) {
		if (this.view.dashboardClass !== "") {
			this.view.dashboardClass = "";
		} else {
			this.view.dashboardClass = "search";
		}
	}

	/**
	 * function called when user scroll to bottom
	 * @param event {Object}
	 */
	onScrollToBottom(event: Object) {

		if (this.view.manga.list == null) {
			return;
		}

		let length = this.view.manga.length + 5;
		if (length > this.view.manga.list.length) {
			length = this.view.manga.list.length;
		}

		this.view.manga.length = length;
	}

	/**
	 * function called when user start searching for a new manga
	 * @param event {Object}
	 */
	onSearch(event: Object) {
		
		let list = [];
		for (let i = 0; i < this.originalMangaList.length; i++) {
			let manga = this.originalMangaList[i];
			if (manga.name.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1) {
				list.push(manga);
			}
		}

		this.view.manga.length = 10;
		this.view.manga.list = list;
	}

	/**
	 * function called on click on each card
	 * @param manga {Object}
	 */
	onCardClick(manga) {
		this.router.navigate(["/manga", this.appHelper.encodeMangaName(manga.name)]);
	}

	/**
	 * function called from constructor to load list of mangas<br/>
	 * content is loaded from server if not available in local storage
	 */
	private _loadMangaList() {
		
		let flag = {
			loading: { mangaList: false, popularMangaList: false },
			list: { popularMangaList: null, mangaList: this.storageHelper.getMangaList() }
		};

		let parsePage = ParsePageHelper.getInstance();

		if (flag.list.mangaList == null || flag.list.mangaList.length === 0) {

			let ajax = NetworkHelper.getInstance();

			flag.loading.mangaList = true;
			flag.loading.popularMangaList = true;

			this.appHelper.showOverlay();

			ajax.getPageHTML({
				site: "http://mangareader.net/",
				prefix: "alphabetical"
			}).then(data => {
				flag.loading.mangaList = false;
				flag.list.mangaList = parsePage.parseMangaListPage({html: data.text});
				this._allLoaded(flag);
			}).catch(data => {
				flag.loading.mangaList = false;
				this._allLoaded(flag);
			});

			ajax.getPageHTML({
				site: "http://mangareader.net/"
			}).then(data => {
				flag.loading.popularMangaList = false;
				flag.list.popularMangaList = parsePage.parsePopularManga({html: data.text});
				this._allLoaded(flag);
			}).catch(data => {
				flag.loading.popularMangaList = false;
				this._allLoaded(flag);
			});
		} else {
			this._allLoaded(flag);
		}
	}

	/**
	 * function called when all the content is loaded from server
	 * @param flag {Object}
	 */
	private _allLoaded(flag: Object) {

		if (flag.loading.mangaList == false && flag.loading.popularMangaList == false) {

			let mangaList = flag.list.mangaList;
			let mangaListHelper = MangaListHelper.getInstance();
			let pinnedMangaList = this.storageHelper.getPinnedMangaList();

			this.appHelper.hideOverlay();
			
			if (flag.list.popularMangaList) {
				mangaList = mangaListHelper.mergePopularAndMangaList(flag.list.popularMangaList, mangaList);
				this.storageHelper.setMangaList(mangaList);
			}

			this.view.manga.length = 10;
			this.view.manga.list = mangaListHelper.mergePinnedAndMangaList(pinnedMangaList, mangaList);
			this.originalMangaList = this.view.manga.list;
		}
	}
}