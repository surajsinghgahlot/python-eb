function authHandler(typeProp, relatedTo = '') {
  const spaceSE = relatedTo ? ` ${relatedTo} ` : ' ';
  const spaceS = ` ${relatedTo}`;
  const spaceE = `${relatedTo} `;

  const authObj = {
    AUTH_SUCCESS: 'Authentication successful.',
    AUTH_FAILED: 'Authentication failed.',
    AUTH_TOKEN_SENT: 'Authentication token.',

    // Inactive
    INACTIVE_ACCOUNT: 'Account inactive contact Admin.',

    // JWT Token
    JWT_NEEDED: 'Empty JWT field in headers.',
    JWT_INVALID: 'Invalid JWT passed in headers.',
    JWT_EXPIRED: 'Expired JWT passed in headers.',

    // Token
    TOKEN_REQUIRED: 'Authentication token is required.',
    TOKEN_INVALID: 'Invalid authentication token passed.',
    TOKEN_EXPIRED: 'Expired authentication token passed.',

    // Invalid
    INVALID_USER_NAME: 'Input user name is invalid.',
    INVALID_EMAIL: 'Input email is invalid.',
    INVALID_PASSWORD: 'Input password is invalid.',
    PASSWORD_NOT_MATCH: "Old password doesn't match.",
    INVALID_CRED: `Unable to login${spaceSE}, invalid credentials.`,

    // Not found | registered
    UNIQUE_ID_NOT_FOUND: 'Unique Id not found.',
    EMAIL_NOT_FOUND: 'Email not found.',
    CRED_NOT_FOUND: 'Credentials not found.',
    PHONE_NOT_FOUND: 'Mobile number not found.',
    ACCOUNT_NOT_FOUND: `${spaceSE}account not found.`,
    EMAIL_MOB_NOT_REGISTERED: 'Email or Mobile Number not registered',

    // Duplicates
    DUPLICATE: `Duplicate ${relatedTo} found.`,
    DUPLICATE_EMAIL_PHONE: 'Duplicate email and phone found.',
    DUPLICATE_EMAIL: 'Duplicate email found.',
    DUPLICATE_PHONE: 'Duplicate phone number found.',
    DUPLICATE_USER_NAME: 'Duplicate user name found.',

    UNABLE_EMAIL: `Unable to create${spaceSE}, duplicate email found.`,
    UNABLE_PHONE: `Unable to create${spaceSE}, duplicate mobile number found.`,
    UNABLE_USER_NAME: `Unable to create${spaceSE}, duplicate${spaceSE} name found.`,
    UNABLE_EMAIL_PHONE: `Unable to create${spaceSE}, duplicate email and mobile number found.`,
    UNABLE_PAN: 'Duplicate PAN card details found.',

    // Already Exist
    NAME_EMAIL_PHONE_EXIST: `Unable to create${spaceSE}, email, phone and username already exists.`,
    EMAIL_PHONE_EXIST: `Unable to create${spaceSE}, email and phone already exists.`,
    EMAIL_EXIST: `Unable to create${spaceSE}, Email already exists.`,
    USER_NAME_EXIST: `Unable to create${spaceSE}, Username already exists.`,
    MOBILE_EXIST: `Unable to create${spaceSE}, Mobile number already exist.`,

    // E-Mail
    OTP_MAIL_SENT: 'OTP sent on registered email address.',

    // Mobile
    OTP_SENT: 'OTP sent on registered mobile number.',
    OTP_TEMP: 'Please enter OTP to change password.',
    INVALID_OTP: 'Invalid OTP please enter a valid otp.',

    // Changed
    CHANGE_PASSWORD: 'Password changed successfully.',
  };

  return authObj[typeProp];
}

function commonHandler(typeProp, relatedTo = '', idx = 1) {
  const spaceSE = relatedTo ? ` ${relatedTo} ` : ' ';
  const spaceS = ` ${relatedTo}`;
  const spaceE = `${relatedTo} `;
  const forCreate = [
    'add',
    'added',
    'create',
    'created', // 3
    'place',
    'placed',
    'register',
    'registered', // 7
  ];
  const forRead = ['fetch', 'fetched', 'list', 'listed', 'login', 'logged in'];
  const forUpdate = ['update', 'updated'];
  const forDelete = ['delete', 'deleted', 'remove', 'removed'];

  const authObj = {
    CREATE: `${spaceE}${forCreate[idx]} successfully.`,
    READ: `${spaceE}${forRead[idx]} successfully.`,
    UPDATE: `${spaceE}${forUpdate[idx]} successfully.`,
    DELETE: `${spaceE}${forDelete[idx]} successfully.`,

    ERR_CREATE: `Unable to ${forCreate[idx]}${spaceSE}.`,
    ERR_READ: `Unable to ${forRead[idx]}${spaceSE}.`,
    ERR_UPDATE: `Unable to ${forUpdate[idx]}${spaceSE}.`,
    ERR_DELETE: `Unable to ${forDelete[idx]}${spaceSE}.`,

    DUPLICATE: `Duplicate ${relatedTo} found.`,

    // COUNT_TRUE: `${type} count ${forRead[idx]} successfully.`,
    // COUNT_FALSE: `Unable to ${forCreate[idx]} ${addSpace} count`,

    NOT_FOUND: `${spaceE}not found.`,
  };

  return authObj[typeProp];
}

function customErrorObj(typeProp) {
  const spaceSE = relatedTo ? ` ${relatedTo} ` : ' ';
  const spaceS = ` ${relatedTo}`;
  const spaceE = `${relatedTo} `;

  const authObj = {
    OBJECT_ID: 'new Error',
  };

  return authObj[typeProp];
}

export { authHandler, commonHandler, customErrorObj };
