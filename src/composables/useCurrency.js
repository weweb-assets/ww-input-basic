import { computed, ref, watch, nextTick } from 'vue';

export function useCurrency(props, { emit, setValue, variableValue } = {}) {
    const isActive = computed(() => props.content.type === 'currency');
    const showCurrencySymbol = computed(
        () => props.content.type === 'currency' && props.content.currencyShowSymbol
    );
    const currencySymbol = computed(() => props.content.currencySymbol || '$');
    const symbolPosition = computed(() => props.content.currencySymbolPosition || 'prefix');
    const decimalPlaces = computed(() => props.content.currencyDecimalPlaces ?? 2);
    const decimalSeparator = computed(() => props.content.currencyDecimalSeparator || '.');
    const thousandsSeparator = computed(() => props.content.currencyThousandsSeparator || ',');

    const currencySymbolRef = ref(null);
    const symbolPadding = ref(''); // Default padding
    const lastCaretPos = ref(0);

    const onCurrencyBlur = () => {
        console.log('Currency blur');
        if (!variableValue.value) return '';
        setValue(formatCurrency(variableValue.value, true));
    };

    const onCurrencyFocus = () => {
        if (!variableValue.value) return '';
        setValue(extractNumericValue(variableValue.value));
    };

    // Count specific characters in a string
    const countOccurrences = (str, char) => {
        return (str.match(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    };

    const updateSymbolPadding = async () => {
        console.log(currencySymbolRef.value);
        await nextTick();
        if (showCurrencySymbol.value && currencySymbolRef.value) {
            const symbolWidth = currencySymbolRef.value.getBoundingClientRect().width;
            // Add some extra space to ensure text doesn't overlap with the symbol
            symbolPadding.value = { [`padding-${symbolPosition.value === 'prefix' ? 'left' : 'right'}`]: `${symbolWidth + 20}px` };
        }
    };

    // Format number with custom thousands separators
    const formatNumber = (value, thousandsSep) => {
        if (!value) return '';

        // Replace all non-digit characters
        let cleanValue = value.replace(/\D/g, "");

        // If no separator specified, just return the clean value
        if (!thousandsSep) {
            return cleanValue;
        }

        // Format with thousands separator
        let formattedValue = '';
        for (let i = 0; i < cleanValue.length; i++) {
            if (i > 0 && (cleanValue.length - i) % 3 === 0) {
                formattedValue += thousandsSep;
            }
            formattedValue += cleanValue[i];
        }

        return formattedValue;
    };

    // Format the currency value
    const formatCurrency = (value, isBlur = false, inputRef = null) => {
        if (!value) return '';

        // Store cursor position
        const caretPos = inputRef ? inputRef.selectionStart : lastCaretPos.value;
        lastCaretPos.value = caretPos;

        // Remove currency symbol if present
        let inputVal = value.toString();
        console.log('Input value', inputVal);
        const symbol = currencySymbol.value;
        if (symbolPosition.value === 'prefix' && inputVal.startsWith(symbol)) {
            inputVal = inputVal.substring(symbol.length);
        } else if (symbolPosition.value === 'suffix' && inputVal.endsWith(symbol)) {
            inputVal = inputVal.substring(0, inputVal.length - symbol.length);
        }

        // Find decimal position (could be . or ,)
        const decimalPos = Math.max(
            inputVal.lastIndexOf("."),
            inputVal.lastIndexOf(",")
        );

        let leftSide = '';
        let rightSide = '';

        if (decimalPos >= 0) {
            // Split into left and right sides of decimal
            leftSide = inputVal.substring(0, decimalPos);
            rightSide = inputVal.substring(decimalPos + 1);

            // Clean right side to only digits
            rightSide = rightSide.replace(/\D/g, "");

            // Handle decimal places
            if (isBlur) {
                // On blur, ensure we have exact decimal places
                rightSide = rightSide.padEnd(decimalPlaces.value, '0').substring(0, decimalPlaces.value);
            } else {
                // During typing, just limit length
                rightSide = rightSide.substring(0, decimalPlaces.value);
            }
        } else {
            // No decimal part
            leftSide = inputVal;
            rightSide = isBlur ? "0".repeat(decimalPlaces.value) : "";
        }

        // Count separators before cursor for position tracking
        const beforeCursor = inputVal.substring(0, caretPos);
        const sepCountBeforeCursor = countOccurrences(beforeCursor, thousandsSeparator.value);
        const isBeforeDecimal = caretPos <= decimalPos || decimalPos === -1;

        // Format left side with thousand separators
        const cleanLeftSide = leftSide.replace(/\D/g, "");
        leftSide = formatNumber(cleanLeftSide, thousandsSeparator.value);

        // Combine parts
        let formattedValue = leftSide;
        if (rightSide || isBlur) {
            formattedValue += decimalSeparator.value + rightSide;
        }

        // Calculate new cursor position
        if (inputRef) {
            let newCaretPos = 0;

            if (isBeforeDecimal) {
                // If cursor was in the left side (before decimal)
                // Count separators in the formatted left side
                const newSepCount = countOccurrences(leftSide, thousandsSeparator.value);

                // Calculate position based on digits typed and separators added
                const digitsPosInOriginal = beforeCursor.replace(/\D/g, "").length;

                // Find where this digit position would be in the new formatted string
                let digitCount = 0;
                let i = 0;
                for (; i < leftSide.length; i++) {
                    if (/\d/.test(leftSide[i])) {
                        digitCount++;
                    }
                    if (digitCount > digitsPosInOriginal) {
                        break;
                    }
                }

                newCaretPos = i;
            } else if (decimalPos >= 0) {
                // If cursor was in the right side (after decimal)
                // Position = left side length + 1 (for decimal) + (cursor position - decimal position - 1)
                newCaretPos = leftSide.length + 1 + (caretPos - decimalPos - 1);
            } else {
                // Fallback - put cursor at the end
                newCaretPos = formattedValue.length;
            }

            // Ensure position is within bounds
            newCaretPos = Math.max(0, Math.min(newCaretPos, formattedValue.length));

            // Set cursor position after a small delay to ensure DOM is updated
            setTimeout(() => {
                if (inputRef) {
                    inputRef.setSelectionRange(newCaretPos, newCaretPos);
                }
            }, 0);
        }

        return formattedValue;
    };

    // Extract numeric value (for calculations)
    const extractNumericValue = (value) => {
        if (!value) return null;

        let cleanValue = value.toString().replace(new RegExp(currencySymbol.value, 'g'), '');

        if (thousandsSeparator.value) {
            cleanValue = cleanValue.replace(new RegExp(thousandsSeparator.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        }

        if (decimalSeparator.value !== '.') {
            cleanValue = cleanValue.replace(decimalSeparator.value, '.');
        }

        return parseFloat(cleanValue);
    };

    // Watch for padding changes
    watch(
        [
            showCurrencySymbol,
            () => props.content.currencySymbol,
            () => props.content.currencySymbolPosition
        ],
        async () => {
            if (isActive.value) {
                await updateSymbolPadding();
            }
        }
    );

    // Watch for formatting changes
    watch(
        [
            () => props.content.currencyDecimalPlaces,
            () => props.content.currencyDecimalSeparator,
            () => props.content.currencyThousandsSeparator
        ],
        async () => {
            if (isActive.value) {
                const formattedValue = formatCurrency(variableValue.value, true);
                setValue(formattedValue);
            }
        }
    );

    // Initial padding update
    watch(
        isActive,
        async () => {
            if (isActive.value) {
                await nextTick();
                await updateSymbolPadding();
            }
        }
    );

    return {
        showCurrencySymbol,
        currencySymbol,
        symbolPosition,
        decimalPlaces,
        decimalSeparator,
        thousandsSeparator,
        currencySymbolRef,
        symbolPadding,
        updateSymbolPadding,
        onCurrencyBlur,
        onCurrencyFocus,
    };
}