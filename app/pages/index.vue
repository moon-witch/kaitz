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
    <div class="library-background" aria-hidden="true">
      <img src="~/assets/images/library.jpg" alt="" />
    </div>

    <HallScene>
      <HallHeader />

      <div class="hall__grid">
        <FeaturedStoryPedestal class="hall__pedestal" :stories="stories" />
        <NewsNoticeBoard class="hall__board" :news="news" />
        <DiaryLectern class="hall__lectern" :entries="diary" />
      </div>

    </HallScene>
  </section>
</template>

<style scoped lang="scss">
.hall {
  position: relative; /* required for background layer */
  padding: 1rem 1rem 2rem;

  @media (min-width: 600px) {
    padding: 1.1rem 1rem 2.2rem;
  }

  @media (min-width: 900px) {
    padding: 1.25rem 1rem 2rem;
  }
}

.library-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  transform: translateZ(0); /* force GPU layer — prevents iOS fixed-position shift on overscroll */

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;

    /* slightly stronger on mobile so it reads as "place" */
    opacity: 0.28;

    @media (min-width: 600px) {
      opacity: 0.24;
    }

    @media (min-width: 900px) {
      opacity: 0.20;
    }
  }
}

/* MOBILE FIRST: single column */
.hall__grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "pedestal"
    "board"
    "lectern";
  gap: 1rem;

  /* Tablet: 2 columns, lectern spans full width */
  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "pedestal board"
      "lectern  lectern";
    gap: 1.15rem;
  }

  /* Desktop: your original composition */
  @media (min-width: 900px) {
    grid-template-columns: 1.15fr 0.85fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      "pedestal board"
      "lectern  board";
    gap: 1.25rem;
  }
}

/* Area mapping */
.hall__pedestal { grid-area: pedestal; }
.hall__board { grid-area: board;}
.hall__lectern { grid-area: lectern; }

/* Remove hardcoded spacing that breaks mobile */
@media (min-width: 720px) {
  .hall__board { margin-top: 3rem; }
}

/* Offsets only on desktop (otherwise it looks broken when stacked) */
.hall__pedestal,
.hall__board,
.hall__lectern {
  transform: none;
}

@media (min-width: 900px) {
  .hall__pedestal { transform: translateY(10px); }
  .hall__board { transform: translateY(-6px); }
  .hall__lectern { transform: translateY(18px); }
}

/* Themes shelf spacing */
.hall__shelf {
  margin-top: 1.15rem;

  @media (min-width: 720px) {
    margin-top: 1.25rem;
  }

  @media (min-width: 900px) {
    margin-top: 1.35rem;
  }
}
</style>
