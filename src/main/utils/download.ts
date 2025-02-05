import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

export const download = async (url: string, destPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(destPath, 'model.zip'));
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(path.join(destPath, 'model.zip'), () => {
                reject(err);
            });
        });
    });
};
