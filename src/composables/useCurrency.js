import { computed, ref, watch, nextTick } from 'vue';

export function useCurrency(props, { variableValue } = {}) {

    // Computed
    const isCurrencyType = computed(() => props.content.type === 'currency');
    const showCurrencySymbol = computed(
        () => props.content.type === 'currency' && props.content.currencyShowSymbol
    );

    // Props
    const currencySymbol = computed(() => props.content.currencySymbol || '$');
    const symbolPosition = computed(() => props.content.currencySymbolPosition || 'prefix');
    const decimalPlaces = computed(() => props.content.currencyDecimalPlaces ?? 2);
    const decimalSeparator = computed(() => props.content.currencyDecimalSeparator || '.');
    const thousandsSeparator = computed(() => props.content.currencyThousandsSeparator || ',');
    
    // Refs
    const currencySymbolRef = ref(null);
    const currencyInputStyle = ref(''); // Default paddin

    // const formattedCurrencyValue = ref(null);
    // const setFormattedCurrencyValue = ref(null);

    const { value: formattedCurrencyValue, setValue: setFormattedCurrencyValue } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'formatted value',
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
        setFormattedCurrencyValue(formattedValue);
    };

    const onCurrencyFocus = () => {
        if (!variableValue.value) return '';
        const formattedValue = formatCurrency(variableValue.value);
        setFormattedCurrencyValue(formattedValue);
    };

    const updateCurrencyInputStyle = async () => {
        await nextTick();
        if (showCurrencySymbol.value && currencySymbolRef.value) {
            // Add some extra space to ensure text doesn't overlap with the symbol
            currencyInputStyle.value = { [`padding-${symbolPosition.value === 'prefix' ? 'left' : 'right'}`]: `${props.content.currencySymbolPadding}` };
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
    const formatCurrency = (value) => {
        if (!value) return '';

        // Remove currency symbol if present
        let inputVal = value.toString();
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
            rightSide = rightSide.padEnd(decimalPlaces.value, '0').substring(0, decimalPlaces.value);
        } else {
            // No decimal part
            leftSide = inputVal;
            rightSide = "";
        }

        // Format left side with thousand separators
        const cleanLeftSide = leftSide.replace(/\D/g, "");
        leftSide = formatNumber(cleanLeftSide, thousandsSeparator.value);

        // Combine parts
        let formattedValue = leftSide;
        if (rightSide) {
            formattedValue += decimalSeparator.value + rightSide;
        }

        return formattedValue;
    };

    // Watch for padding changes
    watch(
        [
            showCurrencySymbol,
            () => props.content.currencySymbol,
            () => props.content.currencySymbolPosition,
            () => props.content.currencySymbolPadding
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
            () => props.content.currencyThousandsSeparator
        ],
        async () => {
            if (isCurrencyType.value) {
                const formattedValue = formatCurrency(variableValue.value);
                setFormattedCurrencyValue(formattedValue);
            }
        }
    );

    // Initial padding update
    watch(
        [isCurrencyType],
        async () => {
            if (isCurrencyType.value) {
                await nextTick();
                await updateCurrencyInputStyle();
            }
            updateFormattedCurrencyValue();
        }
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
    };
}