import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: "arrayLength" })
export class ArrayLengthFilterPipe {
	
	transform(value: Array, length: number) {

		if (value == null || length == null || value.length < length) {
			return value;
		}

		let filteredArray = [];
		for (let i = 0; i < length; i++) {
			filteredArray.push(value[i]);
		}

		return filteredArray;
	}
}