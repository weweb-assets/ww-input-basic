import wwInputPopupStyle from './wwInputPopupStyle.vue';
import wwInputPopupConfig from './wwInputPopupConfig.vue';

wwLib.wwPopups.addPopup('wwInputPopupConfig', wwInputPopupConfig);
wwLib.wwPopups.addPopup('wwInputPopupStyle', wwInputPopupStyle);

wwLib.wwPopups.addStory('WWFORM_INPUT_CONFIG', {
    title: {
        en: 'Input Config',
        fr: "Configuration de l'entrée du formulaire",
    },
    type: 'wwInputPopupConfig',
    buttons: {
        OK: {
            text: {
                en: 'Ok',
                fr: 'Valider',
            },
            next: false,
        },
    },
});

wwLib.wwPopups.addStory('WWFORM_INPUT_STYLE', {
    title: {
        en: 'Input style',
        fr: "Style de l'entrée",
    },
    type: 'wwInputPopupStyle',
    buttons: {
        OK: {
            text: {
                en: 'Ok',
                fr: 'Valider',
            },
            next: false,
        },
    },
});

wwLib.wwPopups.addStory('WWFORM_INPUT_OPTIONS', {
    title: {
        en: 'Edit Form',
        fr: 'Editer le formulaire',
    },
    type: 'wwPopupEditWwObject',
    buttons: null,
    storyData: {
        list: {
            INPUT_CONFIG: {
                separator: {
                    en: 'Configuration',
                    fr: 'Configuration',
                },
                title: {
                    en: 'Change input configuration',
                    fr: "Changer la configuration de l'élement d'entrée",
                },
                desc: {
                    en: '',
                    fr: '',
                },
                icon: 'wwi wwi-config',
                shortcut: 'c',
                next: 'WWFORM_INPUT_CONFIG',
            },
            INPUT_STYLE: {
                separator: {
                    en: 'Style',
                    fr: 'Style',
                },
                title: {
                    en: 'Change input style',
                    fr: "Changer l'apparence de l'élement d'entrée",
                },
                desc: {
                    en: '',
                    fr: '',
                },
                icon: 'wwi wwi-edit-style',
                shortcut: 's',
                next: 'WWFORM_INPUT_STYLE',
            },
        },
    },
});
