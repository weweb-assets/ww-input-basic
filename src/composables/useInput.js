import { computed, ref, watch, nextTick } from 'vue';

export function useInput(props, emit) {
    const isReallyFocused = ref(false);
    const isDebouncing = ref(false);
    const inputRef = ref(null);
    let debounceTimeout = null;

    // New display value ref to decouple UI from actual value
    const displayValue = ref('');

    const type = computed(() => {
        if (Object.keys(props.wwElementState.props).includes('type')) {
            return props.wwElementState.props.type;
        }
        return props.content.type;
    });

    function formatValue(value) {
        if (type.value !== 'decimal') return value;
        if (value === null || value === undefined || value === '') return '';

        // Convert to string and ensure decimal point is '.'
        const valueStr = `${value}`.replace(',', '.');

        // Determine decimal places from precision setting
        const precisionStr = props.content.precision;
        const decimalPlaces = precisionStr.includes('.') ? precisionStr.split('.')[1].length : 0;

        // Format the number with fixed decimal places
        return Number(valueStr).toFixed(decimalPlaces);
    }

    // Convert string to appropriate type based on input type
    function parseValue(value) {
        if (value === '' || value === null || value === undefined) return '';

        if (type.value === 'decimal' || type.value === 'number') {
            return isNaN(parseFloat(value)) ? value : parseFloat(value);
        }

        return value;
    }

    const defaultValue = computed(() => {
        const rawValue = props.content.value === undefined ? '' : props.content.value;
        return type.value === 'decimal' || type.value === 'number' ? parseValue(rawValue) : rawValue;
    });

    const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'value',
        type: computed(() => (['decimal', 'number', 'currency'].includes(type.value) ? 'number' : 'string')),
        defaultValue,
    });

    // Initialize display value
    watch(
        variableValue,
        newValue => {
            // Make sure the displayed value match the variable value
            nextTick(() => {
                displayValue.value = variableValue.value;
            });

            // Only update display value if not focused, otherwise it will disrupt typing
            if (!isReallyFocused.value) {
                displayValue.value = type.value === 'decimal' ? formatValue(newValue) : String(newValue ?? '');
            }
        },
        { immediate: true }
    );

    watch(defaultValue, () => {
        setValue(defaultValue.value);
    });

    const inputType = computed(() => {
        if (!props.content) return 'text';
        if (props.content.type === 'password') {
            return props.content.displayPassword ? 'text' : 'password';
        }
        return props.content.type === 'decimal' ? 'number' : props.content.type;
    });

    const isReadonly = computed(() => {
        /* wwEditor:start */
        if (props.wwEditorState?.isSelected) {
            return props.wwElementState.states.includes('readonly');
        }
        /* wwEditor:end */
        return props.wwElementState.props.readonly === undefined
            ? props.content.readonly
            : props.wwElementState.props.readonly;
    });

    const style = computed(() => {
        const computedStyle = {
            ...wwLib.wwUtils.getTextStyleFromContent(props.content),
            '--placeholder-color': props.content.placeholderColor,
        };
        delete computedStyle['whiteSpaceCollapse'];
        delete computedStyle['whiteSpace'];
        return computedStyle;
    });

    const min = computed(() => {
        if (type.value === 'date') {
            return props.content.minDate;
        }
        return props.content.min;
    });

    const max = computed(() => {
        if (type.value === 'date') {
            return props.content.maxDate;
        }
        return props.content.max;
    });

    const step = computed(() => {
        if (['decimal', 'number'].includes(type.value)) return props.content.step;
        if ('time' === type.value) return props.content.timePrecision || 1;
        return 1;
    });

    const stepAttribute = computed(() => {
        return !isReallyFocused.value && inputType.value === 'number' ? 'any' : step.value;
    });

    const delay = computed(() => wwLib.wwUtils.getLengthUnit(props.content.debounceDelay)[0]);

    function correctDecimalValue(event) {
        if (type.value === 'decimal' && displayValue.value !== '') {
            const parsedValue = parseValue(displayValue.value);
            const formattedDisplay = formatValue(parsedValue);

            // Update the display value with proper formatting
            displayValue.value = formattedDisplay;

            // Always update the actual value to ensure it's in sync with formatted display
            setValue(parseFloat(formattedDisplay));

            // Only emit the event if the value actually changed
            if (parsedValue !== variableValue.value) {
                emit('trigger-event', {
                    name: 'change',
                    event: { domEvent: event, value: parsedValue },
                });
            }
        }
    }

    function handleManualInput(event) {
        const rawValue = event.target.value;

        // Update display value as user types
        displayValue.value = rawValue;

        // For decimal/number, only parse when sending events
        let parsedValue;

        if (inputType.value === 'number' && (rawValue === 0 || (rawValue && rawValue.length))) {
            try {
                parsedValue = parseFloat(rawValue);
                if (isNaN(parsedValue)) {
                    parsedValue = rawValue;
                }
            } catch (error) {
                parsedValue = rawValue;
            }
        } else {
            parsedValue = rawValue;
        }

        // Avoid updating if the value hasn't changed
        if (parsedValue === variableValue.value) return;

        // Update the actual value
        setValue(parsedValue);

        // Trigger events
        if (props.content.debounce) {
            isDebouncing.value = true;
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            debounceTimeout = setTimeout(() => {
                emit('trigger-event', {
                    name: 'change',
                    event: { domEvent: event, value: parsedValue },
                });
                emit('element-event', { type: 'change', value: { domEvent: event, value: parsedValue } });
                isDebouncing.value = false;
            }, delay.value);
        } else {
            emit('trigger-event', { name: 'change', event: { domEvent: event, value: parsedValue } });
            emit('element-event', { type: 'change', value: { domEvent: event, value: parsedValue } });
        }
    }

    function onBlur(event) {
        correctDecimalValue(event);
        isReallyFocused.value = false;
    }

    function focusInput() {
        if (isReadonly.value) return;
        if (inputRef.value) inputRef.value.focus();
    }

    function selectInput() {
        if (inputRef.value) inputRef.value.select();
    }

    watch(isReallyFocused, (isFocused, wasFocused) => {
        if (isFocused && !wasFocused) {
            emit('trigger-event', { name: 'focus' });
        } else if (!isFocused && wasFocused) {
            emit('trigger-event', { name: 'blur' });
        }
    });

    const isFocused = computed(() => {
        /* wwEditor:start */
        if (props.wwEditorState.isSelected) {
            return props.wwElementState.states.includes('focus');
        }
        /* wwEditor:end */
        return isReallyFocused.value;
    });

    watch(
        isFocused,
        value => {
            if (value) {
                emit('add-state', 'focus');
            } else {
                emit('remove-state', 'focus');
            }
        },
        {
            immediate: true,
        }
    );

    watch(
        isReadonly,
        value => {
            if (value) {
                emit('add-state', 'readonly');
            } else {
                emit('remove-state', 'readonly');
            }
        },
        {
            immediate: true,
        }
    );

    /* wwEditor:start */
    watch(
        () => props.content.precision,
        (newValue, oldValue) => {
            if (newValue === oldValue) return;
            // Only format if not currently focused
            if (!isReallyFocused.value && variableValue.value !== '') {
                displayValue.value = formatValue(variableValue.value);
            }
        }
    );
    /* wwEditor:end */

    return {
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
        isFocused,
        setValue,
    };
}
