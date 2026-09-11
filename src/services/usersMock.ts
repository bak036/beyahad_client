import User from '../models/User';

export const tokenMock =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6IjEwMDE5MSAgICIsImNyZWF0aW9uRGF0ZSI6IjIwMDMyMDE5IiwiZXhwaXJlZERhdGUiOiIyMDA2MjAxOSIsIm5iZiI6MTU1MzA3MjYyMCwiZXhwIjoxNTYxMDE3ODIwLCJpYXQiOjE1NTMwNzI2MjB9.8b9x3YDKNuJF-1UtV-UuK0lbKyZd98HZvpkT3KhXmZ4';

const loggedInMockTemp = new User();
loggedInMockTemp.firstName = 'firstName';
loggedInMockTemp.lastName = 'lastName';
loggedInMockTemp.token = tokenMock;
loggedInMockTemp.id = 'id';
loggedInMockTemp.identityNumber = 'identityNumber';

const JoinedMockTemp = new User();
loggedInMockTemp.firstName = 'joined';
loggedInMockTemp.lastName = 'joind lastName';
loggedInMockTemp.token = tokenMock;
loggedInMockTemp.id = 'kjoijn id';
loggedInMockTemp.identityNumber = 'joind identityNumber';

export const loggedInMock = new User(loggedInMockTemp);
export const JoinedMock = new User(JoinedMockTemp);
