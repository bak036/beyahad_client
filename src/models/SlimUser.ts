import {makeAutoObservable, observable} from 'mobx';

class SlimUser {
	@observable MemberId: string;

	constructor(user?: any) {
		makeAutoObservable(this);
		if (user) {
			this.MemberId = user.id;
		}
	}
}

export default SlimUser;
