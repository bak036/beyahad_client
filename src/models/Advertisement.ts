import { observable } from 'mobx';

export default class Advertisement {
	@observable imageUrlBig?: string;

	@observable imageUrlSmall?: string;

	@observable sortOrder?: number;

	@observable link?: string;

	@observable alt?: string;

	constructor(advertisement: any) {
		if (advertisement) {
			this.imageUrlSmall = advertisement.imageUrlSmall ? advertisement.imageUrlSmall : '';
			this.imageUrlBig = advertisement.imageUrlBig ? advertisement.imageUrlBig : '';
			this.sortOrder = advertisement.sortOrder ? advertisement.sortOrder : undefined;
			this.link = advertisement.link ? advertisement.link : '';
			this.alt = advertisement.alt ? advertisement.alt : '';
		} else {
			this.imageUrlBig = '';
			this.sortOrder = undefined;
			this.link = '';
			this.alt = '';
		}
	}
}
