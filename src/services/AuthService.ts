import { Logger } from 'nofshonit-base-web-client';
import ClientConfig from '../config/index';
import { AuthenticateOrJoin, LoginType, NewOrUpdate, UpdatePasswordType } from '../models/enums';
import User from '../models/User';
import AuthError from '../utils/authentication/AuthError';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';
import NofshonitStorage from '../utils/NofhonitStorage';
import BaseHTTPService from './BaseHTTPService';
import BiometricsStore from 'src/stores/BiometricsStore';
import rootStores from 'src/stores';
import { BIOMETRICS_STORE } from 'src/consts/stores';

export interface LoginWithMailReponse {
	error?: boolean;
	errMsg?: string;
	user?: User;
}

class AuthService extends BaseHTTPService {
	// Login & Logout

	/**
	 * Call to log in route of the server
	 * return User object
	 * @param identity (String) Id of the user
	 * @param password (String) Password of the user
	 * @param authenticateOrJoin (Enum) In order to know whether the user is logging in or join to the system
	 */
	loginOrJoinWithIdAndPassword(
		identity: string,
		password: string,
		authenticateOrJoin: AuthenticateOrJoin
	): Promise<User> {
		const body = {
			IdentityNumber: identity,
			Password: password,
			LoginType: LoginType.IdentityAndPassword,
			AuthenticateOrJoin: parseInt(authenticateOrJoin),
		};

		return this.httpPost('/users/authenticate', body)
			.then((response) => {
				// Extract the error from the response (if has one)
				response;
				const error = ErrorUtils.extractError(response);
				if (error) {
					throw error;
				}
				
				// When no error field, return the data from the response
				if (response && response.data && response.data.data) {
					const responseData = response.data.data;
					return this.initUserFromResponseData(responseData);
				} else {
					throw new Error('Response data not found');
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling to "/users/authenticate"', err);
				throw err;
			});
	}

	/**
	 * Log in to the server with a token (usually get from localStorage)
	 * It is in order to collect the data of the currentUser
	 * @param token (String) Token to log in with
	 */
	async loginWithToken(): Promise<User> {
		return this.httpGet(`/users/getCurrentUser`)
			.then((response) => {		
				const error = ErrorUtils.extractError(response);
				if (error) {
					throw error;
				}
				if (response && response.data && response.data.data) {
					// Initialize user data
					const responseData = response.data.data;
					return this.initUserFromResponseData(responseData);
				} else {
					// If no "response.data.data", throws error
					throw AuthError.NoUserInResponse();
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling using "loginWithToken"', err);
				throw err;
			});
	}

	initUserFromResponseData(responseData: any) {
		let user: User = new User();
		user.firstName = responseData.firstName;
		user.lastName = responseData.lastName;
		user.memberIdIdentity = responseData.memberIdIdentity;
		user.email = responseData.email;
		user.allowSmsAndEmail = responseData.allowSmsAndEmail;
		user.birthDate = responseData.birthDate;
		user.identityNumber = responseData.identityNumber;
		user.phoneNumber = responseData.mobilePhone;
		user.partnerPhone = responseData.partnerPhone;
		user.childrenNumber = responseData.numOfChildren;
		user.workingPlace = responseData.factorySymbol;
		user.friendMail = responseData.partnerEmail;
		user.gender = responseData.gender;
		user.token = responseData.token;
		user.premiumType = responseData.premiumType;
		user.hasPinCode = responseData.hasPinCode;
		user.clubCreditCard = responseData.clubCreditCard;
		//user.pinCode = responseData.pinCode;
		user.cardNumber = responseData.cardNumber;
		user.shouldUpdateorRegister = responseData.updateOrRegister;
		user.FPT = responseData.forgetPasswordToken;
		user.memberSpecial = responseData.memberSpecial;
		user.total_Benefit_quantity = responseData.totalBenefitQuantity;
		user.points_skymax = responseData.pointsSkymax;
		user.cookiesAcceptedDate = responseData.cookiesAcceptedDate;
		user.moneyTermsURL = responseData.moneyTermsURL || null;
		user.needToApproveMoneyTerms = !!responseData.needToApproveMoneyTerms;
		user.walletStatus = responseData.walletStatus != null ? Number(responseData.walletStatus) : null;
		user.walletFreezeEndDate = responseData.walletFreezeEndDate ? new Date(responseData.walletFreezeEndDate) : null;
		// Initialize User address
		const userAddres = user.address;
		userAddres.streetNumber = responseData.houseNumber;
		userAddres.apartmentNumber = responseData.apartmentNumber;
		userAddres.postalCode = responseData.zip ? responseData.zip : '';
		userAddres.streetName = responseData.streetName;
		userAddres.entrance=responseData.entrance;
		userAddres.mailbox=responseData.mailbox;
		userAddres.city = {
			cityId: responseData.cityId,
			cityName: responseData.cityName,
			regionID: responseData.regionId,
		};
		return user;
	}

	async logout() {
		await this.httpGet('/users/LogOut');
	}

	updateUserPasswordFromForgotPassword(password, memberId, forgetUrlToken) {
		let body = {
			MemberId: memberId,
			NewPassword: password,
			NewOrUpdate: NewOrUpdate.Reset,
			ForgetPasswordToken: forgetUrlToken,
		};
		return this.httpPost('/users/resetPassword', body).then((response) => {
			const error = ErrorUtils.extractError(response);

			if (error) {
				throw error;
			}

			if (response && response.data && response.data.data) {
				return new User(response.data.data);
			} else {
				throw new Error('Response data not found');
			}
		});
	}
	
	updateMemberCookiesAcceptedDate() {
		return this.httpPost('/users/UpdateMemberCookiesAcceptedDate').then((response) => {
			return response
		});
	}

	userConsentAudit(body: {
		LinkUrl: string;
		ConsentUrl: string;
		HTMLCodeIdentity: string;
		ApprovedVersion: string;
	}) {
		return this.httpPost('/users/UserConsentAudit', body).then((response) => {
			const error = ErrorUtils.extractError(response);
			if (error) {
				throw error;
			}
			return response && response.data;
		});
	}
	updateUserPasswordFromRegistration(password) {
		let body = {
			NewOrUpdate: NewOrUpdate.New,
			newPassword: password,
		};

		return this.httpPost('/users/updatePassword', body).then((response) => {
			const error = ErrorUtils.extractError(response);

			if (error) {
				throw error;
			}

			if (response && response.data && response.data.data) {
				return new User(response.data.data);
			} else {
				throw new Error('Response data not found');
			}
		});
	}

	changePassword(currentPassword, newPassword) {
		const body = {
			newPassword,
			currentPassword,
			newOrUpdate: NewOrUpdate.Update,
		};

		return this.httpPost('/users/updatePassword', body).then((response) => {
			const error = ErrorUtils.extractError(response);

			if (error) {
				throw error;
			}

			if (response && response.data && response.data.data) {
				NofshonitStorage.saveToken();
			} else {
				throw new Error('Response data not found');
			}
		});
	}

	register = (userDetails: User, ads) => {
		const body = {
			id: userDetails.id,
			firstName: userDetails.firstName,
			lastName: userDetails.lastName,
			birthDate: userDetails.birthDate,
			identityNumber: userDetails.identityNumber,
			mobilePhone: userDetails.phoneNumber,
			cityName: userDetails.address.city,
			streetName: userDetails.address.streetName,
			houseNumber: userDetails.address.streetNumber,
			apartmentNumber: userDetails.address.apartmentNumber,
			zip: userDetails.address.postalCode,
			email: userDetails.email,
			numOfChildren: userDetails.childrenNumber,
			gender: 1,
			partnerEmail: userDetails.friendMail,
			loginType: userDetails.loginType,
			accessID: userDetails.accsessID,
			newOrUpdate: NewOrUpdate.New,
			emailSubscribe: ads,
		};

		return this.httpPost('/users/updateMember', body)
			.then((res) => {
				if (res && res.data && res.status && res.data.data) return new User(res.data.data);
				else {
					return new User();
				}
			})
			.catch((err) => {
				Logger.error('register user failed', err);
				return new User();
			});
	};

	updateUser(userDetails: User, ads, token, newOrUpdate: NewOrUpdate) {
		
		let newNumOfChildren;

		if (userDetails.childrenNumber) {
			if (typeof userDetails.childrenNumber == 'string') {
				newNumOfChildren = 10;
			} else {
				newNumOfChildren = userDetails.childrenNumber;
			}
		} else {
			newNumOfChildren = null;
		}
		
		const body = {
			firstName: userDetails.firstName ? userDetails.firstName : null,
			lastName: userDetails.lastName ? userDetails.lastName : null,
			birthDate: userDetails.birthDate ? userDetails.birthDate : null,
			identityNumber: userDetails.identityNumber ? userDetails.identityNumber : null,
			mobilePhone: userDetails.phoneNumber ? userDetails.phoneNumber : null,
			cityid:
				userDetails && userDetails.address && userDetails.address.city
					? userDetails.address.city.cityId
					: '',
			CityName:
			userDetails && userDetails.address && userDetails.address.city ? userDetails.address.city['cityName'] : '',
			streetName: userDetails.address.streetName ? userDetails.address.streetName : null,
			houseNumber: userDetails.address.streetNumber ? userDetails.address.streetNumber : null,
			apartmentNumber: userDetails.address.apartmentNumber ? userDetails.address.apartmentNumber : null,
			zip: userDetails.address.postalCode ? userDetails.address.postalCode : null,
			email: userDetails.email ? userDetails.email : null,
			factorySymbol: userDetails.workingPlace ? userDetails.workingPlace : null,
			numOfChildren: newNumOfChildren,
			gender: userDetails.gender ? userDetails.gender : 0,
			partnerEmail: userDetails.friendMail ? userDetails.friendMail : null,
			loginType: userDetails.loginType,
			accessID: userDetails.accsessID ? userDetails.accsessID : null,
			newOrUpdate: newOrUpdate ? newOrUpdate : null,
			AllowSmsAndMail: ads,
			Entrance: userDetails && userDetails.address ? userDetails.address.entrance : '',
			Mailbox:  userDetails && userDetails.address ? userDetails.address.mailbox : '',
			partnerPhone : userDetails.partnerPhone ? userDetails.partnerPhone : null,
			IsUpdateDetailsApproved : userDetails.isUpdateDetailsApproved ? userDetails.isUpdateDetailsApproved : false,
		};
	
		return this.httpPost('/users/UpdateMember', body).then((res) => {
			const error = ErrorUtils.extractError(res);

			if (error) {
				ErrorUtils.checkErrorAndShowPopUp(error);
			}

			if (res && res.data && res.data.data) {
				return this.initUserFromResponseData(res.data.data);
			} else {
				throw Error('Response data not found');
			}
		});
	}

	forgotPassword = (id) => {
		const body = { memberId: id };
		return this.httpPost('/users/recoverPassword', body).then((res) => {
			const error = ErrorUtils.extractError(res);
			if (error) {
				throw error;
			}
			if (res && res.data) {
				return res.data;
			} else {
				throw Error('Response data not found');
			}
		});
	};
	validateToken = (id, token) => {
		return this.httpGet(`/users/validatePasswordForRecover?tokenCode=${token}&memberId=${id}`).then((res) => {
			const error = ErrorUtils.extractError(res);
			if (error) {
				throw error;
			}
			if (res && res.data) {
				return res.data;
			} else {
				throw new Error('Error Getting a Response Data');
			}
		});
	};

	async sendShortCode(id: string, reCaptchaToken: string) {
		try {
			const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];

			const response = await this.httpPost(`/users/loginBySms?memberId=${id}`, { memberId: id  , hash: biometricsStore.hash}, { reCaptchaToken, memberId: id });
			// Extract the error from the response (if has one)
			const error = ErrorUtils.extractError(response);
			if (error) {
				throw error;
			}
			return response;
		} catch (err) {
			throw err;
		}
	}

	loginWithShortCode(shortCode: string, memberId: string): Promise<User> {
		return this.httpGet(`/users/validateLoginBySms?code=${shortCode}&memberId=${memberId}`)
			.then((response) => {
				
				// Extract the error from the response (if has one)

				// if(response.data.errorId == 10041) { // יוזר נחסם מהמערכת
				// 	sessionStorage.setItem('UserBlockedToLogin', 'true');
				// } else {
				// 	sessionStorage.setItem('UserBlockedToLogin', 'false');
				// }

				const error = ErrorUtils.extractError(response);
				if (error) {
					throw error;
				}

				// When no error field, return the data from the response
				if (response && response.data && response.data.data) {
					const responseData = response.data.data;
					return this.initUserFromResponseData(responseData);
				} else {
					throw new Error('Response data not found');
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling to "/users/validateLoginBySms"', err);
				throw err;
			});
	}

	public async loginWithBiometricsSignautre(privateKey: string, payloadSignature: string, Id: string, confirmPrivacyPolicy: boolean | null): Promise<User> {
		// Get shops list from server
		const body = { PrivateBiometricToken: privateKey, PaylodBiometricToken: payloadSignature, Id, LoginType: LoginType.BiometricToken, confirmPrivacyPolicy };
		return this.httpPost(`/users/authenticate`, body)
		.then((response) => {
			// Extract the error from the response (if has one)
			response;
			const error = ErrorUtils.extractError(response);
			if (error) {
				throw error;
			}

			// When no error field, return the data from the response
			if (response && response.data && response.data.data) {
				const responseData = response.data.data;
				return this.initUserFromResponseData(responseData);
			} else {
				throw new Error('Response data not found');
			}
		})
		.catch((err) => {
			Logger.error('Error occurd when calling to "/users/getMember"', err);
			throw err;
		});
	}

	getMemberHashedData(memberID: string) {
		return this.httpGet(`/users/getMemberHashedData?memberID=${memberID}`)
			.then((response) => {
				// Extract the error from the response (if has one)
				const error = ErrorUtils.extractError(response);
				if (error) {
					throw error;
				}
				// When no error field, return the data from the response
				if (response && response.data) {
					const responseData = response.data;
					return responseData;
				} else {
					throw new Error('Response data not found');
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling to "/users/getMemberHashedData"', err);
				throw err;
			});
	}
}

export default new AuthService(ClientConfig.apiBaseHost);
