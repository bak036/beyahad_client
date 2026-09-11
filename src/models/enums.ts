export enum LogLevel {
	Debug = 'DEBUG',
	Info = 'INFO',
	Warn = 'WARN',
	Error = 'ERROR',
}

export enum UserType {
	Admin = 'Admin',
	Worker = 'Worker',
}

//enum for the menu navigation
export enum MenuButtonType {
	navBarButton = 'navBarButton',
	sideBarButton = 'sideBarButton',
}

export enum DiscountMode {
	Percentage = 'D',
	Leverage = 'L',
}
export enum ByometricType {
	TouchID = 'TouchID',
	FaceID = 'FaceID',
	Biometrics = 'Biometrics',
}

//Enum to know how we want to login
export enum LoginType {
	EmailAndPass = 1,
	IdentityAndPassword = 2,
	UserNameAndPass = 3,
	Facebook = 4,
	Google = 5,
	BiometricToken = 8,
}

//Enum to know how we want to login
export enum AuthenticateOrJoin {
	Authenticate = '1',
	Join = '2',
}

export enum QuantityType {
	View = 'view',
	OutOfStock = 'outOfStock',
	Edit = 'edit',
}

export enum CardTypes {
	NoCard = 0,
	DigitalCard = 1,
	PlasticCard = 2,
}

export enum CategoryType {	
	Shows = 6,
	Hotels = 20,
	Consumerism = 26,
	ConsumerismCoupons = 32,
	TayarotHool = 34,
	Basic = 'basic',
	Show = 'show',
	Iframe = 100,
	Popup = 101,
	NewWindow = 102,
	SameWindow = 103,
}

export enum BenefitType {
	GiftCard = 1,
	NormalVariant = 2,
	Coupon = 3,
	Shows = 10,
	LeumiSpecial = 11,
}

export enum BusinessSubType {
	Subscriptions = 17,
	Hotels = 20,
	Consumerism = 26,
	ConsumerismCoupons = 32,
	TayarotHool = 34,
}

// Enum for purchase history order
export enum Orders {
	ASC = 1,
	DESC = 2,
}

export enum Gender {
	MALE = 1,
	FEMALE = 2,
	OTHER = 3,
}

export enum SearchStatus {
	Searcing = 'searcing',
	Finshed = 'finshed',
	NoResualts = 'noResults',
}
export enum PremiumType {
	PaymentAccess = 1,
	ReadOnly = 3,
	NotAllowedA = 0,
	NotAllowedB = 4,
	Type5 = 5,
}
export enum OrderStatus {
	NotImplemented = 'NotImplemented',
	Implemented = 'Implemented',
	PartiallyImplemented = 'PartiallyImplemented',
	TransferredAsGift = 'TransferredAsGift',
	Canceled = 'Canceled',
	InCancelProcess = 'InCancelProcess',
	Expired = 'Expired',
}

export enum NewOrUpdate {
	New = 1,
	Update = 2,
	Reset = 3,
}

export enum UpdatePasswordType {
	Register = 1,
	Reset = 2,
}

export enum CreditCardType {
	MaxCard = 1,
	RegularCard = 2,
}
export enum BiometricsErros_Android {
	NotEnrolled = "BIOMETRIC_ERROR_NONE_ENROLLED",
	KeyChange = "Error generating signature: Key permanently invalidated",
	failVerificationBiometrics = "Too many attempts. Try again later.",
	sensorDisabled = "Too many attempts. Fingerprint sensor disabled.",
	userCancel = "User cancellation",
}

export enum BiometricsErros_Ios {
	NotEnrolled = "Biometry is not enrolled.",
	userCancel = "Key not found: -128",
	failVerificationBiometrics = "Key not found: error item authentication failed",
	sensorDisabled = "Biometry is locked out.",
}

export enum PlatformApp {
	Android = "android",
	Ios = "ios",
}