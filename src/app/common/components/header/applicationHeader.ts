import {Component, Input} from "@angular/core";

@Component({
	selector: "app-header",
	template: `
		<nav class="navbar navbar-fixed-top navbar-custom">
			
			<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAEOUlEQVR4Xu3cMXYTMRCAYW2RlMAVXMRucwRyhFTUORZU6WhzAzgClMkpuIF45tnv+RnHq9WOZkajn9a7Xmv+D9kLTqbEn6EnMA29ehafADA4AgAAYPAJDL58dgAADD6BwZfPDgCAwScw+PLZAQAw+AQGXz47AAAGn8Dgy2cHAMDgExh8+ewAAIg9gbe3t/uU0v12u32OvdK61YXeAQ7xf6SUPqWUnkDwP5KwAM7iH1cOgjMDIQG8Ex8EF94lwgGYiQ+CyDtAYXwQnCAIswMsjA+CwwRCAKiMD4KU+v9W8Mr4/xDknB93u91L3Z1032d1vQMIxf99e3v7ebPZ/Ok7Zd2r7xYA8euCn5/VJQDiy8TfP0t3AIgvF787AMSXjd8VAOLLx+8GAPHbxO8CAPHbxXcPgPht47sGQPz28d0CIL5OfJcAiK8X3x0A4uvGdwWA+Prx3QAgvk18FwCIbxffHADxbeObAiC+fXwzAMT3Ed8EAPH9xFcHQHxf8VUBEN9ffDUAxPcZXwUA8f3Gbw6A+L7jNwVAfP/xmwEgfh/xmwAgfj/xxQEQv6/4ogCI3198MQCvr69fpmn6mlL6WDuGnPPQP6VbO7e1563+2cBD/O9rfs6Q+Gsz1p+/CgDx6wfv5cxqAGfx85odwMswIr2OaZoe7u7ufs6tqQrAhb/5AJibtPLjzQC8s+0DQDnw3OWaALjyng+AuSLKj4sDmPnABwDlwHOXEwVQ8GkfAHNFlB8HgPLAvV1OFMB+cbwFeEt8/fWIA5hBwFuAMx9NAFxBAIBRALyDAAAjAbiAAACjAbi0E+Sc0zQt/tflXzc3Nw+j/rJmazeLa52/4OPdQc55qoh/fDoQGElYDeBkJ/iWUvqwYh0gWDG82lNFAOwvfvhK2P6/H6u/FZRSAkFtycrzxACAoLKA8WmiAEBgXLPi8uIAQFBRwfCUJgBAYFh04aWbAQDBwhJGhzcFAAKjqgsu2xwACBbUMDhUBQAIDMoWXlINAAgKiygfpgoABMp1Cy6nDgAEBVUUDzEBAALFwjOXMgMAAh8ITAGAwB6BOQAQ2CJwAQAEdgjcAACBDQJXAECgj8AdABDoInAJAAR6CNwCAIEOAtcAQNAegXsAIGiLoAsAIGiHoBsAIGiDoCsAIJBH0B0AEMgi6BIACOQQdAsABDIIugYghSDn/Ljb7V5kRtrXs3QPQADB03a7fe4rm9yrDQFgBYKh4+/nFgZABYLh44cDsAAB8Q/vIqF2gOM748yvqyH+yUeIkACu7ATEP/v8GBbABQTEv3DzEBrACYL7kW/1rt00hgcgd8cc85kAELNr8aoAUDyqmAcCIGbX4lUBoHhUMQ8EQMyuxasCQPGoYh4IgJhdi1cFgOJRxTwQADG7Fq8KAMWjinkgAGJ2LV4VAIpHFfNAAMTsWrwqABSPKuaBAIjZtXhVfwH8D5ufhDu43gAAAABJRU5ErkJggg==" class="navbar-back" (click)="onBackClick()" *ngIf="args.showBack"/>

			<a class="navbar-brand navbar-custom" [ngClass]="{'navbar-center': args.page.aligned !== 'left'}" href="javascript:void(0);">
				{{ args.page.title }}
			</a>

			<span class="navbar-right favourite" [ngClass]="{'selected': args.favourite.selected}" (click)="onFavouriteClick($event)" *ngIf="args.favourite"></span>

			<span class="navbar-right search" (click)="onSearchClick($event)" *ngIf="args.search"></span>

		</nav>
	`,
	styleUrls: ["app/common/components/header/applicationheader.css"]
})

export class ApplicationHeader {
	
	@Input()
	args: Object;

	/**
	 * function called when back image is clicked
	 */
	onBackClick() {
		history.go(-1);
	}

	/**
	 * function called when favourite image is clicked
	 * @param event {Object}
	 */
	onFavouriteClick(event: Object) {
		let favourite = this.args.favourite;
		if (favourite && typeof favourite.onClick === "function") {
			favourite.selected = !favourite.selected;
			favourite.onClick(event, {
				selected: favourite.selected
			});
		}
	}

	/**
	 * function called when search image is clicked
	 * @param event {Object}
	 */
	onSearchClick(event: Object) {
		let search = this.args.search;
		if (search && typeof search.onClick === "function") {
			search.onClick(event);
		}
	}
}