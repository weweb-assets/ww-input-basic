<template>
    <input
        v-if="content.config"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="content.config.type"
        :name="content.config.name"
        :required="content.config.required"
        :pattern="content.config.pattern"
        :placeholder="wwLang.getText(content.config.placeholder)"
        :style="style"
    />
</template>

<script>
export default {
    name: '__COMPONENT_NAME__',
    props: {
        content: Object,
        /* wwEditor:start */
        wwEditorState: Object,
        /* wwEditor:end */
    },
    wwDefaultContent: {
        config: {
            type: 'text',
            name: '',
            required: true,
            pattern: '.*',
            placeholder: {},
        },
        style: {
            color: 'black',
            fontSize: '15px',
        },
    },
    /* wwEditor:start */
    wwEditorConfiguration() {
        return {
            settingsOptions: {
                name: {
                    path: 'config.name',
                    label: { en: 'Name', fr: 'fr' },
                    type: 'Text',
                    options: {
                        placeholder: 'Name',
                    },
                },
                required: {
                    path: 'config.required',
                    label: { en: 'Required', fr: 'Requis' },
                    type: 'OnOff',
                },
                type: {
                    path: 'config.type',
                    label: { en: 'Input type', fr: 'fr' },
                    type: 'TextSelect',
                    options: {
                        options: [
                            { value: 'text', label: { en: 'Text', fr: 'Texte' } },
                            { value: 'email', label: { en: 'Email', fr: 'Email' } },
                            { value: 'password', label: { en: 'Password', fr: 'Mot de passe' } },
                            { value: 'tel', label: { en: 'Phone', fr: 'Téléphone' } },
                            { value: 'number', label: { en: 'Number', fr: 'Nombre' } },
                            { value: 'date', label: { en: 'Date', fr: 'Date' } },
                            { value: 'time', label: { en: 'Time', fr: 'Heure' } },
                        ],
                    },
                },
                ...(function () {
                    const placeholders = {};
                    for (const lang of wwLib.$store.getters['websiteData/getPage'].langs) {
                        placeholders[`placeholder_${lang}`] = {
                            path: `config.placeholder.${lang}`,
                            label: { en: `placeholder (${lang})`, fr: 'fr' },
                            type: 'Text',
                            options: {
                                placeholder: 'firstname',
                            },
                        };
                    }
                    return placeholders;
                })(),
            },
        };
    },
    /* wwEditor:end */
    data() {
        return {
            wwLang: wwLib.wwLang,
        };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        style() {
            if (!this.content || !this.content.style) return {};
            return {
                color: this.content.style.color || 'black',
                fontSize: `${this.content.style.fontSize || '1rem'}`,
            };
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
</style>
