<template>
    <div class="input-container" :style="style">
        <div class="tooltiptext" id="tooltiptext" v-if="content.isTooltip && content.globalSettings.type === 'range'">
            {{ this.selectedValue }}
        </div>

        <input
            v-if="content.globalSettings && content.globalSettings.type !== 'textarea'"
            ref="input"
            class="ww-form-input"
            :class="{ editing: isEditing }"
            :type="content.globalSettings.type"
            :name="isEditing ? `${content.globalSettings.name}-editing` : content.globalSettings.name"
            :required="content.globalSettings.required"
            :placeholder="wwLang.getText(content.globalSettings.placeholder)"
            :style="style"
            :min="content.globalSettings.min"
            :max="content.globalSettings.max"
            :step="content.globalSettings.type === 'range' ? content.globalSettings.step : null"
            @input="rangeVal"
        />
        <textarea
            v-else-if="content.globalSettings"
            class="ww-form-input"
            :class="{ editing: isEditing }"
            :type="content.globalSettings.type"
            :name="content.globalSettings.name"
            :required="content.globalSettings.required"
            :placeholder="wwLang.getText(content.globalSettings.placeholder)"
            :style="[style, { resize: content.globalSettings.resize ? '' : 'none' }]"
            :rows="content.globalSettings.rows"
        />
    </div>
</template>

<script>
/* wwEditor:start */
import { getSettingsConfigurations } from './configurations';
/* wwEditor:end */

export default {
    name: '__COMPONENT_NAME__',
    props: {
        content: Object,
        /* wwEditor:start */
        wwEditorState: Object,
        /* wwEditor:end */
    },
    wwDefaultContent: {
        globalSettings: {
            type: 'text',
            name: '',
            required: true,
            placeholder: {},
            min: 0,
            max: 10000,
            step: 1,
            rows: 4,
            cols: 10,
            resize: false,
        },
        globalStyle: {
            fontSize: '15px',
            fontFamily: '',
            color: 'black',
            rangeBackgroundColor: 'rgb(9, 154, 242)',
            selectorBorderColor: '#1565C0',
            selectorBackgroundColor: 'rgb(9, 154, 242)',
            tooltipBackground: 'rgb(9, 154, 242)',
            tooltipTextColor: '#FFFFFF',
        },
        isTooltip: true,
    },
    /* wwEditor:start */
    wwEditorConfiguration({ content }) {
        return {
            settingsOptions: {
                name: {
                    path: 'globalSettings.name',
                    label: { en: 'Name', fr: 'fr' },
                    type: 'Text',
                    options: {
                        placeholder: 'Name',
                    },
                },
                required: {
                    path: 'globalSettings.required',
                    label: { en: 'Required', fr: 'Requis' },
                    type: 'OnOff',
                },
                type: {
                    path: 'globalSettings.type',
                    label: { en: 'Input type', fr: 'fr' },
                    type: 'TextSelect',
                    options: {
                        options: [
                            { value: 'text', label: { en: 'Short answer', fr: 'Texte' } },
                            { value: 'textarea', label: { en: 'Long answer', fr: 'Texte' } },
                            { value: 'email', label: { en: 'Email', fr: 'Email' } },
                            { value: 'password', label: { en: 'Password', fr: 'Mot de passe' } },
                            { value: 'number', label: { en: 'Number', fr: 'Nombre' } },
                            { value: 'range', label: { en: 'Range', fr: 'Range' } },
                            { value: 'date', label: { en: 'Date', fr: 'Date' } },
                            { value: 'time', label: { en: 'Time', fr: 'Heure' } },
                            { value: 'tel', label: { en: 'Phone', fr: 'Téléphone' } },
                        ],
                    },
                },
                ...getSettingsConfigurations(content.globalSettings.type),
            },
            styleOptions: {
                ...(function () {
                    return content.globalSettings.type === 'range'
                        ? {
                              rangeBackgroundColor: {
                                  path: 'globalStyle.rangeBackgroundColor',
                                  label: { en: 'Range background', fr: 'Range background' },
                                  type: 'Color',
                              },
                              selectorBorderColor: {
                                  path: 'globalStyle.selectorBorderColor',
                                  label: { en: 'Selector border', fr: 'Selector border' },
                                  type: 'Color',
                              },
                              selectorBackgroundColor: {
                                  path: 'globalStyle.selectorBackgroundColor',
                                  label: { en: 'Selector background', fr: 'Selector background' },
                                  type: 'Color',
                              },
                              isTooltip: {
                                  type: 'OnOff',
                                  label: {
                                      en: 'Display tooltip',
                                      fr: 'Afficher le tooltip',
                                  },
                              },
                              ...(function () {
                                  return content.isTooltip
                                      ? {
                                            tooltipBackground: {
                                                path: 'globalStyle.tooltipBackground',
                                                label: { en: 'Selector background', fr: 'Selector background' },
                                                type: 'Color',
                                            },
                                            tooltipTextColor: {
                                                path: 'globalStyle.tooltipTextColor',
                                                label: { en: 'Selector background', fr: 'Selector background' },
                                                type: 'Color',
                                            },
                                        }
                                      : {};
                              })(),
                          }
                        : {};
                })(),
            },
        };
    },
    /* wwEditor:end */
    data() {
        return {
            wwLang: wwLib.wwLang,
            selectedValue: 0,
        };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwSectionHelper.EDIT_MODES.CONTENT;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        style() {
            if (!this.content || !this.content.globalStyle) return {};
            return {
                color: this.content.globalStyle.color || 'black',
                fontSize: `${this.content.globalStyle.fontSize || '15px'}`,
                fontFamily: this.content.globalStyle.fontFamily,
                '--range-border': this.content.globalStyle.rangeBorderColor,
                '--range-background': this.content.globalStyle.rangeBackgroundColor,
                '--selector-border': this.content.globalStyle.selectorBorderColor,
                '--selector-background': this.content.globalStyle.selectorBackgroundColor,
                '--tooltip-position':
                    'calc(' + (this.selectedValue * 100) / this.content.globalSettings.max + '% - 20px)',
                '--tooltip-background': this.content.globalStyle.tooltipBackground,
                '--tooltip-text-color': this.content.globalStyle.tooltipTextColor,
            };
        },
    },
    methods: {
        rangeVal(event) {
            this.selectedValue = event.target.value;
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-form-input {
    width: 100%;
    outline: none;
    font-family: inherit;
    border: inherit;

    &::placeholder {
        color: inherit;
        opacity: 0.7;
    }
    /* wwEditor:start */
    &.editing {
        pointer-events: none;
    }
    /* wwEditor:end */
}

.input-container {
    position: relative;
    width: 100%;
    outline: none;
    font-family: inherit;
    border: inherit;

    &::placeholder {
        color: inherit;
        opacity: 0.7;
    }
    /* wwEditor:start */
    &.editing {
        pointer-events: none;
    }
    /* wwEditor:end */

    input[type='range'] {
        -webkit-appearance: none;
        margin: 10px 0;
        width: 100%;
    }
    input[type='range']:focus {
        outline: none;
    }
    input[type='range']::-webkit-slider-runnable-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        animate: 0.2s;
        box-shadow: 0px 0px 0px #000000;
        background: var(--range-background);
        border-radius: 1px;
        border: 0px solid #000000;
    }
    input[type='range']::-webkit-slider-thumb {
        box-shadow: 0px 0px 0px #000000;
        border: 1px solid var(--selector-border);
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--selector-background);
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -7px;
    }
    input[type='range']::-moz-range-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        animate: 0.2s;
        box-shadow: 0px 0px 0px #000000;
        background: var(--range-background);
        border-radius: 1px;
        border: 0px solid #000000;
    }
    input[type='range']::-moz-range-thumb {
        box-shadow: 0px 0px 0px #000000;
        border: 1px solid var(--range-background);
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--range-background);
        cursor: pointer;
    }
    input[type='range']::-ms-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        animate: 0.2s;
        background: transparent;
        border-color: transparent;
        color: transparent;
    }
    input[type='range']::-ms-fill-lower {
        background: var(--range-background);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
    }
    input[type='range']::-ms-fill-upper {
        background: var(--range-background);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
    }
    input[type='range']::-ms-thumb {
        margin-top: 1px;
        box-shadow: 0px 0px 0px #000000;
        border: 1px solid var(--range-border);
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--range-background);
        cursor: pointer;
    }
    input[type='range']:focus::-ms-fill-lower {
        background: var(--range-background);
    }
    input[type='range']:focus::-ms-fill-upper {
        background: var(--range-background);
    }
}

.input-container .tooltiptext {
    visibility: visible;
    background-color: var(--tooltip-background);
    color: var(--tooltip-text-color);
    text-align: center;
    padding: 5px 15px;
    border-radius: 6px;
    position: absolute;
    z-index: 20;
    top: 0px;
    left: var(--tooltip-position);
    transform: translateY(-120%);
}

.input-container:hover .tooltiptext {
    visibility: visible;
}
</style>
