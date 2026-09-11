import {availableLanguages} from '../consts/availableLanguages';

export const env : string | undefined = process.env['REACT_APP_ENV'];

interface IConfigEnvironment {
	baseHost: string;
	apiBaseHost: string;
}

export interface IClientConfig extends IConfigEnvironment {
	defaultLanguage: string;
}


if (env !== 'prod') {
	console.log('Client started with env', env);
}

/**
 * Generate config according to env
 */
const ClientConfig: IClientConfig = {
	defaultLanguage: availableLanguages.he,

	// Get all environment configurations
	baseHost: `${env}`,
	apiBaseHost: `${env}/api`
};

export default ClientConfig;
