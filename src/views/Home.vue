<template>
    <div id="pageContent" class="-mb-6 -mt-15 -mx-8 md:-mx-12 lg:-mx-16 overflow-hidden">
      <!-- Контейнер для звёзд -->
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      <!-- Контейнер для прокрутки изображений -->
      <div class="h-screen relative">
        <div id="titles" class = "hidden sm:block">
          <div id="titlecontent">
            <div v-for="(row, rowIndex) in imageRows" :key="rowIndex" class="image-row">
              <img v-for="(src, colIndex) in row" :key="colIndex" :src="src" alt="Crawl image" class="crawl-image" />
            </div>
          </div>
        </div>
        <div class="home-container sm:hidden" ref="particleContainer">
            <!-- Частицы будут добавлены сюда динамически -->
        </div>
        <div class="top-40 absolute left-1/2 transform -translate-x-1/2">
          <div class="flex mx-auto justify-around">
            <div class="text-center text-dark-text flex flex-col">
              <h1 class="animate text-4xl sm:text-6xl font-bold mb-6
                         bg-gradient-to-br from-dark-text via-dark-text to-sky-50/50
                         inline-block text-transparent bg-clip-text">
                Голос победы
              </h1>
              <p class="animate text-sm sm:text-base
                        bg-gradient-to-br from-dark-text via-dark-text to-sky-50/50
                        inline-block text-transparent bg-clip-text">
                Сохраняем музыкальное наследие
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center text-dark-text flex flex-col mt-40">
        <div class="flex flex-col">
          <div class="animate animate-as-text flex flex-row justify-center gap-5 sm:gap-15 -mb-9" id="sectionIcon">
            <HeartIcon class="w-20 h-20" />
            <BuildingLibraryIcon class="w-20 h-20" />
            <WrenchScrewdriverIcon class="w-20 h-20" />
          </div>
          <h1 class="animate text-3xl sm:text-5xl font-bold mb-6
                     bg-gradient-to-br from-dark-text via-dark-text to-sky-50/50
                     inline-block text-transparent bg-clip-text">
            Наши функции
          </h1>
          <p class="animate text-sm sm:text-base
                    bg-gradient-to-br from-dark-text via-dark-text to-sky-50/50
                    inline-block text-transparent bg-clip-text">
            на что способен сервис
          </p>
        </div>
        <div class="max-w-screen-xl mx-auto my-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 z-2
                    *:min-h-100 *:min-w-3xs *:p-6 *:overflow-hidden
                    *:bg-dark-surface *:border-1 *:border-gray-600 *:rounded-3xl">
          <div class="sm:col-span-2 text-left">
            <h1 class="text-xl font-bold">Библиотека</h1>
            <span class="text-sm text-gray-400">исследуйте все публичные треки</span>
            <!-- картинка -->
            <div class="w-full h-full flex flex-col p-4">
              <div class="flex flex-row gap-3
                          *:h-40 *:w-30 *:p-2 *:bg-gray-700 *:rounded-md">
                <div class="card animate">
                  <div class="bg-dark-primary p-2 rounded-sm">
                    <MusicalNoteIcon class="h-20"/>
                  </div>
                  <h1>Song name</h1>
                  <span class="text-xs text-gray-400">Artist name</span>
                </div>
                <div class="card animate">
                  <div class="bg-dark-secondary p-2 rounded-sm">
                    <MusicalNoteIcon class="h-20"/>
                  </div>
                  <h1>Song name</h1>
                  <span class="text-xs text-gray-400">Artist name</span>
                </div>
                <div class="hidden sm:block card animate">
                  <div class="bg-light-primary p-2 rounded-sm">
                    <MusicalNoteIcon class="h-20"/>
                  </div>
                  <h1>Song name</h1>
                  <span class="text-xs text-gray-400">Artist name</span>
                </div>
              </div>
              <div class="*:h-10 *:w-full *:bg-gray-700 *:mt-3 *:p-2 *:rounded-md">
                <div class="trackrow animate *:h-6 *:p-1 *:rounded *:bg-dark-primary flex flex-row gap-4">
                  <MusicalNoteIcon/> Song name
                </div>
                <div class="trackrow animate *:h-6 *:p-1 *:rounded *:bg-dark-secondary flex flex-row gap-4">
                  <MusicalNoteIcon/> Song name
                </div>
                <div class="trackrow animate *:h-6 *:p-1 *:rounded *:bg-light-primary flex flex-row gap-4">
                  <MusicalNoteIcon/> Song name
                </div>
              </div>
            </div>
          </div>
          <div class="text-left">
            <h1 class="text-xl font-bold">Поиск</h1>
            <span class="text-sm text-gray-400">находите то, что нужно</span>
            <div class="w-full h-full flex flex-col p-4">
              <div class="h-10 w-full bg-gray-900 mt-3 p-2 rounded-md flex flex-row justify-between">
                <span>Son</span>
                <MagnifyingGlassIcon class="h-6"/>
              </div>
              <div class="*:h-10 *:w-full *:bg-gray-700 *:mt-3 *:p-2 *:rounded-md">
                <div class="trackrow animate flex flex-row gap-4">
                  <MusicalNoteIcon class="h-6 rounded bg-dark-primary p-1"/> <div><span class="underline">Son</span>g name</div>
                </div>
                <div class="trackrow animate flex flex-row gap-4">
                  <MusicalNoteIcon class="h-6 rounded bg-dark-secondary p-1"/> <div><span class="underline">Son</span>g name</div>
                </div>
                <div class="trackrow animate flex flex-row gap-4">
                  <MusicalNoteIcon class="h-6 rounded bg-light-primary p-1"/> <div><span class="underline">Son</span>g name</div>
                </div>
                <div class="trackrow animate flex flex-row gap-4">
                  <MusicalNoteIcon class="h-6 rounded bg-light-secondary p-1"/> <div><span class="underline">Son</span>g name</div>
                </div>
              </div>
            </div>
          </div>
          <MiniVisualizer class="text-left">
            <h1 class="text-xl font-bold">Визуализация музыки</h1>
          </MiniVisualizer>
          <div class="text-left">
            <h1 class="text-xl font-bold">Лайки</h1>
            <span class="text-sm text-gray-400">сохраняйте понравившееся</span>
            <div class="w-full h-full flex flex-col gap-4 p-2">
              <div class="w-full p-3 flex flex-row justify-around">
                <BuildingLibraryIcon class="h-10 my-auto card animate"/>
                <div class="h-40 w-30 p-2 bg-gray-700 rounded-md card animate">
                  <div class="bg-gray-600 p-2 rounded-sm">
                    <MusicalNoteIcon class="h-20"/>
                  </div>
                  <h1>Song name</h1>
                  <span class="text-xs text-gray-400">Artist name</span>
                </div>
              </div>
              <div class="w-full p-3 flex flex-row justify-around">
                <HeartIcon class="h-10 my-auto fill-dark-primary card animate"/>
                <div class="h-40 w-30 p-2 bg-gray-700 rounded-md card animate">
                  <div class="bg-dark-primary p-2 rounded-sm">
                    <MusicalNoteIcon class="h-20"/>
                  </div>
                  <h1>Song name</h1>
                  <span class="text-xs text-gray-400">Artist name</span>
                </div>
              </div>
            </div>
          </div>
          <div class="text-left">
            <h1 class="text-xl font-bold">Авторизация</h1>
            <span class="text-sm text-gray-400">выберите удобный способ</span>
            <div class="w-full h-[90%] flex flex-col gap-2 px-2 content-center *:mx-auto justify-center">
              <img class="w-25 h-25 mr-2 card animate" src="https://upload.wikimedia.org/wikipedia/commons/5/58/Yandex_icon.svg"/>
              <span>или</span>
              <img class="w-25 h-25 mr-2 card-right animate" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"/>
            </div>
          </div>
          <div class="text-left sm:col-span-2">
            <h1 class="text-xl font-bold">Реставрация</h1>
            <span class="text-sm text-gray-400">улучшите старые и поврежденные записи</span>
            <div class="w-full h-[80%] flex flex-col px-2 content-center justify-around">
              <div class="flex flex-row trackrow animate">
                <DocumentIcon class="h-10"/>
                <span class="m-2">Загрузите файл</span>
              </div>
              <div class="flex flex-row trackrow animate">
                <SparklesIcon class="h-10"/>
                <span class="m-2">Подождите обработку</span>
              </div>
              <div class="flex flex-row trackrow animate">
                <PencilSquareIcon class="h-10"/>
                <span class="m-2">Отредактируйте метаданные</span>
              </div>
              <div class="flex flex-row trackrow animate">
                <ArrowDownOnSquareIcon class="h-10"/>
                <span class="m-2">Сохраните результат</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import {
    HeartIcon,
    BuildingLibraryIcon,
    MusicalNoteIcon,
    MagnifyingGlassIcon,
    DocumentIcon,
    SparklesIcon,
    PencilSquareIcon,
    ArrowDownOnSquareIcon,
  } from '@heroicons/vue/24/outline';
  import WrenchScrewdriverIcon from '@/components/icons/WrenchScrewdriverIcon.vue';
  import image1 from '@/assets/home/image1.jpg';
  import image2 from '@/assets/home/image2.jpg';
  import image3 from '@/assets/home/image3.jpg';
  import image4 from '@/assets/home/image4.jpg';
  import MiniVisualizer from '@/components/AudioVisualizer/MiniVisualizer.vue';

  const imageSources = [image1, image2, image3, image4];

  // Генерируем случайные ряды изображений
  const rows = 15;
  const imagesPerRow = 4;
  const imageRows = Array.from({ length: rows }, () =>
    Array.from({ length: imagesPerRow }, () => imageSources[Math.floor(Math.random() * imageSources.length)])
  );
  // анимация для мобилки
// Ссылка на контейнер для добавления частиц
const particleContainer = ref(null);

// Список импортированных изображений
const images = [image1, image2];




  // Функция для генерации box-shadow для звёзд
  const generateBoxShadow = (n) => {
    let value = `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    for (let i = 1; i < n; i++) {
      value += `, ${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    }
    return value;
  };

  // Применяем box-shadow и IntersectionObserver
  onMounted(() => {
    // Звёзды
    const titleContent = document.getElementById('titlecontent');
    titleContent.innerHTML += titleContent.innerHTML;

    const stars = document.getElementById('stars');
    const stars2 = document.getElementById('stars2');
    const stars3 = document.getElementById('stars3');
    stars.style.boxShadow = generateBoxShadow(700);
    stars2.style.boxShadow = generateBoxShadow(200);
    stars3.style.boxShadow = generateBoxShadow(300);

    // IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            console.log('Element in view:', entry.target); // Отладка
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold: 0.1 } // Срабатывает, когда 10% элемента видно
    );

    const allAnimatedElements = document.querySelectorAll('.animate');
    console.log('Found animated elements:', allAnimatedElements.length); // Отладка
    allAnimatedElements.forEach((element) => observer.observe(element));
    // Создаем новую частицу каждые 1 секунду
    const interval = setInterval(() => {
      createParticle();
    }, 2000);

    // Логируем размеры контейнера при изменении окна
    const logContainerSize = () => {
      if (particleContainer.value) {
        const { width, height } = particleContainer.value.getBoundingClientRect();
        console.log('Container size:', { width, height });
      }
    };
    window.addEventListener('resize', logContainerSize);
    logContainerSize(); // Логируем начальный размер

    // Очищаем интервал и обработчик при размонтировании
    onUnmounted(() => {
      clearInterval(interval);
      window.removeEventListener('resize', logContainerSize);
    });
  });
  function createParticle() {
    const img = document.createElement('img');
    img.src = getRandomImage();
    img.className = 'particle';
    img.style.position = 'absolute';

    // Определяем случайный край (верх, низ, лево, право)
    const edge = getRandomEdge();
    let left, top;

    if (edge === 'top') {
      left = Math.random() * 100;
      top = 0;
    } else if (edge === 'bottom') {
      left = Math.random() * 100;
      top = 100;
    } else if (edge === 'left') {
      left = 0;
      top = Math.random() * 100;
    } else if (edge === 'right') {
      left = 100;
      top = Math.random() * 100;
    }

    // Устанавливаем начальные стили
    img.style.left = `${left}%`;
    img.style.top = `${top}%`;
    img.style.transform = 'translate(-50%, -50%) scale(1)';
    img.style.width = `${Math.random() * 200 + 200}px`; // Размер от 300 до 600 пикселей
    img.style.height = 'auto';
    img.style.opacity = '0';
    img.style.zIndex = '0';

    // Сохраняем начальные left и top для анимации (на случай отката)
    img.style.setProperty('--start-left', `${left}%`);
    img.style.setProperty('--start-top', `${top}%`);

    // Логируем создание частицы
    console.log('Particle created:', { src: img.src, left, top });

    // Добавляем частицу
    particleContainer.value.appendChild(img);

    // Удаляем частицу после анимации (5 секунд)
    setTimeout(() => {
      if (img.parentNode) {
        particleContainer.value.removeChild(img);
        console.log('Particle removed:', { src: img.src });
      }
    }, 10000);
  }

  function getRandomImage() {
    return images[Math.floor(Math.random() * images.length)];
  }

  function getRandomEdge() {
    const edges = ['top', 'bottom', 'left', 'right'];
    return edges[Math.floor(Math.random() * edges.length)];
  }
  </script>

  <style>
    .home-container {
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: visible;
  }

  .particle {
    animation: particleAnimation 10s ;
    pointer-events: none;
  }

  @keyframes particleAnimation {
    0% {
      left: var(--start-left);
      top: var(--start-top);
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
      filter: blur(10px);
    }
    50% {
      /* left: calc(var(--start-left) + (50% - var(--start-left)) / 2);
      top: calc(var(--start-top) + (50% - var(--start-top)) / 2);
      transform: translate(-50%, -50%) scale(0.5); */
      opacity: 1;
      filter: blur(0px);
    }
    100% {
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      filter: blur(10px);
    }
  }
  /* Появление текста */
  @keyframes text-appearance-anim {
    from {
      transform: translate3d(0, -10px, 0) scale(1);
      opacity: 0;
    }
    to {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
  }

  p.in-view, h1.in-view, .animate-as-text.in-view {
    animation: text-appearance-anim 0.5s forwards;
  }

  /* Карточки слева */
  .card {
    transform: translateX(-100%);
    opacity: 0;
    filter: blur(5px);
    transition: all 0.2s ease-out;
  }
  .card.in-view {
    transform: translateX(0);
    opacity: 1;
    filter: none;
  }

  .card:nth-child(2) {
    transition-delay: 100ms;
  }
  .card:nth-child(3) {
    transition-delay: 200ms;
  }

  .card:hover {
    transition-delay: 0;
    transform: scale(1.1);
    transition: all 0.2s ease-in-out;
  }

  /* Карточки справа */
  .card-right {
    transform: translateX(100%);
    opacity: 0;
    filter: blur(1.5px);
    transition: all 0.2s ease-out;
  }
  .card-right.in-view {
    transform: translateX(0);
    opacity: 1;
    filter: none;
  }

  .card-right:hover {
    transition-delay: 0;
    transform: scale(1.1);
    transition: all 0.2s ease-in-out;
  }

  /* Треки сверху */
  .trackrow {
    transform: translateY(-100%);
    opacity: 0;
    filter: blur(5px);
    transition: all 0.2s ease-out;
  }
  .trackrow.in-view {
    transform: translateY(0);
    opacity: 1;
    filter: none;
  }

  .trackrow:nth-child(2) {
    transition-delay: 100ms;
  }
  .trackrow:nth-child(3) {
    transition-delay: 200ms;
  }
  .trackrow:nth-child(4) {
    transition-delay: 300ms;
  }

  .trackrow:hover {
    transition-delay: 0;
    transform: scale(1.05);
    transition: all 0.2s ease-in;
  }

  /* Opacity анимация (для мини-эквалайзера) */
  @keyframes opacity-anim {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .opacityanim.in-view {
    animation: opacity-anim 2s forwards;
  }

  #pageContent {
    padding: 0;
    background: radial-gradient(ellipse at bottom, #352a1b 0%, #0f0d09 100%);
  }

  #sectionIcon {
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  }

  #stars, #stars2, #stars3 {
    position: absolute;
    background: transparent;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  #stars {
    width: 1px;
    height: 1px;
    animation: animStar 50s linear infinite;
  }
  #stars:after {
    content: ' ';
    position: absolute;
    top: 2000px;
    width: 1px;
    height: 1px;
    box-shadow: inherit;
  }

  #stars2 {
    width: 2px;
    height: 2px;
    animation: animStar 100s linear infinite;
  }
  #stars2:after {
    content: ' ';
    position: absolute;
    top: 2000px;
    width: 2px;
    height: 2px;
    box-shadow: inherit;
  }

  #stars3 {
    width: 3px;
    height: 3px;
    animation: animStar 150s linear infinite;
  }
  #stars3:after {
    content: ' ';
    position: absolute;
    left: 50%;
    top: 2000px;
    width: 3px;
    height: 3px;
    background: transparent;
    box-shadow: inherit;
  }

  #titles {
    user-select: none; /* Запрещает выделение текста и элементов */
    pointer-events: none;
    position: absolute;
    /* width: 63rem;
    height: 175rem; */
    width: 1008px;
    height: 2800px;
    bottom: 0;
    left: 50%;
    margin-left: -504px;
    /* font-size: 350%; */
    /* overflow: hidden; */
    transform-origin: 50% 100%;
    transform: perspective(300px) rotateX(25deg);
    background-color: transparent;
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, transparent 100%);
  }

  #titlecontent {
    position: absolute;
    width: 100%;
    animation: scroll 20s linear infinite;
  }

  .image-row {
    display: flex;
    justify-content: space-around;
    margin: 40px 0;
  }

  .crawl-image {
    width: 20%;
    height: auto;
  }

  @keyframes scroll {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }

  @keyframes animStar {
    from { transform: translateY(0) scale(1); }
    to { transform: translateY(-2000px) scale(1); }
  }
  </style>
