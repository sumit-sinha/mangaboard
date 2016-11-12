import {Pipe, PipeTransform} from "@angular/core";

/**
 * angular js pipe to manipulate input in template
 * expected use: {{ "this is some string" | trim: 5 }}
 */
@Pipe ({ "name": "trim" })
export class TrimStringPipe implements PipeTransform {

	transform(value: string, maxLength: number): string {

		if (value == null || maxLength == null || value.length <= maxLength) {
			return value;
		}

		return value.substr(0, maxLength) + "<span class='continue'> ...</span>";
	}
}