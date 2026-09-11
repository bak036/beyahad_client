import EventimEventDTO from './EventimEventDTO';

export default class CategoryDTO {
	categoryId: string;
	categoryName: string;
	images?: {file: string; alt: string; imageTypeId: number}[];
	locations?: any[];
	subCategories?: any[];
	isLeaf?: boolean;
	description?: string;
	shortDescription: string;
	price?: number;
	discount?: number;
	eventDate?: string;
	moreInfo?: string;
	phone?: string;
	webSite?: string;
	// mapLandMarks?: MapLandmarks;
	// categoryType?: CategoryType;
	moreInfoTab?: string;
	howToUse?: string;
	termsOfUse?: string;
	// tickets?: Ticket[];
	supplierName?: string;
	discountTitle?: string;
	redimType?: string;
	remarks?: string;
	minimumInventoryForSale?: string;
	campaignDetails?: string;
	categoryHTML?: string;
	breadcrumbs?: {id: number; name: string}[];
	isAllGrandchildren?: boolean;
	// sameLevelCategories?: CategoriesLevel[];
	// business: Business;
	isEvents: boolean;
	events: EventimEventDTO[];
	isSelfPrint: boolean;
	isConsumption?: boolean;
}
