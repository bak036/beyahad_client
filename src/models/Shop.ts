import { makeAutoObservable, observable } from 'mobx';
import WalletChain from './WalletChain';

export default class Shop {
  @observable chainID: number = 0;
  @observable chainName: string = '';
  @observable logoURL?: string = '';
  @observable tagName?: string = '';
  @observable tagId?: number = 0;
  @observable walletChainData: WalletChain[] = [];

  constructor(shop?: any) {
    makeAutoObservable(this);
    if (shop) {
      this.chainID = shop.chainID;
      this.chainName = shop.chainName;
      this.logoURL = shop.logoURL || '';
      this.tagName = shop.tagName;
      this.tagId = shop.tagId;
      this.walletChainData = (shop.walletChainData || []).map((c: any) => new WalletChain(c));
    }
  }
}
