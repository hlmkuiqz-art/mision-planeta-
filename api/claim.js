const { COOKIE_NAME, MAX_AGE_SECONDS, issueAccess } = require('./access');
const ORBIT_RUN_PRODUCT_ID = 'prod_VCnPP2QEydiZNw';

module.exports = async (req, res) => {
  const sessionId = new URL(req.url, 'https://planeta.website').searchParams.get('session_id');
  const secret = process.env.STRIPE_SECRET_KEY;
  const accessSecret = process.env.ORBIT_RUN_ACCESS_SECRET;
  if (!sessionId || !sessionId.startsWith('cs_') || !secret || !accessSecret) return res.redirect(303, '/?purchase=unavailable');
  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`, { headers: { Authorization: `Bearer ${secret}` } });
    if (!response.ok) return res.redirect(303, '/?purchase=invalid');
    const session = await response.json();
    const ownsOrbitRun = session.line_items?.data?.some((item) => item.price?.product === ORBIT_RUN_PRODUCT_ID);
    if (session.payment_status !== 'paid' || !ownsOrbitRun) return res.redirect(303, '/?purchase=unpaid');
    const token = issueAccess(accessSecret);
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Max-Age=${MAX_AGE_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    return res.redirect(303, '/play');
  } catch { return res.redirect(303, '/?purchase=unavailable'); }
};
