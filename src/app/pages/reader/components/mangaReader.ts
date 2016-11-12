import {Component, OnDestroy} from "@angular/core";
import {ActivatedRoute} from '@angular/router';

import {MangaSiteAjaxService} from "app/common/services/network/mangaSiteAjaxService";
import {ParsePageService} from "app/common/services/data/parsePageService";
import {LocalStorageService} from "app/common/services/data/localStorageService";
import {ApplicationService} from "app/common/services/applicationService";

@Component({
	selector: "manga-reader",
	template: `
		<app-header [args]="header"></app-header>
		<div class="slider js_slider">
            <div class="frame js_frame">
                <ul class="slides js_slides" [ngClass]="{'no-slider': this.slider == null}">
                    <li class="js_slide" 
                    	[style.height]="div_height + 'px'" 
                    	[style.width]="div_width + 'px'" 
                    	*ngFor="let page of pages">
                    	<div class="img-loading show" *ngIf="page.loaded === false"></div>
                    	<img src="{{ page.image }}" (load)="onImageLoad(page)" class="reader" alt="{{ page.number }}"/>
                    </li>

                    <li class="js_slide" 
                    	[style.height]="div_height + 'px'" 
                    	[style.width]="div_width + 'px'"
                    	*ngIf="pages == null || pages.length == 0">
                    	<div class="img-loading show"></div>
                    </li>
                </ul>
            </div>
            <span class="js_prev prev">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 501.5 501.5"><g><path fill="#2E435A" d="M302.67 90.877l55.77 55.508L254.575 250.75 358.44 355.116l-55.77 55.506L143.56 250.75z"/></g></svg>
            </span>
            <span class="js_next next">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 501.5 501.5"><g><path fill="#2E435A" d="M199.33 410.622l-55.77-55.508L247.425 250.75 143.56 146.384l55.77-55.507L358.44 250.75z"/></g></svg>
            </span>
        </div>
	`,
	styleUrls: ["app/pages/reader/styles/mangareader.css"]
})

export class MangaReader implements OnDestroy {
	
	pages: Array;

	header: Object;

	div_width: number;

	div_height: number;

	private slider: any;

	constructor(
		private ajax: MangaSiteAjaxService,
		private localStorageService: LocalStorageService,
		private parsePage: ParsePageService,
		private route: ActivatedRoute,
		private appService: ApplicationService
	) {

		let body = document.body;
		let html = document.documentElement;
		let params = this.route.snapshot.params;

		let manga = this.localStorageService.getMangaInformation(params["name"]);

		this.header = {
			page: {title: this.appService.getTrimmedMangaName(manga.name, 18) + " " + params["chapter"]},
			showBack: true
		};

		this.div_width = Math.max(body.offsetWidth, html.clientWidth, html.offsetWidth);
		this.div_height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, 
								html.scrollHeight, html.offsetHeight) - 54;

		this.pages = [];
		this._getAllImages({ 
			name: params["name"], 
			chapter: params["chapter"], 
			page: params["page"],
			fetch_pages: true,
			create_slider: true
		});
		
	}

	ngOnDestroy() {
		this.slider && this.slider.destroy();
	}

	/**
	 * function called when an image is loaded
	 * @param page {Object}
	 */
	onImageLoad(page: Object) {
		page.loaded = true;
	}

	_getAllImages(args: Object) {

		this.ajax.getPageHTML({
			site: "http://mangareader.net/",
			prefix: args.name + "/" + args.chapter + "/" + args.page
		}).subscribe(
			data => {
				
				let pageInfo = this.parsePage.parseReaderPage({
					html: data._body,
					fetch_pages: args.fetch_pages
				});

				if (pageInfo.pages) {
					for (let i = 0; i < pageInfo.pages.length; i++) {

						let page = pageInfo.pages[i];

						this.pages.push({
							loaded: false,
							link: page.link,
							number: page.number
						});
					}
				}

				let pageNumber = parseInt(args.page);

				this.pages[pageNumber - 1].image = pageInfo.image;

				if (pageNumber < this.pages.length) {
					this._getAllImages({
						name: args.name, 
						chapter: args.chapter, 
						page: pageNumber + 1
					});
				}

				if (args.create_slider) {
					setTimeout(() => {
						this.slider = lory(document.querySelector('.js_slider'), {
							rewind: false
						});
					}, 100);
				}
			}
		);
	}

}