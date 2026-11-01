const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini (lazy — only when API key exists)
let genAI = null;
const getGenAI = () => {
    if (!genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

// POST /api/ai/generate-description
const generateDescription = async (req, res) => {
    try {
        const ai = getGenAI();
        if (!ai) {
            return res.status(503).json({ message: 'AI service not configured. Please set GEMINI_API_KEY in .env' });
        }

        const { title, tags } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Project title is required' });
        }

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Write a professional, engaging project description (2-3 paragraphs, max 200 words) for a creative project titled "${title}"${tags && tags.length ? ` using technologies: ${tags.join(', ')}` : ''}. The tone should be modern, technical yet approachable. Do not use markdown formatting, just plain text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ description: text });
    } catch (error) {
        res.status(500).json({ message: 'AI generation failed: ' + error.message });
    }
};

// POST /api/ai/generate-bio
const generateBio = async (req, res) => {
    try {
        const ai = getGenAI();
        if (!ai) {
            return res.status(503).json({ message: 'AI service not configured. Please set GEMINI_API_KEY in .env' });
        }

        const { fullName, skills } = req.body;
        if (!skills || !skills.length) {
            return res.status(400).json({ message: 'Skills are required to generate a bio' });
        }

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Write a professional, concise bio (2-3 sentences, max 100 words) for a creative professional${fullName ? ` named ${fullName}` : ''} who specializes in: ${skills.join(', ')}. The tone should be confident and modern. Do not use markdown formatting, quotes, or any special characters. Just plain text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ bio: text });
    } catch (error) {
        res.status(500).json({ message: 'AI generation failed: ' + error.message });
    }
};

// POST /api/ai/suggest-tags
const suggestTags = async (req, res) => {
    try {
        const ai = getGenAI();
        if (!ai) {
            return res.status(503).json({ message: 'AI service not configured. Please set GEMINI_API_KEY in .env' });
        }

        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Project title is required' });
        }

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Given a project titled "${title}"${description ? ` with description: "${description}"` : ''}, suggest 5-8 relevant technology/skill tags. Return ONLY a JSON array of strings, nothing else. Example: ["React", "Node.js", "MongoDB"]`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Clean up markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const tags = JSON.parse(text);
        res.json({ tags });
    } catch (error) {
        res.status(500).json({ message: 'AI generation failed: ' + error.message });
    }
};

// POST /api/ai/skill-insights
const getSkillInsights = async (req, res) => {
    try {
        const ai = getGenAI();
        if (!ai) {
            return res.status(503).json({ message: 'AI service not configured. Please set GEMINI_API_KEY in .env' });
        }

        const { skills } = req.body;
        if (!skills || !skills.length) {
            return res.status(400).json({ message: 'Skills are required' });
        }

        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Given a professional with these skills: ${skills.join(', ')}. 
Provide skill gap analysis. Return ONLY a JSON object with this exact structure, no markdown:
{
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "reasoning": "Brief explanation of why these skills complement the existing ones",
  "trendingCombination": "A trending tech stack that includes some of their skills"
}`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const insights = JSON.parse(text);
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: 'AI generation failed: ' + error.message });
    }
};

module.exports = { generateDescription, generateBio, suggestTags, getSkillInsights };
