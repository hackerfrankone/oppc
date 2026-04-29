document.addEventListener('DOMContentLoaded', async function() {
  try {

    const params = new URLSearchParams(window.location.search);

    if (params.get('unlocked') === 'paid') {
      localStorage.setItem('unlocked', 'paid');
    }

    const storedHash = localStorage.getItem('oppcusTokenHash');
    const salt = 'oppcus-salt-v1';

    const fpData =
      navigator.userAgent +
      navigator.language +
      screen.width +
      screen.height +
      salt;

    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(fpData)
    );

    const deviceHash = Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (storedHash === deviceHash) {
      localStorage.setItem('unlocked', 'paid');
    }

    const isUnlocked = localStorage.getItem('unlocked') === 'paid';

    if (isUnlocked) {
      document.body.classList.add('unlocked');

      // unlock links except Cisco
      document.querySelectorAll('a.locked').forEach(link => {
        if (link.closest('#cisco')) return;

        link.textContent = link.textContent.replace(/ ?🔒/g, '');
        link.href = link.dataset.url || '#';
        link.classList.remove('locked');
      });

      // Cisco special case
      const ciscoIcon = document.getElementById('cisco');
      if (ciscoIcon) {
        const box = ciscoIcon.querySelector('.hover-box');
        if (box) box.innerHTML = 'Coming Soon';
        ciscoIcon.style.cursor = 'default';
      }

      // unlock click navigation
      [
        { id: 'secplus', url: 'secplus/secplus.html' },
        { id: 'networkPlus', url: 'netplus/netplus.html' },
        { id: 'linuxPlus', url: 'linuxplus/linuxplus.html' },
        { id: 'ctf', url: 'ctf/select.html' }
      ].forEach(({ id, url }) => {
        const icon = document.getElementById(id);
        if (!icon) return;

        icon.classList.add('unlocked-hide-dropdown');
        const hb = icon.querySelector('.hover-box');
        if (hb) hb.style.display = 'none';

        icon.style.cursor = 'pointer';
        icon.addEventListener('click', () => {
          window.location.href = url;
        });
      });

      // Discord unlock
      const discordBtn = document.getElementById('discordButton');
      if (discordBtn) {
        discordBtn.style.opacity = '1';
        discordBtn.style.pointerEvents = 'auto';
      }

      // hide PayPal + message
      const paypal = document.getElementById('paypalContainer');
      if (paypal) paypal.style.display = 'none';

      const msg = document.getElementById('oneTimeMessage');
      if (msg) msg.style.display = 'none';
    }

    // popup button
    document.getElementById('ackBtn')?.addEventListener('click', function() {
      localStorage.setItem('cacheAcknowledged', 'true');
      document.getElementById('cachePopup').style.display = 'none';
    });

  } catch (err) {
    console.error('Unlock error:', err);
  }
});
