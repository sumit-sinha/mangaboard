import {Component} from "@angular/core";
import {Router} from '@angular/router';

import {ParsePageHelper} from "app/helpers/parsePageHelper";

import {ApplicationService} from "app/common/services/applicationService";
import {LocalStorageService} from "app/common/services/data/localStorageService";
import {MangaSiteAjaxService} from "app/common/services/network/mangaSiteAjaxService";


let mangaListHelper = function() {
	
	return {

		/**
		 * method to merge manga list and popular manga together
		 * @param popularMangaList {Array}
		 * @param mangaList {Object}
		 * @return {Object}
		 */
		mergePopularAndMangaList: function(popularMangaList: Array, mangaList: Object, appService: ApplicationService) {

			mangaList = mangaList || {};
			popularMangaList = popularMangaList || [];

			for (let i = 0; i < popularMangaList.length; i++) {

				let popularManga = popularMangaList[i];
				let codedName = appService.parseMangaName(popularManga.name);

				popularManga.description = mangaList[codedName].description;

				delete mangaList[codedName];
			}

			for (let key in mangaList) {
				if (mangaList.hasOwnProperty(key)) {

					let manga = mangaList[key];

					popularMangaList.push({
						name: manga.name,
						description: manga.description
					});
				}
			}

			return popularMangaList;
		},

		/**
		 * method to merge manga list and pinned mangas together
		 * @param pinnedMangaList {Array}
		 * @param mangaList {Array}
		 * @return {Array}
		 */
		mergePinnedAndMangaList: function(pinnedMangaList: Array, mangaList: Array, appService: ApplicationService) {

			let list = [];
			if (pinnedMangaList == null || pinnedMangaList.length == 0) {
				return mangaList;
			}

			for (let i = 0; i < pinnedMangaList.length; i++) {
				let manga = appService.getMangaFromList(mangaList, pinnedMangaList[i]);
				if (manga != null) {
					list.push(manga);
					mangaList.remove(manga);
				}
			}

			for (let key in mangaList) {
				if (mangaList.hasOwnProperty(key)) {
					let manga = mangaList[key];
					list.push({
						name: manga.name,
						description: manga.description
					});
				}
			}

			return list;
		}
	}
}();

@Component({
	selector: "dashboard",
	template: `
		<app-header [args]="header"></app-header>
		<div class="dashboard {{ dashboard_class }}">
			<div class="search-bar">
				<input type="search" class="form-control" placeholder="Search" (keyup)="onSearch($event)">
			</div>
			<infinite-scroll [onBottom]="scroll_callback">
				<div class="list-group">
				  <a class="list-group-item list-group-item-action" 
				  	*ngFor="let manga of mangaList | arrayLength: manga_list_length" (click)="onCardClick(manga)">

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
	
	header: Object;

	mangaList: Array;

	manga_name: string;

	dashboard_class: string;

	scroll_callback: Function;

	manga_list_length: Number;

	on_search_icon_click: Function;

	private original_manga_list: Array;

	constructor(
		private router: Router,
		private ajax: MangaSiteAjaxService, 
		private applicationService: ApplicationService,
		private localStorageService: LocalStorageService
	) {
		
		let loadingMangaList = false;
		let loadingPopularMangaList = false;

		let popularMangaList = null;
		let mangaList = localStorageService.getMangaList();

		let parsePage = ParsePageHelper.getInstance();

		if (mangaList == null || mangaList.length === 0) {

			loadingMangaList = true;
			loadingPopularMangaList = true;

			applicationService.showOverlay();

			ajax.getPageHTML({
				site: "http://mangareader.net/",
				prefix: "alphabetical"
			}).subscribe(data => {
				mangaList = parsePage.parseMangaListPage({html: data._body});
			},error => {}, () => {
				loadingMangaList = false;
				this._allLoaded({
					loading: {
						manga_list: loadingMangaList, 
						popular_manga_list: loadingPopularMangaList
					},
					list: {
						manga_list: mangaList,
						popular_manga_list: popularMangaList
					}
				});
			});

			ajax.getPageHTML({
				site: "http://mangareader.net/"
			}).subscribe(data => {				
				popularMangaList = parsePage.parsePopularManga({html: data._body});
			}, error => {}, () => {
				loadingPopularMangaList = false;
				this._allLoaded({
					loading: {
						manga_list: loadingMangaList, 
						popular_manga_list: loadingPopularMangaList
					},
					list: {
						manga_list: mangaList,
						popular_manga_list: popularMangaList
					}
				});
			});

		} else {
			this._allLoaded({
				loading: {
					manga_list: loadingMangaList, 
					popular_manga_list: loadingPopularMangaList
				},
				list: {
					manga_list: mangaList,
					popular_manga_list: popularMangaList
				}
			});
		}

		this.dashboard_class = "";
		this.scroll_callback = this.onScrollToBottom.bind(this);
		this.on_search_icon_click = this.onSearchClick.bind(this);

		this.header = {
			page: { title: "Manga Board", aligned: "left" },
			search: { onClick: this.on_search_icon_click }
		};
	}

	/**
	 * function called when all the content is loaded from server
	 * @param args {Object}
	 */
	_allLoaded(args: Object) {

		if (args.loading.manga_list == false && args.loading.popular_manga_list == false) {

			this.applicationService.hideOverlay();
			
			let mangaList = args.list.manga_list;
			let pinnedMangaList = this.localStorageService.getPinnedMangaList();

			if (args.list.popular_manga_list) {
				mangaList = mangaListHelper.mergePopularAndMangaList(args.list.popular_manga_list, mangaList, this.applicationService);
				this.localStorageService.setMangaList(mangaList);
			}

			this.manga_list_length = 10;
			this.mangaList = mangaListHelper.mergePinnedAndMangaList(pinnedMangaList, mangaList, this.applicationService);
			this.original_manga_list = this.mangaList;
		}
	}

	/**
	 * function called when search button is clicked
	 * @param event {Object}
	 */
	onSearchClick(event: Object) {
		if (this.dashboard_class !== "") {
			this.dashboard_class = "";
		} else {
			this.dashboard_class = "search";
		}
	}

	/**
	 * function called when user scroll to bottom
	 * @param event {Object}
	 */
	onScrollToBottom(event: Object) {

		if (this.mangaList == null) {
			return;
		}

		let length = this.manga_list_length + 5;
		if (length > this.mangaList.length) {
			length = this.mangaList.length;
		}

		this.manga_list_length = length;
	}

	onSearch(event: Object) {
		
		let list = [];
		for (let i = 0; i < this.original_manga_list.length; i++) {
			let manga = this.original_manga_list[i];
			if (manga.name.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1) {
				list.push(manga);
			}
		}

		this.manga_list_length = 10;
		this.mangaList = list;
	}

	/**
	 * function called on click on each card
	 * @param manga {Object}
	 */
	onCardClick(manga) {
		this.router.navigate(["/manga", this.applicationService.parseMangaName(manga.name)]);
	}
}