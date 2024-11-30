
//////////**********  URLS  ***********////////////

export const INDEX_URL = "/";
export const FORGOT_PASSWORD_URL = "/forgotPassword";

export const LOGIN_URL = "/login";
export const REGISTER_URL = "/register";

export const BACKOFFICE_URL = "/backoffice";
export const BACKOFFICE_USERROLES_URL = `${BACKOFFICE_URL}/userRoles`;


export const ROUTES = {
    PUBLIC: [LOGIN_URL, REGISTER_URL],
    PRIVATE: [BACKOFFICE_URL],
    SUPERADMIN: [BACKOFFICE_URL, BACKOFFICE_USERROLES_URL],
};

export const PUBLIC_SIGNED_OUT_URLS = [INDEX_URL, FORGOT_PASSWORD_URL, LOGIN_URL, REGISTER_URL];


export const PRIVATE_USER_URLS = [
    INDEX_URL,
];

export const PRIVATE_ADMIN_URLS = [
    BACKOFFICE_URL,
    ...PRIVATE_USER_URLS,
];

export const PRIVATE_SUPERADMIN_URLS = [
    BACKOFFICE_USERROLES_URL,
    ...PRIVATE_ADMIN_URLS,

];

export const ALL_URLS = [
    ...PUBLIC_SIGNED_OUT_URLS,
    ...PRIVATE_SUPERADMIN_URLS,
];