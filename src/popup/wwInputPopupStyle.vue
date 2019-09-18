<template>
    <div class="ww-popup-style">
        <div class="content">
            <div class="preview">
                <div class="image" :style="{ 'width': `${imageWidth}px` }">
                    <wwObject class="preview-image" :ww-object="wwObject" ww-no-section="true" ww-force-edit-mode="CONTENT" ww-no-anim="true" ww-no-link="true"></wwObject>
                </div>
            </div>
            <div class="options">
                <div class="title">Fond</div>
                <div class="option">
                    <div class="option-row">
                        <wwManagerColorSelect :value="props.backgroundColor" @change="setValue('backgroundColor', $event)"></wwManagerColorSelect>
                    </div>
                </div>
                <div class="title">Texte</div>
                <div class="option">
                    <div class="option-row">
                        <wwManagerColorSelect :value="props.color" @change="setValue('color', $event)"></wwManagerColorSelect>
                        <wwManagerSlider class="slider" :options="fontSizeOptions" :value="props.fontSize" @change="setValue('fontSize', $event)"></wwManagerSlider>
                        <div class="value">{{props.fontSize}} rem</div>
                    </div>
                </div>
                <div class="title">Marges</div>
                <div class="option">
                    <div class="option-row">
                        <wwManagerSlider class="slider" :options="paddingOptions" :value="props.padding" @change="setValue('padding', $event)"></wwManagerSlider>
                        <div class="value">{{props.padding}} px</div>
                    </div>
                </div>
                <div class="title">Arrondis</div>
                <div class="option">
                    <div class="option-row">
                        <wwManagerSlider class="slider" :options="borderRadiusOptions" :value="props.borderRadius" @change="setValue('borderRadius', $event)"></wwManagerSlider>
                        <div class="value">{{props.borderRadius}} px</div>
                    </div>
                </div>
                <div class="title">Bordure</div>
                <div class="option">
                    <div class="option-row">
                        <wwManagerSlider class="slider" :options="borderWidthOptions" :value="props.borderWidth" @change="setValue('borderWidth', $event)"></wwManagerSlider>
                        <div class="value">{{props.borderWidth}}px</div>
                    </div>
                    <div class="option-row">
                        <wwManagerSelect class="border-style" :options="borderStyleOptions" :value="props.borderStyle" @change="setValue('borderStyle', $event)"></wwManagerSelect>
                        <wwManagerColorSelect class="border-color" :value="props.borderColor" @change="setValue('borderColor', $event)"></wwManagerColorSelect>
                    </div>
                </div>
                <div class="title">Ombre</div>
                <wwManagerSelect class="option" :options="boxShadowOptions" :value="props.boxShadow" @change="setValue('boxShadow', $event)"></wwManagerSelect>
            </div>
        </div>
    </div>
</template>

<script> 
export default {
    name: "wwInputPopupStyle",
    props: {
        options: {
            type: Object,
            default: function () {
                return {}
            }
        },
    },
    data() {
        return {
            wwObject: this.options.data.wwObject,
            imageWidth: 500,
            containerHeight: null,
            paddingOptions: {
                min: 0,
                max: 50,
                digits: 0
            },
            borderRadiusOptions: {
                min: 0,
                max: 50,
                digits: 0
            },
            fontSizeOptions: {
                min: 0,
                max: 5,
                digits: 1
            },
            borderWidthOptions: {
                min: 0,
                max: 20,
                digits: 0
            },
            borderStyleOptions: {
                type: 'text',
                values: [
                    {
                        value: 'none',
                        default: true,
                        text: {
                            en: 'None',
                            fr: 'Aucune'
                        }
                    },
                    {
                        value: 'solid',
                        text: {
                            en: 'Solid',
                            fr: 'Continue'
                        }
                    },
                    {
                        value: 'dotted',
                        text: {
                            en: 'Dotted',
                            fr: 'Pointillés'
                        }
                    },
                    {
                        value: 'dashed',
                        text: {
                            en: 'Dashed',
                            fr: 'Tirets'
                        }
                    },
                    {
                        value: 'double',
                        text: {
                            en: 'Double',
                            fr: 'Double'
                        }
                    },
                ]
            },
            boxShadowOptions: {
                type: 'wwObject',
                wwObject: this.options.data.wwObject,
                data: {
                    url: this.options.data.wwObject.content.data.url
                },
                values: [
                    {
                        value: {},
                        data: {
                            style: {
                                boxShadow: {}
                            }
                        },
                        default: true,
                        text: {
                            en: 'None',
                            fr: 'Aucune'
                        }
                    },
                    {
                        value: {
                            x: 0,
                            y: 0,
                            b: 5,
                            s: 0,
                            c: 'rgba(50, 50, 50, 0.75)'
                        },
                        data: {
                            style: {
                                boxShadow: {
                                    x: 0,
                                    y: 0,
                                    b: 5,
                                    s: 0,
                                    c: 'rgba(50, 50, 50, 0.75)'
                                }
                            }
                        },
                        text: {
                            en: 'Small',
                            fr: 'Légère'
                        }
                    },
                    {
                        value: {
                            x: 0,
                            y: 0,
                            b: 10,
                            s: 0,
                            c: 'rgba(50, 50, 50, 0.75)'
                        },
                        data: {
                            style: {
                                boxShadow: {
                                    x: 0,
                                    y: 0,
                                    b: 10,
                                    s: 0,
                                    c: 'rgba(50, 50, 50, 0.75)'
                                }
                            }
                        },
                        text: {
                            en: 'Medium',
                            fr: 'Moyenne'
                        }
                    },
                    {
                        value: {
                            x: 0,
                            y: 0,
                            b: 20,
                            s: 0,
                            c: 'rgba(50, 50, 50, 0.75)'
                        },
                        data: {
                            style: {
                                boxShadow: {
                                    x: 0,
                                    y: 0,
                                    b: 20,
                                    s: 0,
                                    c: 'rgba(50, 50, 50, 0.75)'
                                }
                            }
                        },
                        text: {
                            en: 'Big',
                            fr: 'Grande'
                        }
                    },
                    {
                        value: {
                            x: 0,
                            y: 2,
                            b: 5,
                            s: 0,
                            c: 'rgba(50, 50, 50, 0.75)'
                        },
                        data: {
                            style: {
                                boxShadow: {
                                    x: 0,
                                    y: 2,
                                    b: 5,
                                    s: 0,
                                    c: 'rgba(50, 50, 50, 0.75)'
                                }
                            }
                        },
                        text: {
                            en: 'Small under',
                            fr: 'Petite en dessous'
                        }
                    },
                    {
                        value: {
                            x: 0,
                            y: 3,
                            b: 10,
                            s: 0,
                            c: 'rgba(50, 50, 50, 0.75)'
                        },
                        data: {
                            style: {
                                boxShadow: {
                                    x: 0,
                                    y: 3,
                                    b: 10,
                                    s: 0,
                                    c: 'rgba(50, 50, 50, 0.75)'
                                }
                            }
                        },
                        text: {
                            en: 'Medium under',
                            fr: 'Moyenne en dessous'
                        }
                    },
                    {
                        value: {
                            x: 0,
                            y: 7,
                            b: 20,
                            s: 0,
                            c: 'rgba(50, 50, 50, 0.75)'
                        },
                        data: {
                            style: {
                                boxShadow: {
                                    x: 0,
                                    y: 7,
                                    b: 20,
                                    s: 0,
                                    c: 'rgba(50, 50, 50, 0.75)'
                                }
                            }
                        },
                        text: {
                            en: 'Big under',
                            fr: 'Grande en dessous'
                        }
                    },
                ]
            },
            
            /*=============================================m_ÔÔ_m=============================================\
              PROPS
            \================================================================================================*/
            props: {
                color: 'black',
                fontSize: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 0,
                borderWidth: 0,
                borderColor: null,
                borderStyle: null,
                padding: 0,
                boxShadow: {
                    x: 0,
                    y: 0,
                    b: 0,
                    s: 0,
                    c: ''
                }
            }
        };
    },
    computed: {
    },
    methods: {
        init() {
        },
        setResult() {
            this.options.result.inputStyle = {} 
            for (const key in this.props) {
                this.options.result.inputStyle[key] = this.props[key];
            }
        },
        /*=============================================m_ÔÔ_m=============================================\
          PROPS
        \================================================================================================*/
        updateWwObject() {
            if (this.$el.querySelector('.preview-image') && this.$el.querySelector('.preview-image').wwObjectCtrl) {
                this.$el.querySelector('.preview-image').wwObjectCtrl.update(this.options.data.wwObject);
            }
            this.setResult();
        },
        setValue(prop, value) {
            this.options.data.wwObject.content.data.style = this.options.data.wwObject.content.data.style || {};
            this.props[prop] = value;
            this.options.data.wwObject.content.data.style[prop] = value;
            if (prop == 'borderWidth') {
                if (value == 0) {
                    this.props.borderStyle = 'none';
                    this.options.data.wwObject.content.data.style.borderStyle = 'none';
                }
                else if (this.props.borderStyle == 'none') {
                    this.props.borderStyle = 'solid';
                    this.options.data.wwObject.content.data.style.borderStyle = 'solid';
                }
            }
            if (prop == 'borderStyle') {
                if (value == 'none') {
                    this.props.borderWidth = 0;
                    this.options.data.wwObject.content.data.style.borderWidth = 0;
                }
                else if (this.props.borderWidth == 0) {
                    this.props.borderWidth = 2;
                    this.options.data.wwObject.content.data.style.borderWidth = 2;
                }
            }
            if (prop == 'borderColor') {
                this.props.borderWidth = this.options.data.wwObject.content.data.style.borderWidth || 1;
                this.options.data.wwObject.content.data.style.borderWidth = this.props.borderWidth;
            }
            this.updateWwObject();
        }
    },
    mounted: function () {
        // this.containerHeight = this.$el.querySelector('.preview').getBoundingClientRect().height - 20;
        this.init()
    },
    created() {
        this.options.data.wwObject.uniqueId = wwLib.wwUtils.getUniqueId();
        this.options.data.wwObject.content.data.style = this.options.data.wwObject.content.data.style || {};
        for (let key in this.props) {
            this.props[key] = this.options.data.wwObject.content.data.style[key] || this.props[key];
        }
    },
    beforeDestroy() {
    }
};
</script>

<style scoped lang="scss">
.ww-popup-style {
    .content {
        display: flex;
        padding: 20px;
        flex-direction: column;
        overflow: auto;
        min-height: 100%;
        font-family: "Monserrat", sans-serif;
        @media (min-width: 992px) {
            flex-direction: row;
        }
        .preview {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #efefef;
            border: 2px solid #cacaca;
            @media (min-width: 992px) {
                flex-basis: 50%;
            }
            .image {
            }
        }
        .options {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            padding: 50px 0;
            @media (min-width: 992px) {
                flex-basis: 50%;
                padding: 0 15px;
                align-items: initial;
            }
            .title {
                color: #e02a4d;
                font-family: "Monserrat", sans-serif;
                font-size: 1.2rem;
                text-transform: uppercase;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .desc {
                margin-right: 15px;
                color: #a7a7a7;
                font-family: "Monserrat", sans-serif;
                font-size: 0.9rem;
            }
            .option {
                width: 80%;
                display: flex;
                flex-direction: column;
                @media (min-width: 992px) {
                    width: 350px;
                }
                .option-row {
                    display: flex;
                    align-items: center;
                    &.center {
                        justify-content: center;
                    }
                    .slider {
                        flex-basis: 80%;
                        @media (min-width: 992px) {
                            flex-basis: 250px;
                        }
                    }
                    .value {
                        padding-left: 10px;
                        font-size: 1.2rem;
                        font-family: "Monserrat", sans-serif;
                        flex-grow: 1;
                        text-align: right;
                        white-space: nowrap;
                    }
                    & + .option-row {
                        margin-top: 15px;
                    }
                    .border-style {
                        flex-grow: 1;
                    }
                    .border-color {
                        margin: 0 0 0 15px;
                    }
                }
            }
            .option + .title {
                margin-top: 25px;
            }
        }
    }
}
</style>