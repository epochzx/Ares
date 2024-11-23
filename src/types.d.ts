import {  SlashCommandBuilder, CommandInteraction, Collection, ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction, } from 'discord.js';

export interface SlashCommand {
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    execute: (interaction: CommandInteraction | ChatInputCommandInteraction) => void;
}

export interface Component {
    customId: string;
    execute: (interaction: ButtonInteraction | StringSelectMenuInteraction) => void;
}

export interface Modal {
    customId: string;
    execute: (interaction: ModalSubmitInteraction) => void;
}

export interface CronSchedule {
    schedule: string;
    execute: (interaction: () => void) => void;
}

export interface BotEvent {
    name: string;
    once?: boolean | false;
    guild: boolean;
    execute: (...args) => void;
}

export interface Infraction {
    userId: string;
    guildId: string;
    action: 'Ban' | 'Kick' | 'Mute' | 'Warn' | 'Unmute' | 'Unban';
    moderator: string;
    reason: string;
    time: number;
    evidence: string;
    ends?: string | number;
    duration?: string | number;
    active?: boolean;
}

interface DutyState {
    threadId: string;
    author: string;
    started: number;
    reminders?: boolean;
    ended: boolean;
}

export type GuildOption = keyof GuildOptions;

declare module 'discord.js' {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>;
        commands: Collection<string, Command>;
    }
}
