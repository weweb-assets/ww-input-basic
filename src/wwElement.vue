<template>
    <input
        v-if="content.type !== 'textarea'"
        :key="'ww-input-basic-' + step"
        ref="input"
        v-bind="wwElementState.props.attributes || {}"
        :value="value"
        class="ww-input-basic"
        :class="{
            hideArrows: content.hideArrows && inputType === 'number',
            'date-placeholder': content.type === 'date' && !value,
            '-readonly': isReadonly,
            editing: isEditing,
        }"
        :type="inputType"
        :name="wwElementState.name"
        :readonly="isReadonly || isEditing"
        :required="content.required"
        :autocomplete="content.autocomplete ? 'on' : 'off'"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="style"
        :min="min"
        :max="max"
        :step="stepAttribute"
        @input="handleManualInput($event)"
        @blur="onBlur($event)"
        @focus="isReallyFocused = true"
    />
    <textarea
        v-else
        ref="input"
        v-bind="wwElementState.props.attributes || {}"
        :value="value"
        class="ww-input-basic"
        :class="{ editing: isEditing }"
        :type="content.type"
        :name="wwElementState.name"
        :readonly="isReadonly || isEditing"
        :required="content.required"
        :placeholder="wwLang.getText(content.placeholder)"
        :style="[style, { resize: content.resize ? '' : 'none' }]"
        :rows="content.rows"
        @input="handleManualInput($event)"
        @focus="isReallyFocused = true"
        @blur="isReallyFocused = false"
    />
</template>

<script>
import { computed, ref } from 'vue';

export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwFrontState: { type: Object, required: true },
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
        uid: { type: String, required: true },
        wwElementState: { type: Object, required: true },
    },
    emits: ['trigger-event', 'add-state', 'remove-state', 'update:content:effect'],
    setup(props) {
        const type = computed(() => {
            if (Object.keys(props.wwElementState.props).includes('type')) {
                return props.wwElementState.props.type;
            }
            return props.content.type;
        });
        const step = computed(() => {
            if (['decimal', 'number'].includes(type.value)) return props.content.step;
            if ('time' === type.value) return props.content.timePrecision || 1;
            return 1;
        });
        function formatValue(value) {
            if (type.value !== 'decimal') return value;
            if (!value && value !== 0) return '';
            value = `${value}`.replace(',', '.');
            const length = value.indexOf('.') !== -1 ? props.content.precision.split('.')[1].length : 0;
            const newValue = parseFloat(Number(value).toFixed(length).replace(',', '.'));
            return newValue;
        }

        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            type: computed(() => (['decimal', 'number'].includes(type.value) ? 'number' : 'string')),
            defaultValue: computed(() => (props.content.value === undefined ? '' : formatValue(props.content.value))),
        });

        const inputRef = ref('input');

        return {
            variableValue,
            setValue,
            formatValue,
            step,
            type,
            inputRef,
        };
    },
    data() {
        return {
            paddingLeft: '0px',
            isReallyFocused: false,
            isDebouncing: false,
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
        value() {
            return this.variableValue;
        },
        delay() {
            return wwLib.wwUtils.getLengthUnit(this.content.debounceDelay)[0];
        },
        style() {
            const style = {
                ...wwLib.wwUtils.getTextStyleFromContent(this.content),
                '--placeholder-color': this.content.placeholderColor,
            };
            delete style['whiteSpaceCollapse']; //Create a visual bug in Firefox
            delete style['whiteSpace']; //Create a visual bug in Firefox

            return style;
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
        isFocused() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes('focus');
            }
            /* wwEditor:end */
            return this.isReallyFocused;
        },
        stepAttribute() {
            return !this.isFocused && this.inputType === 'number' ? 'any' : this.step;
        },
        min() {
            if (this.type === 'date') {
                return this.content.minDate;
            } else {
                return this.content.min;
            }
        },
        max() {
            if (this.type === 'date') {
                return this.content.maxDate;
            } else {
                return this.content.max;
            }
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
        'content.timePrecision'(value) {
            if (typeof this.value !== 'string') return;
            else if (value === 3600) this.setValue(this.value.slice(0, 2));
            else if (value === 60) this.setValue(this.value.slice(0, 5));
            else if (value === 1) this.setValue(this.value.slice(0, 8));
        },
        isReallyFocused(isFocused, wasFocused) {
            if (isFocused && !wasFocused) {
                this.$emit('trigger-event', { name: 'focus' });
            } else if (!isFocused && wasFocused) {
                this.$emit('trigger-event', { name: 'blur' });
            }
        },
        isFocused: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'focus');
                } else {
                    this.$emit('remove-state', 'focus');
                }
            },
        },
    },
    beforeUnmount() {
        wwLib.getFrontDocument().removeEventListener('keyup', this.onKeyEnter);
    },
    mounted() {
        wwLib.getFrontDocument().addEventListener('keyup', this.onKeyEnter);

        if (this.value !== this.$refs.input.value) {
            this.$refs.input.value = this.value;
        }
    },
    methods: {
        handleManualInput(event) {
            const value = event.target.value;
            let newValue;
            if (this.inputType === 'number' && (event.data === '.' || event.data === ',') && value === '') {
                // I dont know why, but 10. is not a valid number, and event.target.value is empty at this moment
                // It's probably depending on the system local, so i have put the ',' usecase as well
                // Returning here prevent the value to be set to null then blinking
                return;
            } else if (this.inputType === 'number' && (value === 0 || (value && value.length))) {
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
            if (this.content.debounce) {
                this.isDebouncing = true;
                if (this.debounce) {
                    clearTimeout(this.debounce);
                }
                this.debounce = setTimeout(() => {
                    this.$emit('trigger-event', {
                        name: 'change',
                        event: { domEvent: event, value: newValue },
                    });
                    this.isDebouncing = false;
                }, this.delay);
            } else {
                this.$emit('trigger-event', { name: 'change', event: { domEvent: event, value: newValue } });
            }
        },
        onKeyEnter(event) {
            if (event.key === 'Enter' && this.isReallyFocused)
                this.$emit('trigger-event', { name: 'onEnterKey', event: { value: this.value } });
        },
        onBlur(event) {
            this.correctDecimalValue(event);
            this.isReallyFocused = false;
        },
        correctDecimalValue(event) {
            if (this.content.type === 'decimal') {
                const newValue = this.formatValue(this.value);

                if (newValue === this.value) return;
                this.setValue(newValue);
                this.$emit('trigger-event', { name: 'change', event: { domEvent: event, value: newValue } });
            }
        },
        // /!\ Use externally
        focusInput() {
            if (this.isReadonly) return;
            const el = this.$refs.input;
            if (el) el.focus();
        },
        selectInput() {
            const el = this.$refs.input;
            if (el) el.select();
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-input-basic {
    outline: none;
    border: none;
    position: relative;
    isolation: isolate;
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

    &.date-placeholder {
        color: var(--placeholder-color, #000000ad);
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
        text-decoration: inherit;
        letter-spacing: inherit;
        word-spacing: inherit;
    }

    &.hideArrows::-webkit-outer-spin-button,
    &.hideArrows::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    &.hideArrows {
        -moz-appearance: textfield;
    }

    &.-readonly {
        cursor: inherit;
    }

    /* wwEditor:start */
    &.editing {
        cursor: initial !important;
    }
    /* wwEditor:end */
}
</style>
