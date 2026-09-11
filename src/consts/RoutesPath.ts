const loginRoot = '/login';
const profileRoot = '/profile';
const cardRoot = '/card';
const cartRoot = '/cart';
const categoryRoot = '/category';
const customerServiceRoot = '/customerService';
const registrationRoot = '/register';
const mintRoot = '/mint';

export const RoutesPath = {
	root: '/',
	howToUse: '/howToUse',
	iframe: '/externalLink',
	login: {
		login: loginRoot,
		join: `${loginRoot}/join`,
		updatePasswordFromForgotPassword: `${loginRoot}/updatePassword/forgotPassword`,
		updatePasswordFromRegistration: `${loginRoot}/updatePassword/registration`,
		// setPassword: `${loginRoot}/setPassword`,
		forgotPassword: `${loginRoot}/forgotPassword`,
		registration: registrationRoot,
		withShortCode: `${loginRoot}/withCode`,
		initialBiometrics: `${loginRoot}/initialBiometrics`,
	},
	externalLink: {
		questionsAndAnswers:`/externalLink?link=https://www.dts.co.il/HtmlView/13092021-1`,
		regulations:`/externalLink?link=https://www.dts.co.il/HtmlView/10042018-1`
	},
	profile: {
		root: profileRoot,
		history: `${profileRoot}/orderHistory`,
		changePassword: `${profileRoot}/changePassword`,
		edit: `${profileRoot}/edit`,
		confirmOrder: `/orderHistory/confirmOrder`,
	},
	card: {
		root: `${cardRoot}`,
		cardCharging: `${cardRoot}/chargingCard`,
		dischargeCard: `${cardRoot}/dischargeCard`,
		shopList: `${cardRoot}/shops`,
		branchesList: `${cardRoot}/shops/branches`,
		orderCard: `/category/productpage/16534`,
		balanceAndUses: `${cardRoot}/balanceAndUses`,
		blockCard: `${cardRoot}/blockCard`,
		checkOut: `${cardRoot}/checkOut`,
		barcodePayment: `${cardRoot}/barcodePayment`,
		terms: `${cardRoot}/terms`,
		limitations: `${cardRoot}/limitations`,
		moneyPolicy: `${cardRoot}/moneyPolicy`,
		iframe: `${cardRoot}/externalLink`,
	},
	cart: {
		root: cartRoot,
		payment: `${cartRoot}/payment`,
		thank: `${cartRoot}/thanks`,
	},
	category: {
		root: categoryRoot,
		productPage: `${categoryRoot}/productPage/:categoryId`,
		rootProductPage: `${categoryRoot}/productPage`, // use this only to root with history.push
		rooteventimProductPage: `${categoryRoot}/eventimProductPage`, // use this only to root with history.push
		eventimProductPage: `${categoryRoot}/eventimProductPage/:categoryId`,
		lobby: `${categoryRoot}/lobby/:categoryId`,
		rootLobby: `${categoryRoot}/lobby`, // use this only to root with history.push
		products: `${categoryRoot}/products/:categoryId`,
		rootProducts: `${categoryRoot}/products`, // use this only to root with history.push
		searchCategory: `${categoryRoot}/searchCategory`,
		showAllCategories: `${categoryRoot}/tag/:tagid`,
		rootShowAllCategories: `${categoryRoot}/tag`,
	},
	customerService: {
		root: customerServiceRoot,
		contactUs: `${customerServiceRoot}/contactUs`,
		chairmanSpeak: `${customerServiceRoot}/chairman`
	},
	mint: {
		root: mintRoot,
		productPage: `${mintRoot}${categoryRoot}/productPage/:categoryId`,
		rooteventimProductPage: `${mintRoot}${categoryRoot}/eventimProductPage`,
		eventimProductPage: `${mintRoot}${categoryRoot}/eventimProductPage/:categoryId`,
		category: `${mintRoot}${categoryRoot}/productPage`,
		cart: `${mintRoot}/cart`,
		history: `${mintRoot}/history`,
		loadCard: `${mintRoot}${cardRoot}/chargingCard`,
		registration: `${mintRoot}/registration`,
		cartPayment: `${mintRoot}${cartRoot}/payment`,
		updatePassword: `${mintRoot}${loginRoot}/updatePassword`,
		updateProfile: `${mintRoot}${profileRoot}/edit`,
		join: `${mintRoot}/join`,
		error: `${mintRoot}/error`,
		successPage: `${mintRoot}/success`,
		failurePage: `${mintRoot}/failure`,
	},
};
