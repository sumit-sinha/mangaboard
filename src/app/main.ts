import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MangaBoardModule }  from './module';

/**
 * global prototype declaration in Array<br/>
 * this will allow to remove content from array by value
 */
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

platformBrowserDynamic().bootstrapModule(MangaBoardModule);