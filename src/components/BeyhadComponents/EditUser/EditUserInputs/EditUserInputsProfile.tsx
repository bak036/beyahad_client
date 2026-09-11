import { observer } from 'mobx-react';
import { CustomInputText, CustomSelector, TextTypes, Logger, CustomHeader } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { USER_DETAILS_STORE } from '../../../../consts/stores';
import { Gender } from '../../../../models/enums';
import User from '../../../../models/User';
import rootStores from '../../../../stores';
import CustomInputDate from '../../../CustomComponents/CustomInputDate/CustomInputDate';
import { useEffect } from 'react';
import ListBox from './ListBox';
import City from 'src/models/City';
import Street from 'src/models/Street';
import ValidationService from 'src/utils/ValidationService';
import UserDetailsStore from 'src/stores/UserDetailsStore';
import PlacesService from 'src/services/PlacesService';
import { promises } from 'dns';
import { all } from 'promise';

interface Props {
	handleSubmit: (cityObj: City, cityName: string, streetName: string, streetNumber: string, apartmentNumber: string, postalCode: string, entrance: string, mailbox: string) => void,
	isSendDetails: boolean,

}
interface IState { }
// const userDetails: userDetails = rootStores[USER_DETAILS_STORE];
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];


const EditUserInputsProfile: React.FC<Props> = ({
	isSendDetails,
	handleSubmit,

}) => {
	const user: User = userDetailsStore.currentEditingUserDetails;
	const allStreets: Street[] = userDetailsStore.allStreets;
	const allCities: City[] = userDetailsStore.getCities;
	const { firstName, workingPlace, childrenNumber, friendMail } = user;
	const {
		phoneNumberAreaCode,
		phoneNumberWithoutAreaCode,
		firstNameError,
		lastNameError,
		emailError,
		genderError,
		workingPlaceError,
		childrenNumberError,
		cityError,
		streetNameError,
		streetNumberError,
		apartmentNumberError,
		postalCodeError,
		friendEmailError,
		mailboxError,
		entranceError,
		partnerPhoneError
	} = userDetailsStore;
	const possiblePhoneNumber = userDetailsStore.getPrefixPhoneNumbers;
	const newBirthDay =
		userDetailsStore.currentEditingUserDetails && userDetailsStore.currentEditingUserDetails.birthDate
			? userDetailsStore.currentEditingUserDetails.birthDate.slice(0, 10)
			: '';
	const genderArray = [
		{ gender: Lang.format('Male'), key: Gender.MALE },
		{ gender: Lang.format('Female'), key: Gender.FEMALE },
		{ gender: Lang.format('Other'), key: Gender.OTHER },
	];
	const [cityName, setCityName] = React.useState<string>(userDetailsStore.address.cityTextName);
	const [cityObj, setCityObj] = React.useState<City>(userDetailsStore.address.city);
	const [allCitiesFilter, setAllCitiesFilter] = React.useState<City[]>(allCities);
	const [showCityError, setShowCityError] = React.useState<boolean>(false);
	const [streetName, setStreetName] = React.useState<string>(userDetailsStore.address.streetName);
	const [streetNameForStore, setStreetNameForStore] = React.useState<string>(userDetailsStore.address.streetName);
	const [allStreetsFilter, setAllStreetsFilter] = React.useState<Street[]>(allStreets);
	const [allStreetsForCity, setAllStreetsForCity] = React.useState<Street[]>(allStreets);
	const [showStreerError, setShowStreetError] = React.useState<boolean>(false);
	const [showCitiesListBox, setShowCitiesListBox] = React.useState<boolean>(false);
	const [showStreetsListBox, setShowStreetsListBox] = React.useState<boolean>(false);
	const [isSelectingStreet, setIsSelectingStreet] = React.useState(false);
	const [isInitData, setisInitData] = React.useState(false);
	const [streetNumberForStore, setStreetNumberForStore] = React.useState<string>(userDetailsStore.address.streetNumber);
	const [apartmentNumberForStore, setApartmentNumberForStore] = React.useState<string>(userDetailsStore.address.apartmentNumber);
	const [postalCodeForStore, setPostalCodeForStore] = React.useState<string>(userDetailsStore.address.postalCode);
	const [entranceForStore, setEntranceForStore] = React.useState<string>(userDetailsStore.address.entrance);
	const [mailboxForStore, setMmailboxForStore] = React.useState<string>(userDetailsStore.address.mailbox);
	const [isSelectingCity, setIsSelectingCity] = React.useState(false);
	const [isBlurredCity, setIsBlurredCity] = React.useState(false);

	const errorStreet = Lang.format('PleaseChooseAStreetFromList');
	const errorCity = Lang.format('PleaseChooseACityFromList');

	let selectingCity: Promise<void> | null = null;
	let genderAsValue = userDetailsStore.getGenderObjectBasedOnValue;
	let newChildrenNumber = childrenNumber ? childrenNumber : 0;
	if (parseInt(newChildrenNumber.toString()) > 9) {
		newChildrenNumber = Lang.format('OverNine');
	}
	useEffect(() => {
		if (isSendDetails) {
			sendDetails();
		}
		initAddress();
	}, [isSendDetails, userDetailsStore.address]);
	useEffect(() =>{
		if (!allCities || allCities.length === 0) return;
		if (userDetailsStore.address.cityTextName) {
			let tempCities = allCities
				.filter((c) => c.cityName && c.cityName.includes(userDetailsStore.address.cityTextName))
				.reduce((unique: City[], city: City) => {
					if (!unique.some((c) => c.cityName === userDetailsStore.address.cityTextName)) {
						unique.push(city);
					}
					return unique;
				}, []);
			if (tempCities.length > 0) {
				setCityName(userDetailsStore.address.cityTextName);
				setShowCityError(false);
			} else {
				setCityName('');
				setShowCityError(true);

			}
		}
	},[allCities])
	const initAllStreets = async (cityId) => {
		if (!cityId)
			return;

		await PlacesService.getStreetsByCity(cityId).then((res) => {
			let streetsList = res.filter(function (item, pos) {
				return res.indexOf(item) == pos;
			});
			let allStreets = streetsList || [];
			let tempStreets = allStreets.reduce((unique: Street[], street: Street) => {
				if (!unique.some(s => s.streetName === street.streetName)) {
					unique.push(street);
				}
				return unique;
			}, []);
			setAllStreetsFilter(tempStreets);
			setAllStreetsForCity(allStreets);
		});
	}
	const initAddress = () => {
		if (userDetailsStore.address && userDetailsStore.address.city && !isInitData) {

			setStreetName(userDetailsStore.address.streetName)
			setStreetNameForStore(userDetailsStore.address.streetName)
			setCityObj(userDetailsStore.address.city);

			setStreetNumberForStore(userDetailsStore.address.streetNumber)
			setApartmentNumberForStore(userDetailsStore.address.apartmentNumber)
			setPostalCodeForStore(userDetailsStore.address.postalCode)
			setEntranceForStore(userDetailsStore.address.entrance);
			setMmailboxForStore(userDetailsStore.address.mailbox)
			setAllStreetsForCity(userDetailsStore.allStreets);

			initAllStreets(userDetailsStore.address.city.cityId);

			setisInitData(true)
		}
	}
	const sendDetails = () => {
		handleSubmit(cityObj, cityName, streetNameForStore, streetNumberForStore, apartmentNumberForStore, postalCodeForStore, entranceForStore, mailboxForStore)
	}
	const changeCityName = (val) => {
		if (showCityError)
			setShowCityError(false);
		if (userDetailsStore.cityError)
			userDetailsStore.setCityError('')
		if (cityObj)
			setCityObj(new City());

		if (!ValidationService.ValidateCharactersOnly(val.currentTarget.value))
			val.currentTarget.value = val.currentTarget.value.slice(0, val.currentTarget.value.length - 1);

		setCityName(val.currentTarget.value);

		if (val.currentTarget.value && allCities) {
			setIsBlurredCity(false);
			let tempCities = allCities.filter(c => c.cityName && c.cityName.includes(val.currentTarget.value))
				.reduce((unique: City[], city: City) => {
					if (!unique.some(c => c.cityName === city.cityName)) {
						unique.push(city);
					}
					return unique;
				}, []);
			setAllCitiesFilter(tempCities);
			if (tempCities.length > 0) {
				setShowCityError(false);
				setShowCitiesListBox(true);
			}
			else
				setShowCitiesListBox(false);

		}
		else {
			setAllCitiesFilter(allCities);
			setShowCityError(false);
			setShowCitiesListBox(true);
		}

	}
	const blurChangeCity = () => {
		setIsBlurredCity(true);
		setTimeout(async () => {
			if (selectingCity) {
				await selectingCity;
				return;
			}
			if (isSelectingCity)
				return
			const foundCity = allCities.find(c => c.cityName === cityName);
			if (foundCity) {

				await clearChoiceStreet(foundCity);
				setCityObj(foundCity);

			} else {
				setShowCityError(true);
				setCityName("");
				setShowStreetsListBox(false);
			}

			if (showCitiesListBox) {
				setShowCitiesListBox(false);
			}
		}, 200);
	};
	const selectCityFromList = async (city: City) => {
		setIsSelectingCity(true);
		selectingCity = (async () => {
			await clearChoiceStreet(city);
			setCityObj(city);
			setCityName(city.cityName);
			setShowCitiesListBox(false);
			setIsSelectingCity(false);
		})();

		await selectingCity;
		selectingCity = null;
	};
	const clearChoiceStreet = async (city: City) => {
		if (userDetailsStore.address.city.cityName != city.cityName || (allStreetsFilter && allStreetsFilter[0] && allStreetsFilter[0].cityId !== city.cityId)) {
			setShowStreetError(true);
			setStreetNameForStore('');
			setStreetName('');
		}
		await initAllStreets(city.cityId);

	}
	const onFocusCityInput = () => {
		setShowCityError(false);
		setShowCitiesListBox(true);
		let tempCities;
		if (cityName)
			tempCities = allCities.filter(c => c.cityName && c.cityName.includes(cityName))
				.reduce((unique: City[], city: City) => {
					if (!unique.some(c => c.cityName === city.cityName)) {
						unique.push(city);
					}
					return unique;
				}, []);
		else
			tempCities = allCities.reduce((unique: City[], city: City) => {
				if (!unique.some(c => c.cityName === city.cityName)) {
					unique.push(city);
				}
				return unique;
			}, []);;
		setAllCitiesFilter(tempCities);
	};
	const onFocusStreetInput = () => {
		let tempStreets;
		if (!streetName || isBlurredCity) {
			setIsBlurredCity(false);
			tempStreets = allStreetsForCity;
		}
		else {
			tempStreets = allStreetsForCity.filter(s => s.streetName && s.streetName.includes(streetName));
		}
		setAllStreetsFilter(tempStreets);
		setShowStreetError(false);
		setShowStreetsListBox(true);
	};
	const changeStreetName = (val) => {
		if (showStreerError)
			setShowStreetError(false);
		if (userDetailsStore.streetNameError)
			userDetailsStore.setStreetNameError('')

		if (!ValidationService.ValidateCharactersAndNumbersOnly(val.currentTarget.value))
			val.currentTarget.value = val.currentTarget.value.slice(0, val.currentTarget.value.length - 1);

		setStreetName(val.currentTarget.value);
		setStreetNameForStore('');

		if (val.target.value && allStreetsForCity) {
			let tempStreets = allStreetsForCity.filter(s => s.streetName && s.streetName.includes(val.target.value));
			setAllStreetsFilter(tempStreets);
			if (tempStreets.length > 0) {
				setShowStreetError(false);
				setShowStreetsListBox(true);
			}
			else
				setShowStreetsListBox(false);
		}
		else {
			setAllStreetsFilter(allStreetsForCity);
			setShowStreetError(false);
			setShowStreetsListBox(true);
		}
	};
	const blurChangeStreet = () => {
		setTimeout(() => {
			if (isSelectingStreet) {
				return; // Exit early if a selection is in progress
			}
			const foundStreet = allStreetsForCity.find(s => s.streetName === streetName);
			if (foundStreet) {
				setStreetNameForStore(foundStreet.streetName);
			} else {
				setShowStreetError(true);
				setStreetName("");
			}

			setShowStreetsListBox(false);
		}, 0);
	};
	const selectStreetFromList = (street: Street) => {
		setIsSelectingStreet(true);
		setStreetName(street.streetName);
		setStreetNameForStore(street.streetName);
		setShowStreetsListBox(false);
		setIsSelectingStreet(false);
	};

	return (
		<div className={'edit-user-inputs'}>
			<div >
				<div className='row first-line'>

					<CustomInputText
						placeholder={user.firstName}
						value={firstName}
						labelText={Lang.format('FirstName')}
						onChange={(value) => {
							userDetailsStore.setFirstName(value);
						}}
						error={firstNameError}
						required
					/>

					<div style={{ height: '14px' }}></div>
					<CustomInputText
						value={user.lastName}
						labelText={Lang.format('LastName')}
						onChange={(value) => {
							userDetailsStore.setLastName(value);
						}}
						error={lastNameError}
						required
					/>
					<div style={{ height: '14px' }}></div>
					<CustomInputText
						value={user.identityNumber}
						labelText={'תעודת זהות'}
						type={TextTypes.Telephone}
						disabled
					/>
				</div>
				<div className='row'>
					<div className='edit-user-inputs-date-profile'>
						<div className='hight-14px'></div>
						<CustomInputDate
							// value={birthDate}
							value={newBirthDay}
							onChange={(value) => {
								userDetailsStore.setBirthDate(value);
							}}
							labelText={Lang.format('Birthday')}
						// error={birthDateError}
						/>
						<div style={{ height: '4px' }}></div>
					</div>
					<div className={'row-with-2-equal-elements'}>
						<CustomSelector
							placeholder={'בחר'}
							text={Lang.format('Gender')}
							value={genderAsValue}
							options={genderArray}
							keyAttribute={'key'}
							valueAttribute={'gender'}
							onSelected={(data) => {
								userDetailsStore.setGender(data && data.key ? data.key : null);
							}}
							error={genderError}
						/>
						<CustomSelector
							text={Lang.format('ChildrenNumber')}
							placeholder={'0'}
							value={newChildrenNumber}
							options={[1, 2, 3, 4, 5, 6, 7, 8, 9, Lang.format('OverNine')]}
							isPrimitiveValue
							onSelected={(e) => {
								userDetailsStore.setChildrenNumber(e);
								Logger.debug(e);
							}}
							error={childrenNumberError}
						/>
					</div>
					<CustomInputText
						placeholder={workingPlace}
						value={workingPlace}
						labelText={Lang.format('WorkingPlace')}
						onChange={(value) => {
							userDetailsStore.setWorkingPlace(value);
						}}
						error={workingPlaceError}
					/>
				</div>
			</div>
			<div >
				<div className='title-seconde'>
					<CustomHeader text={Lang.format('כתובת')} />
				</div>
				<div className={'city-container row'}>
					<div className={`city ${userDetailsStore.cityError ? 'city-red' : ''}`}>
						<label className="label-city required">{Lang.format('City')}</label>
						<input
							type="text"
							className={showCityError ? 'city-input red' : 'city-input'}
							onChange={(val) => changeCityName(val)}
							value={cityName}
							onBlur={blurChangeCity}
							onFocus={onFocusCityInput}
						></input>
						{(showCityError || userDetailsStore.cityError) && <div className="custom-input-error-container"><label className='error custom-input-error-label'>{errorCity}</label></div>}
						{showCitiesListBox && (
							<ListBox
								items={allCitiesFilter}
								onSelected={(city: City) => selectCityFromList(city)}
								onMouseDown={() => setIsSelectingCity(true)}
							/>
						)}
					</div>
					{/* Other city input text */}

					<div
						className={
							userDetailsStore.streetNameError
								? 'street-auto-complete-red street-auto-container'
								: 'street-auto-container'
						}>
						<label className="label-city required">{Lang.format('streetName')}</label>
						<input
							type="text"
							className={(showStreerError && !showStreetsListBox) ? 'city-input red' : 'city-input'}
							onChange={(val) => changeStreetName(val)}
							placeholder=""
							value={streetName}
							onBlur={blurChangeStreet}
							onFocus={onFocusStreetInput}
						></input>
						{((showStreerError && !showStreetsListBox) || userDetailsStore.streetNameError) && <div className="custom-input-error-container"><label className='error custom-input-error-label'>{errorStreet}</label></div>}
						{(showStreetsListBox && allStreetsFilter.length > 0) && (
							<ListBox
								items={allStreetsFilter}
								onSelected={(street: Street) => selectStreetFromList(street)}
								onMouseDown={() => setIsSelectingStreet(true)}
							/>
						)}
					</div>

					<div className={'three-elements'}>
						<CustomInputText
							placeholder={streetNumberForStore}
							value={streetNumberForStore}
							labelText={"מס' בית"}
							type={TextTypes.Number}
							onChange={(value) => {
								setStreetNumberForStore(value);
							}}
							error={streetNumberError}
							required
						/>
						<CustomInputText
							placeholder={apartmentNumberForStore}
							value={apartmentNumberForStore}
							labelText={Lang.format('ApartmentNumber')}
							type={TextTypes.Number}
							onChange={(value) => {
								setApartmentNumberForStore(value);
							}}
							error={apartmentNumberError}
							required
						/>

						<CustomInputText
							value={entranceForStore}
							labelText={Lang.format('Entrance')}
							onChange={(value) => {
								setEntranceForStore(value);
							}}

						/>
					</div>
				</div>
				<div className='row two-element'>
					<div className='Mailbox-input'>
						<div style={{ width: '46%' }}>
							<CustomInputText
								value={mailboxForStore}
								type={TextTypes.Number}
								labelText={Lang.format('Mailbox')}
								onChange={(value) => {
									setMmailboxForStore(value);
								}}
								error={mailboxError}
							/>
						</div>
						<div style={{ width: '46%' }}>
							<CustomInputText
								placeholder={postalCodeForStore}
								value={postalCodeForStore}
								labelText={Lang.format('PostalCode')}
								onChange={(value) => {
									setPostalCodeForStore(value);
								}}
								error={postalCodeError}
								required
							/>
						</div>
					</div>
				</div>
			</div>
			<div>
			<div className='title-seconde'>
				<CustomHeader text={'פרטי התקשרות'} />
			</div>
			<div className='row'>
				<div className='half-line-wrapper'>
					<div className={'phone-number-container'}>
						<div className='phone-number-row'>
						<div className={'number-container'}>
							<div
							className={
								userDetailsStore.phoneNumberWithoutAreaCodeError || userDetailsStore.phoneNumberAreaCodeError
								? 'without-area-code-red'
								: ''
							}>
							<CustomInputText
								placeholder={phoneNumberWithoutAreaCode}
								value={phoneNumberWithoutAreaCode}
								labelText={'מספר טלפון'}
								type={TextTypes.Telephone}
								onChange={(value) => {
								userDetailsStore.setPhoneNumberWithoutAreaCode(value);
								}}
								required
								disabled={!!userDetailsStore.authStore.loggedInUser?.phoneNumber}
							/>
							</div>
						</div>
						<div className={'area-code-container'}>
							<div className={userDetailsStore.phoneNumberWithoutAreaCodeError || userDetailsStore.phoneNumberAreaCodeError? 'area-code-red': ''}>
								<div className={!!userDetailsStore.authStore.loggedInUser?.phoneNumber ? 'disabled-wrapper' : ''}>
									<CustomSelector
										options={possiblePhoneNumber}
										value={phoneNumberAreaCode ? phoneNumberAreaCode : ''}
										selectClassName='select-prefix-phone-number'
										onSelected={(value) => {
										userDetailsStore.setPhoneNumberAreaCode(value);
										}}
										text={""}
										isPrimitiveValue
									/>
								</div>
							</div>
						</div>
						</div>
						<div className='phone-number-row'>
						<div>
							{(userDetailsStore.phoneNumberWithoutAreaCodeError || userDetailsStore.phoneNumberAreaCodeError) && (
							<div className='error'>
								{userDetailsStore.phoneNumberError ? userDetailsStore.phoneNumberError : ''}
							</div>
							)}
						</div>
						</div>
					</div>
					<div className='working-place'>
						<CustomInputText
							value={user.email}
							labelText={Lang.format('Email')}
							type={TextTypes.Email}
							onChange={(value) => {
							userDetailsStore.setEmail(value);
							}}
							error={emailError}
							required
						/>
					</div>
				</div>
			</div>
			<div className='row'>
				<div className='half-line-wrapper'>
					<div className={'phone-number-container'}>
						<div className='phone-number-row'>
							<div className={'number-container'}>
										<div className={userDetailsStore.partnerPhoneWithoutAreaCodeError || userDetailsStore.partnerPhoneAreaCodeError ? 'without-area-code-red' : ''}>
											<CustomInputText
											labelText={Lang.format('PartnerPhone')}
											value={userDetailsStore.partnerPhoneWithoutAreaCode}
											onChange={userDetailsStore.setPartnerPhoneWithoutAreaCode}
											type={TextTypes.Telephone}
											error={partnerPhoneError}
											/>
										</div>
							</div>
							<div className="area-code-container">
									<div className={userDetailsStore.partnerPhoneWithoutAreaCodeError || userDetailsStore.partnerPhoneAreaCodeError ? 'area-code-red' : ''}>

										<CustomSelector
											options={possiblePhoneNumber}
											selectClassName='select-prefix-phone-number'
											value={userDetailsStore.partnerPhoneAreaCode || ''}
											onSelected={userDetailsStore.setPartnerPhoneAreaCode}
											error={
												userDetailsStore.partnerPhoneAreaCodeError ? '' : undefined
											}
											isPrimitiveValue
											
										/>
										</div>
							</div>
						</div>
						<div className='phone-number-row'>
							<div className='phone-number-row'>
									<div>
									{(userDetailsStore.partnerPhoneWithoutAreaCodeError || userDetailsStore.partnerPhoneAreaCodeError) && (
										<div className='error'>
										{userDetailsStore.partnerPhoneWithoutAreaCodeError || userDetailsStore.partnerPhoneAreaCodeError}
										</div>
									)}
									</div>
							</div>
						</div>
					</div>
					<div className='working-place'>
						<CustomInputText
						placeholder={friendMail}
						value={friendMail}
						type={TextTypes.Email}
						labelText={Lang.format('FriendEmail')}
						onChange={(value) => {
							userDetailsStore.setFriendEmail(value);
						}}
						error={friendEmailError}
						/>
					</div>
				</div>
			</div>

			</div>

		</div >
	);
}
export default observer(EditUserInputsProfile)
