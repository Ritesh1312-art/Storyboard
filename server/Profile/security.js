// server/profile/security.js

// Common security questions
export const SECURITY_QUESTIONS = [
    "What was your childhood nickname?",
    "What is the name of your first pet?",
    "What was your first car?",
    "What elementary school did you attend?",
    "What is the name of the town where you were born?",
    "What is your mother's maiden name?",
    "What was your favorite food as a child?",
    "Who was your childhood hero?",
    "What is your favorite book?",
    "What is your favorite movie?",
    "What was the name of your first teacher?",
    "What is the name of your best friend?"
];

export function validateSecurityAnswers(answers) {
    if (!answers || !Array.isArray(answers) || answers.length < 2) {
        return { valid: false, error: 'Please provide at least 2 security answers' };
    }
    
    for (const answer of answers) {
        if (!answer.question || !answer.answer || answer.answer.length < 3) {
            return { valid: false, error: 'Each answer must be at least 3 characters' };
        }
    }
    
    return { valid: true };
}

// Hash answers before storing (use bcrypt)
import bcrypt from 'bcryptjs';

export async function hashSecurityAnswers(answers) {
    const hashed = [];
    for (const item of answers) {
        hashed.push({
            question: item.question,
            answer: await bcrypt.hash(item.answer.toLowerCase(), 10)
        });
    }
    return hashed;
}

export async function verifySecurityAnswer(hashedAnswer, providedAnswer) {
    return await bcrypt.compare(providedAnswer.toLowerCase(), hashedAnswer);
}