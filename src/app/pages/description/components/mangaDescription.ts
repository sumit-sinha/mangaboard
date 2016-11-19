import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from '@angular/router';

import {NetworkHelper} from "app/helpers/networkHelper";
import {ParsePageHelper} from "app/helpers/parsePageHelper";

import {ApplicationService} from "app/common/services/applicationService";
import {LocalStorageService} from "app/common/services/data/localStorageService";

@Component({
	selector: "manga-description",
	template: `
		<app-header [args]="view.header"></app-header>
		<div class="description">
			<p (click)="onDescriptionClick()" [innerHTML]="view.manga.description | trim: view.descriptionLength"></p>
		</div>
		<infinite-scroll [onBottom]="view.scrollCallback">
			<ul class="list-group">
				<li class="list-group-item search-feedback" *ngIf="!view.searchDone && view.manga.listings">
					<span class="name">Searching</span>
					<p class="date">looking for new chapters...</p>
				</li>
				<li class="list-group-item" (click)="onChapterClick($event, listing)" *ngFor="let listing of view.manga.listings | reverse | arrayLength: view.chaptersLength">
					<span class="name">{{ listing.chapter.name }}{{ listing.chapter.title }}</span>
					<p class="date">{{ listing.releaseDate | date: "dd MMM yyyy"}}</p>
				</li>
			</ul>
		</infinite-scroll>
	`,
	styleUrls: ["app/pages/description/components/mangadescription.css"]
})

export class MangaDescription implements OnInit {
	
	view: Object;

	constructor(
		private router: Router,
		private localStorageService: LocalStorageService,
		private route: ActivatedRoute,
		private appService: ApplicationService
	) {}

	ngOnInit() {

		let ajax = NetworkHelper.getInstance();
		let params = this.route.snapshot.params;
		let manga = this.appService.getMangaFromList(this.localStorageService.getMangaList(), params["name"]);

		this.view = {
			manga: manga,
			searchDone: false,
			chaptersLength: 10,
			descriptionLength: 400,
			header: {
				page: {
					title: this.appService.getTrimmedMangaName(manga.name, 18)
				},
				favourite: {
					onClick: this.onFavouriteIconClick.bind(this),
					selected: this.localStorageService.isMangaPinned({name: params["name"]})
				},
				showBack: true
			},
			scrollCallback: this.onScrollToBottom.bind(this)
		}

		if (manga.description == null || manga.listings == null) {
			this.appService.showOverlay();
		}

		ajax.getPageHTML({
			site: "http://mangareader.net/",
			prefix: params["name"]
		}).then(data => {
			this.onAjaxResponse(data);
		}).catch(data => {
			this.onAjaxResponse(data);
		});
	}

	/**
	 * function called to toggle between more or less description
	 */
	onDescriptionClick() {
		if (this.view.descriptionLength == null) {
			this.view.descriptionLength = 400;
		} else {
			this.view.descriptionLength = null;
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

		if (this.view.manga.listings == null) {
			return;
		}

		let newLength = this.view.chaptersLength + 5;
		if (newLength > this.view.manga.listings.length) {
			newLength = this.view.manga.listings.length;
		}

		this.view.chaptersLength = newLength;
	}

	/**
	 * function to handle ajax response
	 * @param data {Object}
	 */
	private onAjaxResponse(data) {

		if (data.text) {
			let mangaInfo = ParsePageHelper.getInstance().parseDescriptionPage({html: data.text});
			this.view.manga.description = mangaInfo.description;
			this.view.manga.listings = mangaInfo.listings;

			this.localStorageService.updateMangaInformation({
				manga: this.view.manga,
				key: params["name"]
			});
		}

		this.view.searchDone = true;
		this.appService.hideOverlay();
	}
}