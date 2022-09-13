<template>
    <div class="ww-input-basic" :class="{ editing: isEditing }">
        <input
            v-if="!isReadonly && content.type !== 'textarea'"
            ref="input"
            v-bind="$attrs"
            :value="value"
            class="ww-input-basic__input"
            :class="{ editing: isEditing, hideArrows: content.hideArrows && inputType === 'number' }"
            :type="inputType"
            :name="wwElementState.name"
            :required="content.required"
            :placeholder="isAdvancedPlaceholder ? '' : wwLang.getText(content.placeholder)"
            :style="style"
            :min="content.min"
            :max="content.max"
            :step="step"
            @input="handleManualInput($event)"
            @blur="onBlur($event)"
            @focus="isFocused = true"
        />
        <textarea
            v-else-if="!isReadonly && content"
            ref="input"
            v-bind="$attrs"
            :value="value"
            class="ww-input-basic__input"
            :class="{ editing: isEditing }"
            :type="content.type"
            :name="wwElementState.name"
            :required="content.required"
            :placeholder="isAdvancedPlaceholder ? '' : wwLang.getText(content.placeholder)"
            :style="[style, { resize: content.resize ? '' : 'none' }]"
            :rows="content.rows"
            @input="handleManualInput($event)"
            @focus="isFocused = true"
            @blur="isFocused = false"
        />
        <wwText v-else-if="isReadonly" v-bind="$attrs" :text="`${value}`"></wwText>
        <div
            ref="placeholder"
            v-if="isAdvancedPlaceholder"
            class="ww-input-basic__placeholder"
            :class="{ editing: isEditing }"
            :style="placeholderSyle"
            @click="focusInput"
        >
            <wwElement
                style="pointerevents: none"
                v-bind="content.placeholderElement"
                :states="value.length ? ['active'] : []"
                :ww-props="{ text: wwLang.getText(content.placeholder) || 'Placeholder' }"
            ></wwElement>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue';

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
            return type.value === 'decimal' ? props.content.precision : '1';
        });
        function formatValue(value) {
            if (type.value !== 'decimal') return value;
            if (!value && value !== 0) return '';
            value = `${value}`.replace(',', '.');
            const length = value.indexOf('.') !== -1 ? step.value.split('.')[1].length : 0;
            const newValue = parseFloat(Number(value).toFixed(length).replace(',', '.'));
            return newValue;
        }

        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            type: computed(() => (['decimal', 'number'].includes(type.value) ? 'number' : 'string')),
            defaultValue: props.content.value === undefined ? '' : formatValue(props.content.value),
        });

        return { variableValue, setValue, formatValue, step, type };
    },
    data() {
        return {
            resizeObserver: null,
            paddingLeft: '0px',
            placeholderPosition: {
                top: '0px',
                left: '0px',
            },
            isFocused: false,
            noTransition: false,
            isMounted: false,
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
        placeholderSyle() {
            const animatedPosition =
                this.content.placeholderPosition === 'outside'
                    ? {
                          top: '-' + this.content.positioningAjustment,
                          left: this.placeholderPosition.left,
                          transform: `translateY(-100%) scale(${this.content.placeholderScaling})`,
                          transformOrigin: 'left',
                          transition: this.noTransition ? '0ms' : this.content.transition,
                      }
                    : {
                          top: this.content.positioningAjustment,
                          left: this.placeholderPosition.left,
                          transform: `translateY(0%) scale(${this.content.placeholderScaling})`,
                          transformOrigin: 'left',
                          transition: this.noTransition ? '0ms' : this.content.transition,
                      };

            if (this.content.forceAnimation && this.isEditing) return animatedPosition;
            if (this.content.animationTrigger === 'focus' && this.isFocused) return animatedPosition;
            if (this.content.animationTrigger === 'input' && this.value.length) return animatedPosition;

            return {
                top: this.placeholderPosition.top,
                left: this.placeholderPosition.left,
                userSelect: 'none',
                transform: 'translateY(0%) scale(1)',
                transition: this.noTransition ? '0ms' : this.content.transition,
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
        isAdvancedPlaceholder() {
            return this.content.advancedPlaceholder && !this.isReadonly;
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
        'content.advancedPlaceholder': {
            async handler(value) {
                let placeholderElement = null;

                if (value) {
                    placeholderElement = await wwLib.createElement(
                        'ww-text',
                        {},
                        { name: 'Placeholder' },
                        this.wwFrontState.sectionId
                    );
                }

                this.$emit('update:content:effect', { placeholderElement });
            },
        },
        'content.type'() {
            this.$nextTick(() => {
                this.handleObserver();
            });
        },
        /* wwEditor:end */
    },
    beforeUnmount() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
    },
    mounted() {
        this.isMounted = true;
        this.handleObserver();
    },
    methods: {
        handleManualInput(event) {
            const value = event.target.value;
            let newValue;
            if (this.inputType === 'number' && value.length) {
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
            this.$emit('trigger-event', { name: 'change', event: { domEvent: event, value: newValue } });
        },
        onBlur(event) {
            this.correctDecimalValue(event);
            this.isFocused = false;
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
            if (this.resizeObserver) this.resizeObserver.disconnect();
            const el = this.$refs.input;
            if (!el) return;
            this.updatePosition(el);

            this.resizeObserver = new ResizeObserver(() => {
                this.updatePosition(el);
            });
            this.resizeObserver.observe(el, { box: 'content-box' });
        },
        updatePosition(el) {
            const placeholder = this.$refs.placeholder;
            if (!el || !placeholder || this.isReadonly) return;
            this.noTransition = true;

            const pos = el.getBoundingClientRect().height / 2 - placeholder.getBoundingClientRect().height / 2;
            this.placeholderPosition.top = pos + 'px';
            this.placeholderPosition.left = el.style.paddingLeft;

            setTimeout(() => {
                this.noTransition = false;
            }, wwLib.wwUtils.getLengthUnit(this.content.transition)[0]);
        },
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
