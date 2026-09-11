import { makeAutoObservable, observable } from 'mobx';

export default class WalletChain {
  @observable chainID: number = 0;
  @observable chainName: string = '';
  @observable searchKeyWords?: string = '';
  @observable isWebOnline?: boolean = false;
  @observable webSite?: string = '';
  @observable storeCityId?: number = 0;
  @observable region?: string = '';
  @observable subBranchRegions?: string = ''; // ✅ עברו לכאן
  @observable subBranchCities?: string = '';  // ✅ עברו לכאן
  
  constructor(chain?: Partial<WalletChain>) {
    makeAutoObservable(this);
    if (chain) {
      Object.assign(this, chain);
    }
  }
}
