import {Component} from "@angular/core";
import {Router} from '@angular/router';

import {ApplicationService} from "app/common/services/applicationService";
import {ParsePageService} from "app/common/services/data/parsePageService";
import {LocalStorageService} from "app/common/services/data/localStorageService";
import {MangaSiteAjaxService} from "app/common/services/network/mangaSiteAjaxService";

@Component({
	selector: "dashboard",
	template: `
		<app-header [args]="header"></app-header>
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
	`,
	styleUrls: ["app/pages/dashboard/components/dashboard.css"]
})

export class Dashboard {
	
	header: Object;

	mangaList: Array;

	manga_name: string;

	scroll_callback: Function;

	manga_list_length: Number;

	private original_manga_list: Array;

	constructor(
		private router: Router,
		private ajax: MangaSiteAjaxService, 
		private parsePage: ParsePageService,
		private applicationService: ApplicationService,
		private localStorageService: LocalStorageService
	) {

		let loadingMangaList = false;
		let loadingPopularMangaList = false;

		if (localStorageService.readFromStorage({key: "manga_list"}) == null) {

			loadingMangaList = true;
			applicationService.showOverlay();

			ajax.getPageHTML({
				site: "http://mangareader.net/",
				prefix: "alphabetical"
			}).subscribe(data => {
				localStorageService.writeToStorage({"manga_list": parsePage.parseMangaListPage({html: data._body})});
			},error => {}, () {
				loadingMangaList = false;
				this._allLoaded(loadingMangaList, loadingPopularMangaList);
			});
		}

		if (localStorageService.readFromStorage({key: "popular_manga_list"}) == null) {

			loadingPopularMangaList = true;
			applicationService.showOverlay();

			ajax.getPageHTML({
				site: "http://mangareader.net/"
			}).subscribe(data => {
				
				localStorageService.writeToStorage({
					"popular_manga_list": parsePage.parsePopularManga({html: data._body})
				});

			}, error => {}, () {
				loadingPopularMangaList = false;
				this._allLoaded(loadingMangaList, loadingPopularMangaList);
			});
		} else {
			this._allLoaded(loadingMangaList, loadingPopularMangaList);
		}

		this.header = {
			page: {
				title: "Manga Board",
				aligned: "left"
			}
		};

		this.scroll_callback = this.onScrollToBottom.bind(this);
	}

	/**
	 * function called when all the content is loaded from server
	 * @param loadingMangaList {Boolean}
	 * @param loadingPopularMangaList {Boolean}
	 */
	_allLoaded(loadingMangaList: boolean, loadingPopularMangaList: boolean) {

		if (loadingPopularMangaList == false && loadingMangaList == false) {
			this.applicationService.hideOverlay();
		
			let mangaList = this.localStorageService.getMangaList();
			let popularMangaList = this.localStorageService.getPopularMangaList();

			for (let i = 0; i < popularMangaList.length; i++) {

				let popularManga = popularMangaList[i];
				let codedName = this.applicationService.parseMangaName(popularManga.name);

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

			this.manga_list_length = 10;
			this.mangaList = popularMangaList;
			this.original_manga_list = popularMangaList;
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