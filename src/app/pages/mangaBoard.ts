import {Component} from "@angular/core";

@Component({
	selector: "manga-board",
	template: `
		<div class="container">
			<router-outlet></router-outlet>
		</div>
	`,
	styleUrls: ["app/pages/mangaBoard.css"]
})

export class MangaBoard {

}