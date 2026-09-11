import { observer } from 'mobx-react';
import { CustomButton, CustomHeader, CustomInputText, CustomSpan, Logger, TextTypes } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { AUTH_STORE, VIEW_STORE, USER_DETAILS_STORE, MINT_STORE, MESSAGES_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import ViewStore from '../../../../stores/ViewStore';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import ValidateService from '../../../../utils/ValidationService';
import AccessTokenService from '../../../../services/AccessTokenService';
import User from '../../../../models/User';
import MintStore from '../../../../stores/MintStore';
import HeaderLogin from '../../HomePage/HeaderLogin';
import { CustomMediaQuery } from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import HeaderLoginMobile from '../../HomePage/HeaderLoginMobile';
import EditorMessage from '../../EditorMessage/EditorMessage';
import MessagesStore from 'src/stores/MessagesStore';
import LogInWithBackImg from '../../HomePage/LogInWithBackImg';
import { useEffect, useState } from 'react';

interface Props {
	history?: any;
	isMint?: boolean;
	accessToken?: string;
}
interface IState {
	id: string;
	password: string;
	errorId?: string;
	errorPassword?: string;
}
const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const mintStore: MintStore = rootStores[MINT_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const Join : React.FC<Props> = ({
	history,
	isMint,
	accessToken
}) => {

	const [id, setId] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [errorId, setErrorId] = useState<string | undefined>('');
	const [errorPassword, setErrorPassword] = useState<string>('');


	let userAccessTokenData : User;
	userAccessTokenData = new User();

    useEffect(() => {
		viewStore.setLoadingView(false);
		if (isMint) {
			mintStore.setMintButtonActivation(false);
			viewStore.setLoadingView(true);
			// addd a check for is mint
			AccessTokenService.getUserDataByAccessToken(accessToken)
				.then((user) => {
					setId(user.identityNumber)
					setPassword(user.identityNumber)
				})
				.catch(() => {
					history.push(RoutesPath.mint.error);
				})
				.finally(() => {
					// SetState loading=false in order to show the user the page
					viewStore.setLoadingView(false);
				});
		}
	},[])

	const onIdInputChange = (value) => {
		if (ValidateService.validateID(value)) {
			setId(value)
		}
	};

	const onPassowrdIputChange = (value) => {
		setPassword(value)
	};

	const validate = () => {
		let retVal = true;

		if (id.length !== 9) {
			if (id.length == 0) {
				setErrorId(Lang.format('InputsThatMarkedWithAsteriskAreRequired'))
			} else {
				setErrorId(Lang.format('IdError'))
			}
			retVal = false;
		} else {
			setErrorId('')
		}

		// if (this.state.password.length !== 9) {
		// 	if (this.state.password.length == 0) {
		// 		this.setState({errorPassword: Lang.format('InputsThatMarkedWithAsteriskAreRequired')});
		// 	} else {
		// 		this.setState({errorPassword: Lang.format('PasswordIsNotNineCharacters')});
		// 	}
		// 	retVal = false;
		// } else {
		// 	this.setState({errorPassword: ''});
		// }

		if (retVal) {
			if (id !== id) {
				setErrorPassword(Lang.format('PasswordDontMatchID'))
				retVal = false;
			} else {
				setErrorPassword('')
			}
		}

		return retVal;
	};

	const onJoinClicked = () => {
		if (validate()) {
			viewStore.setLoadingView(true);
			authStore
				.join(id, id)
				.then((user) => {
					// Disable loader
					viewStore.setLoadingView(false);
					history.push(RoutesPath.login.registration);
				})
				.catch((err) => {
					// Disable loader
					viewStore.setLoadingView(false);
					// Check error type
					ErrorUtils.checkErrorAndShowPopUp(err, '', '');
				});
		} else {
			Logger.debug('the input is not a valid');
		}
	};
	const joinWithEnter = (e) => {
		if (e.key === 'Enter') {
			onJoinClicked();
		}
	};
	let tagImgFromMsg = messagesStore.imgBackgroundLoginDesktop;

	let myRegexHttps = /<img[^>]+src="(https:\/\/[^">]+)"/g;
	let myRegexHttp = /<img[^>]+src="(http:\/\/[^">]+)"/g;

	let backImgHttps = myRegexHttps.exec(tagImgFromMsg);
	let backImgHttp = myRegexHttp.exec(tagImgFromMsg);

	let backImg;

	if (backImgHttps)
		backImg = backImgHttps[1];
	if (backImgHttp)
		backImg = backImgHttp[1];

	return (
		<React.Fragment>
			<LogInWithBackImg>
				<CustomMediaQuery.Mobile>
					<HeaderLoginMobile />
				</CustomMediaQuery.Mobile>
				<CustomMediaQuery.Desktop>
					<div className='header-container-injoin'>
						<HeaderLogin />
					</div>
				</CustomMediaQuery.Desktop>
				<div className='join-main-container' onKeyDown={joinWithEnter}>
					<div className='login-content'>
						{/* <div className='logo-container'>
						<img
							className='login-beyhad-logo-item'
							src={require('../../../../assets/Login.jpg')}
							alt={Lang.format('Join1')}
						/>
					</div> */}
						<CustomMediaQuery.Mobile>
							<CustomHeader headerClassName='header-title-login-content' text={`${Lang.format('Join1')}`} />
						</CustomMediaQuery.Mobile>


						<div className='login-withtext-container'>
							<div className='main-text-container'>
								<CustomMediaQuery.Desktop>

									<CustomHeader text={`${Lang.format('Join1')}`} />
								</CustomMediaQuery.Desktop>

								<div className='bottom-text'>
									<EditorMessage message={messagesStore.joinTextTitle} />
								</div>
							</div>
							<div className='login-content-container'>
								<div className='input-container'>
									<CustomInputText
										labelText={Lang.format('תעודת זהות')}
										type={TextTypes.Telephone}
										value={id}
										error={errorId}
										onChange={onIdInputChange}
									/>
									{/*יש להקליד מספר זהות כולל ספרת ביקורת (9 ספרות) <CustomInputText
									labelText={Lang.format('Password')}
									type={TextTypes.Password}
									value={password}
									error={errorPassword}
									onChange={this.onPassowrdIputChange}
									required
								/> */}
									<p className='id-property'>יש להקליד מספר זהות כולל ספרת ביקורת (9 ספרות)</p>
								</div>
								<div className='btn-container'>
									<div className='btn-item'>
										<CustomButton
											text={Lang.format('NewUser')}
											buttonClassName={`primary-design center`}
											onClick={onJoinClicked}
											disabled={viewStore.loadingView}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</LogInWithBackImg>
		</React.Fragment>
	);
}
export default observer(Join)
