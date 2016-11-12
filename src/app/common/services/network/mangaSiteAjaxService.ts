import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";

@Injectable()
export class MangaSiteAjaxService {
	
	constructor(private http: Http) {}

	/**
	 * function to get home page html of a manga
	 * @param args {Object}
	 * @return {Observable}
	 */
	getPageHTML(args: Object): Observable<Object> {
		return this.http.get("https://crossorigin.me/" + args.site + ((args.prefix)?args.prefix: ""))
				.map(this.parsePage)
				.catch(this.onPageLoadError);
	}

	parsePage(response: Response) {
		return response;
	}

	onPageLoadError(error: Response | any) {
		return Observable.throw("error");
	}
}