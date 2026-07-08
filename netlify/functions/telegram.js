exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    try {
        const { order, message } = JSON.parse(event.body);
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (!botToken || !chatId) return { statusCode: 500, body: JSON.stringify({ error: 'Telegram not configured' }) };
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
        });
        if (!response.ok) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send' }) };
        return { statusCode: 200, body: JSON.stringify({ success: true, orderId: order.orderId }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
