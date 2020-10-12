<template>
    <div class="ww-popup-style">
        <div class="content">
            <div class="options">
                <div class="title">Texte</div>
                <div class="option">
                    <div class="option-row">
                        <wwManagerColorSelect
                            :value="props.color"
                            @change="setValue('color', $event)"
                        ></wwManagerColorSelect>
                        <wwManagerSlider
                            class="slider"
                            :options="fontSizeOptions"
                            :value="props.fontSize"
                            @change="setValue('fontSize', $event)"
                        ></wwManagerSlider>
                        <div class="value">{{ props.fontSize }} rem</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'wwInputPopupStyle',
    props: {
        options: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            content: this.options.data,
            imageWidth: 500,
            containerHeight: null,
            fontSizeOptions: {
                min: 0,
                max: 5,
                digits: 1,
            },
            /*=============================================m_ÔÔ_m=============================================\
              PROPS
            \================================================================================================*/
            props: {
                color: 'black',
                fontSize: 1,
            },
        };
    },
    methods: {
        setResult() {
            this.options.result.style = {};
            for (const key in this.props) {
                this.options.result.style[key] = this.props[key];
            }
        },
        setValue(prop, value) {
            this.options.data.style = this.options.data.style || {};
            this.props[prop] = value;
            this.options.data.style[prop] = value;
            this.setResult();
        },
    },
    created() {
        this.options.data.style = this.options.data.style || {};
        for (let key in this.props) {
            this.props[key] = this.options.data.style[key] || this.props[key];
        }
    },
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
        font-family: 'Monserrat', sans-serif;
        @media (min-width: 992px) {
            flex-direction: row;
        }
        .options {
            display: flex;
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
                font-family: 'Monserrat', sans-serif;
                font-size: 1.2rem;
                text-transform: uppercase;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .desc {
                margin-right: 15px;
                color: #a7a7a7;
                font-family: 'Monserrat', sans-serif;
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
                        font-family: 'Monserrat', sans-serif;
                        flex-grow: 1;
                        text-align: right;
                        white-space: nowrap;
                    }
                    & + .option-row {
                        margin-top: 15px;
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
