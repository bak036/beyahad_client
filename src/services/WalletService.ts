import * as _ from 'lodash';
import {Logger} from 'nofshonit-base-web-client';
import ClientConfig from '../config';
import Card from '../models/Card';
import Transaction from '../models/Transaction';
import Varient from '../models/Varient';
import Wallet from '../models/Wallet';
import BaseHTTPService from './BaseHTTPService';
import CreditCard from '../models/CreditCard';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';
import Ticket from '../models/Ticket';
import Lang from '../config/Language';

class WalletService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	getWallets = () => {
		return this.httpGet('/cards/GetCardGeneralInfo')
			.then((res) => {
				const error = ErrorUtils.extractError(res);
				if (error) {
					throw error;
				}

				if (res && res.data && res.data.data && res.data.data.wallets) {
					const card = new Card(res.data.data);
					return card;
				} else {
					return [];
				}
			});
	};

	getGeneratedBarcode = async() => {
		return await this.httpGet('/cards/GeneratePayCode').then((res) => {
			const error = ErrorUtils.extractError(res);

			if (error) {
				throw error;
			}

			if (res && res.data && res.data.data) {
				return res.data.data;
			} else {
				throw new Error('no data in response');
			}
		});
	};

	getTransactions = () => {
		return this.httpGet('/cards/GetCardActivities')
			.then((res) => {
				const error = ErrorUtils.extractError(res);
				if (error) {
					throw error;
				}

				const data = res && res.data && res.data.data;
				const transactions = data && data.cardActivitiesList
					? data.cardActivitiesList.map((transaction) => new Transaction(transaction))
					: [];
				const totalYearlyDeposit =
					data && data.totalYearlyDeposit != null ? Number(data.totalYearlyDeposit) : 0;
				const maxDepositYearly =
					data && data.maxDepositYearly != null ? Number(data.maxDepositYearly) : null;
				return { transactions, totalYearlyDeposit, maxDepositYearly };
			});
	};

	getWalletById = (id) => {
		return this.httpGet(`/cards/GetWalletInfo?walletId=${id}`).then((res) => {
			const error = ErrorUtils.extractError(res);

			if (error) {
				throw error;
			}

			if (res && res.data && res.data.data) {
				return new Wallet(res.data.data);
			} else {
				throw new Error('Response not wallet returning data');
			}
		});
	};

	cartInit = () => {
		return this.httpGet('/shoppingBasket/getCart')
			.then((res) => {
				if (res && res.data && res.data.data) {
					return res.data.data;
				} else {
					return [];
				}
			})
			.catch((err) => {
				Logger.error('the request /shoppingBasket/getCart failed. ', err);
				return null;
			});
	};

	// TODO: Eliran - this should not be in WalletService...
	public organizeCart(res) {
		var resultArray: any[] = [];
		var result = _.groupBy(res, 'categoryId');

		for (let key in result) {
			const item = {
				categoryId: key,
				data: result[key],
			};
			resultArray.push(item);
		}

		var resultFromServer: any[] = [];
		resultArray.forEach((item) => {
			var x;
			if (item && item.data && item.data[0] && item.data[0].variant) {
				x = {
					categoryId: item.categoryId,
					name: item.data[0].categoryName,
					supplierName: item.data[0].supplierName,
					eventDate: item.data[0].eventDate,
					imges: item.data[0].imges,
					shortDescription: item.data[0].shortDescription,
					location: item && item.data[0].loaction ? item.data[0].location : '',
					// quantity: item.data[0].quantity,
					variants: item.data.map((y, index) => {
						if (y) {
							return new Varient(y.variant, item.data[index].quantity);
						} else return null;
					}),
					allowPriceZero: item.data[0].allowPriceZero,
				};
			} else {
				x = {
					categoryId: item.categoryId,
					name: item.data[0].categoryName,
					supplierName: item.data[0].supplierName,
					eventDate: item.data[0].eventDate,
					shortDescription: item.data[0].shortDescription,
					location: item.data[0].location,
					expireDate: item.data[0].expireDate,
					quantity: item.data[0].quantity,
					tickets:
						item.data[0] && item.data[0].tickets
							? item.data[0].tickets.map((ticket) => {
									return new Ticket(ticket);
							  })
							: null,
				};
			}
			resultFromServer.push(x);
		});
		return resultFromServer;
	}

	removeVareint = async (barCode) => {
		try {
			const result = await this.httpPost(`/shoppingBasket/remove?barcode=${barCode}`, {});
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (result && result.data && result.data.data) {
				return result.data.data;
			} else {
				throw Error('אין אפשרות כרגע למחוק פריט זה , נסה שנית מאוחר יותר.');
			}
		} catch (err) {
			throw err;
		}
	};

	addToCart = (request) => {
		return this.httpPost('/shoppingBasket/add', request)
			.then((res) => {
				const error = ErrorUtils.extractError(res);
				if (error) {
					throw error;
				}
				if (res && res.data && res.data.data) {
					return res.data.data;
				} else {
					throw new Error('Response data not found in addToCart ');
				}
			})
			.catch((err) => {
				Logger.error('Error occurd when calling to addToCart', err);
				throw err;
			});
	};

	loadWallet = async (walletId, amountToCharge, amountToLoad, cardDetails: CreditCard, shortCode, email) => {
		const newCvv = cardDetails.cvv ? parseInt(cardDetails.cvv) : 0;
		const body = {
			walletID: walletId,
			amountToCharge,
			amountToLoad,
			payerCardTZ: cardDetails.identity,
			payerCardNumber: cardDetails.cardNumber,
			payerCardCVV: newCvv,
			payerCardExpiresMonth: cardDetails.validateMonth,
			payerCardExpiresYear: cardDetails.validateYear,
			saveForQuickLoad: cardDetails.saveCard,
			pinCode: shortCode,
			email: email
		};
		try {
			
			const result = await this.httpPost('/cards/LoadWallet', body);
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (result && result.data && result.data.status) {
				return result.data.status;
			} else {
				throw new Error('request faild');
			}
		} catch (err) {
			throw err;
		}
	};

	removeCategory = (categoryId) => {
		return this.httpPost(`/shoppingBasket/removeByCategory?categoryNumber=${categoryId}`, {}).then((res) => {
			if (res && res.data && res.data.data) {
				return res.data.data;
			} else {
				return [];
			}
		});
	};

	updateCart = async (barCode, quantity) => {
		const body = {
			barCode,
			quantity,
		};
		try {
			const result = await this.httpPost('/shoppingBasket/update', body);
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (result && result.data && result.data.data) {
				return result.data.data;
			} else {
				throw new Error('עידכון העגלה לא צלח');
			}
		} catch (err) {
			throw err;
		}
	};

	creditCardType = async (creditCardType) => {
		try {
			const result = await this.httpGet(`/shoppingBasket/updateShoppingCartPrices?creditCardType=${creditCardType}`);
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (result && result.data && result.data.data) {
				return result.data.data;
			} else {
				throw new Error('עידכון העגלה לא צלח');
			}
		} catch (err) {
			throw err;
		}
	}

	getGlobalSelfDischargeLimit = async () => {
		try {
		  const result = await this.httpGet('/cards/GetGlobalSelfDischargeLimit');
		  const error = ErrorUtils.extractError(result);
		  if (error) throw error;
	  
		  if (result && result.data && result.data.data !== undefined && result.data.data !== null) {
			return Number(result.data.data);
		  }
	  
		  throw new Error('לא ניתן לקבל את תקרת הביטול החודשית.');
		} catch (err) {
		  throw err;
		}
	  };

	balanceForDischarge = async (walletID) => {
		try {
			const result = await this.httpGet('/cards/GetAvailableBalanceForDischarge?walletId=' + walletID);
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (result && result.data && result.data.data) {
				return result.data.data;
			} else {
				throw new Error('לא ניתן לקבל את יתרת הכרטיס.');
			}
		} catch (err) {
			throw err;
		}
	};
	onDischargeClicked = async (
		walletID,
		dischargeAmount,
		email,
		creditCardNumber,
		expiredDate,
		cvv,
		phoneNumber
	) => {
		try {
			let getParams = `walletId=${walletID}&phoneNumber=${phoneNumber}&email=${email}&expiredDate=${expiredDate}`;
			getParams += `&cvv=${cvv}&dischargeAmount=${dischargeAmount}&creditCardNumber=${creditCardNumber}`;

			const result = await this.httpGet('/cards/Discharge?' + getParams);
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (result && result.data && result.data.data) {
				return result.data.data;
			} else {
				throw new Error(`לא ניתן לבצע את ביטול הטעינה כרגע.`);
			}
		} catch (err) {
			throw err;
		}
	};
	AllowedToDischarge = async (walletID) => {
		try {
			const result = await this.httpGet('/cards/AllowedToDischarge?walletId=' + walletID);
			const error = ErrorUtils.extractError(result);
			if (error) {
				throw error;
			}
			if (result) {
				return result.data;
			} else {
				console.log(result)
				throw new Error('לא ניתן לקבל את יתרת הכרטיס.');
			}
		} catch (err) {
			console.log(err)
			throw err;
		}
	};
	getTimeBetweenDischargeAndCharge = async () => {
		try {
			const result = await this.httpGet('/cards/GetTimeBetweenDischargeAndCharge');
			const error = ErrorUtils.extractError(result);
		
			if (error) {
				throw error;
			}
			if (result && result.data) {
				return result.data;
			} else {
				throw new Error('לא ניתן להחזיר את הזמן בין טעינה לביטול');
			}
		} catch (err) {
			throw err;
		}
	};
}

export default new WalletService(ClientConfig.apiBaseHost);
