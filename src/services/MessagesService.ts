import BaseHTTPService from './BaseHTTPService';
import ClientConfig from '../config';
import {Logger} from 'nofshonit-base-web-client';

export interface MessagesObject {
	activeHours: string;
	joinTextTitle: string;
	footerHTML: string;
	footerMobileHTML: string;
	dvarYorImage: string;
	dvarYorText: string;
	contactMessage: string;
	registrationMessage: string;
	leftAdvertisement: string;
	rightAdvertisement: string;
	shoppingbasketEmpty: string;
	paymentNotAllowed: string;
	blockCard: string;
	loadCardLimitationError: string;
	cancelCardLimitationError: string;
	cancelCardMonthlyLimitError: string;
	loadCardMonthlyLimitError: string;
	loadCardTotalBalanceAllWalletsError: string;
	loadCardYearlyLimitError: string;
	emptyShoppingCart: string;
	userSuccessfulySubmittedContactForm: string;
	inProccessCancel: string;
	cancelLevelOne: string;
	topFooterHTML: string;
	footerHTMLlogIn: string;
	footerHTMLlogInMobile: string;

	eventimTicketExpired: string;
	premiumType5Login: string;
	premiumType5Join: string;
	shortCodeSent: string;
	UpdatePasswordInstructions: string;
	MessageForUserWeekPassword: string;
	MessageForCancelExternal: string;
	MessageForCancelExternalClose: string;
	messageLeavePage: string;
	errorMessageForUserExpired:string;
	priceInfo:string;
	ContactApprovalText: string;
	loginBlockMessage: string;
	pinCodeBlockMessages: string;
	externalCouponLimitMessage: string;
	couponLimitMessage : string;
	privacyPolicyText : string;
	privacyPolicyRegistration : string;
	acceptCookiesText : string;

}
export interface MessagesBiometricsObject {
	MainTitle: string;
	SecondaryTitleFingerprint: string;
	BodyTextFingerprint: string;
	SecondaryTitleBiometrics: string;
	BodyTextBiometrics: string;
}

class MessagesService extends BaseHTTPService {
	getMessagesRoute: string = '/media/GetMessagesByKeyList';

	constructor() {
		super(ClientConfig.apiBaseHost);
	}

	// ------------------------------ TOKEN value should be removed from parameters
	// ------------------------------ after backend removes it from their api messages route

	getAllMessages(messagesKey: number[]) {
		// Values are the messages id.
		const body = messagesKey;

		return this.getListMessages(body)
			.then((data: { messageText: string  , messageKey:string}[]) => {
				const messages: MessagesObject = {
					activeHours: data.filter(x=>x.messageKey=='10214').length>0 ? data.filter(x=>x.messageKey=='10214')[0].messageText : '',
					footerHTML: data.filter(x=>x.messageKey=='29').length>0 ? data.filter(x=>x.messageKey=='29')[0].messageText : '',
					footerMobileHTML: data.filter(x=>x.messageKey=='22').length>0 ? data.filter(x=>x.messageKey=='22')[0].messageText : '',
					dvarYorImage:  data.filter(x=>x.messageKey=='10212').length>0 ? data.filter(x=>x.messageKey=='10212')[0].messageText : '',
					dvarYorText: data.filter(x=>x.messageKey=='10213').length>0 ? data.filter(x=>x.messageKey=='10213')[0].messageText : '',
					contactMessage: data.filter(x=>x.messageKey=='10215').length>0 ? data.filter(x=>x.messageKey=='10215')[0].messageText : '',
					registrationMessage: data.filter(x=>x.messageKey=='10042').length>0 ? data.filter(x=>x.messageKey=='10042')[0].messageText : '',
					leftAdvertisement: data.filter(x=>x.messageKey=='10230').length>0 ? data.filter(x=>x.messageKey=='10230')[0].messageText : '',
					rightAdvertisement: data.filter(x=>x.messageKey=='10231').length>0 ? data.filter(x=>x.messageKey=='10231')[0].messageText : '',
					shoppingbasketEmpty: data.filter(x=>x.messageKey=='10251').length>0 ? data.filter(x=>x.messageKey=='10251')[0].messageText : '',
					paymentNotAllowed: data.filter(x=>x.messageKey=='725').length>0 ? data.filter(x=>x.messageKey=='725')[0].messageText : '',
					blockCard: data.filter(x=>x.messageKey=='10227').length>0 ? data.filter(x=>x.messageKey=='10227')[0].messageText : '',
					loadCardLimitationError: data.filter(x=>x.messageKey=='10232').length>0 ? data.filter(x=>x.messageKey=='10232')[0].messageText : '',
					cancelCardLimitationError:data.filter(x=>x.messageKey=='10295').length>0 ? data.filter(x=>x.messageKey=='10295')[0].messageText : '',
					emptyShoppingCart: data.filter(x=>x.messageKey=='10218').length>0 ? data.filter(x=>x.messageKey=='10218')[0].messageText : '',
					inProccessCancel: data.filter(x=>x.messageKey=='10259').length>0 ? data.filter(x=>x.messageKey=='10259')[0].messageText : '',
					userSuccessfulySubmittedContactForm: data.filter(x=>x.messageKey=='10221').length>0 ? data.filter(x=>x.messageKey=='10221')[0].messageText : '',
					cancelLevelOne: data.filter(x=>x.messageKey=='344').length>0 ? data.filter(x=>x.messageKey=='344')[0].messageText : '',
					topFooterHTML: data.filter(x=>x.messageKey=='10271').length>0 ? data.filter(x=>x.messageKey=='10271')[0].messageText : '',
					// topFooterLoginHTML: data.filter(x=>x.messageKey=='10297').length>0 ? data.filter(x=>x.messageKey=='10297')[0].messageText : '',
					eventimTicketExpired: data.filter(x=>x.messageKey=='10282').length>0 ? data.filter(x=>x.messageKey=='10282')[0].messageText : '',
					premiumType5Login: data.filter(x=>x.messageKey=='10286').length>0 ? data.filter(x=>x.messageKey=='10286')[0].messageText : '',
					premiumType5Join: data.filter(x=>x.messageKey=='10288').length>0 ? data.filter(x=>x.messageKey=='10288')[0].messageText : '',
					shortCodeSent: data.filter(x=>x.messageKey=='10289').length>0 ? data.filter(x=>x.messageKey=='10289')[0].messageText : '',
					UpdatePasswordInstructions: data.filter(x=>x.messageKey=='10308').length>0 ? data.filter(x=>x.messageKey=='10308')[0].messageText : '',
					MessageForUserWeekPassword: data.filter(x=>x.messageKey=='10307').length>0 ? data.filter(x=>x.messageKey=='10307')[0].messageText : '',
					MessageForCancelExternal: data.filter(x=>x.messageKey=='51126').length>0 ? data.filter(x=>x.messageKey=='51126')[0].messageText : '',
					MessageForCancelExternalClose: data.filter(x=>x.messageKey=='10310').length>0 ? data.filter(x=>x.messageKey=='10310')[0].messageText : '',
					footerHTMLlogIn: data.filter(x=>x.messageKey=='68').length>0 ? data.filter(x=>x.messageKey=='68')[0].messageText : '',
					footerHTMLlogInMobile: data.filter(x=>x.messageKey=='16').length>0 ? data.filter(x=>x.messageKey=='16')[0].messageText : '',
					joinTextTitle: data.filter(x=>x.messageKey=='51123').length>0 ? data.filter(x=>x.messageKey=='51123')[0].messageText : '',
					messageLeavePage: data.filter(x=>x.messageKey=='51103').length>0 ? data.filter(x=>x.messageKey=='51103')[0].messageText : '',
					errorMessageForUserExpired: data.filter(x=>x.messageKey=='51106').length>0 ? data.filter(x=>x.messageKey == '51106')[0].messageText:'',
					priceInfo : data.filter(x=>x.messageKey =='10012608').length>0?data.filter(x=>x.messageKey =='10012608')[0].messageText :'',
					ContactApprovalText : data.filter(x => x.messageKey == '51170').length > 0 ? data.filter(x => x.messageKey == '51170')[0].messageText : '',
					loginBlockMessage: data.filter(x => x.messageKey == '10041').length > 0 ? data.filter(x => x.messageKey == '10041')[0].messageText : '',
					pinCodeBlockMessages:data.filter(x=>x.messageKey=='51171').length>0 ? data.filter(x=>x.messageKey=='51171')[0].messageText : '',
					externalCouponLimitMessage: data.filter(x=>x.messageKey=='51133').length>0 ? data.filter(x=>x.messageKey=='51133')[0].messageText : '',
					couponLimitMessage: data.filter(x=>x.messageKey=='51134').length>0 ? data.filter(x=>x.messageKey=='51134')[0].messageText : '',
					privacyPolicyText: data.filter(x=>x.messageKey=='10012632').length>0 ? data.filter(x=>x.messageKey=='10012632')[0].messageText : '',
					privacyPolicyRegistration: data.filter(x=>x.messageKey=='10012646').length>0 ? data.filter(x=>x.messageKey=='10012646')[0].messageText : '',
					acceptCookiesText: data.filter(x=>x.messageKey=='10012633').length>0 ? data.filter(x=>x.messageKey=='10012633')[0].messageText : '',
					cancelCardMonthlyLimitError: data.filter(x => x.messageKey == '10012658').length > 0 ? data.filter(x => x.messageKey == '10012658')[0].messageText : '',
					loadCardMonthlyLimitError: data.filter(x => x.messageKey == '10012649').length > 0 ? data.filter(x => x.messageKey == '10012649')[0].messageText : '',
					loadCardTotalBalanceAllWalletsError: data.filter(x => x.messageKey == '10012650').length > 0 ? data.filter(x => x.messageKey == '10012650')[0].messageText : '',
					loadCardYearlyLimitError: data.filter(x => x.messageKey == '10012651').length > 0 ? data.filter(x => x.messageKey == '10012651')[0].messageText : '',
				};
				return messages;
			})
			.catch((error) => {
				Logger.debug('error getting messages from api - MessagesService', error);
				return {};
			});
	}

	getMessagesForBiometricsComponent(messagesKey: number[]) {
		const body = messagesKey;

		return this.getListMessages(body)
			.then((data: { messageText: string }[]) => {
				const messages: MessagesBiometricsObject = {
					MainTitle: data[0] ? data[0].messageText : '',
					SecondaryTitleFingerprint: data[1] ? data[1].messageText : '',
					BodyTextFingerprint: data[2] ? data[2].messageText : '',
					SecondaryTitleBiometrics: data[3] ? data[3].messageText : '',
					BodyTextBiometrics: data[4] ? data[4].messageText : '',
				};
				return messages;
			})
			.catch((error) => {
				Logger.debug('error getting messages from api - MessagesService', error);
				return {};
			});
	}

	async getListMessages(body: number[]) {
		return await this.httpPost(this.getMessagesRoute, body)
			.then((res) => {
				if (res && res.data && res.data.data && res.data.data.length >= 0) {
					return res.data.data;
				}

				return [];
			})
	}

	getSingleMessage(messageKey: number) {
		// Values are the messages id.
		const body = [messageKey];

		return this.httpPost(this.getMessagesRoute, body)
			.then((res) => {
				return res && res.data && res.data.data ? res.data.data : '';
			})
			.then((data) => {
				return data[0]['messageText'];
			})
			.catch((error) => {
				Logger.debug('error getting single message from api - MessagesService', error);
			});
	}

	// Get a single message

	getMessageFromService(messageId: number) {
		// Variable Definition
		const body = [messageId];

		// Code Section
		return this.httpPost(this.getMessagesRoute, body)
			.then((res) => {
				// TODO - remove this condition after adding resolver function to ajax
				return res && res.data && res.data.data ? res.data.data : '';
			})
			.then((data) => {
				return data.length > 0 ? data[0] : null; // The server respone with array
			})
			.catch((err) => {});
	}
}

export default new MessagesService();
