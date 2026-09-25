const validateArticle = async (req, res, next) => {
    try {
        const { title, date, text } = req.body;

        // Check if title, date, and text are present
        if (!title || !date || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Additional validation logic can be added here
        // ...

        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error validating article');
    }
};

const validateDate = async (req, res, next) => {
    try {
        const { date } = req.body;
        // Simple regex to check for YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error validating date format');
    }
};

const validateTextLength = async (req, res, next) => {
    try {
        const { text } = req.body;
        const minLength = 10; // example length requirement
        if (text && text.length < minLength) {
            return res.status(400).json({ error: `Text must be at least ${minLength} characters long` });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error validating text length');
    }
};

module.exports = {
    validateArticle,
    validateDate,
    validateTextLength
};
