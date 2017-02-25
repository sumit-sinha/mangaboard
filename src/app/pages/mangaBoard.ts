import {Component, OnInit} from "@angular/core";
import {AppHelper} from "app/helpers/applicationHelper";

@Component({
	selector: "manga-board",
	template: `
		<div class="container">
			<router-outlet></router-outlet>
		</div>
	`,
	styleUrls: ["app/pages/mangaBoard.css"]
})

export class MangaBoard implements OnInit {
	
	constructor() {}

	ngOnInit() {

		let appHelper = AppHelper.getInstance();

		appHelper.hideOverlay();
		appHelper.removeOverlayText();
	}
}