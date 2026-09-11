import {action, makeAutoObservable, observable} from 'mobx';
import {Logger} from 'nofshonit-base-web-client';
import MessagesService, {MessagesObject,MessagesBiometricsObject} from '../services/MessagesService';
import AlertUtils from '../utils/AlertUtils';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';
import AuthStore from './AuthStore';
import ConfigurationStore from './ConfigurationStore';

export default class MessagesStore {
	@observable activeHours: string = '';
	@observable joinTextTitle: string = '';
	@observable footerHTML: string = '';

	@observable footerMObileHTML: string = '';

	@observable dvarYorImage: string = '';

	@observable dvarYorText: string = '';

	@observable contactMessage: string = '';

	@observable registrationMessage: string = '';
	@observable shoppingbasketEmpty: string = '';

	@observable rightAdvertisement: string = '';

	@observable leftAdvertisement: string = '';
	@observable paymentNotAllowed: string = '';
	@observable blockCard: string = '';
	@observable loadCardLimitationError = '';
	@observable cancelCardLimitationError = '';
	@observable cancelCardMonthlyLimitError = '';
	@observable loadCardMonthlyLimitError = '';
	@observable loadCardTotalBalanceAllWalletsError = '';
	@observable loadCardYearlyLimitError = '';

	@observable emptyShoppingCart: string = '';
	@observable userSuccessfulySubmittedContactForm: string = '';
	@observable inProccessCancel: string = '';
	@observable cancelLevelOne: string = '';
	@observable topFooterHTML: string = '';
	@observable footerHTMLlogIn: string = '';
	@observable footerHTMLlogInMobile: string = '';

	@observable eventimTicketExpired: string = '';
	@observable premiumType5Login: string = '';
	@observable premiumType5Join: string = '';
	@observable shortCodeSent: string = '';
	@observable UpdatePasswordInstructions: string = '';
	@observable MessageForUserWeekPassword: string = '';
	@observable messageLeavePage: string = '';
	@observable config;
	@observable timeoutToLogoutId;
	@observable MessageForCancelExternalCoupon: string = '';
	@observable MessageForCancelExternalCouponExit: string = '';
	@observable mainTitle: string = '';
	@observable secondaryTitleFingerprint: string = '';
	@observable bodyTextFingerprint: string = '';
	@observable secondaryTitleBiometrics: string = '';
	@observable bodyTextBiometrics: string = '';
	@observable imgBackgroundLoginDesktop: string = '';
	@observable priceInfo:string ='';
	@observable ContactApprovalText: string = '';
	@observable loginBlockMessage: string = '';
	@observable pinCodeBlockMessages: string = '';
	@observable externalCouponLimitMessage: string = '';
	@observable couponLimitMessage : string = '';
	@observable privacyPolicyText : string = '';
	@observable privacyPolicyRegistration : string = '';
	@observable acceptCookiesText : string = '';
	// Sagi: There are messages i need to use when the form process was successful.
	// (contact form,update profile, registration..)
	// I'm not sure if this is the right implementation.
	// The problem was i cannot get the success message from the service and only get the error message,
	// because in many places we return a user/other types for a successful promise.
	userWasntActiveForTwoYearsKey: number = 10257;
	userDidnotFinishRegistrationMessageKey: number = 10242;
	userFinishedRegistrationPremiumTypeOneKey: number = 10222;
	userAcceptToRecieveMarketing = 10217;
	userFinishedRegistrationPremiumTypeThreeKey: number = 10256;
	forgotPasswordMessage: number = 10260;
	forgotPasswordMessage2: number = 347;
	cancelOrderMessage: number = 11145;
	cancelTzarchanotOrder: number = 51127;
	cancelHotelsOrSubscriptions: number = 51128;
	benefitOnlyForBeyahadCardHoldersDesktopKey: number = 10298;
	benefitOnlyForBeyahadCardHoldersMobileKey: number = 10299;
	messageAdrresOrderInfo: number = 10300;
	firstLoginForOldMember: number = 10261;
	disconnectSessionMessage: number = 10306;
	errorMessageForUserExpired:number = 51106;

	authStore: AuthStore;

	configurationStore: ConfigurationStore;

	constructor(authStore: AuthStore, configurationStore: ConfigurationStore) {
		this.authStore = authStore;
		this.configurationStore = configurationStore;
		makeAutoObservable(this);
	}

	@action
	async init() {
		this.config = await NofhonitConfigurationLoader.loadConfiguration();
		this.getMessagesFromService();
	}

	@action
	async getMessagesFromService() {
		try {
			// Get configuration of site
			const messagesKeys = this.configurationStore.getConfiguration.messagesKeys;
			// Get messages by keys
			return MessagesService.getAllMessages(messagesKeys).then((messages: MessagesObject) => {
				this.activeHours = messages.activeHours;
				this.footerHTML = messages.footerHTML;
				this.footerMObileHTML = messages.footerMobileHTML;
				this.dvarYorImage = messages.dvarYorImage;
				this.dvarYorText = messages.dvarYorText;
				this.contactMessage = messages.contactMessage;
				this.registrationMessage = messages.registrationMessage;
				this.leftAdvertisement = messages.leftAdvertisement;
				this.rightAdvertisement = messages.rightAdvertisement;
				this.shoppingbasketEmpty = messages.shoppingbasketEmpty;
				this.paymentNotAllowed = messages.paymentNotAllowed;
				this.blockCard = messages.blockCard;
				this.loadCardLimitationError = messages.loadCardLimitationError;
				this.cancelCardLimitationError = messages.cancelCardLimitationError;
				this.cancelCardMonthlyLimitError = messages.cancelCardMonthlyLimitError;
				this.loadCardMonthlyLimitError = messages.loadCardMonthlyLimitError;
				this.loadCardTotalBalanceAllWalletsError = messages.loadCardTotalBalanceAllWalletsError;
				this.loadCardYearlyLimitError = messages.loadCardYearlyLimitError;
				this.emptyShoppingCart = messages.emptyShoppingCart;
				this.inProccessCancel = messages.inProccessCancel;
				this.userSuccessfulySubmittedContactForm = messages.userSuccessfulySubmittedContactForm;
				this.cancelLevelOne = messages.cancelLevelOne;
				this.topFooterHTML = messages.topFooterHTML;
				this.footerHTMLlogIn = messages.footerHTMLlogIn;
				this.footerHTMLlogInMobile = messages.footerHTMLlogInMobile;
				this.eventimTicketExpired = messages.eventimTicketExpired;
				this.premiumType5Login = messages.premiumType5Login;
				this.premiumType5Join = messages.premiumType5Join;
				this.shortCodeSent = messages.shortCodeSent;
				this.UpdatePasswordInstructions = messages.UpdatePasswordInstructions;
				this.MessageForUserWeekPassword = messages.MessageForUserWeekPassword;
				this.MessageForCancelExternalCoupon = messages.MessageForCancelExternal;
				this.MessageForCancelExternalCouponExit = messages.MessageForCancelExternalClose;
				this.joinTextTitle = messages.joinTextTitle;
				this.messageLeavePage = messages.messageLeavePage;
				this.priceInfo = messages.priceInfo;
				this.ContactApprovalText = messages.ContactApprovalText;
				this.loginBlockMessage = messages.loginBlockMessage;
				this.pinCodeBlockMessages = messages.pinCodeBlockMessages;
				this.externalCouponLimitMessage = messages.externalCouponLimitMessage;
				this.couponLimitMessage = messages.couponLimitMessage;
				this.privacyPolicyText = messages.privacyPolicyText;
				this.privacyPolicyRegistration = messages.privacyPolicyRegistration;
				this.acceptCookiesText = messages.acceptCookiesText;

			});
		} catch (err) {
			Logger.debug('Error Getting Messages: ', err);
		}
	}

	@action
	async getMessagesForBiometricsComponent() {
		try {
			// messages for biometrics component
			const messagesKeys = [51097, 51098, 51099, 51100, 51101]; 
			// Get messages by keys
			return MessagesService.getMessagesForBiometricsComponent(messagesKeys).then((messages: MessagesBiometricsObject) => {
				this.mainTitle = messages.MainTitle;
				this.secondaryTitleFingerprint = messages.SecondaryTitleFingerprint;
				this.bodyTextFingerprint = messages.BodyTextFingerprint;
				this.secondaryTitleBiometrics = messages.SecondaryTitleBiometrics;
				this.bodyTextBiometrics = messages.BodyTextBiometrics;
			});
		} catch (err) {
			Logger.debug('Error Getting Messages: ', err);
		}
	}


	// Sagi: Added this action because i dont want to load the message when
	// the application starts, and get it only in specific places where its needed.

	@action
	async getSingleMessageFromService(key: number) {
		try {
			// Get message by key
			return MessagesService.getSingleMessage(key)
				.then((data) => {
					return data || '';
				})
				.then((message) => {
					return message;
				});
		} catch (err) {
			Logger.debug('Error Getting Messages: ', err);
		}
	}

	@action
	async setSessionTimeout() {
		var minutes = this.config && this.config.MinutesToExpired_RefreshToken || 30;
		clearTimeout(this.timeoutToLogoutId);
		this.timeoutToLogoutId = setTimeout( async() => {
			const message = await this.getSingleMessageFromService(this.disconnectSessionMessage);
			AlertUtils.basicAlert('', message)
			.then(this.authStore.logout);
		}, 60000 * minutes);
	}
}
