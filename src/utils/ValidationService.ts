class ValidationService {
	ValidateCharactersOnly = (str: string) => {
		if (!str||str.length == 0) {
			return true;
		}

		if (str.match(/^[A-Za-zא-ת()".'-\s]+$/) != null) {
			console.debug('success');

			return true;
		}
		console.debug('failed');

		return false;
	};
	ValidateCharactersAndNumbersOnly = (str: string) => {
		if (!str||str.length == 0) {
			return true;
		}

		if (str.match(/^[A-Za-zא-ת()0-9".'-\s]+$/) != null) {
			console.debug('success');

			return true;
		}
		console.debug('failed');

		return false;
   };

	ValidateNoNumbers = (name: string) => {
		if (name.length === 0) {
			return false;
		}
		if (name.match(/\d+/g) != null) {
			return true;
		}
		return false;
	};

	validatePassword = (password: string) => {
		if (password.length < 6 || password.length > 14) {
			return false;
		} else return true;
	};
	validateMatchPasswords = (passwordA, passwordB) => {
		if (passwordA === passwordB) {
			return true;
		} else {
			return false;
		}
	};


	// BASIC EMAIL VALIDATION - Checks for one @ and a . to the right
	validateEmail = (email: string): boolean => {
		 if (!email) return false;
	
    	// בדיקה שהתווים הם ASCII בלבד
		const isAscii = /^[\x00-\x7F]+$/.test(email);
		if (!isAscii) return false;

		// ולידציה לפי פורמט אימייל תקני
		const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		return regex.test(email);
	};

	validateNumbersOnly(text: string) {
		if (text) {
			const numericRegex = new RegExp('^[0-9]*$');
			return numericRegex.test(text);
		} else if (text && text.length == 0) {
			return true;
		} else {
			return false;
		}
	}

	validateNumbersOnlyAndMaxLength = (numericText: string, maxLength: number): boolean => {
		if (numericText) {
			if (numericText.length < maxLength) {
				return this.validateNumbersOnly(numericText);
			} else {
				const numericRegex = new RegExp('^[0-9]{' + maxLength + '}$'); // Exactly 9 numbers
				return numericRegex.test(numericText);
			}
		} else {
			if (numericText.length == 0) {
				return true;
			}
			return false;
		}
	};

	validateShortCode = (shortCode: string) => {
		if (shortCode.length !== 5) {
			return false;
		} else return true;
	};

	// ID must be numeric only && max length of 9

	validateID = (id: string): boolean => {
		if (id) {
			if (id.length < 9) {
				return this.validateNumbersOnly(id);
			} else {
				const numericRegex = new RegExp('^[0-9]{9}$'); // Exactly 9 numbers
				return numericRegex.test(id);
			}
		} else {
			if (id.length == 0) {
				return true;
			}
			return false;
		}
	};
}

export default new ValidationService();
