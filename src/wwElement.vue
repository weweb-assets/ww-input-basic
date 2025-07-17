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
                    event => {
                        isReallyFocused = false;
                        handleCurrencyBlur(event);
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
        @blur="onBlur"
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
        @click="handleColorInputClick"
        @keyup.enter="onEnter"
    />
</template>

<script>
import { computed, inject, watch, nextTick, ref } from 'vue';
import { useInput } from './composables/useInput';
import { useCurrency } from './composables/useCurrency';
/* wwEditor:start */
import useParentSelection from './editor/useParentSelection';
/* wwEditor:end */

export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwFrontState: { type: Object, required: true },
        wwEditorState: { type: Object, required: true },
        parentSelection: { type: Object, default: () => ({ allow: false, texts: {} }) },
        /* wwEditor:end */
        uid: { type: String, required: true },
        wwElementState: { type: Object, required: true },
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
            displayValue,
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

        // Get delay value for currency debouncing
        const delay = computed(() => wwLib.wwUtils.getLengthUnit(props.content.debounceDelay)[0]);

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
            formatCurrency,
        } = useCurrency(props, { emit, setValue, variableValue });

        // Track the formatted display value separately for currency inputs
        const currencyDisplayValue = ref('');

        // Track if we're currently typing to avoid re-formatting during input
        let isTyping = false;

        // Debounce timeout for currency input
        let currencyDebounceTimeout = null;

        // Initialize currency display value from initial value
        watch(
            [() => props.content.type, () => props.content.value, variableValue],
            ([contentType, propsValue, variableValue], [oldContentType, oldPropsValue, oldVariableValue]) => {
                // Use props.content.value if it exists (binding case), otherwise use variableValue
                const value = propsValue !== undefined && propsValue !== null ? propsValue : variableValue;

                // Check if props.content.value (init value) has changed
                const isInitValueChange =
                    propsValue !== oldPropsValue && propsValue !== undefined && propsValue !== null;

                if (contentType === 'currency' && (!isTyping || isInitValueChange)) {
                    if (value !== undefined && value !== null && value !== '') {
                        // Format when not typing OR when init value changes (override typing)
                        // For input field, use formatCurrency with zero padding and without symbol
                        const inputFormattedValue = formatCurrency(value, { padZeros: true, includeSymbol: false });
                        if (currencyDisplayValue.value !== inputFormattedValue) {
                            currencyDisplayValue.value = inputFormattedValue;
                        }
                        // Reset isTyping when init value changes
                        if (isInitValueChange) {
                            isTyping = false;
                        }
                    } else {
                        // Clear the display value when the actual value is empty/null/undefined
                        if (currencyDisplayValue.value !== '') {
                            currencyDisplayValue.value = '';
                        }
                    }
                }
            },
            { immediate: true }
        );

        function handleCurrencyKeydown(event) {
            const decimalSep = props.content.currencyDecimalSeparator || '.';
            const decimalPlaces = props.content.currencyDecimalPlaces ?? 2;

            // Allow: backspace, delete, tab, escape, enter
            if (
                [8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (event.keyCode === 65 && event.ctrlKey === true) ||
                (event.keyCode === 67 && event.ctrlKey === true) ||
                (event.keyCode === 86 && event.ctrlKey === true) ||
                (event.keyCode === 88 && event.ctrlKey === true) ||
                // Allow: home, end, left, right, down, up
                (event.keyCode >= 35 && event.keyCode <= 40)
            ) {
                return;
            }

            // Allow decimal separator only if it's not already present
            if (event.key === decimalSep && !event.target.value.includes(decimalSep)) {
                return;
            }

            // Allow numbers (0-9) but check decimal places limit
            if (/^[0-9]$/.test(event.key)) {
                const currentValue = event.target.value;
                const cursorPosition = event.target.selectionStart;
                const decimalIndex = currentValue.indexOf(decimalSep);

                // If we have a decimal separator and cursor is after it
                if (decimalIndex >= 0 && cursorPosition > decimalIndex) {
                    const currentDecimalPart = currentValue.substring(decimalIndex + 1);

                    // Check if we're already at the decimal places limit
                    if (currentDecimalPart.length >= decimalPlaces) {
                        event.preventDefault();
                        return;
                    }
                }

                // Allow the digit
                return;
            }

            // Prevent all other characters
            event.preventDefault();
        }

        function handleCurrencyBlur(event) {
            if (props.content.type !== 'currency') return;

            isTyping = false; // Allow watcher to work again after typing is done

            const input = event.target;
            const rawValue = input.value;
            const decimalSep = props.content.currencyDecimalSeparator || '.';
            const decimalPlaces = props.content.currencyDecimalPlaces ?? 2;

            // Apply final formatting with zero padding on blur
            if (rawValue && decimalPlaces > 0) {
                const parts = rawValue.split(decimalSep);
                const integerPart = parts[0];
                let decimalPart = parts[1] || '';

                // Always pad with zeros to reach required decimal places, even if no decimal separator was typed
                if (decimalPart.length < decimalPlaces) {
                    decimalPart = decimalPart.padEnd(decimalPlaces, '0');
                }

                const finalValue = integerPart + decimalSep + decimalPart;

                // Update display value with padded zeros
                if (currencyDisplayValue.value !== finalValue) {
                    currencyDisplayValue.value = finalValue;
                }
            }

            // Call original blur handler
            onBlur(event);
        }

        function handleCurrencyInput(event) {
            isTyping = true; // Prevent watcher from re-formatting during typing

            const input = event.target;
            const rawValue = input.value;
            const cursorPosition = input.selectionStart;
            const thousandsSep = props.content.currencyThousandsSeparator ?? ',';
            const decimalSep = props.content.currencyDecimalSeparator || '.';
            const decimalPlaces = props.content.currencyDecimalPlaces ?? 2;

            // Prevent multiple processing of the same value
            if (rawValue === currencyDisplayValue.value) {
                return;
            }

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

            // Clean input - smarter separator handling
            let cleanValue = rawValue;
            let hasUserDecimal = false;

            // First, remove any invalid characters - keep only digits and common separators
            const validChars = new RegExp(
                `[^\\d\\.,\\s'${thousandsSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${decimalSep.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                )}]`,
                'g'
            );
            cleanValue = cleanValue.replace(validChars, '');

            // First, detect if user entered a decimal separator (any common decimal separator)
            const commonDecimalSeparators = [',', '.'];
            let userDecimalSeparator = null;

            for (const sep of commonDecimalSeparators) {
                if (sep !== thousandsSep && cleanValue.includes(sep)) {
                    userDecimalSeparator = sep;
                    hasUserDecimal = true;
                    break;
                }
            }

            if (hasUserDecimal && userDecimalSeparator) {
                // Replace the user's decimal separator with standard dot, but only the LAST occurrence
                const lastDecimalIndex = cleanValue.lastIndexOf(userDecimalSeparator);
                if (lastDecimalIndex !== -1) {
                    cleanValue =
                        cleanValue.substring(0, lastDecimalIndex) + '.' + cleanValue.substring(lastDecimalIndex + 1);
                }
            }

            // Then remove thousands separators intelligently
            if (thousandsSep) {
                if (hasUserDecimal) {
                    // User entered decimal separator - find the LAST dot (which is the decimal separator)
                    // and only remove thousands separators from before it
                    const lastDotIndex = cleanValue.lastIndexOf('.');
                    if (lastDotIndex !== -1) {
                        const integerPart = cleanValue.substring(0, lastDotIndex);
                        const decimalPart = cleanValue.substring(lastDotIndex + 1); // exclude the dot itself

                        // Remove thousands separators from integer part
                        let cleanIntegerPart;
                        if (thousandsSep === '.') {
                            // Simple string replacement for dots
                            cleanIntegerPart = integerPart.replace(/\./g, '');
                        } else {
                            // Use regex for other separators
                            cleanIntegerPart = integerPart.replace(
                                new RegExp(`\\${thousandsSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
                                ''
                            );
                        }

                        // Reconstruct with decimal point - but if decimal part is empty and user just typed decimal separator, add the dot
                        if (decimalPart || rawValue.endsWith(decimalSep)) {
                            cleanValue = cleanIntegerPart + '.' + decimalPart;
                        } else {
                            cleanValue = cleanIntegerPart;
                        }
                    }
                } else {
                    // No user decimal separator entered yet
                    if (thousandsSep === '.' && cleanValue.includes('.')) {
                        // When thousands separator is dot, we need to be very careful
                        // In this context, all dots should be treated as thousands separators
                        // because the user hasn't entered a decimal separator (comma) yet
                        cleanValue = cleanValue.replace(/\./g, '');
                    } else {
                        // Normal case: remove all thousands separators
                        cleanValue = cleanValue.replace(
                            new RegExp(`\\${thousandsSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
                            ''
                        );
                    }
                }
            }

            // Format for display first (this will also determine the final value)
            let parts = cleanValue.split('.');
            let integerPart = parts[0] || '';
            let decimalPart = parts[1] || '';

            // Limit decimal places BEFORE parsing to ensure consistency
            if (decimalPart.length > decimalPlaces) {
                decimalPart = decimalPart.substring(0, decimalPlaces);
            }

            // Reconstruct the clean value with limited decimal places
            const limitedCleanValue = integerPart + (decimalPart ? '.' + decimalPart : '');

            // Extract numeric value from the limited clean value
            // If the clean value is empty, keep it as empty string instead of defaulting to 0
            const actualValue = limitedCleanValue === '' ? '' : parseFloat(limitedCleanValue) || 0;

            // Add thousands separators to integer part
            if (integerPart && thousandsSep) {
                integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
            }

            // Combine formatted value - don't pad zeros while typing
            let formattedValue = integerPart;
            if (parts.length > 1 || rawValue.includes(decimalSep)) {
                // Show decimal separator if user typed it, even if no decimal digits yet
                formattedValue += decimalSep + decimalPart;
            }

            // Calculate cursor position adjustment
            const oldLength = rawValue.length;
            const newLength = formattedValue.length;

            // Simpler cursor positioning logic
            let newCursorPosition;

            // If cursor is at the end, keep it at the end
            if (cursorPosition >= rawValue.length) {
                newCursorPosition = formattedValue.length;
            } else {
                // Find where to position cursor based on character-by-character comparison
                const beforeCursor = rawValue.substring(0, cursorPosition);
                const digitsAndDecimalBeforeCursor = beforeCursor.replace(
                    new RegExp(`[^\\d${decimalSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g'),
                    ''
                );

                // Count through the formatted value to find equivalent position
                let count = 0;
                newCursorPosition = 0;

                for (let i = 0; i < formattedValue.length; i++) {
                    const char = formattedValue[i];
                    if (/\d/.test(char) || char === decimalSep) {
                        if (count < digitsAndDecimalBeforeCursor.length) {
                            count++;
                            newCursorPosition = i + 1;
                        } else {
                            break;
                        }
                    }
                }

                // If we didn't find enough characters, position at end
                if (count < digitsAndDecimalBeforeCursor.length) {
                    newCursorPosition = formattedValue.length;
                }
            }

            // Ensure cursor is within bounds
            newCursorPosition = Math.min(formattedValue.length, Math.max(0, newCursorPosition));

            // Set the numeric value for form handling
            setValue(actualValue);

            // Update the display value reactively only if it changed
            if (currencyDisplayValue.value !== formattedValue) {
                currencyDisplayValue.value = formattedValue;
            }

            // Restore cursor position after Vue updates
            nextTick(() => {
                if (input.selectionStart !== newCursorPosition) {
                    input.setSelectionRange(newCursorPosition, newCursorPosition);
                }
            });

            // Trigger events based on debounce setting (same as regular input)
            if (props.content.debounce) {
                isDebouncing.value = true;
                if (currencyDebounceTimeout) {
                    clearTimeout(currencyDebounceTimeout);
                }
                currencyDebounceTimeout = setTimeout(() => {
                    emit('trigger-event', { name: 'change', event: { domEvent: event, value: actualValue } });
                    emit('element-event', { type: 'change', value: { domEvent: event, value: actualValue } });
                    isDebouncing.value = false;
                }, delay.value);
            } else {
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
            value: props.content.type === 'currency' ? currencyDisplayValue.value : displayValue.value,
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
            value: displayValue.value,
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

        function handleColorInputClick(event) {
            // Prevent color picker from opening when input is readonly (either from isReadonly or isEditing)
            if (props.content.type === 'color' && (isReadonly.value || isEditing.value)) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
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
                () => props.content.currencyDecimalPlaces,
            ],
            () => {
                if (props.content.type === 'currency' && currencyDisplayValue.value) {
                    // Extract the current numeric value from display
                    const currentThousandsSep = props.content.currencyThousandsSeparator ?? ',';
                    const currentDecimalSep = props.content.currencyDecimalSeparator || '.';
                    const currentDecimalPlaces = props.content.currencyDecimalPlaces ?? 2;

                    // Check for conflicting separators
                    if (currentThousandsSep === currentDecimalSep) {
                        console.warn(
                            '⚠️ Warning: Thousands separator and decimal separator are the same:',
                            currentThousandsSep
                        );

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

                    // Update display value only if it changed
                    if (currencyDisplayValue.value !== integerPart) {
                        currencyDisplayValue.value = integerPart;
                    }
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
            handleColorInputClick,
            // Currency-related
            handleCurrencyInput,
            handleCurrencyKeydown,
            handleCurrencyBlur,
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
