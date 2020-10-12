<template>
    <div class="ww-popup-config">
        <div class="content">
            <div class="elem">
                <wwManagerInput class="input" color="orange" v-model="result.config.name" label="Name"></wwManagerInput>
            </div>
            <div class="elem">
                <div class="title">Type</div>
                <wwManagerSelect
                    class="option"
                    :options="typeOptions"
                    :value="result.config.type"
                    @change="result.config.type = $event"
                ></wwManagerSelect>
            </div>
            <div class="elem">
                <div class="title">Required</div>
                <wwManagerRadio class="radio" v-model="result.config.required"></wwManagerRadio>
            </div>
            <div class="elem">
                <div class="title">Placeholder</div>
                <wwManagerInput
                    v-for="lang in langs"
                    :key="lang"
                    class="input"
                    color="blue"
                    v-model="result.config.placeholder[lang]"
                    :label="'Placeholder - ' + lang.toUpperCase()"
                ></wwManagerInput>
            </div>
            <div class="elem">
                <div class="title">Pattern</div>
                <wwManagerInput
                    class="input"
                    color="green"
                    v-model="result.config.pattern"
                    label="Pattern"
                ></wwManagerInput>
            </div>
            <div class="elem">
                <div class="title">Texte</div>
                <div class="elem-row">
                    <wwManagerColorSelect :value="result.style.color" @change="result.style.color = $event" />
                    <wwManagerSlider
                        class="slider"
                        :options="fontSizeOptions"
                        :value="result.style.fontSize"
                        @change="result.style.fontSize = $event"
                    />
                    <div class="value">{{ result.style.fontSize }} rem</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'wwInputPopupConfig',
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
            langs: wwLib.wwWebsiteData.getCurrentPage().langs,
            result: {
                style: {
                    color: 'black',
                    fontSize: 1,
                },
                config: {
                    type: undefined,
                    required: undefined,
                    placeholder: undefined,
                    pattern: undefined,
                },
            },
            fontSizeOptions: {
                min: 0,
                max: 5,
                digits: 1,
            },
            typeOptions: {
                type: 'text',
                values: [
                    {
                        value: 'text',
                        default: true,
                        text: {
                            en: 'Text',
                            fr: 'Texte',
                        },
                    },
                    {
                        value: 'email',
                        text: {
                            en: 'Email',
                            fr: 'Email',
                        },
                    },
                    {
                        value: 'password',
                        text: {
                            en: 'Password',
                            fr: 'Password',
                        },
                    },
                    {
                        value: 'tel',
                        text: {
                            en: 'Phone',
                            fr: 'Téléphone',
                        },
                    },
                    {
                        value: 'number',
                        text: {
                            en: 'Number',
                            fr: 'Nombre',
                        },
                    },
                    {
                        value: 'date',
                        text: {
                            en: 'Date',
                            fr: 'Date',
                        },
                    },
                    {
                        value: 'time',
                        text: {
                            en: 'Time',
                            fr: 'Heure',
                        },
                    },
                ],
            },
        };
    },
    methods: {
        init() {
            this.result.config.type = this.content.config.type;
            this.result.config.required = this.content.config.required || false;
            this.result.config.name = this.content.config.name;
            this.result.config.placeholder = this.content.config.placeholder;
            this.result.config.pattern = this.content.config.pattern;
            this.result.style.color = this.content.style.color;
            this.result.style.fontSize = this.content.style.fontSize;
            this.options.result = this.result;
        },
    },
    created() {
        this.init();
    },
};
</script>

<style scoped lang="scss">
.ww-popup-config {
    .content {
        display: flex;
        padding: 20px;
        flex-direction: column;
        width: 100%;
        align-items: center;
        .elem-row {
            display: flex;
            align-items: center;
        }
        .elem {
            margin: 10px;
            width: 90%;

            @media (min-width: 992px) {
                width: 40%;
            }
            .input {
                width: 100%;
            }
            .input + .input {
                margin-top: 5px;
            }
            .slider {
                flex-basis: 70%;
            }
            .select {
                width: 33%;
            }
        }
        .title {
            color: #e02a4d;
            font-family: 'Monserrat', sans-serif;
            font-size: 1.2rem;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 10px;
        }
    }
}
</style>
