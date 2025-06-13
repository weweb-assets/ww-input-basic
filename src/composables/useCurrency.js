import { computed, ref, watch, nextTick, watchEffect } from 'vue';

export function useCurrency(props, { variableValue } = {}) {
    // Computed
    const isCurrencyType = computed(() => props.content.type === 'currency');
    const showCurrencySymbol = computed(() => props.content.type === 'currency' && props.content.currencyShowSymbol);

    // Props
    const currencySymbol = computed(() => props.content.currencySymbol || '$');
    const symbolPosition = computed(() => props.content.currencySymbolPosition || 'prefix');
    const decimalPlaces = computed(() => props.content.currencyDecimalPlaces ?? 2);
    const decimalSeparator = computed(() => props.content.currencyDecimalSeparator || '.');
    const thousandsSeparator = computed(() => props.content.currencyThousandsSeparator ?? ',');

    // Refs
    const currencySymbolRef = ref(null);
    const currencyInputStyle = ref('');

    const { value: formattedCurrencyValue, setValue: setFormattedCurrencyValue } =
        wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'formatted value',
            isActive: isCurrencyType,
        });

    // Styles
    const currencySymbolStyle = computed(() => ({
        left: symbolPosition.value === 'prefix' ? props.content.currencySymbolPadding ?? '0px' : 'auto',
        right: symbolPosition.value === 'suffix' ? props.content.currencySymbolPadding ?? '0px' : 'auto',
        fontSize: props.content.currencySymbolFontSize || 'inherit',
        color: props.content.currencySymbolColor || 'inherit',
    }));

    const onCurrencyBlur = () => {
        if (!variableValue.value) return '';
        const formattedValue = formatCurrency(variableValue.value);
        if (formattedCurrencyValue.value !== formattedValue) {
            setFormattedCurrencyValue(formattedValue);
        }
    };

    const onCurrencyFocus = () => {
        if (!variableValue.value) return '';
        const formattedValue = formatCurrency(variableValue.value);
        if (formattedCurrencyValue.value !== formattedValue) {
            setFormattedCurrencyValue(formattedValue);
        }
    };

    const updateCurrencyInputStyle = async () => {
        await nextTick();
        if (showCurrencySymbol.value && currencySymbolRef.value) {
            // Add some extra space to ensure text doesn't overlap with the symbol
            currencyInputStyle.value = {
                [`padding-${
                    symbolPosition.value === 'prefix' ? 'left' : 'right'
                }`]: `${props.content.currencySymbolPadding}`,
            };
        }
    };

    // Format number with custom thousands separators
    const formatNumber = (value, thousandsSep) => {
        if (!value) return '';

        // Replace all non-digit characters
        let cleanValue = value.replace(/\D/g, '');

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
    const formatCurrency = (value, options = {}) => {
        const { padZeros = true, includeSymbol = true } = options;
        if (value === undefined || value === null || value === '') return '';

        // Remove currency symbol if present
        let inputVal = value.toString();
        const symbol = currencySymbol.value;
        if (symbolPosition.value === 'prefix' && inputVal.startsWith(symbol)) {
            inputVal = inputVal.substring(symbol.length);
        } else if (symbolPosition.value === 'suffix' && inputVal.endsWith(symbol)) {
            inputVal = inputVal.substring(0, inputVal.length - symbol.length);
        }

        // Find decimal position - prioritize the configured decimal separator
        let decimalPos = -1;
        
        // First, check if the configured decimal separator exists
        if (decimalSeparator.value && inputVal.includes(decimalSeparator.value)) {
            decimalPos = inputVal.lastIndexOf(decimalSeparator.value);
        } else {
            // Fallback: look for common decimal separators (dot or comma)
            decimalPos = Math.max(inputVal.lastIndexOf('.'), inputVal.lastIndexOf(','));
        }

        let leftSide = '';
        let rightSide = '';

        if (decimalPos >= 0) {
            // Split into left and right sides of decimal
            leftSide = inputVal.substring(0, decimalPos);
            rightSide = inputVal.substring(decimalPos + 1);

            // Clean right side to only digits
            rightSide = rightSide.replace(/\D/g, '');

            // Handle decimal places
            if (padZeros) {
                rightSide = rightSide.padEnd(decimalPlaces.value, '0').substring(0, decimalPlaces.value);
            } else {
                rightSide = rightSide.substring(0, decimalPlaces.value);
            }
        } else {
            // No decimal part
            leftSide = inputVal;
            rightSide = padZeros ? '0'.repeat(decimalPlaces.value) : '';
        }

        // Format left side with thousand separators
        const cleanLeftSide = leftSide.replace(/\D/g, '');
        leftSide = formatNumber(cleanLeftSide, thousandsSeparator.value);

        // Combine parts
        let formattedValue = leftSide;
        if (rightSide || (decimalPos >= 0 && !padZeros) || (padZeros && decimalPlaces.value > 0)) {
            // Show decimal separator if:
            // - There are decimal digits, OR
            // - User entered a decimal separator (when not padding), OR
            // - We're padding and decimal places > 0 (always show for currency formatting)
            formattedValue += decimalSeparator.value + rightSide;
        }

        // Add currency symbol if enabled and requested
        if (includeSymbol && showCurrencySymbol.value && currencySymbol.value) {
            if (symbolPosition.value === 'prefix') {
                formattedValue = currencySymbol.value + formattedValue;
            } else {
                formattedValue = formattedValue + currencySymbol.value;
            }
        }

        return formattedValue;
    };

    // Watch for padding changes
    watch(
        [
            showCurrencySymbol,
            () => props.content.currencySymbol,
            () => props.content.currencySymbolPosition,
            () => props.content.currencySymbolPadding,
        ],
        async () => {
            if (isCurrencyType.value) {
                await updateCurrencyInputStyle();
            }
        }
    );

    // Watch for formatting changes
    watch(
        [
            () => props.content.currencyDecimalPlaces,
            () => props.content.currencyDecimalSeparator,
            () => props.content.currencyThousandsSeparator,
        ],
        async () => {
            if (isCurrencyType.value) {
                const formattedValue = formatCurrency(variableValue.value);
                if (formattedCurrencyValue.value !== formattedValue) {
                    setFormattedCurrencyValue(formattedValue);
                }
            }
        }
    );

    // Initial padding update
    watchEffect(
        async () => {
            if (isCurrencyType.value) {
                const formattedValue = formatCurrency(variableValue.value);
                if (formattedCurrencyValue.value !== formattedValue) {
                    setFormattedCurrencyValue(formattedValue);
                }
                await nextTick();
                await updateCurrencyInputStyle();
            }
        },
        { immediate: true }
    );

    return {
        isCurrencyType,
        showCurrencySymbol,
        currencySymbol,
        symbolPosition,
        decimalPlaces,
        decimalSeparator,
        thousandsSeparator,
        currencySymbolRef,
        currencyInputStyle,
        currencySymbolStyle,
        updateCurrencyInputStyle,
        onCurrencyBlur,
        onCurrencyFocus,
        formattedCurrencyValue,
        formatCurrency,
    };
}
