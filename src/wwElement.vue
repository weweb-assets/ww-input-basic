<template>
    <div class="ww-input-basic" :class="{ editing: isEditing }">
        <input
            v-if="content.type !== 'textarea'"
            :key="'ww-input-basic-' + step"
            ref="input"
            v-bind="{ ...$attrs, ...(wwElementState.props.attributes || {}) }"
            :value="value"
            class="ww-input-basic__input"
            :class="{
                editing: isEditing,
                hideArrows: content.hideArrows && inputType === 'number',
                'date-placeholder': content.type === 'date' && !value,
                '-readonly': isReadonly,
            }"
            :type="inputType"
            :name="wwElementState.name"
            :readonly="isReadonly"
            :required="content.required"
            :autocomplete="content.autocomplete ? 'on' : 'off'"
            :placeholder="isAdvancedPlaceholder ? '' : wwLang.getText(content.placeholder)"
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
            v-bind="{ ...$attrs, ...(wwElementState.props.attributes || {}) }"
            :value="value"
            class="ww-input-basic__input"
            :class="{ editing: isEditing }"
            :type="content.type"
            :name="wwElementState.name"
            :readonly="isReadonly"
            :required="content.required"
            :placeholder="isAdvancedPlaceholder ? '' : wwLang.getText(content.placeholder)"
            :style="[style, { resize: content.resize ? '' : 'none' }]"
            :rows="content.rows"
            @input="handleManualInput($event)"
            @focus="isReallyFocused = true"
            @blur="isReallyFocused = false"
        />
        <div
            v-if="isAdvancedPlaceholder"
            ref="placeholder"
            class="ww-input-basic__placeholder"
            :class="{ editing: isEditing }"
            :style="placeholderSyle"
            @click="focusInput"
        >
            <wwElement
                style="pointerevents: none"
                v-bind="content.placeholderElement"
                :states="value === 0 || (value && value.length) ? ['active'] : []"
                :ww-props="{ text: wwLang.getText(content.placeholder) }"
            ></wwElement>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
    inheritAttrs: false,
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

        /* wwEditor:start */
        const { createElement } = wwLib.useCreateElement();
        /* wwEditor:end */

        return {
            variableValue,
            setValue,
            formatValue,
            step,
            type,
            inputRef,
            /* wwEditor:start */
            createElement,
            /* wwEditor:end */
        };
    },
    data() {
        return {
            paddingLeft: '0px',
            placeholderPosition: {
                top: '0px',
                left: '0px',
            },
            isReallyFocused: false,
            noTransition: false,
            isMounted: false,
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
        placeholderSyle() {
            const transition = `all ${this.noTransition ? '0ms' : this.content.transition} ${
                this.content.timingFunction
            }`;

            const animatedPosition =
                this.content.placeholderPosition === 'outside'
                    ? {
                          top: '-' + this.content.positioningAjustment,
                          left: this.placeholderPosition.left,
                          transform: `translate3d(0, -100%, 0) scale(${this.content.placeholderScaling})`,
                          transformOrigin: 'left',
                          transition,
                      }
                    : {
                          top: this.content.positioningAjustment,
                          left: this.placeholderPosition.left,
                          transform: `translate3d(0, 0%, 0) scale(${this.content.placeholderScaling})`,
                          transformOrigin: 'left',
                          transition,
                      };

            if (this.content.forceAnimation && this.isEditing) return animatedPosition;
            if (this.value || this.value === 0) return animatedPosition;
            if (this.isDebouncing) return animatedPosition;
            if (this.content.animationTrigger === 'focus' && this.isFocused) return animatedPosition;

            return {
                top: this.placeholderPosition.top,
                left: this.placeholderPosition.left,
                userSelect: 'none',
                transform: 'translate3d(0, 0%, 0) scale(1)',
                transformOrigin: 'left',
                transition,
            };
        },
        style() {
            return {
                ...wwLib.getTextStyleFromContent(this.content),
                '--placeholder-color': this.content.placeholderColor,
            };
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
        isAdvancedPlaceholder() {
            return this.content.advancedPlaceholder;
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

                this.$nextTick(() => {
                    this.handleObserver();
                });
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
        'content.type'() {
            this.$nextTick(() => {
                this.handleObserver();
            });
        },
        inputRef() {
            this.$nextTick(() => {
                this.handleObserver();
            });
        },
        'content.advancedPlaceholder': {
            async handler(value) {
                this.$nextTick(() => {
                    this.handleObserver();
                });

                /* wwEditor:start */
                if (this.wwEditorState.isACopy) {
                    return;
                }

                let placeholderElement = null;

                if (value) {
                    placeholderElement = await this.createElement('ww-text', {
                        _state: { name: 'Placeholder' },
                    });
                }

                this.$emit('update:content:effect', { placeholderElement });
                /* wwEditor:end */
            },
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
        if (this.resizeObserverContent) this.resizeObserverContent.disconnect();
        if (this.resizeObserverBorder) this.resizeObserverBorder.disconnect();

        wwLib.getFrontDocument().removeEventListener('keyup', this.onKeyEnter);
    },
    mounted() {
        this.isMounted = true;
        this.handleObserver();

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
        handleObserver() {
            if (!this.isMounted) return;
            if (this.resizeObserverContent) this.resizeObserverContent.disconnect();
            if (this.resizeObserverBorder) this.resizeObserverBorder.disconnect();
            const el = this.$refs.input;
            if (!el) return;

            // We need both Observers because one of them works outside a ww-modal, while the other in a ww-modal
            this.resizeObserverContent = new ResizeObserver(() => {
                this.updatePosition(el);
            });
            this.resizeObserverBorder = new ResizeObserver(() => {
                this.updatePosition(el);
            });
            this.resizeObserverContent.observe(el, { box: 'content-box' });
            this.resizeObserverBorder.observe(el, { box: 'border-box' });
        },
        updatePosition(el) {
            const placeholder = this.$refs.placeholder;
            if (!el || !placeholder) return;
            this.noTransition = true;

            const pos =
                this.content.type === 'textarea'
                    ? wwLib.wwUtils.getLengthUnit(el.style.paddingTop)[0]
                    : el.clientHeight / 2 - placeholder.clientHeight / 2;
            this.placeholderPosition.top = pos + 'px';
            this.placeholderPosition.left = el.style.paddingLeft;

            setTimeout(() => {
                this.noTransition = false;
            }, wwLib.wwUtils.getLengthUnit(this.content.transition)[0]);
        },
        // /!\ Use externally
        focusInput() {
            if (this.isReadonly) return;
            const el = this.$refs.input;
            if (el) el.focus();
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-input-basic {
    width: 100%;
    height: 100%;

    &__input {
        width: 100%;
        height: 100%;
        outline: none;
        border: none;
        background-color: inherit;
        border-radius: inherit;

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

        /* wwEditor:start */
        &.editing {
            pointer-events: none;
        }
        /* wwEditor:end */

        &.-readonly {
            cursor: inherit;
        }
    }

    &__placeholder {
        position: absolute;
        cursor: text;
        height: fit-content;

        /* wwEditor:start */
        &.editing {
            cursor: initial;
        }
        /* wwEditor:end */
    }

    /* wwEditor:start */
    &.editing {
        pointer-events: none;
    }
    /* wwEditor:end */
}
</style>
