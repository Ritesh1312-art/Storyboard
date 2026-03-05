import sharp from 'sharp';

class WatermarkGenerator {
    constructor() {
        this.watermarks = {
            subtle: {
                text: '🔷 StoryBoard Free',
                color: 'rgba(99, 102, 241, 0.15)',
                font: 'Arial',
                size: 60
            },
            pattern: {
                text: 'STORYBOARD FREE',
                color: 'rgba(255, 255, 255, 0.1)',
                font: 'Arial',
                size: 30
            }
        };
    }

    async addWatermark(imageBuffer, username, style = 'subtle') {
        try {
            const watermark = this.watermarks[style] || this.watermarks.subtle;
            
            // Get image dimensions
            const metadata = await sharp(imageBuffer).metadata();
            const width = metadata.width || 1024;
            const height = metadata.height || 1024;
            
            // Create SVG watermark
            const svgText = `
                <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                    <style>
                        .watermark {
                            fill: ${watermark.color};
                            font-family: ${watermark.font};
                            font-size: ${watermark.size}px;
                            font-weight: bold;
                            text-anchor: middle;
                            dominant-baseline: middle;
                            user-select: none;
                        }
                    </style>
                    <text x="50%" y="50%" class="watermark" transform="rotate(-35, ${width/2}, ${height/2})">
                        ${watermark.text}
                    </text>
                    <text x="80%" y="10%" class="watermark" style="font-size: ${watermark.size * 0.5}px;">
                        ${new Date().toLocaleDateString()}
                    </text>
                </svg>
            `;

            // Apply watermark
            const watermarked = await sharp(imageBuffer)
                .composite([
                    {
                        input: Buffer.from(svgText),
                        blend: 'overlay',
                        gravity: 'center'
                    }
                ])
                .toBuffer();

            return watermarked;
        } catch (error) {
            console.error('Watermark error:', error);
            return imageBuffer;
        }
    }

    async addWatermarkPattern(imageBuffer) {
        try {
            const metadata = await sharp(imageBuffer).metadata();
            const width = metadata.width || 1024;
            const height = metadata.height || 1024;
            
            // Create pattern watermark (tiled)
            const pattern = `
                <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="watermarkPattern" patternUnits="userSpaceOnUse" width="200" height="200">
                            <text x="0" y="20" fill="rgba(255,255,255,0.08)" font-size="16" transform="rotate(-35, 0, 20)">
                                STORYBOARD FREE
                            </text>
                            <text x="100" y="120" fill="rgba(255,255,255,0.08)" font-size="16" transform="rotate(-35, 100, 120)">
                                STORYBOARD FREE
                            </text>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#watermarkPattern)"/>
                </svg>
            `;

            const watermarked = await sharp(imageBuffer)
                .composite([
                    {
                        input: Buffer.from(pattern),
                        blend: 'overlay'
                    }
                ])
                .toBuffer();

            return watermarked;
        } catch (error) {
            console.error('Pattern watermark error:', error);
            return imageBuffer;
        }
    }
}

export default new WatermarkGenerator();