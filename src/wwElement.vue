<template>
    <input
        v-if="content.type !== 'textarea'"
        v-model="value"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="inputType"
        :name="isEditing ? `${wwElementState.name}-editing` : wwElementState.name"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="style"
        :min="content.min"
        :max="content.max"
        :step="step"
    />
    <textarea
        v-else-if="content"
        v-model="value"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="content.type"
        :name="wwElementState.name"
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
        uid: { type: String, required: true },
    },
    emits: ['trigger-event'],
    setup(props) {
        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable(props.uid, 'value', '');
        return { variableValue, setValue };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        value: {
            get() {
                return this.variableValue;
            },
            set(value) {
                if (value !== this.variableValue) {
                    value = this.formatInput(value);
                    this.$emit('trigger-event', { name: 'change', event: { value } });
                    this.setValue(value);
                }
            },
        },
        style() {
            return {
                color: this.content.color,
                fontSize: this.content.fontSize,
                fontFamily: this.content.fontFamily,
            };
        },
        inputType() {
            if (!this.content) return 'text';
            return this.content.type === 'decimal' ? 'number' : this.content.type;
        },
        step() {
            if (!this.content) return '1';
            return this.content.type === 'decimal' ? this.content.precision : '1';
        },
    },
    /* wwEditor:start */
    watch: {
        'content.value'(value) {
            this.value = value;
        },
        'content.precision'() {
            this.value = this.formatInput(this.value);
        },
    },
    /* wwEditor:end */
    methods: {
        formatInput(value) {
            if (this.content.type !== 'decimal') return value;
            return Number(value).toFixed(this.step.split('.')[1].length).replace(',', '.');
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
