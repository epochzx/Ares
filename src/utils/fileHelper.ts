import { readdirSync, statSync } from 'fs';
import { join } from 'path/posix';

export default function getFiles(dir: string): string[] {
    const results: string[] = [];
    const files = readdirSync(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            results.push(...getFiles(filePath));
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            results.push(filePath);
        }
    }

    return results;
}