import {Component, Input} from "@angular/core";

@Component({
	selector: "infinite-scroll",
	template: `
		<div class="infinite-scroll" (window:scroll)="onScroll($event)">
			<ng-content></ng-content>
		</div>
	`
})

export class InfiniteScroll {
	
	@Input()
	onBottom: Funtion	

	/**
	 * function called when user scrolls <br/>
	 * it is used for infinite scroll implementation
	 * @param event {Object}
	 */
	onScroll(event: Object) {
		let body = document.body, html = document.documentElement;
		let docHeight = Math.max(body.scrollHeight, 
								body.offsetHeight, 
								html.clientHeight, 
								html.scrollHeight, 
								html.offsetHeight);

		let windowHeight = "innerHeight" in window ? window.innerHeight: document.documentElement.offsetHeight;
		let windowBottom = windowHeight + window.pageYOffset;

		if (windowBottom >= docHeight && typeof this.onBottom === "function") {
			this.onBottom(event);
		}
	}
}