import {makeAutoObservable, observable} from 'mobx';
import * as moment from 'moment';
import {isNullOrUndefined} from 'util';
import CategoryDTO from '../dto/CategoryDTO';
import EventimEventDTO from '../dto/EventimEventDTO';
import Breadcrumbs from './Breadcrumbs';
import Business from './Business';
import CategoriesLevel from './CategoriesLevel';
import {CategoryType} from './enums';
import EventimEvent from './EventimEvent';
import Locations from './locations';
import MapLandmarks from './MapLandmarks';
import Ticket from './Ticket';
import Varient from './Varient';

export default class Category {
	@observable categoryId: string = '';

	@observable categoryName: string = '';

	@observable index?: number;

	@observable images: any[];

	@observable image?: any = '';

	@observable locations?: Locations[] = [];

	@observable subCategories?: Category[] = [];

	@observable children?: Category[] = [];

	@observable isLeaf?: boolean = false;

	@observable variants?: Varient[] = [];

	@observable description?: string = '';

	@observable shortDescription: string = '';

	@observable categorySubTitle: string = '';

	@observable price?: number = 0;

	@observable discount?: number = 0;

	@observable eventDate?: string = '';

	@observable moreInfo?: string = '';

	@observable phone?: string = '';

	@observable webSite?: string = '';

	@observable mapLandMarks?: MapLandmarks;

	@observable categoryType?: CategoryType;

	@observable moreInfoTab?: string = '';

	@observable howToUse?: string = '';

	@observable termsOfUse?: string = '';

	@observable tickets?: Ticket[] = [];

	@observable supplierName?: string = '';

	@observable discountTitle?: string = '';

	@observable redimType?: string = '';

	@observable remarks?: string = '';

	@observable minimumInventoryForSale?: string = '';

	@observable campaignDetails?: string;

	@observable categoryHTML?: string;

	@observable breadcrumbs?: Breadcrumbs[] = [];

	@observable isAllGrandchildren?: boolean = false;

	@observable sameLevelCategories?: CategoriesLevel[] = [];

	@observable business: Business;

	@observable events: EventimEvent[];

	@observable isSelfPrint: boolean = false;

	@observable categoryUrl: string = '';

	@observable isEvents: boolean = false;

	@observable hasChildren: boolean = false;

	@observable isConsumption?: boolean = false;

		// Filter data from server
	@observable isFilterEnabled?: boolean = false;
	@observable filterParameters?: string | Set<number> | number[]; // Can be CSV string (e.g., "1,2,3") or array/Set
	@observable prices?: Set<number> | number[];
	@observable cityIds?: Set<number> | number[];
	@observable regionIds?: Set<number> | number[];
	@observable dateRanges?: Array<{ startDate: string | Date; endDate: string | Date }>;

	constructor(category?: any) {
		makeAutoObservable(this);
		if (category) {
			this.images = category.images ? category.images : [];
			this.categoryId = category.categoryId;
			this.categoryName = category.categoryName;
			this.supplierName = category.supplierName ? category.supplierName : '';
			this.subCategories = category.subCategories ? category.subCategories.map((x) => new Category(x)) : [];
			this.children = category.children ? category.children.map((x) => new Category(x)) : [];
			this.locations = category.locations ? category.locations.map((x) => new Locations(x)) : [];
			//this.locations = undefined;
			this.isLeaf = category.isLeaf ? category.isLeaf : false;
			this.variants = category.variants ? category.variants.map((x) => new Varient(x)) : [];
			this.description = category.description ? category.description : '';
			this.price = category.price ? category.price : 0;
			this.discount = category.discount ? category.discount : 0;
			this.eventDate = category.eventDate ? category.eventDate : '';
			this.moreInfo = category.moreInfo ? category.moreInfo : '';
			this.phone = category.phone ? category.phone : '';
			this.webSite = category.webSite ? category.webSite : '';
			this.mapLandMarks = category.mapLandMarks ? category.mapLandMarks : [];
			this.moreInfoTab = category.moreInfoTab ? category.moreInfoTab : '';
			this.howToUse = category.howToUse ? category.howToUse : '';
			this.termsOfUse = category.termsOfUse ? category.termsOfUse : '';
			this.discountTitle = category.discountTitle ? category.discountTitle : '';
			this.redimType = category.redimType ? category.redimType : '';
			this.remarks = category.remarks ? category.remarks : '';
			this.minimumInventoryForSale = category.minimumInventoryForSale ? category.minimumInventoryForSale : '';
			this.campaignDetails = category.campaignDetails ? category.campaignDetails : '';
			this.categoryHTML = category.categoryHTML ? category.categoryHTML : '';
			this.breadcrumbs = category.breadcrumbs ? category.breadcrumbs : [];
			this.isAllGrandchildren = category.isAllGrandchildren;
			this.image = category.image ? category.image : undefined;
			this.hasChildren = category.hasChildren ? category.hasChildren : false;
			this.sameLevelCategories = category.sameLevelCategories
				? category.sameLevelCategories.map((x) => new CategoriesLevel(x))
				: [];
			this.shortDescription = category.shortDescription ? category.shortDescription : '';
			this.categorySubTitle = category.categorySubTitle ? category.categorySubTitle : '';
			this.categoryUrl = category.categoryUrl ? category.categoryUrl : '';
			this.categoryType = category.categoryType ? category.categoryType : '';
			this.business = category.business ? category.business : new Business();
			this.isEvents = isNullOrUndefined(category.isEvents) ? false : category.isEvents;
			if (this.isEvents && category.events && category.events.length > 0) {
				this.events = category.events.map((event: EventimEventDTO) => EventimEvent.convertFromEventimEventDTO(event));
			}
			this.isConsumption = category.isConsumption ? category.isConsumption : false;
						this.isFilterEnabled = category.isFilterEnabled !== undefined ? category.isFilterEnabled : false;
			// filterParameters can be CSV string (e.g., "1,2,3") or array/Set - keep as is, will be parsed in component
			this.filterParameters = category.filterParameters !== undefined ? category.filterParameters : '';
			this.prices = category.prices ? (Array.isArray(category.prices) ? category.prices : Array.from(category.prices)) : [];
			this.cityIds = category.cityIds ? (Array.isArray(category.cityIds) ? category.cityIds : Array.from(category.cityIds)) : [];
			this.regionIds = category.regionIds ? (Array.isArray(category.regionIds) ? category.regionIds : Array.from(category.regionIds)) : [];
			this.dateRanges = category.dateRanges ? category.dateRanges.map((dr: any) => ({
				startDate: dr.startDate || dr.StartDate,
				endDate: dr.endDate || dr.EndDate
			})) : [];
		} else {
			this.images = [];
			this.locations = [];
			this.categoryName = '';
			this.supplierName = '';
			this.subCategories = [];
			this.children = [];
			this.isLeaf = false;
			this.variants = [];
			this.description = '';
			this.price = 0;
			this.discount = 0;
			this.eventDate = '';
			this.moreInfo = '';
			this.phone = '';
			this.webSite = '';
			this.mapLandMarks = new MapLandmarks();
			this.moreInfoTab = '';
			this.howToUse = '';
			this.termsOfUse = '';
			this.discountTitle = '';
			this.redimType = '';
			this.remarks = '';
			this.minimumInventoryForSale = '';
			this.campaignDetails = '';
			this.categoryHTML = '';
			this.breadcrumbs = [];
			this.isAllGrandchildren = false;
			this.image = undefined;
			this.sameLevelCategories = [];
			this.shortDescription = '';
			this.business = new Business();
			//this.isEvents = false;
			this.categoryUrl = '';
			this.hasChildren = false;
			this.isConsumption = false;
			this.isFilterEnabled = false;
			this.filterParameters = '';
			this.prices = [];
			this.cityIds = [];
			this.regionIds = [];
			this.dateRanges = [];
		}
	}

	static mapFromServerReponse(category) {
		var mycategory: Category = new Category();
		if (category) {
			mycategory.images = category.images ? category.images : [];
			mycategory.locations = category.locations ? category.locations : undefined;
			mycategory.categoryId = category.categoryId;
			mycategory.categoryName = category.categoryName;
			mycategory.subCategories = category.subCategories ? category.subCategories.map((x) => new Category(x)) : [];
			mycategory.children = category.children ? category.children.map((x) => new Category(x)) : [];
			mycategory.isLeaf = category.isLeaf ? category.isLeaf : false;
			mycategory.variants = category.variants ? category.variants.map((x) => new Varient(x)) : [];
			mycategory.description = category.description ? category.description : '';
			mycategory.price = category.price ? category.price : 0;
			mycategory.discount = category.discount ? category.discount : 0;
			mycategory.eventDate = category.eventDate ? category.eventDate : '';
			mycategory.moreInfo = category.moreInfo ? category.moreInfo : '';
			mycategory.phone = category.phone ? category.phone : '';
			mycategory.webSite = category.webSite ? category.webSite : '';
			mycategory.mapLandMarks = category.mapLandMarks ? category.mapLandMarks : [];
			mycategory.moreInfoTab = category.moreInfoTab ? category.moreInfoTab : '';
			mycategory.howToUse = category.howToUse ? category.howToUse : '';
			mycategory.termsOfUse = category.termsOfUse ? category.termsOfUse : '';
			mycategory.discountTitle = category.discountTitle ? category.discountTitle : '';
			mycategory.redimType = category.redimType ? category.redimType : '';
			mycategory.remarks = category.remarks ? category.remarks : '';
			mycategory.minimumInventoryForSale = category.minimumInventoryForSale ? category.minimumInventoryForSale : '';
			mycategory.campaignDetails = category.campaignDetails ? category.campaignDetails : '';
			mycategory.categoryHTML = category.categoryHTML ? category.categoryHTML : '';
			mycategory = category.breadcrumbs ? category.breadcrumbs : '';
			mycategory.isAllGrandchildren = category.isAllGrandchildren;
			mycategory.image = category.image ? category.image : undefined;
			mycategory.sameLevelCategories = category.sameLevelCategories
				? category.sameLevelCategories.map((x) => new CategoriesLevel(x))
				: [];
			mycategory.shortDescription = category.shortDescription ? category.shortDescription : '';
			mycategory.business = category.business ? category.business : new Business();
			mycategory.categoryUrl = category.categoryUrl ? category.categoryUrl : '';
			mycategory.categoryType = category.categoryType ? category.categoryType : '';
			mycategory.isEvents = category.isEvents ? category.isEvents : false;
			mycategory.hasChildren = category.hasChildren ? category.hasChildren : false;
			mycategory.isConsumption = category.isConsumption ? category.isConsumption : false;
		}
		return mycategory;
	}

	static convertFromCategoryDTO(categoryDTO: CategoryDTO): Category {
		const category = new Category();
		category.categoryId = categoryDTO.categoryId;
		category.isSelfPrint = categoryDTO.isSelfPrint;
		category.breadcrumbs = categoryDTO.breadcrumbs
			? categoryDTO.breadcrumbs.map((crumb) => new Breadcrumbs(crumb))
			: [];
		category.images = categoryDTO.images ? categoryDTO.images : [];
		category.categoryName = categoryDTO.categoryName;

		category.description = categoryDTO.description; // field of "החל מ..."
		category.shortDescription = categoryDTO.shortDescription;

		// more info contents
		category.redimType = categoryDTO.redimType;
		category.termsOfUse = categoryDTO.termsOfUse;
		category.remarks = categoryDTO.remarks;
		category.minimumInventoryForSale = categoryDTO.minimumInventoryForSale;
		category.campaignDetails = categoryDTO.campaignDetails;
		category.categoryHTML = categoryDTO.categoryHTML;

		category.isEvents = isNullOrUndefined(categoryDTO.isEvents) ? false : categoryDTO.isEvents;
		category.events = EventimEvent.convertFromEventimEventDTOArray(categoryDTO.events);

		category.isConsumption = category.isConsumption ? category.isConsumption : false;
		return category;
	}

	getEventsVanueNames = () => {
		if (this.events && this.events.length > 0) {
			const eventsVanueNames = {};
			const events = this.events;
			for (let i = 0; i < events.length; i++) {
				const currentEvent = events[i];
				if (!isNullOrUndefined(currentEvent.venueName)) {
					eventsVanueNames[currentEvent.venueName] = true;
				}
			}

			return Object.keys(eventsVanueNames);
		}

		return [];
	}

	getEventsDates = () => {
		if (this.events && this.events.length > 0) {
			const eventsDates = {};
			const events = this.events;
			for (let i = 0; i < events.length; i++) {
				const currentEvent = events[i];
				if (!isNullOrUndefined(currentEvent.dateFormattedString)) {
					eventsDates[currentEvent.dateFormattedString] = true;
				}
			}

			return Object.keys(eventsDates).sort((a, b) => {
				const aMoment = moment(a, 'DD/MM/YYYY');
				const bMoment = moment(b, 'DD/MM/YYYY');
				return aMoment.diff(bMoment);
			});
		}

		return [];
	}

	getEventsTimes = () => {
		if (this.events && this.events.length > 0) {
			const eventsTimes = {};
			const events = this.events;
			for (let i = 0; i < events.length; i++) {
				const currentEvent = events[i];
				if (!isNullOrUndefined(currentEvent.timeFormattedString)) {
					eventsTimes[currentEvent.timeFormattedString] = true;
				}
			}
			return Object.keys(eventsTimes).sort((a, b) => {
				const aMoment = moment(a, 'HH:mm');
				const bMoment = moment(b, 'HH:mm');
				return aMoment.diff(bMoment);
			});
		}

		return [];
	}
}
