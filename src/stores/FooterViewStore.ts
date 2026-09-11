import {action, toJS, computed, observable, makeAutoObservable} from 'mobx';

export default class FooterViewStore {

    @observable height: number;

    constructor(){
        makeAutoObservable(this);
    }

    @action 
    setFooterCurrentHeight = (height: number): void => {
        if(height >= 0)
            this.height = height;
    }

    @computed
    get getFooterCurrentHeight():number{
        return toJS(this.height);
    }
}