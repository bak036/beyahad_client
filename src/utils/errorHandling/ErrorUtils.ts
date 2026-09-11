import AlertUtils from '../AlertUtils';
import Lang from '../../config/Language';

export default class ErrorUtils {
	static extractError(response: any) {
		// Detect Error
		if (response && response.data && response.data.status == false) {
			const title = response.data.errorTitle || undefined;
			const errorId = response.data.errorId != null ? response.data.errorId : undefined;
			// return error types
			if (response.data.errorDescription) {
				return new ErrorDescription(response.data.errorDescription, title, errorId);
			} else if (response.data.errorHTML) {
				return new ErrorHTML(response.data.errorHTML, title, errorId);
			} else {
				return new Error('Cannot find "errorDescription" or "errorHTML" field');
			}
		} else {
			return null;
		}
	}

	static isHTMLError(error) {
		return error instanceof ErrorHTML;
	}

	static isStringError(error) {
		return error instanceof ErrorDescription;
	}

	/**
	 * The backend's generic catch-all handler (`BaseController.OnBusinessException`) uses
	 * `errorId === 1` to mark an unexpected/internal server error (as opposed to a real business
	 * rule violation, e.g. a blocked wallet) - it always carries the generic
	 * `errorDescription: "שגיאה כללית"` text. Callers that want to stay silent on unexpected
	 * server errors (matching the app's older/default behavior) while still surfacing real
	 * business errors should check this before showing a popup.
	 */
	static isGeneralServerError(error) {
		return (ErrorUtils.isHTMLError(error) || ErrorUtils.isStringError(error)) && error.errorId === 1;
	}

	/**
	 *
	 * @param err  - contains the error message coming from the server. If the server returned an
	 * errorTitle (err.title), it takes precedence over the htmlTitle/stringTitle arguments below.
	 * @param htmlTitle - the fallback title of the popup for HTMLError, used when err.title is not set
	 * @param stringTitle - the fallback title of the popup for StringError, used when err.title is not set
	 */
	static checkErrorAndShowPopUp(err, htmlTitle?: string, stringTitle?: string) {
		if (ErrorUtils.isHTMLError(err)) {
			return AlertUtils.basicAlert(err.title || (htmlTitle ? htmlTitle : ''), err.message);
		} else if (ErrorUtils.isStringError(err)) {
			return AlertUtils.basicAlert(err.title || (stringTitle ? stringTitle : ''), err.message);
		} else {
			return AlertUtils.basicAlert(Lang.format('GeneralError'), '');
		}
	}
}

// About the typescript error when the prototype chain breaks
// https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
// There is a bug in typescript while transpiling from es6 to es5, when subclassing
// Array, Error the prototype chain breaks, thats why we need to use - Object.setPrototypeOf
// to restore the prototype chain

export class ErrorHTML extends Error {
	title?: string;
	errorId?: number;

	constructor(message: string, title?: string, errorId?: number) {
		super(message);
		this.title = title;
		this.errorId = errorId;
		// must be called after super
		Object.setPrototypeOf(this, ErrorHTML.prototype);
	}
}
export class ErrorDescription extends Error {
	title?: string;
	errorId?: number;

	constructor(message: string, title?: string, errorId?: number) {
		super(message);
		this.title = title;
		this.errorId = errorId;
		// must be called after super
		Object.setPrototypeOf(this, ErrorDescription.prototype);
	}
}
