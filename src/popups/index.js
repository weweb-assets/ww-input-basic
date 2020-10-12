import './stories';

export default async function openPopup(content) {
    try {
        const options = {
            firstPage: 'WWFORM_INPUT_CONFIG',
            data: { ...content },
        };
        return await wwLib.wwPopups.open(options);
    } catch (err) {
        wwLib.wwLog.error(err);
        return null;
    }
}
