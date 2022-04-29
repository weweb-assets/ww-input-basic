<template>
    <wwText v-if="isReadonly" :text="value"></wwText>
    <template v-else>
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
            @blur="correctDecimalValue()"
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
            return wwLib.getTextStyleFromContent(this.content);
        },
        inputType() {
            if (!this.content) return 'text';
            if (this.type === 'password') {
                return this.content.displayPassword ? 'text' : 'password';
            }
            return this.type === 'decimal' ? 'number' : this.type;
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
        handleManualInput(value) {
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
            this.$emit('trigger-event', { name: 'change', event: { value: newValue } });
        },
        correctDecimalValue() {
            if (this.type === 'decimal') {
                const newValue = this.formatValue(this.value);

                if (newValue === this.value) return;
                this.setValue(newValue);
                this.$emit('trigger-event', { name: 'change', event: { value: newValue } });
            }
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
