import i18n from 'i18next';

let languages = require('./locales/translations.json');

let i18nInstance = null;

function getI18nInstance() {
    if ( !i18nInstance ) {
        i18nInstance = i18n.createInstance();

        i18nInstance
            .init({

                fallbackLng: 'eng',

                resources: languages,

                ns: ['translations'],
                defaultNS: 'translations',

                debug: false,

                interpolation: {
                    escapeValue: false, // not needed for react!!
                },

                react: {
                    wait: true,
                },

                saveMissing: true,
                missingKeyHandler: (lng, ns, key, fallbackValue) => {
                    // eslint-disable-next-line no-console
                    console.log(lng, ns, key, fallbackValue);
                },
            });
    }

    return i18nInstance;
}

export {
    getI18nInstance,
};
