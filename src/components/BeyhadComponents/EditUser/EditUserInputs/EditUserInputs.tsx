import { observer } from 'mobx-react';
import { CustomAutoComplete, CustomInputText, CustomSelector, TextTypes, Logger, CustomHeader } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { MESSAGES_STORE, USER_DETAILS_STORE } from '../../../../consts/stores';
import { Gender } from '../../../../models/enums';
import User from '../../../../models/User';
import rootStores from '../../../../stores';
import MessagesStore from '../../../../stores/MessagesStore';
import UserDetailsStore from '../../../../stores/UserDetailsStore';
import CustomInputDate from '../../../CustomComponents/CustomInputDate/CustomInputDate';
import EditorMessage from '../../EditorMessage/EditorMessage';
import { CustomMediaQuery } from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { useEffect } from 'react';
import ListBox from './ListBox';
import City from 'src/models/City';
import Street from 'src/models/Street';
import ValidationService from 'src/utils/ValidationService';

interface Props { }
interface IState { }
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const EditUserInputs: React.FC<Props> = ({ }) => {
	const _onCityChange = (val) => {
		userDetailsStore.address.setCityTextName(val.cityName);
	}

	const getGenderObjectBasedOnValue = () => { };
	const user: User = userDetailsStore.currentEditingUserDetails;
	const { allStreets } = userDetailsStore;
	const allCities = userDetailsStore.getCities;
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
		phoneNumberError,
		partnerPhoneError
	} = userDetailsStore;
	const possiblePhoneNumber = userDetailsStore.getPrefixPhoneNumbers;
	const { city, streetName, streetNumber, apartmentNumber, postalCode, entrance, mailbox } = userDetailsStore.address;
	const newBirthDay =
		userDetailsStore.currentEditingUserDetails && userDetailsStore.currentEditingUserDetails.birthDate
			? userDetailsStore.currentEditingUserDetails.birthDate.slice(0, 10)
			: '';
	const genderArray = [
		{ gender: Lang.format('Male'), key: Gender.MALE },
		{ gender: Lang.format('Female'), key: Gender.FEMALE },
		{ gender: Lang.format('Other'), key: Gender.OTHER },
	];
	const [cityName, setCityName] = React.useState<string>('');
	const [allCitiesFilter, setAllCitiesFilter] = React.useState<City[]>(userDetailsStore.getCities);
	const [showCityError, setShowCityError] = React.useState<boolean>(false);
	const [showCitiesListBox, setShowCitiesListBox] = React.useState<boolean>(false);
	const errorCity = Lang.format('PleaseChooseACityFromList');
	const [street, setStreet] = React.useState<string>('');
	const [allStreetsFilter, setAllStreetsFilter] = React.useState<Street[]>(allStreets);
	const [showStreerError, setShowStreetError] = React.useState<boolean>(false);
	const [showStreetsListBox, setShowStreetsListBox] = React.useState<boolean>(false);
	const [isSelectingCity, setIsSelectingCity] = React.useState(false);

	const errorStreet = Lang.format('PleaseChooseAStreetFromList');

	useEffect(() => {
		userDetailsStore.initConfig();
		userDetailsStore.initUserDetails();
		userDetailsStore.getAllCities();
		if (userDetailsStore.address.cityTextName)
			setCityName(userDetailsStore.address.cityTextName);

		if (userDetailsStore.address.streetName)
			setStreet(userDetailsStore.address.streetName);
	}, [])

	const changeCityName = (val) => {
		if (!ValidationService.ValidateCharactersOnly(val.currentTarget.value))
			val.currentTarget.value = val.currentTarget.value.slice(0, val.currentTarget.value.length - 1);

		userDetailsStore.setCityTextName(val.currentTarget.value);
		setCityName(val.currentTarget.value);

		if (val.currentTarget.value && allCities) {
			let tempCities = allCities.filter(c => c.cityName && c.cityName.includes(val.currentTarget.value));
			setAllCitiesFilter(tempCities);
			setShowCityError(false);

			if (tempCities.length > 0)
				setShowCitiesListBox(true);
			else
				setShowCitiesListBox(false);

		}
		else {
			setAllCitiesFilter(allCities);
			setShowCitiesListBox(true);
		}

	}
	const blurChangeCity = () => {
		setTimeout(() => {
			if (isSelectingCity)
				return
			const foundCity = allCities.find(c => c.cityName === cityName);
			if (foundCity) {
				userDetailsStore.address.setCity(foundCity);
				userDetailsStore.setCity(foundCity);
				setShowCityError(false);
				clearChoiceStreet(foundCity);
			}
			else {
				setShowCityError(true);
				setCityName("");
				userDetailsStore.address.setCity(new City());
			}
			if (showCitiesListBox) {
				setShowCitiesListBox(false);
			}
		}, 200);

	}
	const selectCityFromList = (city) => {
		setIsSelectingCity(true);

		userDetailsStore.setCity(city);
		setCityName(city.cityName)
		userDetailsStore.setCityTextName(city.cityName);
		clearChoiceStreet(city);

		setShowCitiesListBox(false);
		setIsSelectingCity(false);

	}
	const onFocusCityInput = () =>{
		setShowCityError(false);
		setShowCitiesListBox(true);
		let tempCities;
		if(cityName)
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
	const onFocusStreetInput = () =>{
		setShowStreetError(false);
		let tempStreets;
		if(streetName)
			tempStreets = allStreets.filter(s => s.streetName && s.streetName.includes(streetName))
				.reduce((unique: Street[], street: Street) => {
					if (!unique.some(s => s.streetName === street.streetName)) {
						unique.push(street);
					}
					return unique;
				}, []);
		else 
		tempStreets = allStreets.reduce((unique: Street[], street: Street) => {
			if (!unique.some(s => s.streetName === street.streetName)) {
				unique.push(street);
			}
			return unique;
		}, []);;
			setAllStreetsFilter(tempStreets);
			if(tempStreets.length>0)
				setShowStreetsListBox(true);
	};
	const changeStreetName = (val) => {
		if (!ValidationService.ValidateCharactersAndNumbersOnly(val.currentTarget.value))
			val.currentTarget.value = val.currentTarget.value.slice(0, val.currentTarget.value.length - 1);
		userDetailsStore.address.setStreetName(val.currentTarget.value)
		setStreet(val.currentTarget.value);

		if (val.target.value && allStreets) {
			let tempStreets = allStreets.filter(s => s.streetName && s.streetName.includes(val.target.value));
			setAllStreetsFilter(tempStreets);
			setShowStreetError(false);
			if (tempStreets.length > 0)
				setShowStreetsListBox(true);
			else
				setShowStreetsListBox(false);
		}
		else {
			setAllStreetsFilter(allStreets);
			setShowStreetsListBox(true);
		}
	};
	const blurChangeStreet = () => {
		setTimeout(() => {
			if (allStreets.filter(s => s.streetName == userDetailsStore.address.streetName).length > 0) {
				userDetailsStore.address.setStreetName(allStreets.filter(s => s.streetName == userDetailsStore.address.streetName)[0].streetName);
				setShowStreetError(false);
			}
			else {
				setShowStreetError(true);
				setStreet("");
				userDetailsStore.address.setStreetName("");
			}
			if (showStreetsListBox) {
				setShowStreetsListBox(false);
			}
		}, 200);

	}
	const selectStreetFromList = (street) => {
		userDetailsStore.address.setStreetName(street.streetName);
		setStreet(street.streetName);
		setShowStreetsListBox(false);
	}
	const clearChoiceStreet = async (city: City) => {
		if (userDetailsStore.address.city.cityName != city.cityName || (allStreetsFilter && allStreetsFilter[0] && allStreetsFilter[0].cityId !== city.cityId)) {
			setShowStreetError(true);
				setStreet("");
				userDetailsStore.address.setStreetName("");
		}

	}

	let genderAsValue = userDetailsStore.getGenderObjectBasedOnValue;
	let newChildrenNumber = childrenNumber ? childrenNumber : 0;
	if (parseInt(newChildrenNumber.toString()) > 9) {
		newChildrenNumber = Lang.format('OverNine');
	}
	return (
		<div className={'edit-user-inputs'}>
			<div className='cointerner-mobile'>
				<div className='title-seconde'>
					<CustomHeader text={'פרטי הלקוח'} />
				</div>
				<div className='row'>
					<CustomInputText
						value={user.identityNumber}
						labelText={Lang.format('ID')}
						type={TextTypes.Telephone}
						disabled
					/>
					<div style={{ height: '14px' }}></div>
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
				</div>
				<div className='row two-element'>
					<div className='edit-user-inputs-date-container'>
						<CustomInputDate
							// value={birthDate}
							value={newBirthDay}
							onChange={(value) => {
								userDetailsStore.setBirthDate(value);
							}}
							labelText={Lang.format('Birthday')}
						// error={birthDateError}
						/>
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
				</div>
			</div>
			<div className='cointerner-mobile'>
				<div className='title-seconde'>
					<CustomHeader text={Lang.format('פרטי הקשר')} />
				</div>
				<div className='row'>
					
					<div className={'phone-number-container'}>
						<div className='phone-number-row'>
							<div className={'number-container '}>
								<div
									className={
										userDetailsStore.phoneNumberWithoutAreaCodeError || userDetailsStore.phoneNumberAreaCodeError
											? 'without-area-code-red'
											: ''
									}>
									<CustomInputText
										placeholder={phoneNumberWithoutAreaCode}
										value={phoneNumberWithoutAreaCode}
										labelText={Lang.format('UserPhoneNumber')}
										type={TextTypes.Telephone}
										onChange={(value) => {
											userDetailsStore.setPhoneNumberWithoutAreaCode(value);
										}}
										required
									/>
								</div>
							</div>
							<div className={'area-code-container'}>
								<div
									className={
										userDetailsStore.phoneNumberWithoutAreaCodeError || userDetailsStore.phoneNumberAreaCodeError
											? 'area-code-red'
											: ''
									}>
									<CustomSelector
										options={possiblePhoneNumber}
										value={phoneNumberAreaCode ? phoneNumberAreaCode : ''}
										onSelected={(value) => {
											userDetailsStore.setPhoneNumberAreaCode(value);
										}}
										isPrimitiveValue
									/>
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
					<div className='email'>
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
					<div className='working-place'>
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
				{/* <div className='row'>
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
				</div> */}
			</div>
			<div className='cointerner-mobile'>
				<div className='title-seconde'>
					<CustomHeader text={Lang.format('כתובת')} />
				</div>
				<div className={'city-container row'}>
					<div className={`city ${userDetailsStore.streetNameError ? 'city-red' : ''}`}>
						<label className="label-city required">{Lang.format('City')}</label>
						<input
							type="text"
							className={showCityError ? 'city-input red' : 'city-input'}
							onChange={(val) => changeCityName(val)}
							placeholder=""
							value={cityName}
							onBlur={blurChangeCity}
							onFocus={onFocusCityInput}
						></input>
						{(showCityError || userDetailsStore.streetNameError) && <div className='custom-input-error-container'><label className='error custom-input-error-label'>{errorCity}</label></div>}
						{showCitiesListBox && (
							<ListBox items={allCitiesFilter} onMouseDown={() => setIsSelectingCity(true)} onSelected={(city) => selectCityFromList(city)} />)}
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
							className={showStreerError ? 'city-input red' : 'city-input'}
							onChange={(val) => changeStreetName(val)}
							placeholder=""
							value={street}
							onBlur={blurChangeStreet}
							onFocus={onFocusStreetInput}
						></input>
						{(showStreerError || userDetailsStore.streetNameError) && <div className='custom-input-error-container'> <label className='error custom-input-error-label'>{errorStreet}</label></div>}
						{showStreetsListBox && (
							<ListBox items={allStreetsFilter} onSelected={(street) => selectStreetFromList(street)} />)}

					</div>
					<div className={'three-elements'}>
						<CustomInputText
							placeholder={streetNumber}
							value={streetNumber}
							labelText={Lang.format('StreetNumber')}
							type={TextTypes.Number}
							onChange={(value) => {
								userDetailsStore.address.setStreetNumber(value);
							}}
							error={streetNumberError}
							required
						/>
						<CustomInputText
							placeholder={apartmentNumber}
							value={apartmentNumber}
							labelText={Lang.format('ApartmentNumber')}
							type={TextTypes.Number}
							onChange={(value) => {
								userDetailsStore.address.setApartmentNumber(value);
							}}
							error={apartmentNumberError}
							required
						/>

						<CustomInputText
							value={entrance}
							labelText={Lang.format('Entrance')}
							onChange={(value) => {
								userDetailsStore.address.setEntrance(value);
							}}

						/>
					</div>
				</div>
				<div className='row two-element postal-mailbox-row'>
					<div className='Mailbox-input'>
						<CustomInputText
							value={mailbox}
							type={TextTypes.Number}
							labelText={Lang.format('Mailbox')}
							onChange={(value) => {
								userDetailsStore.address.setMailbox(value);
							}}
							error={mailboxError}
						/>
					</div>
					<div className='Postal-code'>
						<CustomInputText
							placeholder={postalCode}
							value={postalCode}
							labelText={Lang.format('PostalCode')}
							onChange={(value) => {
								userDetailsStore.address.setPostalCode(value);
							}}
							error={postalCodeError}
							required
						/>
					</div>
				</div>
			</div>
			<div className='cointerner-mobile'>
				<div className='title-seconde'>
					<CustomHeader text={Lang.format('פרטים נוספים של בן/בת הזוג')} />
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
						<div className='email'>
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
			{/* <CustomMediaQuery.Mobile>
				<div className={'three-elements'}>
					<CustomInputText
						value={mailbox}
						type={TextTypes.Number}
						labelText={Lang.format('Mailbox')}
						onChange={(value) => {
							userDetailsStore.address.setMailbox(value);
						}}
						error={mailboxError}
					/>
					<CustomInputText
						placeholder={postalCode}
						value={postalCode}
						labelText={Lang.format('PostalCode')}
						onChange={(value) => {
							userDetailsStore.address.setPostalCode(value);
						}}
						error={postalCodeError}
					/>
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
				</div>
			</CustomMediaQuery.Mobile> */}
		</div>
	);
}
export default observer(EditUserInputs)
