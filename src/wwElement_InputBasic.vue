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
                class="ww-input-basic currency-type"
                :class="[inputClasses]"
                :style="showCurrencySymbol ? currencyInputStyle : {}"
                type="text"
                @input="handleCurrencyInput"
                @keydown="handleCurrencyKeydown"
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
import { computed, inject, watch, nextTick, ref } from 'vue';
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

        // Track the formatted display value separately for currency inputs
        const currencyDisplayValue = ref('');

        // Create maska options for currency formatting
        const currencyMaskaOptions = computed(() => {
            if (props.content.type !== 'currency') return null;
            
            const thousandsSep = props.content.currencyThousandsSeparator || ',';
            const decimalSep = props.content.currencyDecimalSeparator || '.';
            const decimalPlaces = props.content.currencyDecimalPlaces ?? 2;
            
            const options = {
                mask: '#*',
                tokens: {
                    '#': { pattern: new RegExp(`[0-9\\${decimalSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`), repeated: true },
                },
                postProcess: (val) => {
                    if (!val) return '';
                    
                    // Handle decimal separator (split by the configured separator)
                    let parts = val.split(decimalSep);
                    let integerPart = parts[0] || '';
                    let decimalPart = parts[1] || '';
                    
                    // Limit decimal places
                    if (decimalPart.length > decimalPlaces) {
                        decimalPart = decimalPart.substring(0, decimalPlaces);
                    }
                    
                    // Add thousands separators to integer part
                    if (integerPart && thousandsSep) {
                        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
                    }
                    
                    // Combine parts
                    let result = integerPart;
                    if (parts.length > 1) {
                        result += decimalSep + decimalPart;
                    }
                    
                    return result;
                },
            };
            
            return options;
        });

        function handleCurrencyKeydown(event) {
            const decimalSep = props.content.currencyDecimalSeparator || '.';
            
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (event.keyCode === 65 && event.ctrlKey === true) ||
                (event.keyCode === 67 && event.ctrlKey === true) ||
                (event.keyCode === 86 && event.ctrlKey === true) ||
                (event.keyCode === 88 && event.ctrlKey === true) ||
                // Allow: home, end, left, right, down, up
                (event.keyCode >= 35 && event.keyCode <= 40)) {
                return;
            }
            
            // Allow numbers (0-9) - check the actual key rather than keyCode+shift
            if (/^[0-9]$/.test(event.key)) {
                return;
            }
            
            // Allow decimal separator only if it's not already present
            if (event.key === decimalSep && !event.target.value.includes(decimalSep)) {
                return;
            }
            
            // Prevent all other characters
            event.preventDefault();
        }

        function handleCurrencyInput(event) {
            const input = event.target;
            const rawValue = input.value;
            const cursorPosition = input.selectionStart;
            const thousandsSep = props.content.currencyThousandsSeparator || ',';
            const decimalSep = props.content.currencyDecimalSeparator || '.';
            const decimalPlaces = props.content.currencyDecimalPlaces ?? 2;
            
            // Check for conflicting separators
            if (thousandsSep === decimalSep) {
                console.warn('⚠️ Warning: Thousands separator and decimal separator are the same:', thousandsSep);
                
                /* wwEditor:start */
                wwLib.wwNotification.open({
                    text: {
                        en: `Currency input error: Thousands separator and decimal separator cannot be the same ("${thousandsSep}").<br/>Please change one of them in the component settings.`,
                    },
                    color: 'red',
                    duration: 10000,
                });
                /* wwEditor:end */
            }
            
            // Clean input - remove any existing separators
            let cleanValue = rawValue.replace(new RegExp(`\\${thousandsSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), '');
            if (decimalSep !== '.') {
                cleanValue = cleanValue.replace(decimalSep, '.');
            }
            
            // Extract numeric value
            const actualValue = parseFloat(cleanValue) || 0;
            
            // Format for display
            let parts = cleanValue.split('.');
            let integerPart = parts[0] || '';
            let decimalPart = parts[1] || '';
            
            // Add thousands separators
            if (integerPart && thousandsSep) {
                integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
            }
            
            // Limit decimal places
            if (decimalPart.length > decimalPlaces) {
                decimalPart = decimalPart.substring(0, decimalPlaces);
            }
            
            // Combine formatted value
            let formattedValue = integerPart;
            if (parts.length > 1) {
                formattedValue += decimalSep + decimalPart;
            }
            
            // Calculate cursor position adjustment
            const oldLength = rawValue.length;
            const newLength = formattedValue.length;
            
            // Count separators before cursor in old and new value
            const separatorsBeforeCursorOld = (rawValue.substring(0, cursorPosition).match(new RegExp(`\\${thousandsSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')) || []).length;
            const separatorsBeforeCursorNew = (formattedValue.substring(0, cursorPosition + (newLength - oldLength)).match(new RegExp(`\\${thousandsSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')) || []).length;
            
            const newCursorPosition = Math.min(
                formattedValue.length,
                Math.max(0, cursorPosition + (separatorsBeforeCursorNew - separatorsBeforeCursorOld))
            );
            
            // Set the numeric value for form handling
            setValue(actualValue);
            
            // Update the display value reactively
            currencyDisplayValue.value = formattedValue;
            
            // Restore cursor position after Vue updates
            nextTick(() => {
                if (input.selectionStart !== newCursorPosition) {
                    input.setSelectionRange(newCursorPosition, newCursorPosition);
                }
            });
            
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
            value: isCurrencyType.value ? currencyDisplayValue.value : variableValue.value,
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

        // Watch for separator changes and reformat currency input
        watch(
            [
                () => props.content.currencyThousandsSeparator,
                () => props.content.currencyDecimalSeparator,
                () => props.content.currencyDecimalPlaces
            ],
            () => {
                if (props.content.type === 'currency' && currencyDisplayValue.value) {
                    // Extract the current numeric value from display
                    const currentThousandsSep = props.content.currencyThousandsSeparator || ',';
                    const currentDecimalSep = props.content.currencyDecimalSeparator || '.';
                    const currentDecimalPlaces = props.content.currencyDecimalPlaces ?? 2;
                    
                    // Check for conflicting separators
                    if (currentThousandsSep === currentDecimalSep) {
                        console.warn('⚠️ Warning: Thousands separator and decimal separator are the same:', currentThousandsSep);
                        
                        /* wwEditor:start */
                        wwLib.wwNotification.open({
                            text: {
                                en: `Currency input error: Thousands separator and decimal separator cannot be the same ("${currentThousandsSep}").<br/>Please change one of them in the component settings.`,
                            },
                            color: 'red',
                            duration: 10000,
                        });
                        /* wwEditor:end */
                        return; // Don't reformat if separators are invalid
                    }
                    
                    // Get the numeric value from variableValue (which should be clean)
                    const numericValue = variableValue.value || 0;
                    
                    // Reformat with new settings
                    let cleanValueStr = numericValue.toString();
                    let parts = cleanValueStr.split('.');
                    let integerPart = parts[0] || '';
                    let decimalPart = parts[1] || '';
                    
                    // Add thousands separators with new separator
                    if (integerPart && currentThousandsSep) {
                        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currentThousandsSep);
                    }
                    
                    // Handle decimal places with new settings
                    if (currentDecimalPlaces > 0) {
                        // Pad or truncate decimal part
                        if (decimalPart.length < currentDecimalPlaces) {
                            decimalPart = decimalPart.padEnd(currentDecimalPlaces, '0');
                        } else if (decimalPart.length > currentDecimalPlaces) {
                            decimalPart = decimalPart.substring(0, currentDecimalPlaces);
                        }
                        
                        if (decimalPart || parts.length > 1) {
                            integerPart += currentDecimalSep + decimalPart;
                        }
                    }
                    
                    currencyDisplayValue.value = integerPart;
                }
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
            handleCurrencyKeydown,
            currencyMaskaOptions,
            currencyDisplayValue,
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