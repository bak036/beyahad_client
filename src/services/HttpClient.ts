import axios, {CancelToken} from 'axios';

export interface IHttp {
	get(url: string, headers?: object): Promise<any>;

	post(url: string, body?: object, headers?: object): Promise<any>;

	put(url: string, body?: object, headers?: object): Promise<any>;

	del(url: string, body?: object, headers?: object): Promise<any>;

	postFormData(url: string, file: any): Promise<any>;

	uploadFile(url: string, file: any, cancelToken: CancelToken): Promise<any>;
}

export class AxiosHttp implements IHttp {
	get(url: string, headers?: any): Promise<any> {
		return axios.get(url, {
			timeout: 600000,
			withCredentials: true,
			headers,
		});
	}

	post(url: string, body?: any, headers?: any): Promise<any> {
		return axios.post(url, body, {
			withCredentials: true,
			headers,
		});
	}

	put(url: string, body?: any, headers?: any): Promise<any> {
		return axios.put(url, body, {
			withCredentials: true,
			headers,
		});
	}

	del(url: string, body?: any, headers?: any): Promise<any> {
		return axios.delete(url, {
			withCredentials: true,
			headers,
		});
	}

	postFormData(url: string, file: any) {
		const formData = new FormData();
		formData.append('file', file);
		return axios.post(`${url}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	}

	uploadFile(url: string, file: any, cancelToken: CancelToken): Promise<any> {
		const formData = new FormData();
		formData.append('file', file);
		return axios.post(`${url}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			cancelToken: cancelToken,
		});
	}
}
