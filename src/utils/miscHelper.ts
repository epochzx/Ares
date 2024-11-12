import { pluralize } from './replyHelper';

export function formatTimeSince(timestamp: number): string {
    const now = Date.now();
    const elapsedMilliseconds = now - timestamp;

    if (elapsedMilliseconds < 0) {
        return 'In the future';
    }

    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

    const days = Math.floor(elapsedSeconds / 86400);
    const hours = Math.floor((elapsedSeconds % 86400) / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    let timeString = '';

    if (days > 0) {
        timeString += pluralize(days, 'day') + ', ';
    }
    if (hours > 0 || days > 0) {
        timeString += pluralize(hours, 'hour') + ', ';
    }
    if (minutes > 0 || hours > 0 || days > 0) {
        timeString += pluralize(minutes, 'minute') + ', ';
    }
    
    timeString += pluralize(seconds, 'second');

    return timeString;
}

export function formatTimeUntil(timestamp: number, requestTime: number): string {
    const remainingMilliseconds = timestamp - requestTime;

    if (remainingMilliseconds <= 0) {
        return 'Already passed';
    }

    const remainingSeconds = Math.floor(remainingMilliseconds / 1000);

    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    let timeString = '';

    if (days > 0) {
        timeString += pluralize(days, 'day') + ', ';
    }
    if (hours > 0) {
        timeString += pluralize(hours, 'hour') + ', ';
    }
    if (minutes > 0) {
        timeString += pluralize(minutes, 'minute') + ', ';
    }
    if (seconds > 0) {
        timeString += pluralize(seconds, 'second');
    }

    if (timeString.endsWith(', ')) {
        timeString = timeString.slice(0, -2);
    }

    return timeString;
}