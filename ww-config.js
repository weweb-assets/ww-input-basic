export default {
    editor: {
        label: { en: 'Form Input', fr: 'Entrée de Formulaire' },
    },
    properties: {
        globalStyle: {
            type: 'Object',
            options: {
                item: {
                    color: {
                        label: { en: 'Color', fr: 'Couleur' },
                        type: 'Color',
                    },
                    fontFamily: {
                        type: 'FontFamily',
                        label: { en: 'Font family', fr: 'Font' },
                    },
                    fontSize: {
                        type: 'Length',
                        label: { en: 'Font size', fr: 'Taille du texte' },
                        options: {
                            unitChoices: [
                                { value: 'px', label: 'px', min: 10, max: 50 },
                                { value: 'em', label: 'em', min: 1, max: 50 },
                                { value: 'rem', label: 'rem', min: 1, max: 50 },
                            ],
                        },
                    },
                },
            },
            defaultValue: {
                fontSize: '15px',
                fontFamily: '',
                color: 'black',
            },
        },
        globalSettings: {
            type: 'Object',
            section: 'settings',
            options: {
                item: {
                    variable: {
                        label: {
                            en: 'Associated variable',
                        },
                        type: 'Variable',
                        options: {
                            types: ['String', 'Number', 'Query'],
                        },
                        section: 'settings',
                        defaultValue: null,
                        hidden: content => !content.variable,
                    },
                    initialValue: {
                        label: {
                            en: 'Initial value',
                        },
                        type: 'Text',
                        section: 'settings',
                        bindable: true,
                        hidden: content => content.globalSettings.variable,
                        defaultValue: '',
                    },
                    name: {
                        label: { en: 'Name', fr: 'Nom' },
                        type: 'Text',
                        options: { placeholder: 'Name' },
                    },
                    required: {
                        label: { en: 'Required', fr: 'Requis' },
                        type: 'OnOff',
                    },
                    type: {
                        label: { en: 'Input type', fr: 'Input type' },
                        type: 'TextSelect',
                        options: {
                            options: [
                                { value: 'text', label: { en: 'Short answer', fr: 'Texte' } },
                                { value: 'textarea', label: { en: 'Long answer', fr: 'Texte' } },
                                { value: 'email', label: { en: 'Email', fr: 'Email' } },
                                { value: 'password', label: { en: 'Password', fr: 'Mot de passe' } },
                                { value: 'number', label: { en: 'Number', fr: 'Nombre' } },
                                { value: 'decimal', label: { en: 'Decimal', fr: 'Decimal' } },
                                { value: 'date', label: { en: 'Date', fr: 'Date' } },
                                { value: 'time', label: { en: 'Time', fr: 'Heure' } },
                                { value: 'tel', label: { en: 'Phone', fr: 'Téléphone' } },
                            ],
                        },
                    },
                    precision: {
                        label: { en: 'Precision', fr: 'Precision' },
                        type: 'TextSelect',
                        options: {
                            options: [
                                { value: '0.1', label: { en: '1.0' } },
                                { value: '0.01', label: { en: '1.00' } },
                                { value: '0.001', label: { en: '1.000' } },
                                { value: '0.0001', label: { en: '1.0000' } },
                                { value: '0.00001', label: { en: '1.00000' } },
                                { value: '0.000001', label: { en: '1.000000' } },
                                { value: '0.0000001', label: { en: '1.0000000' } },
                                { value: '0.00000001', label: { en: '1.00000000' } },
                            ],
                        },
                        hidden: content => content.globalSettings.type !== 'decimal',
                    },
                    placeholder: {
                        label: { en: 'Placeholder', fr: 'Placeholder' },
                        type: 'Text',
                        options: { placeholder: 'Type text' },
                        hidden: content =>
                            content.globalSettings.type === 'date' || content.globalSettings.type === 'time',
                        multiLang: true,
                    },
                    rows: {
                        label: { en: 'Rows', fr: 'Rows' },
                        type: 'Number',
                        options: { min: 1, max: 25 },
                        hidden: content => content.globalSettings.type !== 'textarea',
                    },
                    resize: {
                        label: { en: 'Resize', fr: 'Resize' },
                        type: 'OnOff',
                        hidden: content => content.globalSettings.type !== 'textarea',
                    },
                    min: {
                        label: { en: 'Min number', fr: 'Min number' },
                        type: 'Number',
                        options: { min: 0, max: 100 },
                        hidden: content =>
                            content.globalSettings.type !== 'number' && content.globalSettings.type !== 'decimal',
                    },
                    max: {
                        label: { en: 'Max number', fr: 'Max number' },
                        type: 'Number',
                        options: { min: 0, max: 10000 },
                        hidden: content =>
                            content.globalSettings.type !== 'number' && content.globalSettings.type !== 'decimal',
                    },
                },
            },
            defaultValue: {
                type: 'text',
                name: '',
                required: true,
                placeholder: {},
                min: 0,
                max: 10000,
                precision: '0.1',
                rows: 4,
                cols: 10,
                resize: false,
            },
        },
    },
};
