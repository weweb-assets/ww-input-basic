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
import { computed } from 'vue';

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
        const step = computed(() => {
            return props.content.type === 'decimal' ? props.content.precision : '1';
        });
        function formatValue(value) {
            let formattedValue = value
            
            if (props.content.type === 'decimal') {
                value = `${value}`.replace(',', '.');
                const length = value.indexOf('.') !== -1 ? step.value.split('.')[1].length : 0;
                formattedValue = parseFloat(Number(value).toFixed(length).replace(',', '.'));
            }

            if (props.content.type === 'number') {
                try {
                    formattedValue = parseFloat(value);
                } catch (error) {
                    return value
                }
            }

            return formattedValue
        }

        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            defaultValue: props.content.value,
            sanitizer: value => value === undefined ? '' : formatValue(value)
        });

        return { variableValue, setValue, step };
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
    },
    watch: {
        'content.value'(value) {
            const { newValue, hasChanged } = this.setValue(value);
            if (hasChanged) {
                this.$emit('trigger-event', { name: 'initValueChange', event: { value: newValue } });
            }
        },
        /* wwEditor:start */
        'content.precision'(newValue) {
            this.setValue(newValue);
        },
        /* wwEditor:end */
    },
    methods: {
        handleManualInput(value) {
            const { newValue, hasChanged } = this.setValue(value);
            if (hasChanged) {
                this.$emit('trigger-event', { name: 'change', event: { value: newValue } });
            }
        }
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
