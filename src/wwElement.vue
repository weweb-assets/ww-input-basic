<template>
    <input
        v-if="content.type !== 'textarea'"
        :value="value"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="inputType"
        :name="wwElementState.name"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="style"
        :min="content.min"
        :max="content.max"
        :step="step"
        @input="handleManualInput($event.target.value)"
    />
    <textarea
        v-else-if="content"
        :value="value"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="content.type"
        :name="wwElementState.name"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="[style, { resize: content.resize ? '' : 'none' }]"
        :rows="content.rows"
        @input="handleManualInput($event.target.value)"
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
        wwElementState: { type: Object, required: true },
    },
    emits: ['trigger-event'],
    setup(props) {
        const formatValue = (type, step, value) => {
            if (type !== 'decimal') return value;
            return Number(value).toFixed(step.split('.')[1].length).replace(',', '.');
        };

        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable(
            props.uid,
            'value',
            props.content.value === undefined
                ? ''
                : formatValue(props.content.type, props.content.step, props.content.value)
        );

        return { variableValue, setValue, formatValue };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        value() {
            return this.variableValue;
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
    watch: {
        'content.value'(newValue, OldValue) {
            if (this.content.type === 'decimal') newValue = this.formatValue(this.content.type, this.step, newValue);
            if (newValue === OldValue) return;
            this.setValue(newValue);
            this.$emit('trigger-event', { name: 'initValueChange', event: { value: newValue } });
        },
        'content.precision'(newValue, OldValue) {
            if (newValue === OldValue) return;
            const value = this.formatValue(this.content.type, this.step, this.value);
            this.setValue(value);
            this.$emit('trigger-event', { name: 'initValueChange', event: { value: value } });
        },
    },
    methods: {
        handleManualInput(value) {
            if (this.content.type === 'decimal') value = this.formatValue(this.content.type, this.step, value);
            if (value === this.value) return;
            this.setValue(value);
            this.$emit('trigger-event', { name: 'change', event: { value } });
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
