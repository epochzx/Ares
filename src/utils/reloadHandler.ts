import { join } from "path";
import { componentInteractions, modalInteractions } from "../handlers/interactionHandler";
import { Component, Modal } from "../types";
import { pluralize } from "./replyHelper";
import getFiles from "./fileHelper";

export async function reloadComponentInteractions(): Promise<number | boolean> {
    componentInteractions.clear();

    const componentsDir = join(__dirname, '../interactions/components');
    const componentFiles = getFiles(componentsDir);

    let reloadedCount = 0;

    for (const filePath of componentFiles) {
        delete require.cache[require.resolve(filePath)];

        const componentModule = await import(filePath);
        const component: Component = componentModule.default;

        if (component && component.customId) {
            componentInteractions.set(component.customId, component);
            reloadedCount++;
        } else {
            console.log(`❌  Component interaction ${filePath} is missing customId`);
        }
    }

    if (reloadedCount > 0) {
        console.log(`✅  Reloaded ${pluralize(reloadedCount, `component`)}`);
        return reloadedCount;
    } else {
        return false;
    }
}

export async function reloadModalInteractions(): Promise<number | boolean> {
    modalInteractions.clear();

    const modalsDir = join(__dirname, '../interactions/modals');
    const modalFiles = getFiles(modalsDir);

    let reloadedCount = 0;

    for (const filePath of modalFiles) {
        delete require.cache[require.resolve(filePath)];

        const modalModule = await import(filePath);
        const modal: Modal = modalModule.default;

        if (modal && modal.customId) {
            modalInteractions.set(modal.customId, modal);
            reloadedCount++;
        } else {
            console.log(`❌  Modal interaction ${filePath} is missing customId`);
        }
    }

    if (reloadedCount > 0) {
        console.log(`✅  Reloaded ${pluralize(reloadedCount, `modal`)}`);
        return reloadedCount;
    } else {
        return false;
    }
}
