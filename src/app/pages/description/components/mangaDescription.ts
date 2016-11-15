import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from '@angular/router';
import {MangaSiteAjaxService} from "app/common/services/network/mangaSiteAjaxService";
import {ParsePageService} from "app/common/services/data/parsePageService";
import {LocalStorageService} from "app/common/services/data/localStorageService";
import {ApplicationService} from "app/common/services/applicationService";

@Component({
	selector: "manga-description",
	template: `
		<app-header [args]="header"></app-header>
		<div class="description">
			<p (click)="onDescriptionClick()" [innerHTML]="manga.description | trim: description_length"></p>
		</div>
		<infinite-scroll [onBottom]="infinite_scroll_callback">
			<ul class="list-group">
				<li class="list-group-item search-feedback" *ngIf="!search_done && manga.listings">
					<span class="name">Searching</span>
					<p class="date">looking for new chapters...</p>
				</li>
				<li class="list-group-item" (click)="onChapterClick($event, listing)" *ngFor="let listing of manga.listings | reverse | arrayLength: manga_list_length">
					<span class="name">{{ listing.chapter.name }}{{ listing.chapter.title }}</span>
					<p class="date">{{ listing.releaseDate | date: "dd MMM yyyy"}}</p>
				</li>
			</ul>
		</infinite-scroll>
	`,
	styleUrls: ["app/pages/description/styles/mangadescription.css"]
})

export class MangaDescription implements OnInit {
	
	manga: Object;

	header: Object;

	search_done: boolean;

	manga_list_length: number;

	description_length: number;

	infinite_scroll_callback: Function;

	favourite_click_callback: Function;

	constructor(
		private router: Router,
		private ajax: MangaSiteAjaxService,
		private localStorageService: LocalStorageService,
		private parsePage: ParsePageService,
		private route: ActivatedRoute,
		private appService: ApplicationService
	) {
		this.manga_list_length = 10;
		this.description_length = 400;
	}

	ngOnInit() {

		let params = this.route.snapshot.params;
		
		this.manga = this.appService.getMangaFromList(this.localStorageService.getMangaList(), params["name"]);
		
		if (this.manga.description == null || this.manga.listings == null) {
			this.appService.showOverlay();
		}
	
		this.ajax.getPageHTML({
			site: "http://mangareader.net/",
			prefix: params["name"]
		}).subscribe(
			data => {
				let mangaInfo = this.parsePage.parseDescriptionPage({html: data._body});
				this.manga.description = mangaInfo.description;
				this.manga.listings = mangaInfo.listings;

				this.localStorageService.updateMangaInformation({
					manga: this.manga,
					key: params["name"]
				});
			},
			error => {},
			() => {
				this.search_done = true;
				this.appService.hideOverlay();
			}
		);
		
		this.infinite_scroll_callback = this.onScrollToBottom.bind(this);
		this.favourite_click_callback = this.onFavouriteIconClick.bind(this);

		this.header = {
			page: { title: this.appService.getTrimmedMangaName(this.manga.name, 18) },
			favourite: { 
				onClick: this.favourite_click_callback, 
				selected: this.localStorageService.isMangaPinned({name: params["name"]}) 
			},
			showBack: true
		}
	}

	/**
	 * function called to toggle between more or less description
	 */
	onDescriptionClick() {
		if (this.description_length == null) {
			this.description_length = 400;
		} else {
			this.description_length = null;
		}
	}

	/**
	 * function called when a chapter is clicked
	 * @param event {Object}
	 * @param listing
	 */
	onChapterClick(event: Object, listing: Object) {
		var linkParameters = listing.link.split("/");
		this.router.navigate(["/manga", this.route.snapshot.params["name"], linkParameters[2], 1]);
	}

	/**
	 * function called then favourite icon is clicked
	 * @param event {Object}
	 * @param args {Object}
	 */
	onFavouriteIconClick(event: Object, args: Object) {
		let mangaName = this.route.snapshot.params["name"];
		if (args.selected) {
			this.localStorageService.addToPinnedMangaList({name: mangaName});
		} else {
			this.localStorageService.removeFromPinnedMangaList({name: mangaName})
		}
	}

	/**
	 * function called when user scrolls to bottom<br/>
	 * it is used for infinite scroll implementation
	 * @param event {Object}
	 */
	onScrollToBottom(event: Object) {

		if (this.manga.listings == null) {
			return;
		}

		let newLength = this.manga_list_length + 5;
		if (newLength > this.manga.listings.length) {
			newLength = this.manga.listings.length;
		}

		this.manga_list_length = newLength;
	}
}