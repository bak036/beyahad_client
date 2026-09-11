import {observable} from 'mobx';

class Breadcrumbs {
	@observable id: number;
	@observable name: string;

	constructor(breadcrumbs?: any) {
		if (breadcrumbs) {
			this.id = breadcrumbs.id ? breadcrumbs.id : 0;
			this.name = breadcrumbs.name ? breadcrumbs.name : '';
		}
	}
}

export default Breadcrumbs;
