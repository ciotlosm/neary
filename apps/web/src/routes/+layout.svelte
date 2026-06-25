<script lang="ts">
  import '$lib/styles/app.css';

  // Layout shell. Header / status bar / bottom nav will land here in Phase 3.
  // For Phase 0 we just want a Tailwind-enabled blank shell that builds.
  let { children } = $props();
</script>

{@render children()}
