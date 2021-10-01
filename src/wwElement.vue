<template>
    <input
        v-if="content.globalSettings && content.globalSettings.type !== 'textarea'"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="inputType"
        :name="isEditing ? `${content.globalSettings.name}-editing` : content.globalSettings.name"
        :required="content.globalSettings.required"
        :placeholder="wwLang.getText(content.globalSettings.placeholder)"
        :style="style"
        :min="content.globalSettings.min"
        :max="content.globalSettings.max"
        :step="step"
        @focusout="formatInput"
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
</template>

<script>
export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
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
            return {
                color: this.content.globalStyle.color,
                fontSize: this.content.globalStyle.fontSize,
                fontFamily: this.content.globalStyle.fontFamily,
            };
        },
        inputType() {
            if (!this.content.globalSettings) return 'text';
            return this.content.globalSettings.type === 'decimal' ? 'number' : this.content.globalSettings.type;
        },
        step() {
            if (!this.content.globalSettings) return '1';
            return this.content.globalSettings.type === 'decimal' ? this.content.globalSettings.precision : '1';
        },
    },
    methods: {
        formatInput(event) {
            if (this.content.globalSettings.type !== 'decimal') return;
            const formatedValue = Number(event.target.value).toFixed(this.step.split('.')[1].length);
            event.target.value = formatedValue;
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
