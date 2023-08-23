export default {
    inherit: {
        type: 'ww-text',
        exclude: ['text'],
    },
    editor: {
        label: { en: 'Form Input', fr: 'Entrée de Formulaire' },
        icon: 'text-input',
        customSettingsPropertiesOrder: [
            'value',
            [
                'type',
                'precision',
                'min',
                'max',
                'step',
                'timePrecision',
                'hideArrows',
                'displayPassword',
                'rows',
                'resize',
            ],
            ['placeholder'],
            ['readonly', 'required'],
            ['debounce', 'debounceDelay'],
        ],
        customStylePropertiesOrder: [
            'placeholderColor',
            'advancedPlaceholder',
            'forceAnimation',
            [
                'animationTrigger',
                'placeholderPosition',
                'placeholderScaling',
                'positioningAjustment',
                'transition',
                'timingFunction',
            ],
        ],
    },
    states: ['focus', 'readonly'],
    actions: [{ label: 'Focus element', action: 'focusInput' }],
    triggerEvents: [
        { name: 'change', label: { en: 'On change' }, event: { value: '' }, default: true },
        { name: 'initValueChange', label: { en: 'On init value change' }, event: { value: '' } },
        { name: 'onEnterKey', label: { en: 'On enter key' }, event: { value: '' } },
        { name: 'focus', label: { en: 'On focus' }, event: null },
        { name: 'blur', label: { en: 'On blur' }, event: null },
    ],
    properties: {
        placeholderColor: {
            label: {
                en: 'Placeholder color',
            },
            type: 'Color',
            options: {
                nullable: true,
            },
            bindable: true,
            responsive: true,
            states: true,
            hidden: content => content.advancedPlaceholder,
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'A string that represents a color code: `"rebeccapurple" | "#00ff00" | "rgb(214, 122, 127)"`',
            },
            /* wwEditor:end */
        },
        advancedPlaceholder: {
            label: 'Advanced placeholder',
            type: 'OnOff',
            defaultValue: false,
            classes: true,
        },
        forceAnimation: {
            label: { en: 'Force animation' },
            type: 'OnOff',
            defaultValue: false,
            classes: true,
            hidden: content => !content.advancedPlaceholder,
        },
        animationTrigger: {
            label: { en: 'Trigger on' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'focus', label: { en: 'Focus' } },
                    { value: 'input', label: { en: 'Input' } },
                ],
            },
            responsive: true,
            classes: true,
            defaultValue: 'input',
            hidden: content => !content.advancedPlaceholder,
        },
        placeholderPosition: {
            label: { en: 'Active position' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'inside', label: { en: 'Inside' } },
                    { value: 'outside', label: { en: 'Outside' } },
                ],
            },
            responsive: true,
            classes: true,
            defaultValue: 'outside',
            hidden: content => !content.advancedPlaceholder,
        },
        placeholderScaling: {
            label: { en: 'Active size' },
            type: 'Number',
            options: { min: 0, max: 1, step: 0.1 },
            responsive: true,
            classes: true,
            defaultValue: 0.8,
            hidden: content => !content.advancedPlaceholder,
        },
        positioningAjustment: {
            type: 'Length',
            label: {
                en: 'Active margin',
            },
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 500 }],
            },
            responsive: true,
            defaultValue: '0px',
            classes: true,
            hidden: content => !content.advancedPlaceholder,
        },
        transition: {
            type: 'Length',
            label: {
                en: 'Transition',
            },
            options: {
                unitChoices: [{ value: 'ms', label: 'ms', min: 0, max: 2000 }],
            },
            responsive: true,
            defaultValue: '400ms',
            classes: true,
            hidden: content => !content.advancedPlaceholder,
        },
        timingFunction: {
            label: { en: 'Timing function' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'cubic-bezier(0, 1.08, 0.76, 1)', label: { en: 'auto' } },
                    { value: 'ease', label: { en: 'ease' } },
                    { value: 'ease-in', label: { en: 'ease-in' } },
                    { value: 'ease-out', label: { en: 'ease-out' } },
                    { value: 'ease-in-out', label: { en: 'ease-in-out' } },
                    { value: 'linear', label: { en: 'linear' } },
                ],
            },
            defaultValue: 'cubic-bezier(0, 1.08, 0.76, 1)',
            classes: true,
            hidden: content => !content.advancedPlaceholder,
        },
        value: {
            label: {
                en: 'Init value',
            },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                validations: [
                    {
                        type: 'string',
                    },
                    {
                        type: 'number',
                    },
                ],
                tooltip: 'A string or a number depending on the type of input chosen: `42`, `"My message"`',
            },
            /* wwEditor:end */
        },
        type: {
            label: { en: 'Input type', fr: 'Input type' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'text', label: { en: 'Short answer', fr: 'Texte' } },
                    { value: 'textarea', label: { en: 'Long answer', fr: 'Texte' } },
                    { value: 'email', label: { en: 'Email', fr: 'Email' } },
                    { value: 'search', label: { en: 'Search', fr: 'Recherche' } },
                    { value: 'password', label: { en: 'Password', fr: 'Mot de passe' } },
                    { value: 'number', label: { en: 'Number', fr: 'Nombre' } },
                    { value: 'decimal', label: { en: 'Decimal', fr: 'Decimal' } },
                    { value: 'date', label: { en: 'Date', fr: 'Date' } },
                    { value: 'time', label: { en: 'Time', fr: 'Heure' } },
                    { value: 'tel', label: { en: 'Phone', fr: 'Téléphone' } },
                    { value: 'color', label: { en: 'Color', fr: 'Couleur' } },
                ],
            },
            section: 'settings',
            defaultValue: 'text',
        },
        displayPassword: {
            label: {
                en: 'Display password',
            },
            section: 'settings',
            type: 'OnOff',
            bindable: true,
            defaultValue: false,
            classes: true,
            hidden: content => content.type !== 'password',
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean that defines if the input should display the password: `true | false`',
            },
            /* wwEditor:end */
        },
        readonly: {
            label: { en: 'Read only', fr: 'Lecture seule' },
            type: 'OnOff',
            section: 'settings',
            bindable: true,
            defaultValue: false,
            hidden: (content, sidePanelContent, boundProps, wwProps) => !!(wwProps && wwProps.readonly !== undefined),
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean that defines if the input is in readonly: `true | false`',
            },
            /* wwEditor:end */
        },
        required: {
            label: { en: 'Required', fr: 'Requis' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean that defines if the input is required: `true | false`',
            },
            /* wwEditor:end */
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
            section: 'settings',
            hidden: content => content.type !== 'decimal',
            defaultValue: '0.1',
        },
        step: {
            label: { en: 'Step', fr: 'Step' },
            section: 'settings',
            type: 'Number',
            options: content =>
                content.type === 'decimal'
                    ? { min: 0, max: 10 * parseFloat(content.precision), step: parseFloat(content.precision) }
                    : { min: 1, max: 100, step: 1 },
            defaultValue: 1,
            bindable: true,
            hidden: content => content.type !== 'decimal' && content.type !== 'number',
        },
        timePrecision: {
            label: { en: 'Time precision', fr: 'Time precision' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 3600, label: { en: 'hh' } },
                    { value: 60, label: { en: 'hh:mm' } },
                    { value: 1, label: { en: 'hh:mm:ss' } },
                    { value: 0.1, label: { en: 'hh:mm:ss.s' } },
                ],
            },
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip:
                    'A number representing the step: 60 for minutes only, 1 to enable seconds, 0.1 to enable milliseconds`',
            },
            /* wwEditor:end */
            section: 'settings',
            hidden: content => content.type !== 'time',
            defaultValue: 1,
        },
        placeholder: {
            label: { en: 'Placeholder', fr: 'Placeholder' },
            type: 'Text',
            options: { placeholder: 'Type text' },
            section: 'settings',
            hidden: content => content.type === 'date' || content.type === 'time',
            multiLang: true,
            bindable: true,
            defaultValue: {},
            /* wwEditor:start */
            bindingValidation: {
                validations: [
                    {
                        type: 'string',
                    },
                    {
                        type: 'number',
                    },
                ],
                tooltip: 'A string or a number depending on the type of input chosen: `42`, `"My placeholder"`',
            },
            /* wwEditor:end */
        },
        rows: {
            label: { en: 'Rows', fr: 'Rows' },
            type: 'Number',
            options: { min: 1, max: 25 },
            section: 'settings',
            hidden: content => content.type !== 'textarea',
            defaultValue: 4,
            classes: true,
        },
        resize: {
            label: { en: 'Resize', fr: 'Resize' },
            type: 'OnOff',
            hidden: content => content.type !== 'textarea',
            defaultValue: false,
            classes: true,
        },
        min: {
            label: { en: 'Min number', fr: 'Min number' },
            type: 'Number',
            options: { min: 0, max: 100 },
            section: 'settings',
            hidden: content => content.type !== 'number' && content.type !== 'decimal',
            defaultValue: '0',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'A number that defines the minimum value: `50`',
            },
            /* wwEditor:end */
        },
        max: {
            label: { en: 'Max number', fr: 'Max number' },
            type: 'Number',
            options: { min: 0, max: 10000 },
            section: 'settings',
            hidden: content => content.type !== 'number' && content.type !== 'decimal',
            defaultValue: '10000',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'A number that defines the maximum value: `500`',
            },
            /* wwEditor:end */
        },
        hideArrows: {
            label: { en: 'Hide arrows', fr: 'Masquer les flèches' },
            type: 'OnOff',
            section: 'settings',
            hidden: content => content.type !== 'number' && content.type !== 'decimal',
            defaultValue: false,
            classes: true,
        },
        debounce: {
            label: { en: 'Debounce' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
        },
        debounceDelay: {
            type: 'Length',
            label: {
                en: 'Delay',
            },
            options: {
                unitChoices: [{ value: 'ms', label: 'ms', min: 1, max: 5000 }],
            },
            section: 'settings',
            defaultValue: '500ms',
            hidden: content => !content.debounce,
        },
        placeholderElement: {
            hidden: true,
            defaultValue: null,
        },
    },
};
