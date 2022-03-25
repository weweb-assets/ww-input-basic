<template>
    <input
        v-if="inputType === 'number'"
        v-model.number="internalValue"
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
    />
    <input
        v-else-if="content.type !== 'textarea'"
        v-model="internalValue"
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
    />
    <textarea
        v-else-if="content"
        v-model="internalValue"
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
            if (!value) return '';

            if (props.content.type === 'decimal') {
                const replaced = String(value).replace(',', '.');
                const precision = replaced.indexOf('.') !== -1 ? step.value.split('.')[1].length : 0;
                return parseFloat(Number(replaced).toFixed(precision).replace(',', '.'));
            }

            if (props.content.type === 'number') {
                return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
            }

            return String(value);
        }

        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            type: computed(() => (['decimal', 'number'].includes(props.content.type) ? 'number' : 'string')),
            defaultValue: props.content.value === undefined ? '' : formatValue(props.content.value),
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
        internalValue: {
            get() {
                return this.variableValue;
            },
            set(value) {
                const { newValue, hasChanged } = this.setValue(value);
                if (hasChanged) {
                    this.$emit('trigger-event', { name: 'change', event: { value: newValue } });
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
    },
    watch: {
        'content.value'(value) {
            const { newValue, hasChanged } = this.setValue(value);
            if (hasChanged) {
                this.$emit('trigger-event', { name: 'initValueChange', event: { value: newValue } });
            }
        },
        /* wwEditor:start */
        'content.precision'() {
            this.setValue(this.internalValue);
        },
        /* wwEditor:end */
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
