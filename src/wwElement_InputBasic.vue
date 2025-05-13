<template>
    <input
        v-if="content.type !== 'textarea'"
        ref="inputRef"
        v-bind="inputBindings"
        class="ww-input-basic"
        :class="inputClasses"
        @input="handleManualInput"
        @blur="onBlur"
        @focus="isReallyFocused = true"
        @keyup.enter="onEnter"
    />
    <textarea
        v-else
        ref="inputRef"
        v-bind="textareaBindings"
        class="ww-input-basic"
        :class="{ editing: isEditing }"
        @input="handleManualInput"
        @focus="isReallyFocused = true"
        @blur="isReallyFocused = false"
        @keyup.enter="onEnter"
    />
</template>

<script>
import { computed, inject, watch } from 'vue';
import { useInput } from './composables/useInput';
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

        const useForm = inject('_wwForm:useForm', () => {});
        const formContext = inject('_wwForm:info', null);
        
        console.log('[INPUT DEBUG]', 'Form context injection', {
            hasFormContext: !!formContext,
            formContextData: formContext,
            elementUid: props.uid,
            inPopup: !!document.querySelector(`[data-ww-element-id="${props.uid}"]`)?.closest('.ww-popup'),
            isFormVisible: !!document.querySelector(`[data-ww-uid="${formContext?.uid}"]`),
            mountedAt: Date.now()
        });

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
        };
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
