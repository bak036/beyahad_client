export default class StringFormatUtils {
	public static tryConvertToLocaleString(price: any) {
		try {
			if (price) {
				return parseFloat(price).toLocaleString();
			}
			return price;
		} catch (err) {
			return price;
		}
	}

	public static readySearchText(text: string, type: boolean = false) {
		// type equals true decodes text "/" values
		return type ? text.replace(/Lw==/g, '/') : text.replace(/\//g, 'Lw==');
	}
}
