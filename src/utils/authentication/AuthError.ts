import {LoginError} from './enums';

export default class AuthError implements Error {
	name: string;
	message: string;
	stack?: string | undefined;

	constructor(loginError: LoginError) {
		this.name = 'LoginError';
		this.message = loginError;
	}

	static GeneralError() {
		return new AuthError(LoginError.GeneralLoginError);
	}

	static NoTokenInStorage() {
		return new AuthError(LoginError.NoTokenInStorage);
	}

	static TokenInvalid() {
		return new AuthError(LoginError.TokenInvalid);
	}

	static UserAndPasswordIncorrect() {
		return new AuthError(LoginError.UserAndPasswordIncorrect);
	}

	static NoUserInResponse() {
		return new AuthError(LoginError.UserAndPasswordIncorrect);
	}
}
