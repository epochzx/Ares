import { SlashCommandBuilder, CommandInteraction, Collection, ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction } from 'discord.js';
import { PlayerInfo } from 'noblox.js';

export interface SlashCommand {
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    execute: (interaction: CommandInteraction | ChatInputCommandInteraction) => void;
}

export interface ContextMenuCommand {
    command: ContextMenuCommandBuilder;
    execute: (interaction: ContextMenuCommandInteraction) => void;
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
    environment: string;
    execute: (interaction: () => void) => void;
}

export interface BotEvent {
    name: string;
    once?: boolean | false;
    guild: boolean;
    execute: (...args) => void;
}

export interface RobloxUser {
    username: string;
    userId: number;
    isBanned: boolean;
    playerInfo: PlayerInfo;
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

export interface DutyState {
    threadId: string;
    author: string;
    started: number;
    reminders?: boolean;
    ended: boolean;
}

export interface AutoResponse {
    prompt: string,
    response: string
}

export interface GuildLog {
    guildId: string,
    enabled: boolean,
    channel: string
}

export interface GenericData {
    name: string,
    data: string,
}

export interface UserTimezone {
    userId: string,
    gmtOffset: string,
}

export interface StatusResponse {
    result: {
        status_overall: {
            updated: string;
            status: string;
            status_code: number;
        };
        status: object[];
        incidents: object[];
        maintenance: {
            active: object[];
            upcoming: object[];
        };
    };
}

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, SlashCommand>;
    }
}
