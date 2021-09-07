const PLACEHOLDER_SETTINGS = {
    ...(function () {
        const placeholders = {};
        for (const lang of wwLib.wwWebsiteData.getCurrentPage().langs) {
            placeholders[`placeholder_${lang}`] = {
                path: `globalSettings.placeholder.${lang}`,
                label: { en: `placeholder (${lang})`, fr: 'fr' },
                type: 'Text',
                options: {
                    placeholder: 'firstname',
                },
            };
        }
        return placeholders;
    })(),
};

const TEXTAREA_SETTINGS = {
    ...(function () {
        const placeholders = {};
        for (const lang of wwLib.wwWebsiteData.getCurrentPage().langs) {
            placeholders[`placeholder_${lang}`] = {
                path: `globalSettings.placeholder.${lang}`,
                label: { en: `placeholder (${lang})`, fr: 'fr' },
                type: 'Textarea',
                options: {
                    placeholder: 'Type text',
                },
            };
        }
        return placeholders;
    })(),
    rows: {
        path: 'globalSettings.rows',
        label: { en: 'Rows', fr: 'fr' },
        type: 'Number',
        options: {
            min: 1,
            max: 25,
        },
    },
    resize: {
        path: 'globalSettings.resize',
        label: { en: 'Resize', fr: 'fr' },
        type: 'OnOff',
    },
};

const NUMBER_SETTINGS = {
    ...PLACEHOLDER_SETTINGS,
    min: {
        path: 'globalSettings.min',
        label: { en: 'Min number', fr: 'fr' },
        type: 'Number',
        options: {
            min: 0,
            max: 100,
        },
    },
    max: {
        path: 'globalSettings.max',
        label: { en: 'Max number', fr: 'fr' },
        type: 'Number',
        options: {
            min: 0,
            max: 100,
        },
    },
};

const DECIMAL_SETTINGS = {
    precision: {
        path: 'globalSettings.precision',
        label: {
            en: 'Precision',
            fr: 'Precision',
        },
        type: 'TextSelect',
        options: {
            options: [
                { value: '1.0', label: { en: '1.0' } },
                { value: '1.00', label: { en: '1.00' } },
                { value: '1.000', label: { en: '1.000' } },
                { value: '1.0000', label: { en: '1.0000' } },
                { value: '1.00000', label: { en: '1.00000' } },
                { value: '1.000000', label: { en: '1.000000' } },
                { value: '1.0000000', label: { en: '1.0000000' } },
                { value: '1.00000000', label: { en: '1.00000000' } },
            ],
        },
    },
    ...NUMBER_SETTINGS,
};

const DATE_SETTINGS = {};

const TIME_SETTINGS = {};

export const getSettingsConfigurations = type => {
    switch (type) {
        case 'textarea':
            return TEXTAREA_SETTINGS;
        case 'number':
            return NUMBER_SETTINGS;
        case 'decimal':
            return DECIMAL_SETTINGS;
        case 'date':
            return DATE_SETTINGS;
        case 'time':
            return TIME_SETTINGS;
        default:
            return PLACEHOLDER_SETTINGS;
    }
};
