<script setup lang="ts">
const { data: news, error: newsError } = useNews();
const { data: diary, error: diaryError } = useDiary();
const { data: stories, error: storiesError } = useStories();
</script>

<template>
  <div class="grid">
    <ParchmentFrame>
      <h2 class="h2">News</h2>
      <div class="list">
        <div v-for="n in news?.slice(0, 5)" :key="n.id" class="item">
          <NuxtLink :to="`/news/${n.slug}`">{{ n.title }}</NuxtLink>
        </div>
      </div>
    </ParchmentFrame>

    <ParchmentFrame>
      <h2 class="h2">Tagebuch</h2>
      <div class="list">
        <div v-if="diary?.[0]" class="item">
          <NuxtLink :to="`/diary/${diary[0].slug}`">{{ diary[0].title }}</NuxtLink>
        </div>
      </div>
    </ParchmentFrame>

    <ParchmentFrame>
      <h2 class="h2">Stories</h2>
      <div class="list">
        <div v-for="s in stories?.slice(0, 5)" :key="s.id" class="item">
          <NuxtLink :to="`/story/${s.slug}`">{{ s.title }}</NuxtLink>
        </div>
      </div>
    </ParchmentFrame>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.h2 {
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  margin: 0;
}

.list {
  margin-top: 1rem;
  font-family: $font-sans;
  font-size: 0.95rem;
}

.item {
  padding: 0.35rem 0;
  opacity: 0.9;
}
</style>
