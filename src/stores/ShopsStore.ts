import { action, makeAutoObservable, observable } from 'mobx';
import Shop from '../models/Shop';
import ShopsService from '../services/ShopsService';
import AuthStore from './AuthStore';

export const WalletsEnum = {
  DEFAULT: 2237,
  NO_WALLET_ID: 0,
};

export default class ShopsStore {
  @observable shops: Shop[] = [];

  @observable originalShops: Shop[] = []; // לשמירת העותק המקורי לאיפוס
  @observable geoFilter: any = null;      // הפילטר הגאוגרפי האחרון
  @observable currentWalletId: number | null = null; // 🟢 ארנק טעון כרגע
  @observable categoryFilter: any[] = [];
  @observable navigatedFromGeo = false;        // יציאה מדף בגלל GEO
  @observable navigatedFromCategory = false;   // יציאה מדף בגלל קטגוריה

  authStore: AuthStore;

  constructor(authStore: AuthStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }

  // ----- פעולות -----

  @action setCurrentWalletId(id: number | null) {
    this.currentWalletId = id;
  }

  @action setOriginalShops(data: Shop[]) {
    this.originalShops = data || [];
  }

  @action setGeoFilter(filter: any) {
    this.geoFilter = filter;
  }

  @action clearGeoFilter() {
    this.geoFilter = null;
  }

  @action setNavigatedFromGeo(value: boolean) {
    this.navigatedFromGeo = value;
  }

  @action setNavigatedFromCategory(value: boolean) {
    this.navigatedFromCategory = value;
  }


  @action init(walletId: number = WalletsEnum.DEFAULT) {
    return this.getShops(walletId);
  }

  @action getShops(walletId: number) {
    return ShopsService.getShops(walletId).then((shops: any) => {
      this.shops = shops || [];
    });
  }

  @action async getWalletChainNearMe(walletId: number, lat: number, lon: number): Promise<any[]> {
    const shops = await ShopsService.getShopsNearMe(walletId, lat, lon);
    return shops || [];
  }

  @action setShops(data: Shop[]) {
    this.shops = data || [];
  }

  @action setCategoryFilter(list: any[]) {
    this.categoryFilter = list || [];
  }
}
