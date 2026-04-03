<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
  };
}>();

const isNotFound = computed(() => props.error?.statusCode === 404);

function handleError() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <div class="error-page">
    <div class="error-page__inner">
      <div class="error-page__sigil" aria-hidden="true"></div>

      <h1 class="error-page__code">{{ isNotFound ? "404" : error.statusCode ?? "Fehler" }}</h1>

      <p class="error-page__message">
        {{ isNotFound
          ? "Diese Seite existiert nicht — oder wurde von der Zeit verschluckt."
          : "Etwas ist schiefgelaufen. Die Bibliothek ist vorübergehend unzugänglich."
        }}
      </p>

      <button class="error-page__btn" @click="handleError">
        Zurück zur Eingangshalle
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(to bottom, $ink-900, $ink-950);

  font-family: $font-serif;
  text-align: center;
}

.error-page__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  max-width: 36rem;
}

.error-page__sigil {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba($accent-500, 0.80);
  box-shadow:
    0 0 28px rgba($accent-500, 0.55),
    0 0 6px rgba($candle-bright, 0.35);
  @include sigil-pulse(3.5s, 0s);
}

.error-page__code {
  margin: 0;
  font-size: clamp(3.5rem, 10vw, 6rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  color: rgba($moon-100, 0.88);
  line-height: 1;
}

.error-page__message {
  margin: 0;
  font-size: 1.15rem;
  font-style: italic;
  line-height: 1.6;
  color: rgba($moon-100, 0.65);
  letter-spacing: 0.01em;
}

.error-page__btn {
  margin-top: 0.5rem;
  padding: 0.65rem 1.5rem;
  font-family: $font-serif;
  font-style: italic;
  font-size: 1rem;
  letter-spacing: 0.04em;
  color: rgba($moon-100, 0.90);
  background: transparent;
  border: 1px solid rgba($accent-500, 0.35);
  border-radius: 3px 2px 4px 2px / 2px 3px 2px 3px;
  cursor: pointer;

  transition: border-color 220ms ease, color 220ms ease, box-shadow 220ms ease;

  &:hover {
    border-color: rgba($accent-500, 0.70);
    color: rgba($candle-bright, 0.95);
    box-shadow: 0 0 18px rgba($accent-500, 0.22);
  }
}
</style>
