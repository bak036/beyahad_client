import BaseHTTPService from './BaseHTTPService';
import ClientConfig from '../config';
import User from '../models/User';
import ErrorUtils from 'src/utils/errorHandling/ErrorUtils';
import { Logger } from 'nofshonit-base-web-client';
import SlimUser from 'src/models/SlimUser';

class UserService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	// TODO: Daniel - move "friendMail" to User object
	updateUser = (userDetail: User) => {
		const request = {
			loginType: 2,
			identityNumber: userDetail.identityNumber,
			firstName: userDetail.firstName,
			lastName: userDetail.lastName,
		};
		return this.httpPost('/users/updateMember', request);
	};

	updatePassword = (newPassword) => {
		const request = {
			Id: '307924506',
			Token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjMwNzkyNDUwNiIsIm5iZiI6MTU1MjgzNDM0NiwiZXhwIjoxNTUyODM3OTQ2LCJpYXQiOjE1NTI4MzQzNDZ9.5WTYldJ6YVsXuk-arE4JIQFhgya_tfjtndmiD0nlU6Y',
			currentpassword: '123456',
			NewPassword: newPassword,
		};
		return this.httpPost('/users/updatePassword', request);
	};

	deleteMember = (user: User) => {
		
		var slimUser: SlimUser = 
		{
			MemberId : user.identityNumber
		};
		
		return this.httpPost(`/users/deleteMember`, slimUser).then((response) => {
			console.log("response.data", response.data);

			// Extract the error from the response (if has one)
			 const error = ErrorUtils.extractError(response);
			if (error) {
				throw error;
			}
			// When no error field, return the data from the response
			if (response && response.data) {
				const success = response.data;
				return success;
			} else {
				throw new Error('Response data not found');
			}
		})
		.catch((err) => {
			Logger.error('Error occurd when calling to "/users/deleteUser"', err);
			throw err;
		});
	};

}

export default new UserService(ClientConfig.apiBaseHost);
