// api/2.5/validate.js
const supabase = require('../../lib/supabase');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
    // CORS configuration
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
        return res.status(405).json({ status: 'Method not allowed' });
    }

    const { license_key, hwid, plugin_id } = req.body;

    if (!license_key || !hwid || !plugin_id) {
        return res.status(400).json({ status: 'Missing parameters' });
    }

    if (!supabase) {
        return res.status(500).json({ status: 'Server configuration error (Supabase not initialized)' });
    }

    // Ensure it's explicitly for Auto Caption V2.5
    if (plugin_id !== 'auto_caption_v2.5') {
        return res.status(400).json({ status: 'wrong_plugin' });
    }

    try {
        const { data: license, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('license_key', license_key)
            .single();

        if (error || !license) {
            return res.status(200).json({ status: 'invalid_serial' });
        }

        // Verify plugin assignment if you use single table, or just ignore if it's dedicated
        if (license.plugin_id && license.plugin_id !== 'auto_caption_v2.5') {
             return res.status(200).json({ status: 'wrong_plugin' });
        }

        if (license.status === 'blocked') {
            return res.status(200).json({ status: 'blocked' });
        }

        // HWID Binding
        if (!license.hwid) {
            // First activation
            const { error: updateError } = await supabase
                .from('licenses')
                .update({ hwid: hwid, status: 'active', activated_at: new Date().toISOString() })
                .eq('id', license.id);

            if (updateError) throw updateError;
        } else if (license.hwid !== hwid) {
            return res.status(200).json({ status: 'hwid_mismatch' });
        }

        // Generate Session Token
        const sessionToken = crypto.randomUUID();

        // Update last seen and session
        await supabase
            .from('licenses')
            .update({ session_token: sessionToken, last_seen: new Date().toISOString() })
            .eq('id', license.id);

        return res.status(200).json({
            status: 'activated',
            session_token: sessionToken,
            config: license.config || {}
        });

    } catch (err) {
        return res.status(500).json({ status: 'server_error', error: err.message });
    }
};
