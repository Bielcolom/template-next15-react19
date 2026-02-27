
//////////**********  URLS  ***********////////////

export const SUPPORTED_LOCALES = ["es", "en"];
export const DEFAULT_LOCALE = "es";

export const INDEX_URL = "/";
export const ABOUT_URL = "/about";
export const FORGOT_PASSWORD_URL = "/forgot-password";

export const LOGIN_URL = "/login";
export const REGISTER_URL = "/register";

export const PRODUCTS_URL = "/products";
export const getProductDetailUrl = (productId) => `${PRODUCTS_URL}/${productId}`;
export const PRODUCT_1_URL = getProductDetailUrl("1");

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

export const getLocaleFromPath = (url) => {
    const normalizedUrl = url?.startsWith("/") ? url : `/${url || ""}`;
    const firstSegment = normalizedUrl.split("/").filter(Boolean)[0];
    return SUPPORTED_LOCALES.includes(firstSegment) ? firstSegment : null;
};

export const stripLocaleFromPath = (url) => {
    const normalizedUrl = url?.startsWith("/") ? url : `/${url || ""}`;
    const segments = normalizedUrl.split("/").filter(Boolean);
    if (!SUPPORTED_LOCALES.includes(segments[0])) {
        return normalizedUrl === "" ? "/" : normalizedUrl;
    }

    const pathWithoutLocale = `/${segments.slice(1).join("/")}`.replace(/\/$/, "");
    return pathWithoutLocale || "/";
};

export const getLocalizedPath = (url, locale = DEFAULT_LOCALE) => {
    const safePath = url?.startsWith("/") ? url : `/${url || ""}`;
    const cleanPath = stripLocaleFromPath(safePath);
    const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
    return cleanPath === INDEX_URL ? `/${safeLocale}` : `/${safeLocale}${cleanPath}`;
};
