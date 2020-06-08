<template>
    <div class="elem-input">
        <input class="input" :type="wwObject.content.data.config.type" :name="wwObject.content.data.config.name" :required="wwObject.content.data.config.required" :pattern="wwObject.content.data.config.pattern || '.*'" :placeholder="wwLang.getText(wwObject.content.data.config.placeholder)" :style="style" />
    </div>
</template>

<script>
/* wwManager:start */
import wwInputPopupStyle from './popup/wwInputPopupStyle.vue'
import wwInputPopupConfig from './popup/wwInputPopupConfig.vue'

wwLib.wwPopups.addPopup('wwInputPopupConfig', wwInputPopupConfig)
wwLib.wwPopups.addPopup('wwInputPopupStyle', wwInputPopupStyle)

wwLib.wwPopups.addStory('WWFORM_INPUT_CONFIG', {
    title: {
        en: 'Input Config',
        fr: 'Configuration de l\'entrée du formulaire'
    },
    type: 'wwInputPopupConfig',
    buttons: {
        OK: {
            text: {
                en: 'Ok',
                fr: 'Valider'
            },
            next: false
        }
    }
})

wwLib.wwPopups.addStory('WWFORM_INPUT_STYLE', {
    title: {
        en: 'Input style',
        fr: 'Style de l\'entrée'
    },
    type: 'wwInputPopupStyle',
    buttons: {
        OK: {
            text: {
                en: 'Ok',
                fr: 'Valider'
            },
            next: false
        }
    }
})

wwLib.wwPopups.addStory('WWFORM_INPUT_OPTIONS', {
    title: {
        en: 'Edit Form',
        fr: 'Editer le formulaire'
    },
    type: 'wwPopupEditWwObject',
    buttons: null,
    storyData: {
        list: {
            INPUT_CONFIG: {
                separator: {
                    en: 'Configuration',
                    fr: 'Configuration'
                },
                title: {
                    en: 'Change input configuration',
                    fr: 'Changer la configuration de l\'élement d\'entrée'
                },
                desc: {
                    en: '',
                    fr: ''
                },
                icon: 'wwi wwi-config',
                shortcut: 'c',
                next: 'WWFORM_INPUT_CONFIG'
            },
            INPUT_STYLE: {
                separator: {
                    en: 'Style',
                    fr: 'Style'
                },
                title: {
                    en: 'Change input style',
                    fr: 'Changer l\'apparence de l\'élement d\'entrée'
                },
                desc: {
                    en: '',
                    fr: ''
                },
                icon: 'wwi wwi-edit-style',
                shortcut: 's',
                next: 'WWFORM_INPUT_STYLE'
            },
        }
    }
})
/* wwManager:end */

export default {
    name: "ww-form-input",
    props: {
        wwObjectCtrl: Object,
    },
    data() {
        return {
            wwLang: wwLib.wwLang
        }
    },
    computed: {
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        style() {
            let style = {};
            let wwObjectStyle = this.wwObject.content.data.style || {};

            style.color = wwObjectStyle.color || 'black';
            style.fontSize = `${(wwObjectStyle.fontSize || 1)}rem`;
            style.backgroundColor = wwObjectStyle.backgroundColor || '#FFFFFF';
            style.borderRadius = `${(wwObjectStyle.borderRadius || 1)}px`;
            style.borderWidth = `${(wwObjectStyle.borderWidth || 0)}px`;
            style.borderColor = wwObjectStyle.borderColor || '#000000';
            style.borderStyle = wwObjectStyle.borderStyle || 'solid';
            style.boxShadow = this.getShadow(this.wwObject.content.data.style);
            style.padding = wwObjectStyle.padding ? `${(wwObjectStyle.padding / 2)}px ${wwObjectStyle.padding}px` : '0';
            return style;
        },
    },
    methods: {
        getShadow(wwObjectStyle) {
            wwObjectStyle = wwObjectStyle || {};
            const shadow = wwObjectStyle.boxShadow || {};
            if (shadow.x || shadow.y || shadow.b || shadow.s || shadow.c) {
                return `${shadow.x}px ${shadow.y}px ${shadow.b}px ${shadow.s}px ${shadow.c}`;
            }
            return '';
        },
        /* wwManager:start */
        async options() {
            let copyObj = JSON.parse(JSON.stringify(this.wwObject)) // to clean
            copyObj.uniqueId += 1
            let options = {
                firstPage: 'WWFORM_INPUT_OPTIONS',
                data: {
                    wwObject: copyObj,
                }
            }
            try {
                const result = await wwLib.wwPopups.open(options);
                wwLib.wwObjectHover.setLock(this);
                /*=============================================m_ÔÔ_m=============================================\
                    INPUT STYLE
                \================================================================================================*/
                this.wwObject.content.data.style = this.wwObject.content.data.style || {};
                if (typeof (result.inputStyle) != 'undefined') {
                    if (typeof (result.inputStyle.borderColor) != 'undefined') {
                        this.wwObject.content.data.style.borderColor = result.inputStyle.borderColor;
                    }
                    if (typeof (result.inputStyle.borderRadius) != 'undefined') {
                        this.wwObject.content.data.style.borderRadius = result.inputStyle.borderRadius;
                    }
                    if (typeof (result.inputStyle.borderStyle) != 'undefined') {
                        this.wwObject.content.data.style.borderStyle = result.inputStyle.borderStyle;
                    }
                    if (typeof (result.inputStyle.borderWidth) != 'undefined') {
                        this.wwObject.content.data.style.borderWidth = result.inputStyle.borderWidth;
                    }
                    if (typeof (result.inputStyle.boxShadow) != 'undefined') {
                        this.wwObject.content.data.style.boxShadow = result.inputStyle.boxShadow;
                    }
                    if (typeof (result.inputStyle.backgroundColor) != 'undefined') {
                        this.wwObject.content.data.style.backgroundColor = result.inputStyle.backgroundColor;
                    }
                    if (typeof (result.inputStyle.color) != 'undefined') {
                        this.wwObject.content.data.style.color = result.inputStyle.color;
                    }
                    if (typeof (result.inputStyle.fontSize) != 'undefined') {
                        this.wwObject.content.data.style.fontSize = result.inputStyle.fontSize;
                    }
                    if (typeof (result.inputStyle.padding) != 'undefined') {
                        this.wwObject.content.data.style.padding = result.inputStyle.padding;
                    }
                    this.wwObjectCtrl.update(this.wwObject);
                }
                /*=============================================m_ÔÔ_m=============================================\
                    INPUT CONFIG
                \================================================================================================*/
                this.wwObject.content.data.config = this.wwObject.content.data.config || {};
                if (typeof (result.inputConfig) != 'undefined') {
                    if (typeof (result.inputConfig.type) != 'undefined') {
                        this.wwObject.content.data.config.type = result.inputConfig.type;
                    }
                    if (typeof (result.inputConfig.required) != 'undefined') {
                        this.wwObject.content.data.config.required = result.inputConfig.required;
                    }
                    if (typeof (result.inputConfig.name) != 'undefined') {
                        this.wwObject.content.data.config.name = result.inputConfig.name;
                    }
                    if (typeof (result.inputConfig.placeholder) != 'undefined') {
                        this.wwObject.content.data.config.placeholder = result.inputConfig.placeholder;
                    }
                    if (typeof (result.inputConfig.pattern) != 'undefined') {
                        this.wwObject.content.data.config.pattern = result.inputConfig.pattern;
                    }
                    this.wwObjectCtrl.update(this.wwObject);
                }
                this.wwObjectCtrl.globalEdit(result);
            } catch (err) {
                wwLib.wwLog.error('ERROR', err)
            }
            wwLib.wwObjectHover.removeLock();
        }
        /* wwManager:end */
    },
    mounted() {
        this.wwObject.content.data = this.wwObject.content.data || {}
        this.wwObject.content.data.config = this.wwObject.content.data.config || {}
        this.wwObject.content.data.style = this.wwObject.content.data.style || {}

        this.wwObjectCtrl.update(this.wwObject)
        this.$emit('ww-loaded', this);
    }
};
</script>

<style lang="scss" scoped>
.elem-input {
    width: 100%;
    .input {
        width: 100%;
        outline: none;
    }
    ::placeholder {
        color: inherit;
        opacity: 0.7;
    }
}
</style>
