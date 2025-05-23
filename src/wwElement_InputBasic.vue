<template>
    <div v-if="content.type == 'currency'" @click="focusInput">
        <div
            class="input-currency-wrapper"
            :class="{ 'has-currency-symbol': showCurrencySymbol }"
            :style="{ 'flex-direction': `${symbolPosition == 'prefix' ? 'row' : 'row-reverse'}` }"
        >
            <span
                v-if="showCurrencySymbol"
                ref="currencySymbolRef"
                class="currency-symbol"
                :style="[currencySymbolStyle, { padding: style.padding }]"
            >
                {{ currencySymbol }}
            </span>
            <input
                ref="inputRef"
                v-bind="inputBindings"
                v-maska="currencyMaskaOptions"
                class="ww-input-basic currency-type"
                :class="[inputClasses]"
                :style="showCurrencySymbol ? currencyInputStyle : {}"
                type="text"
                @input="handleCurrencyInput"
                @blur="
                    () => {
                        isReallyFocused = false;
                        onBlur();
                        onCurrencyBlur();
                    }
                "
                @focus="
                    () => {
                        isReallyFocused = true;
                        onCurrencyFocus();
                    }
                "
                @keyup.enter="onEnter"
            />
        </div>
    </div>
    <textarea
        v-else-if="content.type == 'textarea'"
        ref="inputRef"
        v-bind="textareaBindings"
        class="ww-input-basic"
        :class="{ editing: isEditing }"
        @input="handleManualInput"
        @focus="isReallyFocused = true"
        @blur="isReallyFocused = false"
        @keyup.enter="onEnter"
    />
    <input
        v-else
        ref="inputRef"
        v-bind="inputBindings"
        class="ww-input-basic"
        :class="[inputClasses]"
        @input="handleManualInput"
        @blur="onBlur"
        @focus="isReallyFocused = true"
        @keyup.enter="onEnter"
    />
</template>

<script>
import { computed, inject, watch } from 'vue';
import { useInput } from './composables/useInput';
import { useCurrency } from './composables/useCurrency';
import { vMaska } from 'maska/vue';
/* wwEditor:start */
import useParentSelection from './editor/useParentSelection';
/* wwEditor:end */

export default {
    directives: {
        maska: vMaska,
    },
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwFrontState: { type: Object, required: true },
        wwEditorState: { type: Object, required: true },
        parentSelection: { type: Object, default: () => ({ allow: false, texts: {} }) },
        /* wwEditor:end */
        uid: { type: String, required: true },
        wwElementState: { type: Object, required: true },
        useForm: { type: Boolean, default: true }, // TODO => Prevent specific component from using form
    },
    emits: [
        'element-event',
        'trigger-event',
        'add-state',
        'remove-state',
        'update:content:effect',
        'update:sidepanel-content',
    ],
    setup(props, { emit }) {
        const isEditing = computed(() => {
            /* wwEditor:start */
            return props.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            return false;
        });

        /* wwEditor:start */
        const { selectParentElement } = useParentSelection(props, emit);
        /* wwEditor:end */

        const {
            inputRef,
            variableValue,
            isReallyFocused,
            isDebouncing,
            type,
            step,
            inputType,
            isReadonly,
            style,
            min,
            max,
            stepAttribute,
            handleManualInput,
            focusInput,
            selectInput,
            onBlur,
            setValue,
        } = useInput(props, emit);

        const {
            isCurrencyType,
            showCurrencySymbol,
            currencySymbol,
            currencySymbolRef,
            currencySymbolStyle,
            currencyInputStyle,
            symbolPosition,
            onCurrencyBlur,
            onCurrencyFocus,
            formattedCurrencyValue,
        } = useCurrency(props, { emit, setValue, variableValue });

        // Create maska options for currency formatting
        const currencyMaskaOptions = computed(() => {
            if (props.content.type !== 'currency') return null;
            
            const thousandsSep = props.content.currencyThousandsSeparator || ',';
            const decimalSep = props.content.currencyDecimalSeparator || '.';
            const decimalPlaces = props.content.currencyDecimalPlaces ?? 2;
            
            return {
                mask: '#*',
                tokens: {
                    '#': { pattern: /[0-9]/, repeated: true },
                },
                preProcess: (val) => val.replace(/[^\d]/g, ''),
                postProcess: (val) => {
                    if (!val) return '';
                    
                    let num = parseFloat(val) / (10 ** decimalPlaces);
                    
                    // Format with separators
                    let formatted = num.toLocaleString('en-US', {
                        minimumFractionDigits: decimalPlaces,
                        maximumFractionDigits: decimalPlaces,
                        useGrouping: true,
                    });
                    
                    // Replace separators with custom ones
                    if (thousandsSep !== ',') {
                        formatted = formatted.replace(/,/g, thousandsSep);
                    }
                    if (decimalSep !== '.') {
                        formatted = formatted.replace(/\./g, decimalSep);
                    }
                    
                    return formatted;
                },
            };
        });

        function handleCurrencyInput(event) {
            // The maska library will handle formatting, we just need to extract the numeric value
            const maskedValue = event.target.value;
            const numericValue = maskedValue.replace(/[^\d]/g, '');
            const decimalPlaces = props.content.currencyDecimalPlaces ?? 2;
            const actualValue = parseFloat(numericValue) / (10 ** decimalPlaces);
            
            setValue(actualValue || 0);
            
            if (!props.content.debounce) {
                emit('trigger-event', { name: 'change', event: { domEvent: event, value: actualValue } });
                emit('element-event', { type: 'change', value: { domEvent: event, value: actualValue } });
            }
        }

        const useForm = inject('_wwForm:useForm', () => {});

        const fieldName = computed(() => props.content.fieldName);
        const validation = computed(() => props.content.validation);
        const customValidation = computed(() => props.content.customValidation);
        const required = computed(() => props.content.required);

        useForm(
            variableValue,
            { fieldName, validation, customValidation, required, initialValue: computed(() => props.content.value) },
            { elementState: props.wwElementState, emit, sidepanelFormPath: 'form', setValue }
        );

        const inputBindings = computed(() => ({
            ...props.wwElementState.props.attributes,
            key: 'ww-input-basic-' + step.value,
            value: variableValue.value,
            type: inputType.value,
            name: props.wwElementState.name,
            readonly: isReadonly.value || isEditing.value,
            required: props.content.required,
            autocomplete: props.content.autocomplete ? 'on' : 'off',
            placeholder: wwLib.wwLang.getText(props.content.placeholder),
            style: style.value,
            min: min.value,
            max: max.value,
            step: stepAttribute.value,
        }));

        const textareaBindings = computed(() => ({
            ...props.wwElementState.props.attributes,
            value: variableValue.value,
            type: props.content.type,
            name: props.wwElementState.name,
            readonly: isReadonly.value || isEditing.value,
            required: props.content.required,
            placeholder: wwLib.wwLang.getText(props.content.placeholder),
            rows: props.content.rows,
            style: [style.value, { resize: props.content.resize ? '' : 'none' }],
        }));

        const inputClasses = computed(() => ({
            hideArrows: props.content.hideArrows && inputType.value === 'number',
            'date-placeholder': props.content.type === 'date' && !variableValue.value,
            '-readonly': isReadonly.value,
            editing: isEditing.value,
        }));

        function onEnter() {
            emit('trigger-event', { name: 'onEnterKey', event: { value: variableValue.value } });
        }

        watch(
            () => props.content.value,
            v => {
                emit('trigger-event', { name: 'initValueChange', event: { value: v } });
            }
        );

        return {
            inputRef,
            isReallyFocused,
            isDebouncing,
            type,
            step,
            inputType,
            isReadonly,
            style,
            isEditing,
            min,
            max,
            stepAttribute,
            handleManualInput,
            focusInput,
            selectInput,
            onBlur,
            /* wwEditor:start */
            selectParentElement,
            /* wwEditor:end */
            inputBindings,
            textareaBindings,
            inputClasses,
            onEnter,
            // Currency-related
            handleCurrencyInput,
            currencyMaskaOptions,
            showCurrencySymbol,
            currencySymbolStyle,
            currencySymbol,
            currencySymbolRef,
            currencyInputStyle,
            onCurrencyBlur,
            onCurrencyFocus,
            formattedCurrencyValue,
            symbolPosition,
            // End Currency
        };
    },
};
</script>

<style lang="scss" scoped>
.input-currency-wrapper {
    position: relative;

    &.has-currency-symbol {
        display: flex;
        align-items: center;
        height: 100%;

        .currency-symbol {
            pointer-events: none;
            font-size: inherit;
            color: var(--placeholder-color, #000000ad);
            white-space: nowrap; /* Ensure symbol doesn't wrap */
        }
    }
}

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

    &.currency-type {
        background-color: transparent;
        width: 100%;
    }
}
</style>