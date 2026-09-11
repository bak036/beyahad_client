import { action, computed, makeAutoObservable, observable } from 'mobx';
import { Logger } from 'nofshonit-base-web-client';
import { AuthenticateOrJoin, UpdatePasswordType, NewOrUpdate } from '../models/enums';
import User from '../models/User';
import AuthService from '../services/AuthService';
import AuthError from '../utils/authentication/AuthError';
import NofhonitStorage from '../utils/NofhonitStorage';
import AccessTokenService from '../services/AccessTokenService';
import { RoutesPath } from 'src/consts/RoutesPath';


export default class AuthStore {

	@observable history: any;
	@observable currentUser: User = new User();
	@observable isLoggedIn: boolean = false;
	@observable initialBiometricsInProgress: Boolean = false;
	@observable showNavBarSearchBox: Boolean = true;
	@observable showSearchIcon: Boolean = true;
	@observable productJsonForGA: string;
	@observable productIndexForGA: string;
	@observable promotionNameForGA?: string;
	@observable creativeNameForGA?: string;

	@observable isLoginInProgress: boolean = false;
	private loginInProgressPromise?: Promise<User>;

	@observable isUpdateUserInProgress: boolean = false;
	private updateUserInProgressPromise?: Promise<User>;

	// Saves this for login with shortcode
	// This is because the user move between the login page and the LoginWithCode page
	@observable
	public tempMemberId;
	public tempReCaptchaToken;

	// // ? Use this if we wan't to "write" how the user loggedIn
	// 	@observable
	// 	loginState: LoginState;

	constructor() {
		makeAutoObservable(this)
		this.currentUser = new User();
	}

	// Core functions

	@action
	savetHistory = (history: any) => {
		this.history = history;
	}

	/**
	 * Get the token from the LocalStorage and call to "loginWithToken" in AuthService.
	 * In case the token is valid and a login occurd, save the currentUser
	 */
	async tryLogin(): Promise<User> {

		try {
			const isLoggedIn = NofhonitStorage.getToken();
			if (isLoggedIn) {
				this.isLoggedIn = isLoggedIn;
				const user: User = await AuthService.loginWithToken();
				this.currentUser = user;
				return user;
			} else {
				throw AuthError.NoTokenInStorage();
			}
		} catch (err) {
			Logger.error('Could not login with "tryLogin"', err);
			throw err;
		}
	}

	async mintTryLogin(accessToken: string): Promise<User> {
		return AccessTokenService.getUserTokenByAccessToken(accessToken)
			.then(() => {
				NofhonitStorage.saveToken();
			})
			.then(() => {
				return this.tryLogin();
			});
	}

	async refreshCurrentUserAfterUsingShortcode() {
		try {
			const isLoggedIn = NofhonitStorage.getToken();
			if (isLoggedIn) {
				this.isLoggedIn = isLoggedIn;
				const user: User = await AuthService.loginWithToken();
				this.currentUser = user;
			}
		} catch (err) { }

		return this.currentUser;
	}

	private async loginOrJoin(
		id: string,
		password: string,
		authenticateOrJoin: AuthenticateOrJoin,
		rememberMe: boolean = false
	): Promise<User> {
		if (this.loginInProgressPromise) {
			return this.loginInProgressPromise;
		}

		this.isLoginInProgress = true;
		this.loginInProgressPromise = (async () => {
			try {
				const userResponse: User = await AuthService.loginOrJoinWithIdAndPassword(id, password, authenticateOrJoin);
				this.currentUser = userResponse;
				this.isLoggedIn = true;
				NofhonitStorage.saveToken();
				return userResponse;
			} catch (err) {
				Logger.error('error in "loginOrJoin"', err);
				throw err;
			} finally {
				this.isLoginInProgress = false;
				this.loginInProgressPromise = undefined;
			}
		})();

		return this.loginInProgressPromise;
	}

	@action
	updateUser(user, ads, newOrUpdate: NewOrUpdate) {
		if (this.updateUserInProgressPromise) {
			return this.updateUserInProgressPromise;
		}

		this.isUpdateUserInProgress = true;
		this.updateUserInProgressPromise = AuthService.updateUser(user, ads, this.isLoggedIn, newOrUpdate)
			.then((user) => {
				this.currentUser = user;
				return user;
			})
			.finally(() => {
				this.isUpdateUserInProgress = false;
				this.updateUserInProgressPromise = undefined;
			});

		return this.updateUserInProgressPromise;
	}
	@action
	changePassword(currentPassword, newPassword) {
		return AuthService.changePassword(currentPassword, newPassword);
	}

	@action
	forgotPassword = (id: string) => {
		return AuthService.forgotPassword(id);
	};

	// Login & Logout

	@action
	async loginWithIdentityAndPassword(id: string, password: string, rememberMe: boolean) {
		return this.loginOrJoin(id, password, AuthenticateOrJoin.Authenticate, rememberMe);
	}

	@action
	async loginWithShortCode(shortCode: string) {
		try {
			const userResponse: User = await AuthService.loginWithShortCode(shortCode, this.tempMemberId);
			this.currentUser = userResponse;
			this.isLoggedIn = true;
			NofhonitStorage.saveToken();
			return userResponse;
		} catch (err) {
			Logger.error('error in "loginWithShortCode"', err);
			throw err;
		}
	}

	loginWithBiometricsSignautre = async (privateKey: string, payloadSignature: string, confirmPrivacyPolicy: boolean | null): Promise<User> => {
		try {
			const userResponse: User = await AuthService.loginWithBiometricsSignautre(privateKey, payloadSignature, this.tempMemberId, confirmPrivacyPolicy);
			this.currentUser = userResponse;
			this.isLoggedIn = true;
			NofhonitStorage.saveToken();
			return userResponse;
		} catch (err) {
			Logger.error('error in "loginWithBiometricsSignautre"', err);
			throw err;
		}
	}

	/**
	 * if there is an id (for Login page for example), save it in "tempMemberId"
	 * otherwise, call to "sendShortCode" with the tempMemberId
	 * @param id MemberId for sending shortCode
	 */
	@action
	async sendShortCode(id?: string, reCaptchaToken?: string) {
		try {
			if (id) {
				this.tempMemberId = id;
			}
			if (reCaptchaToken) {
				this.tempReCaptchaToken = reCaptchaToken;
			}
			const result = await AuthService.sendShortCode(this.tempMemberId, this.tempReCaptchaToken);
			return result;
		} catch (err) {
			Logger.error('error in "sendShortCode"', err);
			throw err;
		}
	}

	@action
	logout = async () => {
		NofhonitStorage.clearStorage();
		await AuthService.logout();
		window.location.href = RoutesPath.login.login;
	}

	@action
	clearToken() {
		NofhonitStorage.clearStorage();
		this.isLoggedIn = false;
	}

	@action
	async updateMemberCookiesAcceptedDate() {
		const res = await AuthService.updateMemberCookiesAcceptedDate()
		this.currentUser.cookiesAcceptedDate = res
		return res
	}

	@action
	setCurrentUser = (user) => {
		this.currentUser = user;
	};

	// Registration / Join

	@action
	async join(id: string, password: string) {
		return this.loginOrJoin(id, password, AuthenticateOrJoin.Join);
	}

	@action
	register(userdetails, ads) {
		return AuthService.register(userdetails, ads)
			.then((res) => {
				if (res) {
					this.currentUser = res;
					return true;
				} else {
					return false;
				}
			})
			.catch((err) => {
				Logger.error('register failed', err);
				return false;
			});
	}
	// Passwords

	@action
	async updatePassword(type: UpdatePasswordType, newPassword, memberId, tokenPassedInUrl) {
		if (type == 1) {
			// Registration
			return AuthService.updateUserPasswordFromRegistration(newPassword);
		} else if (type == 2) {
			// Forgot Password
			return AuthService.updateUserPasswordFromForgotPassword(newPassword, memberId, tokenPassedInUrl);
		} else {
			throw new Error('Error updating password');
		}
	}
	@action
	validateToken = (id, token) => {
		return AuthService.validateToken(id, token).then((user) => {
			this.setCurrentUser(user);
		});
	};

	@action
	getMemberHashedData = (memberID: string) => {
		return AuthService.getMemberHashedData(memberID);
	};

	@action setHasPinCode(val: boolean) {
		if (this.currentUser) {
			this.currentUser.hasPinCode = val;
		}
	}

	// General for AuthStore

	// TODO: Gal - Check with Tal if this is needed
	// @action
	// checkUser(email, password, loginType) {
	// 	return AuthService.checkUser(email, password, loginType);
	// }

	/**
	 * get the currentUser only if he logged in.
	 * In case the user not loged in, return null
	 */
	@computed
	get loggedInUser() {
		if (this.isUserLoggedIn) {
			return this.currentUser;
		}

		return null;
	}

	/**
	 *  used to check if we can let the user enable a certain action
	 *	like clicking on a link
	 */

	@computed
	get canActivateAction() {
		return this.loggedInUser && !this.currentUser.shouldUpdateorRegister;
	}

	/**
	 * Check if token exists
	 * Check if this.currentUser exists
	 * Check if this.currentUser has "identityNumber"
	 */
	@computed
	get isUserLoggedIn() {
		if (this.isLoggedIn && this.currentUser && this.currentUser.identityNumber && !this.initialBiometricsInProgress) {
			return true;
		}

		return false;
	}
	get hasShortCode() {
		return this.currentUser.hasPinCode || false;
	}
}
