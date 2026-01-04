<script setup lang="ts">
import FeaturedStoryPedestal from "~/components/hall/FeaturedStoryPedestal.vue";
import DiaryLectern from "~/components/hall/DiaryLectern.vue";
import NewsNoticeBoard from "~/components/hall/NewsNoticeBoard.vue";
import ThemesShelf from "~/components/hall/ThemesShelf.vue";

const { data: news } = await useAsyncData("news", () => $fetch("/api/news"));
const { data: diary } = await useAsyncData("diary", () => $fetch("/api/diary"));
const { data: stories } = await useAsyncData("stories", () => $fetch("/api/stories"));
const { data: themes } = await useAsyncData("themes", () => $fetch("/api/themes"));
</script>

<template>
  <section class="hall">
    <div class="library-background">
      <img src="~/assets/images/library.jpg" alt="Library background" />
    </div>
    <HallScene>
      <HallHeader />

      <div class="hall__grid">
        <FeaturedStoryPedestal class="hall__pedestal" :stories="stories" />
        <DiaryLectern class="hall__lectern" :entries="diary" />
        <NewsNoticeBoard class="hall__board" :news="news" />
      </div>
    </HallScene>
  </section>
</template>

<style scoped lang="scss">
.library-background {
  position: absolute;
  inset: 0;
  z-index: -1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.2;
  }
}
.hall {
  padding: 1.25rem 0 2rem;
}

.hall__grid {
  display: grid;
  gap: 1.25rem;

  @media (min-width: 900px) {
    grid-template-columns: 1.15fr 0.85fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      "pedestal board"
      "lectern  board";
  }
}

/* Map components to areas on wide screens */
.hall__pedestal { grid-area: pedestal; }
.hall__lectern { grid-area: lectern; }
.hall__board { grid-area: board; }

@media (min-width: 900px) {
  .hall__pedestal { transform: translateY(10px); }
  .hall__board { transform: translateY(-6px); }
  .hall__lectern { transform: translateY(18px); }
}

.hall::before {
  content: "";
  position: absolute;
  inset: auto 0 -80px 0;
  height: 240px;
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 60%);
  opacity: 0.25;
  pointer-events: none;
}
</style>
