<template>
  <footer class="site-footer">
    <div class="footer-content">
      <p class="footer-text">
        <span class="footer-label">{{ $t('footer.author') }}：</span>
        <span class="footer-value">nos</span>
      </p>
      <p class="footer-text">
        <span class="footer-label">{{ $t('footer.copyright') }}：</span>
        <span class="footer-value">EpidGames&Bilibili</span>
      </p>
      <p class="footer-text">
        <span class="footer-label">Discord：</span>
        <a href="https://discord.com/users/nos1130" target="_blank" rel="noopener noreferrer" class="footer-link">nos1130</a>
      </p>
      <p class="footer-license">{{ $t('footer.license') }}</p>
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
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
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

.footer-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.footer-license {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .site-footer {
    padding: 1.5rem 1rem;
  }

  .footer-content {
    gap: 1rem;
    flex-direction: column;
  }

  .footer-text {
    font-size: 0.8125rem;
  }

  .footer-license {
    font-size: 0.6875rem;
  }
}
</style>

