import {makeAutoObservable, observable} from "mobx";

class ContactInfo {

    @observable
    id: string;

    @observable
    fullName: string;

    @observable
    email: string;

    @observable
    content: string;

    constructor(data?: any) {
        makeAutoObservable(this);
        // Code Section
        if (data) {
            this.id         = data.id;
            this.fullName   = data.fullName;
            this.email      = data.email;
            this.content    = data.content;
        }
    }
}

export default ContactInfo;