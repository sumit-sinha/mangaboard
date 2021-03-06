import {Component, OnDestroy} from "@angular/core";
import {ActivatedRoute} from '@angular/router';

import {AppHelper} from "app/helpers/applicationHelper";
import {StorageHelper} from "app/helpers/storageHelper";
import {NetworkHelper} from "app/helpers/networkHelper";
import {ParsePageHelper} from "app/helpers/parsePageHelper";

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
                    	
                    	<img src="{{ page.image }}" (load)="onImageLoad(page)" class="reader" alt="{{ page.number }}"/>
                    	<div class="loading loading-position-absolute show" *ngIf="page.loaded === false"></div>
                    </li>

                    <li class="js_slide" 
                    	[style.height]="div_height + 'px'" 
                    	[style.width]="div_width + 'px'"
                    	*ngIf="pages == null || pages.length == 0">
                    	<div class="loading loading-position-fixed show"></div>
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
	styleUrls: ["app/pages/reader/components/mangareader.css"]
})

export class MangaReader implements OnDestroy {
	
	pages: Array;

	header: Object;

	div_width: number;

	div_height: number;

	private slider: any;

	private ajax: NetworkHelper;

	private parsePage: ParsePageHelper;

	constructor(private route: ActivatedRoute) {

		let body = document.body;
		let html = document.documentElement;
		let params = this.route.snapshot.params;
		let manga = StorageHelper.getInstance().getMangaFromList(params["name"]);

		this.header = {
			page: {title: AppHelper.getInstance().getTrimmedMangaName(manga.name, 18) + " " + params["chapter"]},
			showBack: true
		};

		this.ajax = NetworkHelper.getInstance();
		this.parsePage = ParsePageHelper.getInstance();

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

	/**
	 * function to get all the images for a manga chapter
	 * @param args {Object}
	 */
	_getAllImages(args: Object) {

		this.ajax.getPageHTML({
			site: "http://mangareader.net/",
			prefix: args.name + "/" + args.chapter + "/" + args.page
		}).then(data => {
				
			let pageInfo = this.parsePage.parseReaderPage({
				html: data.text,
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
		});
	}

}