<template>
    <input
        v-if="content.globalSettings && content.globalSettings.type !== 'textarea'"
        v-model="value"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="inputType"
        :name="isEditing ? `${content.globalSettings.name}-editing` : content.globalSettings.name"
        :required="content.globalSettings.required"
        :placeholder="wwLang.getText(content.globalSettings.placeholder)"
        lang="en"
        :style="style"
        :min="content.globalSettings.min"
        :max="content.globalSettings.max"
        :step="step"
        @focusout="formatInput"
    />
    <textarea
        v-else-if="content.globalSettings"
        v-model="value"
        class="ww-form-input"
        :class="{ editing: isEditing }"
        :type="content.globalSettings.type"
        :name="content.globalSettings.name"
        :required="content.globalSettings.required"
        :placeholder="wwLang.getText(content.globalSettings.placeholder)"
        :style="[style, { resize: content.globalSettings.resize ? '' : 'none' }]"
        :rows="content.globalSettings.rows"
    />
</template>

<script>
import { computed } from 'vue';

export default {
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['trigger-event'],
    setup(props) {
        const internalVariableId = computed(() => props.content.globalSettings.variable);
        const variableId = wwLib.wwVariable.useComponentVariable(props.uid, 'value', '', internalVariableId);

        return { variableId };
    },
    data() {
        return {
            internalValue: '',
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
        value: {
            get() {
                if (this.variableId) return wwLib.wwVariable.getValue(this.variableId);
                return this.internalValue;
            },
            set(value) {
                this.$emit('trigger-event', { name: 'change', event: { value } });
                this.internalValue = value;
                if (this.variableId) wwLib.wwVariable.updateValue(this.variableId, value);
            },
        },
        style() {
            return {
                color: this.content.globalStyle.color,
                fontSize: this.content.globalStyle.fontSize,
                fontFamily: this.content.globalStyle.fontFamily,
            };
        },
        inputType() {
            if (!this.content.globalSettings) return 'text';
            return this.content.globalSettings.type === 'decimal' ? 'number' : this.content.globalSettings.type;
        },
        step() {
            if (!this.content.globalSettings) return '1';
            return this.content.globalSettings.type === 'decimal' ? this.content.globalSettings.precision : '1';
        },
    },
    /* wwEditor:start */
    watch: {
        'content.globalSettings.initialValue'(value) {
            this.value = value;
        },
    },
    /* wwEditor:end */
    mounted() {
        if (this.content.initialValue) this.value = this.content.initialValue;
    },
    methods: {
        formatInput(event) {
            if (this.content.globalSettings.type !== 'decimal') return;
            const formatedValue = Number(event.target.value).toFixed(this.step.split('.')[1].length).replace(',', '.');
            this.value = formatedValue;
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-form-input {
    width: 100%;
    outline: none;
    font-family: inherit;
    border: inherit;
    &::placeholder {
        color: inherit;
        opacity: 0.7;
    }
    /* wwEditor:start */
    &.editing {
        pointer-events: none;
    }
    /* wwEditor:end */
}
</style>
