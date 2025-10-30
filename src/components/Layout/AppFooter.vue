<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-info">
        <p class="footer-text">
          <span class="footer-label">{{ $t('footer.author') }}：</span>
          <span class="footer-value">nos</span>
        </p>
        <p class="footer-text">
          <span class="footer-label">{{ $t('footer.copyright') }}：</span>
          <span class="footer-value">EpidGames&Bilibili</span>
        </p>
        <router-link to="/changelog" class="changelog-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          {{ $t('changelog.title') }}
        </router-link>
      </div>
      <div class="footer-social">
        <a href="https://discord.com/users/noswork" target="_blank" rel="noopener noreferrer" class="social-link" title="Discord">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </a>
        <a href="https://www.youtube.com/@nos9do" target="_blank" rel="noopener noreferrer" class="social-link" title="YouTube">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.site-footer {
  margin-top: auto;
  padding: 2rem;
  background: var(--footer-bg);
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.footer-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
}

.footer-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.footer-label {
  font-weight: 500;
}

.footer-value {
  color: var(--text-primary);
  font-weight: 600;
}

.changelog-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.changelog-link:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.changelog-link svg {
  width: 16px;
  height: 16px;
}

.footer-social {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
  text-decoration: none;
}

.social-link:nth-child(1) {
  color: #5865F2; /* Discord brand color */
}

.social-link:nth-child(1):hover {
  background: #5865F2;
  color: white;
  border-color: #5865F2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
}

.social-link:nth-child(2) {
  color: #FF0000; /* YouTube brand color */
}

.social-link:nth-child(2):hover {
  background: #FF0000;
  color: white;
  border-color: #FF0000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
}

.social-link svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .site-footer {
    padding: 1.5rem 1rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .footer-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer-text {
    font-size: 0.8125rem;
    justify-content: center;
  }

  .footer-social {
    justify-content: center;
  }
}
</style>

