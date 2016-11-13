import {Component, OnInit} from "@angular/core";
import {ApplicationService} from "app/common/services/applicationService";

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
	
	constructor(private applicationService: ApplicationService) {}

	ngOnInit() {
		this.applicationService.hideOverlay();
		this.applicationService.removeOverlayText();
	}
}