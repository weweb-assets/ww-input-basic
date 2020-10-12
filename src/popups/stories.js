import wwInputPopupConfig from './wwInputPopupConfig.vue';

wwLib.wwPopups.addPopup('wwInputPopupConfig', wwInputPopupConfig);

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
