import noblox from 'noblox.js';
import { RobloxUser } from '../types';

export async function validateRobloxUser(username: string): Promise<RobloxUser> {
    const userId = await noblox.getIdFromUsername(username as string);

    if (!userId) {
        throw new Error(`\`${username}\` was not found on Roblox.`);
    };

    const upToDateUsername = await noblox.getUsernameFromId(userId);

    const playerInfo = await noblox.getPlayerInfo(userId);
        
    if (!playerInfo) {
        throw new Error(`\`${username}\` was not found on Roblox.`);
    };

    if (playerInfo.isBanned) {
        throw new Error(`\`${username}\` is banned from Roblox.`);
    };

    const robloxUser: RobloxUser = {
        username: upToDateUsername,
        userId: userId,
        isBanned: false,
        playerInfo: playerInfo
    };

    return robloxUser;
}