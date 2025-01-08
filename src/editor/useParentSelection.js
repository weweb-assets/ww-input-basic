import { computed, watch } from 'vue';

export default function useParentSelection(props, emit) {
    const parentSelection = computed(() => props.parentSelection);

    function selectParentElement(el, ...args) {
        wwLib.selectParentByFlag(el, ...args);
    }

    watch(
        parentSelection,
        parentSelection => {
            if (parentSelection.allow && parentSelection.info) {
                emit('update:sidepanel-content', { path: 'parentSelection', value: parentSelection.info });
            } else {
                emit('update:sidepanel-content', { path: 'parentSelection', value: null });
            }
        },
        { immediate: true, deep: true }
    );

    return { selectParentElement };
}
