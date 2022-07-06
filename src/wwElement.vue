<template>
    <input
        v-if="!isReadonly && content.type !== 'textarea'"
        :value="value"
        class="ww-input-basic"
        :class="{ editing: isEditing }"
        :type="inputType"
        :name="wwElementState.name"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="style"
        :min="content.min"
        :max="content.max"
        :step="step"
        v-bind="content.type === 'checkbox' ? { checked: !!value } : {}"
        @input="handleManualInput($event)"
        @blur="correctDecimalValue($event)"
    />
    <textarea
        v-else-if="!isReadonly && content"
        :value="value"
        class="ww-input-basic"
        :class="{ editing: isEditing }"
        :type="content.type"
        :name="wwElementState.name"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="[style, { resize: content.resize ? '' : 'none' }]"
        :rows="content.rows"
        @input="handleManualInput($event)"
    />
    <wwText v-else-if="isReadonly" :text="`${value}`"></wwText>
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
    emits: ['trigger-event', 'add-state', 'remove-state'],
    setup(props) {
        const type = computed(() => {
            if (Object.keys(props.wwElementState.props).includes('type')) {
                return props.wwElementState.props.type;
            }
            return props.content.type;
        });
        const step = computed(() => {
            return type.value === 'decimal' ? props.content.precision : '1';
        });
        function formatValue(value) {
            if (type.value !== 'decimal') return value;
            value = `${value}`.replace(',', '.');
            const length = value.indexOf('.') !== -1 ? step.value.split('.')[1].length : 0;
            const newValue = parseFloat(Number(value).toFixed(length).replace(',', '.'));
            return newValue;
        }

        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            type: computed(() => (['decimal', 'number'].includes(type.value) ? 'number' : 'string')),
            defaultValue: props.content.value === undefined ? '' : formatValue(props.content.value),
        });

        return { variableValue, setValue, formatValue, step, type };
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
            return {...wwLib.getTextStyleFromContent(this.content), '--placeholder-color': this.content.placeholderColor};
        },
        inputType() {
            if (!this.content) return 'text';
            if (this.content.type === 'password') {
                return this.content.displayPassword ? 'text' : 'password';
            }
            return this.content.type === 'decimal' ? 'number' : this.content.type;
        },
        isReadonly() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes('readonly');
            }
            /* wwEditor:end */
            return this.wwElementState.props.readonly === undefined
                ? this.content.readonly
                : this.wwElementState.props.readonly;
        },
    },
    watch: {
        'content.value'(newValue) {
            if (this.type === 'decimal') newValue = this.formatValue(newValue);
            if (newValue === this.value) return;
            this.setValue(newValue);
            this.$emit('trigger-event', { name: 'initValueChange', event: { value: newValue } });
        },
        isReadonly: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'readonly');
                } else {
                    this.$emit('remove-state', 'readonly');
                }
            },
        },
        /* wwEditor:start */
        'content.precision'(newValue, OldValue) {
            if (newValue === OldValue) return;
            const value = this.formatValue(this.value);
            this.setValue(value);
        },
        /* wwEditor:end */
    },
    methods: {
        handleManualInput(event) {
            const value = event.target.value;
            let newValue;
            if (this.inputType === 'number' && value.length) {
                try {
                    newValue = parseFloat(value);
                } catch (error) {
                    newValue = value;
                }
            } else {
                newValue = value;
            }

            if (newValue === this.value) return;
            this.setValue(newValue);
            this.$emit('trigger-event', { name: 'change', event: { domEvent: event, value: newValue } });
        },
        correctDecimalValue(event) {
            if (this.content.type === 'decimal') {
                const newValue = this.formatValue(this.value);

                if (newValue === this.value) return;
                this.setValue(newValue);
                this.$emit('trigger-event', { name: 'change', event: { domEvent: event, value: newValue } });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-input-basic {
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
    background-color: inherit;
    border-radius: inherit;

    &::placeholder {
        color: var(--placeholder-color, #000000ad);
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
        text-decoration: inherit;
        letter-spacing: inherit;
        word-spacing: inherit;
    }
    /* wwEditor:start */
    &.editing {
        pointer-events: none;
    }
    /* wwEditor:end */
}
</style>
