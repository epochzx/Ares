import { Collection, Client, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { join } from 'path';
import { SlashCommand, Modal, Component } from '../types';
import getFiles from '../utils/fileHelper';
import { pluralize } from '../utils/replyHelper';
import settings from '../settings.json';

export const modalInteractions = new Collection<string, Modal>();
export const componentInteractions = new Collection<string, Component>();

export default async function loadInteractions(client: Client, clientCommands: Collection<string, SlashCommand>): Promise<void> {
    if (settings.loadCommands) {
        await loadCommands(client, clientCommands);
    } else {
        console.log(`✖️   Command loading has been disabled`);
    }

    if (settings.loadModals) {
        await loadModals();
    } else {
        console.log(`✖️   Modal loading has been disabled`);
    }

    if (settings.loadComponents) {
        await loadComponents();
    } else {
        console.log(`✖️   Component loading has been disabled`);
    }
}

async function loadCommands(client: Client, clientCommands: Collection<string, SlashCommand>): Promise<void> {
    const commands: SlashCommandBuilder[] = [];
    const commandsDir = join(__dirname, '../interactions/commands');
    const commandFiles = getFiles(commandsDir);

    for (const filePath of commandFiles) {
        try {
            const commandModule = await import(filePath);
            const command: SlashCommand = commandModule.default;

            commands.push(command.command);
            clientCommands.set(command.command.name, command);
        } catch (error) {
            console.log(`❌  Failed to load command from ${filePath}: ${error}`);
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.token as string);

    try {
        const data = await rest.put(
            Routes.applicationCommands(process.env.clientId as string),
            { body: commands }
        );

        if (Array.isArray(data) && data.length > 0) {
            console.log(`✅  Successfully registered ${pluralize(data.length, `global command`)}`);
        } else {
            console.log(`❌  0 global commands to register`);
        }
    } catch (error) {
        console.log(`❌  Failed to register commands: ${error}`);
    }
}

async function loadModals(): Promise<void> {
    const modalsDir = join(__dirname, '../interactions/modals');
    const modalFiles = getFiles(modalsDir);

    let loadedCount = 0;

    for (const filePath of modalFiles) {
        try {
            const modalModule = await import(filePath);
            const modal: Modal = modalModule.default;

            if (modal && modal.customId) {
                modalInteractions.set(modal.customId, modal);
                loadedCount++;
            } else {
                console.log(`❌  Modal ${filePath} is missing customId`);
            }
        } catch (error) {
            console.log(`❌  Failed to load modal from ${filePath}: ${error}`);
        }
    }

    if (loadedCount == 0) {
        console.log(`❌  0 modals to load`);
    }
}

async function loadComponents(): Promise<void> {
    const componentsDir = join(__dirname, '../interactions/components');
    const componentFiles = getFiles(componentsDir);

    let loadedCount = 0;

    for (const filePath of componentFiles) {
        try {
            const componentModule = await import(filePath);
            const component: Component = componentModule.default;

            if (component && component.customId) {
                componentInteractions.set(component.customId, component);
                loadedCount++;
            } else {
                console.log(`❌  Component ${filePath} is missing customId`);
            }
        } catch (error) {
            console.log(`❌  Failed to load component from ${filePath}: ${error}`);
        }
    }

    if (loadedCount == 0) {
        console.log(`❌  0 components to load`);
    }
}
