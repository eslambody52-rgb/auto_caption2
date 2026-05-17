// api/2.5/ping.js
const supabase = require('../../lib/supabase');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ valid: false });
    }

    const { session_token, hwid } = req.body;

    if (!session_token || !hwid) {
        return res.status(400).json({ valid: false });
    }

    try {
        const { data: license, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('session_token', session_token)
            .single();

        if (error || !license) {
            return res.status(200).json({ valid: false });
        }

        if (license.hwid !== hwid || license.status === 'blocked') {
            return res.status(200).json({ valid: false });
        }

        // Update last seen heartbeat
        await supabase
            .from('licenses')
            .update({ last_seen: new Date().toISOString() })
            .eq('license_key', license.license_key);

        return res.status(200).json({ valid: true });

    } catch (err) {
        return res.status(500).json({ valid: false });
    }
};
