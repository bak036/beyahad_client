export enum LoginError {
	GeneralLoginError = 'GeneralLoginError',
	NoTokenInStorage = 'NoTokenInStorage',
	TokenInvalid = 'TokenInvalid',
	UserAndPasswordIncorrect = 'UserAndPasswordIncorrect',
}
export enum registrationStatus {
	Pass = 0,
	NeedEdit = 1,
	NeedRegister = 2,
	UserExpired=4,
	RefreshExpierdPassword=5
}