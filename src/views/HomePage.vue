<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <StartScreen @start="startGame" @tutorial="showTutorial" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import StartScreen from '@/components/game/StartScreen.vue';

const router = useRouter();

function showTutorial() {
  // Navigate to intro with tutorial flag - tutorial starts in GamePage
  router.push('/intro?tutorial=true');
}

function startGame() {
  router.push('/intro');
}
</script>

<style scoped>
.home-content {
  --background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
}
</style>
