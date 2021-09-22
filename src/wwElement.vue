<template>
    <input
        v-if="content.type !== 'textarea'"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="inputType"
        :name="isEditing ? `${content.name}-editing` : content.name"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="style"
        :min="content.min"
        :max="content.max"
        :step="step"
        @focusout="formatInput"
    />
    <textarea
        v-else
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="content.type"
        :name="content.name"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="[style, { resize: content.resize ? '' : 'none' }]"
        :rows="content.rows"
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
                color: this.content.color,
                fontSize: `${this.content.fontSize}`,
                fontFamily: this.content.fontFamily,
            };
        },
        inputType() {
            return this.content.type === 'decimal' ? 'number' : this.content.type;
        },
        step() {
            return this.content.type === 'decimal' ? this.content.precision : '1';
        },
    },
    methods: {
        formatInput(event) {
            if (this.content.type !== 'decimal') return;
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
