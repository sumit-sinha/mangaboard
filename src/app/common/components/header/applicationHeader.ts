import {Component, Input} from "@angular/core";

@Component({
	selector: "app-header",
	template: `
		<nav class="navbar navbar-fixed-top navbar-custom">
			<img src="static/images/arrow.png" class="navbar-back" (click)="onBackClick()" *ngIf="args.showBack"/>
			<a class="navbar-brand navbar-custom" [ngClass]="{'navbar-center': args.page.aligned !== 'left'}" href="javascript:void(0);">
				{{ args.page.title }}
			</a>
		</nav>
	`,
	styleUrls: ["app/common/components/header/applicationheader.css"]
})

export class ApplicationHeader {
	
	@Input()
	args: Object;

	onBackClick() {
		history.go(-1);
	}
}