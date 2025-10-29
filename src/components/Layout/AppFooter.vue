<template>
  <footer class="site-footer">
    <div class="footer-content">
      <UsageCounter />
      <div class="footer-info">
        <p class="footer-text">
          <span class="footer-label">工具製作：</span>
          <span class="footer-value">nos</span>
        </p>
        <p class="footer-text">
          <span class="footer-label">遊戲版權：</span>
          <span class="footer-value">EpidGames</span>
        </p>
        <p class="footer-text">
          <span class="footer-label">Discord：</span>
          <a href="https://discord.com/users/nos1130" target="_blank" rel="noopener noreferrer" class="footer-link">nos1130</a>
        </p>
      </div>
      <p class="footer-license">MIT License</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import UsageCounter from './UsageCounter.vue'
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
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.footer-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
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

  .footer-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer-text {
    font-size: 0.8125rem;
  }

  .footer-license {
    font-size: 0.6875rem;
  }
}
</style>

