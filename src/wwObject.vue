<template>
    <input
        class="ww-form-input"
        :class="{ 'ww-editing': isEditing }"
        :type="content.config.type"
        :name="content.config.name"
        :required="content.config.required"
        :pattern="content.config.pattern"
        :placeholder="wwLang.getText(content.config.placeholder)"
        :style="style"
    />
</template>

<script>
/* wwEditor:start */
import openPopup from './popups';
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
        config: {
            type: 'text',
            name: 'Name',
            required: true,
            pattern: '.*',
            placeholder: {
                fr: 'Nom',
                en: 'Name',
            },
        },
        style: {
            color: 'black',
            fontSize: 1,
        },
    },
    data() {
        return {
            wwLang: wwLib.wwLang,
        };
    },
    computed: {
        isEditing() {
            return this.wwEditorState.editMode === wwLib.wwSectionHelper.EDIT_MODES.CONTENT;
        },
        style() {
            return {
                color: this.content.style.color || 'black',
                fontSize: `${this.content.style.fontSize || 1}rem`,
            };
        },
    },
    /* wwEditor:start */
    methods: {
        async setOptions() {
            const result = await openPopup(this.content);
            if (result) this.$emit('update', result);
        },
    },
    /* wwEditor:end */
};
</script>

<style lang="scss" scoped>
.ww-form-input {
    width: 100%;
    outline: none;
    &::placeholder {
        color: inherit;
        opacity: 0.7;
    }
    /* wwEditor:start */
    &.ww-editing {
        pointer-events: none;
    }
    /* wwEditor:end */
}
</style>
