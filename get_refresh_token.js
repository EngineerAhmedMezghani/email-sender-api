const { google } = require('googleapis');

const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'YOUR_REDIRECT_URI_HERE'; // e.g. http://localhost

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const url = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // important to get refresh_token
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', url);

// After you visit the URL and authorize, Google will redirect to your redirect URI with ?code=YOUR_CODE

// Run this after you get the code from the URL (replace YOUR_CODE_HERE):
// async function getToken() {
//   const { tokens } = await oAuth2Client.getToken('YOUR_CODE_HERE');
//   console.log('Refresh Token:', tokens.refresh_token);
// }
// getToken();
