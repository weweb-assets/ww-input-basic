<template>
    <div class="ww-popup-config">
        <div class="content">
            <div class="elem">
                <wwManagerInput class="input" color="orange" v-model="result.inputConfig.name" label="Name"></wwManagerInput>
            </div>
            <div class="elem">
                <div class="title">Type</div>
                <wwManagerSelect class="option" :options="typeOptions" :value="result.inputConfig.type" @change="result.inputConfig.type = $event"></wwManagerSelect>
            </div>
            <div class="elem">
                <div class="title">Required</div>
                <wwManagerRadio class="radio" v-model="result.inputConfig.required"></wwManagerRadio>
            </div>
            <div class="elem">
                <div class="title">Placeholder</div>
                <wwManagerInput v-for="lang in langs" :key="lang" class="input" color="blue" v-model="result.inputConfig.placeholder[lang]" :label="'Placeholder - ' + lang.toUpperCase()"></wwManagerInput>
            </div>
            <div class="elem">
                <div class="title">Pattern</div>
                <wwManagerInput class="input" color="green" v-model="result.inputConfig.pattern" label="Pattern"></wwManagerInput>
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
            default() {
                return {
                }
            }
        },
    },
    data() {
        return {
            // wwLang: wwLib.wwLang,
            wwObject: this.options.data.wwObject,
            langs: wwLib.wwWebsiteData.getCurrentPage().langs,
            result: {
                inputConfig: {
                    type: undefined,
                    required: undefined,
                    placeholder: undefined,
                    pattern: undefined

                }
            },
            typeOptions: {
                type: 'text',
                values: [{
                    value: 'text',
                    default: true,
                    text: {
                        en: 'Text',
                        fr: 'Texte'
                    }
                }, {
                    value: 'email',
                    text: {
                        en: 'Email',
                        fr: 'Email'
                    }
                }, {
                    value: 'password',
                    text: {
                        en: 'Password',
                        fr: 'Password'
                    }
                }, {
                    value: 'tel',
                    text: {
                        en: 'Phone',
                        fr: 'Téléphone'
                    }
                }, {
                    value: 'number',
                    text: {
                        en: 'Number',
                        fr: 'Nombre'
                    }
                }, {
                    value: 'date',
                    text: {
                        en: 'Date',
                        fr: 'Date'
                    }
                }, {
                    value: 'time',
                    text: {
                        en: 'Time',
                        fr: 'Heure'
                    }
                }]
            }
        };
    },
    methods: {
        init() {
            this.result.inputConfig.type = this.wwObject.content.data.config.type
            this.result.inputConfig.required = this.wwObject.content.data.config.required || false
            this.result.inputConfig.name = this.wwObject.content.data.config.name
            this.result.inputConfig.placeholder = this.wwObject.content.data.config.placeholder
            this.result.inputConfig.pattern = this.wwObject.content.data.config.pattern
            this.options.result = this.result
        }
    },
    created() {
        this.init()
    },
    beforeDestroy() {
    }
};
</script>

<style scoped lang="scss">
.ww-popup-config {
    .content {
        display: flex;
        padding: 20px;
        flex-direction: column;
        overflow: auto;
        width: 100%;
        align-items: center;
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
            .select {
                width: 33%;
            }
        }

        .title {
            color: #e02a4d;
            font-family: "Monserrat", sans-serif;
            font-size: 1.2rem;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 10px;
        }
    }
}
</style>