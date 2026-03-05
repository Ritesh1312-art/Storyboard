// Input validation middleware
export function validateScript(req, res, next) {
    const { script, sceneCount } = req.body;
    
    if (!script || script.trim().length < 10) {
        return res.status(400).json({ error: 'Script must be at least 10 characters' });
    }
    
    if (sceneCount && (sceneCount < 1 || sceneCount > 100)) {
        return res.status(400).json({ error: 'Scene count must be between 1 and 100' });
    }
    
    next();
}

export function validateImageRequest(req, res, next) {
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim().length < 5) {
        return res.status(400).json({ error: 'Prompt must be at least 5 characters' });
    }
    
    next();
}

export function validateAudioRequest(req, res, next) {
    const { text } = req.body;
    
    if (!text || text.trim().length < 2) {
        return res.status(400).json({ error: 'Text must be at least 2 characters' });
    }
    
    next();
}

export function sanitizeInput(req, res, next) {
    // Remove any HTML tags from inputs
    if (req.body.script) {
        req.body.script = req.body.script.replace(/<[^>]*>/g, '');
    }
    if (req.body.prompt) {
        req.body.prompt = req.body.prompt.replace(/<[^>]*>/g, '');
    }
    if (req.body.text) {
        req.body.text = req.body.text.replace(/<[^>]*>/g, '');
    }
    
    next();
}