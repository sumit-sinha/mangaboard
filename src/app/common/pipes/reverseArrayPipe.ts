import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "reverse"})
export class ReverseArrayPipe implements PipeTransform {
	
	transform(value: Array) {
		if (value == null) {
			value = [];
		}

		return value.slice().reverse();
	}
}