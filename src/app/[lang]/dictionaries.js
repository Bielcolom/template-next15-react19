import "server-only";

const BASEPATH = "./locales";
const dictionaries = {
    en: {
        common: () => import(`${BASEPATH}/en/common.json`).then((module) => module.default),
        user: () => import(`${BASEPATH}/en/user.json`).then((module) => module.default),
    },
    es: {
        common: () => import(`${BASEPATH}/es/common.json`).then((module) => module.default),
        user: () => import(`${BASEPATH}/es/user.json`).then((module) => module.default),
    },
};

export const getDictionary = async (locale, fileType) => {
    const dictionary = dictionaries[locale];
    return dictionary && dictionary[fileType] ? await dictionary[fileType]() : null;
};
