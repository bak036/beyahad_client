import { makeAutoObservable, observable } from 'mobx';
import Address from './Address';
import { Gender, LoginType, PremiumType } from './enums';

class User {
	@observable id: string = '';

	@observable firstName: string = '';

	@observable memberIdIdentity: string = '';

	@observable lastName: string = '';

	@observable userName: string = '';

	@observable loginType: LoginType;

	@observable accsessID: string = '';

	@observable token: string = '';
	@observable allowSmsAndEmail: boolean = false;
	@observable email: string = '';
	@observable password: string = '';

	@observable identityNumber: string = '';

	@observable apartmentNumber: string = '';

	@observable streetNumber: string = '';

	@observable streetName: string = '';

	@observable city: string = '';

	@observable birthDate: string = '';

	@observable phoneNumber: string = '';

	@observable partnerPhone: string = '';

	@observable gender: Gender= Gender.MALE;

	@observable address: Address;

	@observable workingPlace: string = '';

	@observable premiumType: PremiumType;

	@observable childrenNumber: string = '';
	@observable FPT: string = '';

	@observable friendMail: string = '';

	//@observable pinCode: string;
	@observable hasPinCode: boolean;

	@observable shouldUpdateorRegister: number;

	@observable cardNumber: string = '';

	@observable entrance: string = '';

	@observable mailbox: string = '';

	@observable isUpdateDetailsApproved: boolean = false;

	@observable clubCreditCard: number;
	@observable memberSpecial: boolean;

	@observable total_Benefit_quantity: number;

	@observable points_skymax: number;
	
	@observable cookiesAcceptedDate: Date | null = null;

	@observable moneyTermsURL: string | null = null;

	@observable needToApproveMoneyTerms: boolean = false;

	// Wallet status from AllMembers.WalletStatus. 1 = allowed; anything else
	// known (0, 2, ...) = blocked; null = not yet loaded (treated as allowed).
	@observable walletStatus: number | null = null;

	// Populated by the server only when the wallet is blocked (status 2) AND a freeze request exists.
	// Used to show msg 10012663 with the release date substituted into [תאריך סיום ההקפאה].
	@observable walletFreezeEndDate: Date | null = null;


	constructor(user?: any) {
		makeAutoObservable(this);
		if (user) {
			this.id = user.id;
			this.password = user.password;
			this.memberIdIdentity = user.memberIdIdentity;
			this.allowSmsAndEmail = user.allowSmsAndEmail;
			this.userName = user.userName;
			this.firstName = user.firstName;
			this.lastName = user.lastName;
			this.loginType = user.loginType;
			this.token = user.token;
			this.accsessID = user.accsessID;
			this.identityNumber = user.identityNumber;
			this.email = user.email;
			this.city = user.city;
			this.apartmentNumber = user.apartmentNumber;
			this.streetName = user.streetName;
			this.streetNumber = user.streetNumber;
			this.birthDate = user.birthDate;
			this.phoneNumber = user.phoneNumber;
			this.partnerPhone = user.partnerPhone;
			this.gender = user.gender;
			this.address = user.address ? user.address : new Address(user.address);
			this.workingPlace = user.workingPlace;
			this.childrenNumber = user.childrenNumber;
			this.premiumType = user.premiumType;
			//this.pinCode = user.pinCode;
			this.hasPinCode = user.hasPinCode;
			this.FPT = user.ForgetPasswordToken;
			this.cardNumber = user.cardNumber ? user.cardNumber : '';
			this.entrance = user.entrance;
			this.mailbox = user.mailbox;
			this.clubCreditCard = user.clubCreditCard ? user.clubCreditCard : 0;
			this.memberSpecial = user.memberSpecial;
			this.total_Benefit_quantity = user.total_Benefit_quantity;
			this.points_skymax = user.Points_skymax;
			this.moneyTermsURL = user.moneyTermsURL || null;
			this.needToApproveMoneyTerms = !!user.needToApproveMoneyTerms;
			this.walletStatus = user.walletStatus != null ? Number(user.walletStatus) : null;
			this.walletFreezeEndDate = user.walletFreezeEndDate ? new Date(user.walletFreezeEndDate) : null;
		} else {
			this.gender = Gender.MALE;
			this.address = new Address();
			this.premiumType = PremiumType.NotAllowedA;
		}
	}
}

export default User;
