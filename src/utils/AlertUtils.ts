import { CloseButton } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default class AlertUtils {
	static basicAlert(title: string, content: string, confirmButtonText?: string) {
		return Swal.fire({
			title,
			html: content,
			// timer: time,
			// type: 'success',
			showCloseButton: true,
			...(confirmButtonText ? { confirmButtonText } : {}),
		});
	}
	static basicAlertPromise(title: string, content: string) {
		return Swal.fire({
			title,
			html: content,
			// timer: time,
			// type: 'success',
			showCloseButton: true,
		});
	}

	static infoAlert(title: string, content: string) {
		Swal.fire({
			title,
			html: content,
			// timer: time,
			icon: 'info',
			showCloseButton: true,
		});
	}

	static infoWarning(title: string, content: string) {
		Swal.fire({
			title,
			html: content,
			// timer: time,
			icon: 'warning',
			showCloseButton: true,
		});
	}

	static successAlert(title: string, content: string = '', showConfirmationButton: boolean = true) {
		return Swal.fire({
			title: title,
			text: content,
			icon: 'success',
			showConfirmButton: showConfirmationButton,
			showCloseButton: true
		});
	}

	static failureAlert(title: string, content: string) {
		Swal.fire({
			icon: 'error',
			title: title,
			text: content,
			showCloseButton: true
		});
	}

	static successWithTimerAlert(title: string, content: string, time: number) {
		Swal.fire({
			title,
			html: content,
			timer: time,
			icon: 'success',
			showConfirmButton: false,
			showCloseButton: true
		});
	}

	// confirmAlert return a promise
	// chain .then with a successAlert or failureAlert if needed

	static confirmAlert(
		title: string,
		content: string,
		confirmButtonText: string,
		cancelButtonText: string,
		additionalOptions: any = {}
	): Promise<any> {
		return Swal.fire({
			title: title,
			text: content,
			icon: 'warning',
			showCancelButton: true,
			cancelButtonText: cancelButtonText,
			// confirmButtonColor: '#3085d6',
			// cancelButtonColor: '#d33',
			confirmButtonText: confirmButtonText,
			reverseButtons: true,
			showCloseButton: true,
			...additionalOptions,
		});
	}

	static confirmAlertCustom(
		title: string,
		content: string,
		additionalOptions: any = {}
	): Promise<any> {
		return Swal.fire({
			title: title,
			html: content,
			confirmButtonColor: '#3085d6',
			...additionalOptions,
		});
	}

	static confirmAlert2(
		title: string,
		content: string,
		cancelButtonText: string,
		confirmButtonText: string,
		additionalOptions: any = {}
	): Promise<any> {
		return Swal.fire({
			title: title,
			text: content,
			icon: 'warning',
			showCancelButton: true,
			cancelButtonText: cancelButtonText,
			// confirmButtonColor: '#3085d6',
			// cancelButtonColor: '#d33',
			confirmButtonText: confirmButtonText,
			reverseButtons: true,
			showCloseButton: true,
			...additionalOptions,
		});
	}

	static confirmAlertOneButton(
		title: string,
		content: string,
		confirmButtonText: string,
		additionalOptions: any = {},
		isHtml = false
	): Promise<any> {
		return Swal.fire({
			title: title,
			[isHtml ? "html" : "text"]: content,
			type: 'warning',
			showCancelButton: false,
			confirmButtonColor: '#3085d6',
			confirmButtonText: confirmButtonText,
			reverseButtons: true,
			...additionalOptions,
		});
	}

	static confirmAlertOneButtonWithHtml(
		title: string,
		content: string,
		confirmButtonText: string,
		additionalOptions: any = {}
	): Promise<any> {
		return Swal.fire({
			title: title,
			html: content,
			type: 'warning',
			customClass: 'swal-wide',
			showCancelButton: false,
			confirmButtonColor: '#3085d6',
			confirmButtonText: confirmButtonText,
			reverseButtons: true,
			...additionalOptions,
		});
	}

	static confirmAlertWithHtml(
		title: string,
		content: string,
		confirmButtonText: string,
		cancelButtonText: string,
		additionalOptions: any = {}
	): Promise<any> {
		return Swal.fire({
			title: title,
			html: content,
			type: 'warning',
			showCancelButton: true,
			customClass: 'swal-wide',
			cancelButtonText: cancelButtonText,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: confirmButtonText,
			reverseButtons: true,
			...additionalOptions,
		});
	}
	static confirmAlertWithHtmlForDeleteUser(
		title: string,
		content: string,
		confirmButtonText: string,
		cancelButtonText: string,
		additionalOptions: any = {}
	): Promise<any> {
		return Swal.fire({
			title: title,
			html: content,
			type: 'warning',
			showCancelButton: true,
			customClass: 'confirm-for-delete-user',
			cancelButtonText: cancelButtonText,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: confirmButtonText,
			reverseButtons: true,
			...additionalOptions,
		});
	}
	static confirmAlertWithHtmlAndWithOutType(
		title: string,
		content: string,
		confirmButtonText: string,
		cancelButtonText: string,
		additionalOptions: any = {}
	): Promise<any> {
		return Swal.fire({
			title: title,
			html: content,
			showCancelButton: true,
			customClass: 'swal-wide-confirm-alert-html',
			cancelButtonText: cancelButtonText,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: confirmButtonText,
			reverseButtons: true,
			...additionalOptions,
		});
	}
}
